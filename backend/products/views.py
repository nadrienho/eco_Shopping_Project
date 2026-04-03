from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Product, Profile
from .serializers import ProductSerializer, UserSerializer, UserMeSerializer, ProfileSerializer
from .permissions import IsVendorOrReadOnly


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

        if role not in ["customer", "vendor"]:
            return Response(
                {"error": "Invalid role. Choose 'customer' or 'vendor'."},
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