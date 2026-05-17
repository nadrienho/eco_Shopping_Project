from pyclbr import Class
from rest_framework import serializers
from .models import Order, Product, Category, Profile, OrderItem, Category, Review
from django.contrib.auth.models import User
from django.db.models import Avg

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "user_name",
            "product",
            "product_name",
            "order",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "user_name",
            "product_name",
            "created_at",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")

        if not request:
            raise serializers.ValidationError("Request context is missing.")

        user = request.user
        product = attrs.get("product")
        order = attrs.get("order")

        if order.user != user:
            raise serializers.ValidationError(
                "You can only review products from your own orders."
            )

        if Review.objects.filter(user=user, product=product, order=order).exists():
            raise serializers.ValidationError(
                "You have already reviewed this product for this order."
            )

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        return Review.objects.create(user=user, **validated_data)

class ProductSerializer(serializers.ModelSerializer):
    # This nested serializer shows the full category info instead of just an ID
    category = CategorySerializer(read_only=True)
    vendor_name = serializers.CharField(source="vendor.username", read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'category', 'vendor',
            'created_at', 'weight', 'material_type', 'transport_distance', 'transport_mode',
            'energy_usage', 'grid_intensity', 'co2_saved', 'status', 'co2_baseline', 'actual_co2', 'eco_score', 'image', 'vendor_name', 'average_rating', 'review_count',
            'reviews',

        ]

    def get_eco_score(self, obj):
        return obj.eco_score  # Assuming `eco_score` is a property in the Product model
    def get_average_rating(self, obj):
        average = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(average, 2) if average else 0
    def get_review_count(self, obj):
        return obj.reviews.count()


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
    product = serializers.IntegerField(source="product.id", read_only=True)
    name = serializers.CharField(source="product.name", read_only=True)
    description = serializers.CharField(source="product.description", read_only=True)
    price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    image = serializers.ImageField(source="product.image", read_only=True)
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "name",
            "description",
            "price",
            "quantity",
            "image",
        ]

    def get_order_id(self, obj):
        if obj.order:
            return obj.order.id
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

class OrderItemDetailSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(source='product.name')
    description = serializers.CharField(source='product.description')
    image = serializers.ImageField(source='product.image', allow_null=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'name', 'description', 'price', 'quantity', 'image', 'product']

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemDetailSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'items']



    


