from rest_framework import serializers
from .models import Product, Category

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