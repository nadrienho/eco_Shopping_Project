from decimal import Decimal
import os
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from django.contrib.auth.models import User
from .models import Product, Profile, Category, Cart, CartItem, Order, OrderItem, Review, SavedProduct, Category
from .serializers import OrderItemDetailSerializer, ProductSerializer, UserSerializer, UserMeSerializer, ProfileSerializer, CategorySerializer, OrderItemSerializer, CategorySerializer, OrderDetailSerializer, ReviewSerializer
from .permissions import IsShopAdmin, IsVendorOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.http import QueryDict
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode




class ProductListView(ListAPIView):
    queryset = Product.objects.filter(status='verified')  # Only show verified products in the list
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'price': ['lte', 'gte', 'exact'], # This enables price__lte and price__gte
    }
    ordering_fields = ['created_at', 'price']  # Enable sorting by created_at (newest) and price

    def get_queryset(self):
        print(self.request.GET)  # Log the query parameters
        return super().get_queryset()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(status='verified')  # Only show verified products in the list
    serializer_class = ProductSerializer
    permission_classes = [IsVendorOrReadOnly]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_saved_products(request):
    """
    Fetch all saved products for the authenticated user.
    """
    user = request.user
    print(f"Fetching saved products for user: {user}")
    saved_products = SavedProduct.objects.filter(user=user).select_related("product")
    print(f"Saved products: {saved_products}")
    data = [
        {
            "id": saved.product.id,
            "name": saved.product.name,
            "description": saved.product.description,
            "price": saved.product.price,
            #"vendor_name": saved.product.category.name,  # Assuming category is used as vendor
        }
        for saved in saved_products
    ]
    return Response(data, status=200)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_saved_product(request, product_id):
    user = request.user
    try:
        saved_product = SavedProduct.objects.get(user=user, product_id=product_id)
        saved_product.delete()
        return Response({"message": "Product removed from saved."}, status=200)
    except SavedProduct.DoesNotExist:
        return Response({"error": "Product not found in saved list."}, status=404)

@api_view(["GET"])
def get_products(request):
    products = Product.objects.all()
    category = request.GET.get("category")
    price_lte = request.GET.get("price__lte")
    ordering = request.GET.get("ordering")

    if category:
        products = products.filter(category_id=category)
    if price_lte:
        products = products.filter(price__lte=price_lte)
    if ordering:
        products = products.order_by(ordering)

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


class UserDetailView(generics.RetrieveAPIView):
    """
    Get current authenticated user's profile with role information.
    Used for role-based redirects after login.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserMeView(APIView):
    """
    Get the authenticated user's details
    GET /api/user/me/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile": {
                    "role": profile.role,
                    "shop_name": profile.shop_name,
                    "bio": profile.bio,
                },
            }
            return Response(user_data)
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
class RegisterView(APIView):
    """
    Register a new user account
    POST /api/register/
    """
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role", "customer")
        shop_name = request.data.get("shop_name")
        bio = request.data.get("bio")

        # Validation
        if not username or not email or not password:
            return Response(
                {"error": "Username, email, and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already in use."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in ["customer", "vendor", "shop_admin"]:
            return Response(
                {"error": "Invalid role. Choose 'customer', 'vendor', or 'shop_admin'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role == "vendor" and not shop_name:
            return Response(
                {"error": "Shop name is required for vendors."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            user.role = role  # Attach the role to the user instance

            # Set is_staff=True for shop_admins
            if role == "shop_admin":
                user.is_staff = True

            user.save()

            # Explicitly create the profile with the correct role
            profile = Profile.objects.create(
                user=user,
                role=role,
                shop_name=shop_name if role == "vendor" else None,
                bio=bio if role == "vendor" else None,
            )
            
            return Response(
                {
                    "message": "Account created successfully.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
@api_view(["GET"])
def get_all_customers(request):
    """
    Get all customers in the system
    """
    # Ensure only shop_admins can access this endpoint
    if not request.user.profile.role == "shop_admin":
        return Response({"error": "Permission denied."}, status=403)

    # Fetch all customers
    customers = Profile.objects.filter(role="customer").select_related("user")
    customer_data = [
        {
            "id": customer.user.id,
            "username": customer.user.username,
            "email": customer.user.email,
            "is_active": customer.user.is_active,
        }
        for customer in customers
    ]

    # Metrics: Total number of customers
    total_customers = customers.count()

    return Response({"total_customers": total_customers, "customers": customer_data})

@api_view(["POST"])
def block_or_restore_customer(request, user_id):
    """
    Block or restore a customer account
    """
    # Ensure only shop_admins can access this endpoint
    if not request.user.profile.role == "shop_admin":
        return Response({"error": "Permission denied."}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user.profile.role != "customer":
            return Response({"error": "Only customers can be blocked or restored."}, status=400)

        # Toggle the is_active status
        user.is_active = not user.is_active
        user.save()

        status = "blocked" if not user.is_active else "restored"
        return Response({"message": f"Customer account has been {status}."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
@api_view(["GET"])
def get_all_vendors(request):
    """
    Get all vendors in the system
    """
    # Ensure only shop_admins or vendors can access this endpoint
    if not request.user.profile.role in ["shop_admin", "vendor"]:
        return Response({"error": "Permission denied."}, status=403)

    # Fetch all vendors
    vendors = Profile.objects.filter(role="vendor").select_related("user")
    vendor_data = [
        {
            "id": vendor.user.id,
            "username": vendor.user.username,
            "email": vendor.user.email,
            "is_active": vendor.user.is_active,
        }
        for vendor in vendors
    ]

    # Metrics: Total number of vendors
    total_vendors = vendors.count()

    return Response({"total_vendors": total_vendors, "vendors": vendor_data})

@api_view(["POST"])
def block_or_restore_vendor(request, user_id):
    """
    Block or restore a vendor account
    """
    # Ensure only shop_admins can access this endpoint
    if not request.user.profile.role == "shop_admin":
        return Response({"error": "Permission denied."}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user.profile.role != "vendor":
            return Response({"error": "Only vendors can be blocked or restored."}, status=400)

        # Toggle the is_active status
        user.is_active = not user.is_active
        user.save()

        status = "blocked" if not user.is_active else "restored"
        return Response({"message": f"Vendor account has been {status}."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_product(request):
    """
    Create a new product (with image upload) – vendors only.
    """
    user = request.user

    # Restrict to vendors
    if getattr(user.profile, "role", None) != "vendor":
        return Response({"error": "Only vendors can create products."}, status=403)

    data = request.data
    image = request.FILES.get("image")           # ✅ the uploaded file object

    name = data.get("name")
    description = data.get("description")
    material_type = data.get("material_type")
    transport_mode = data.get("transport_mode")
    category_id = data.get("category")

    # convert numerics safely
    try:
        price = Decimal(data.get("price"))
        stock = int(data.get("stock", 0))
        weight = float(data.get("weight", 0))
        energy_usage = float(data.get("energy_usage", 0))
        longevity = float(data.get("longevity", 0))
        transport_distance = float(data.get("transport_distance", 2.0))
        grid_intensity = float(data.get("grid_intensity", 0.2))
    except (ValueError, TypeError):
        return Response({"error": "Invalid numeric value."}, status=400)

    # simple validation
    if not all([name, description, price, stock, category_id, material_type, transport_mode]):
        return Response({"error": "Missing required fields."}, status=400)

    valid_materials = {
        "recycled_polyester", "virgin_polyester", "organic_cotton",
        "conventional_cotton", "linen", "hemp", "wool", "nylon", "silk",
        "recycled_cardboard", "virgin_paper", "recycled_plastic_pet",
        "virgin_plastic_pet", "bioplastic_pla", "glass", "aluminum_recycled",
        "aluminum_virgin", "steel", "copper", "lithium_ion_battery",
        "bamboo", "cork", "hardwood_timber", "concrete",
    }
    valid_modes = {"air", "truck", "sea"}

    if material_type not in valid_materials:
        return Response({"error": "Invalid material type."}, status=400)
    if transport_mode not in valid_modes:
        return Response({"error": "Invalid transport mode."}, status=400)

    try:
        category = Category.objects.get(pk=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Invalid category ID."}, status=400)

    try:
        product = Product.objects.create(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category=category,
            vendor=user,
            weight=weight,
            material_type=material_type,
            transport_distance=transport_distance,
            transport_mode=transport_mode,
            energy_usage=energy_usage,
            grid_intensity=grid_intensity,
            longevity=longevity,
            image=image,                 # ✅ correctly saved file
            status="pending",
        )
        serializer = ProductSerializer(product)
        return Response(
            {"message": "Product created successfully", "product": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        # print real error to debug
        import traceback; traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_vendor_products(request):
    """
    Get all products for the logged-in vendor
    """
    user = request.user

    # Ensure the user is a vendor
    if not user.profile.role == "vendor":
        return Response({"error": "Only vendors can view their products."}, status=403)

    # Fetch products for the vendor
    products = Product.objects.filter(vendor=user)
    product_data = [
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
        }
        for product in products
    ]

    return Response({"products": product_data})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Add a product to the cart or update its quantity
    """
    user = request.user
    product_id = request.data.get("product_id")
    quantity = request.data.get("quantity", 1)

    try:
        product = Product.objects.get(id=product_id)

        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=user)

        # Check if the product is already in the cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            # If the item already exists, update the quantity
            cart_item.quantity += int(quantity)
        else:
            cart_item.quantity = int(quantity)

        cart_item.save()

        return Response({"message": "Product added to cart successfully."}, status=200)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_cart(request):
    """
    View the user's cart
    """
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        cart_items = cart.items.all()
        data = [
            {
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": item.product.price,
                },
                "quantity": item.quantity,
            }
            for item in cart_items
        ]
        return Response({"cart": data}, status=200)
    except Cart.DoesNotExist:
        return Response({"cart": []}, status=200)
    
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item_quantity(request):
    """
    Update the quantity of a cart item
    """
    user = request.user
    product_id = request.data.get("product_id")
    quantity = request.data.get("quantity")

    if quantity < 1:
        return Response({"error": "Quantity must be at least 1."}, status=400)

    try:
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.quantity = quantity
        cart_item.save()

        return Response({"message": "Cart item updated successfully."}, status=200)
    except Cart.DoesNotExist:
        return Response({"error": "Cart not found."}, status=404)
    except CartItem.DoesNotExist:
        return Response({"error": "Cart item not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """
    Clear all items from the user's cart.
    """
    user = request.user
    try:
        # Get the user's cart
        cart = Cart.objects.get(user=user)
        # Delete all items in the cart
        CartItem.objects.filter(cart=cart).delete()
        return Response({"message": "Cart cleared successfully"}, status=200)
    except Cart.DoesNotExist:
        return Response({"error": "Cart not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    Create an order for the authenticated user.
    """
    user = request.user
    data = request.data

    # Extract order details from the request
    address = data.get("address")
    delivery_option = data.get("deliveryOption")
    cart_items = data.get("cart")
    total_cost = data.get("totalCost")

    if not address or not cart_items:
        return Response({"error": "Invalid order data"}, status=400)

    # Create the order
    order = Order.objects.create(
        user=user,
        full_name=address["fullName"],
        street=address["street"],
        city=address["city"],
        region=address["region"],
        post_code=address["postCode"],
        country=address["country"],
        delivery_option=delivery_option,
        total_cost=total_cost,
    )

    # Create order items and update product stock
    for item in cart_items:
        product_data = item["product"]
        product_id = product_data["id"]
        quantity = item["quantity"]
        price = product_data["price"]

        # Fetch the product instance
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": f"Product with id {product_id} does not exist."}, status=400)

        # Check if enough stock is available
        if product.stock < quantity:
            return Response({"error": f"Not enough stock for product {product.name}."}, status=400)

        # Create the order item
        OrderItem.objects.create(
            order=order,
            product=product,
            price=price,
            quantity=quantity,
        )

        # Subtract the ordered quantity from stock and save
        product.stock -= quantity
        product.save()

    # Clear the user's cart
    CartItem.objects.filter(cart__user=user).delete()

    return Response({"message": "Order created successfully", "orderId": order.id}, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_orders(request):
    """
    Fetch all orders for the authenticated user.
    """
    user = request.user
    # Fetch orders and "select_related" to optimize database hits
    orders = Order.objects.filter(user=user).order_by("-created_at")

    data = [
        {
            "id": order.id,
            "created_at": order.created_at,
            "total_cost": float(order.total_cost), # 1. Convert Decimal to float for JSON
            "status": order.status,
            "items": [
                {
                    # 2. FIX: Pull name from the Product, not the OrderItem
                    "name": item.product.name, 
                    "price": float(item.price),
                    "quantity": item.quantity,
                }
                # 3. FIX: Use the correct related_name (usually 'items' or 'orderitem_set')
                for item in order.items.all() 
            ],
        }
        for order in orders
    ]

    return Response(data, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):
    """
    Fetch dashboard metrics for the authenticated user.
    """
    user = request.user

    # Fetch orders with related data
    orders = Order.objects.filter(user=user).prefetch_related('items__product')

    # Total CO2 saved
    total_co2_saved = sum(
        item.product.co2_saved * item.quantity
        for order in orders
        for item in order.items.all()
    )

    # Number of EcoPurchases
    eco_purchases = orders.count()

    # Average EcoScore
    eco_scores = [
        item.product.eco_score
        for order in orders
        for item in order.items.all()
    ]
    average_eco_score = sum(eco_scores) / len(eco_scores) if eco_scores else 0

    # CO2 savings over time
    co2_savings_over_time = (
        Order.objects.filter(user=user)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total_co2_saved=Sum(F("items__quantity") * F("items__product__co2_saved")))
        .order_by("month")
    )

    # Recent purchases
    recent_orders = orders.order_by("-created_at")[:5]
    recent_purchases = [
        {
            "id": order.id,
            "created_at": order.created_at,
            "total_cost": order.total_cost,
            "items": [
                {
                    "name": item.product.name,
                    "price": item.price,
                    "quantity": item.quantity,
                }
                for item in order.items.all()
            ],
        }
        for order in recent_orders
    ]

    return Response({
        "total_co2_saved": total_co2_saved,
        "eco_purchases": eco_purchases,
        "average_eco_score": average_eco_score,
        "co2_savings_over_time": list(co2_savings_over_time),
        "recent_purchases": recent_purchases,
    }, status=200)

class VendorProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.GET.get("status")
        qs = Product.objects.filter(vendor=user)
        if status_param and status_param != "all":
            qs = qs.filter(status=status_param)
        return qs

class VendorProductStockUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk, vendor=request.user)
        stock = request.data.get("stock")
        if stock is not None and isinstance(stock, int):
            product.stock = stock
            product.save()
            return Response({"success": True, "stock": product.stock})
        return Response({"error": "Invalid stock value"}, status=status.HTTP_400_BAD_REQUEST)

class VendorOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all orders for products owned by this vendor
        products = Product.objects.filter(vendor=request.user)
        orders = Order.objects.filter(product__in=products)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class VendorOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk, product__vendor=request.user)
        status_value = request.data.get("status")
        if status_value not in ["pending", "processing", "shipped", "delivered", "cancelled"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_value
        order.save()
        return Response({"success": True, "status": order.status})
    
class VendorOrderItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = OrderItem.objects.filter(
            product__vendor=request.user
        ).select_related("order", "product")
        serializer = OrderItemDetailSerializer(items, many=True)
        return Response(serializer.data)

class VendorOrderItemStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        item = get_object_or_404(OrderItem, pk=pk, product__vendor=request.user)
        status_value = request.data.get("status")
        if status_value not in dict(OrderItem.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        item.status = status_value
        item.save()
        return Response({"success": True, "status": item.status})

class PendingProductListView(ListAPIView):
    queryset = Product.objects.filter(status="pending")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class PendingProductDetailView(RetrieveAPIView):
    queryset = Product.objects.filter(status="pending")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class ProductMetricApprovalView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        approvals = request.data.get("approvals", {})
        # approvals = { "name": true, "description": true, ... }

        if not all(approvals.values()):
            product.status = "rejected"
        else:
            product.status = "verified"
        product.save()
        return Response({"status": product.status})
    
class ShopAdminProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        status = self.request.GET.get("status")
        qs = Product.objects.all()
        if status in ["pending", "verified", "rejected"]:
            qs = qs.filter(status=status)
        return qs

class ProductDetailView(RetrieveAPIView):
    """
    Retrieve product details by ID.
    Endpoint: GET /api/products/<int:pk>/
    """
    queryset = Product.objects.filter(status='verified')  # Only verified products are visible
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
    # Always pretend success
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If that email exists, a reset link has been sent."}, status=200)
    # Correct UID and token
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # Use NEXTAUTH_URL from .env
    frontend_url = os.getenv("NEXTAUTH_URL", "http://localhost:3000")
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
    send_mail(
        subject="Reset your EcoShop password",
        message=f"Click the link to reset your password:\n\n{reset_url}\n\nIf you did not request this, ignore this email.",
        from_email=None,  # uses DEFAULT_FROM_EMAIL
        recipient_list=[email],
        fail_silently=False,
    )
    return Response({"message": "Password reset email sent."}, status=200)

@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("password")

    if not new_password:
        return Response({"error": "Password is required"}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({"error": "Invalid reset link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successful"}, status=200)

@api_view(["GET"])
@permission_classes([AllowAny])
def list_public_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)
# 2️⃣ Admin-only create + list view
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]    # anyone can list
        return [IsAdminUser()]     # only admins can create
# 3️⃣ Admin-only update/delete view
class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=404)
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_review(request):
    serializer = ReviewSerializer(
        data=request.data,
        context={"request": request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET"])
@permission_classes([AllowAny])
def product_reviews(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product).select_related(
        "user",
        "product",
        "order"
    )
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)





