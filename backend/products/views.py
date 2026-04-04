from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Product, Profile
from .serializers import ProductSerializer, UserSerializer, UserMeSerializer, ProfileSerializer
from .permissions import IsVendorOrReadOnly
from rest_framework.response import Response


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsVendorOrReadOnly]


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


