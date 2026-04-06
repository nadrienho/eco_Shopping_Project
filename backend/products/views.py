from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.contrib.auth.models import User
from .models import Product, Profile, Category, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, UserSerializer, UserMeSerializer, ProfileSerializer, CategorySerializer
from .permissions import IsVendorOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.http import QueryDict


class ProductListView(ListAPIView):
    queryset = Product.objects.all()
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
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsVendorOrReadOnly]

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
            user.save()

            # Explicitly create the profile with the correct role
            profile = Profile.objects.create(
                user=user,
                role=role,
                shop_name=shop_name if role in ["vendor", "shop_admin"] else None,
                bio=bio if role in ["vendor", "shop_admin"] else None,
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
    Create a new product
    """
    user = request.user

    # Ensure only vendors can create products
    if not user.profile.role == "vendor":
        return Response({"error": "Only vendors can create products."}, status=403)

    # Extract product data from the request
    name = request.data.get("name")
    description = request.data.get("description")
    price = request.data.get("price")
    stock = request.data.get("stock")
    category_id = request.data.get("category")

    # Validate the data
    if not name or not price or not stock:
        return Response(
            {"error": "Name, price, stock and category are required fields."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Fetch the category
        category = Category.objects.get(id=category_id)
        
        # Create the product
        product = Product.objects.create(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category=category,  # Associate the product with the selected category
            vendor=user,  # Associate the product with the logged-in vendor
        )
        return Response(
            {"message": "Product created successfully.", "product": ProductSerializer(product).data},
            status=status.HTTP_201_CREATED,
        )
    except Category.DoesNotExist:
        return Response({"error": "Invalid category ID."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

@api_view(["GET"])
@permission_classes([AllowAny])
def get_categories(request):
    """
    Get all categories
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

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


    


