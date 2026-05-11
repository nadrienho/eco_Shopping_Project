from pyclbr import Class
from rest_framework import serializers
from .models import Order, Product, Category, Profile, OrderItem, Category
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # This nested serializer shows the full category info instead of just an ID
    category = CategorySerializer(read_only=True)
    vendor_name = serializers.CharField(source="vendor.username", read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'category', 'vendor',
            'created_at', 'weight', 'material_type', 'transport_distance', 'transport_mode',
            'energy_usage', 'grid_intensity', 'co2_saved', 'status', 'co2_baseline', 'actual_co2', 'eco_score', 'image', 'vendor_name',
        ]

    def get_eco_score(self, obj):
        return obj.eco_score  # Assuming `eco_score` is a property in the Product model


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

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "order_id", "product", "quantity", "price", "status"]

    def get_order_id(self, obj):
        if obj.order:
            return obj.order.id
        return None
    
    def get_product(self, obj):
        if obj.product:
            return {"id": obj.product.id, "name": obj.product.name}
        return None
    

class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source='user.username')
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", 
            "customer", 
            "items", 
            "total_price",
            "status", 
            "created_at",
            "full_name",
            "street",
            "city",
            "region",
            "post_code",
            "country",
            "delivery_option",
            "total_cost",
        ]

    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

    


