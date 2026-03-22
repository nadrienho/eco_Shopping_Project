from rest_framework import serializers
from .models import Product, Category, Profile
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # This nested serializer shows the full category info instead of just an ID
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'name', 'description', 
            'price', 'material_composition', 
            'carbon_footprint_kg', 'eco_score', 'image_url'
        ]

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role', 'shop_name', 'bio']

class UserSerializer(serializers.ModelSerializer):
    # This allows us to see the profile data inside the user data
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class UserMeSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']