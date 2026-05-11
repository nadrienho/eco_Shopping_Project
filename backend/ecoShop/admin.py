from django.contrib import admin
from .models import Category, Product, Profile, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'stock', 'price', 'get_eco_score')
    list_filter = ('category', 'status')  # Allows filtering by category and status in the sidebar

    def get_eco_score(self, obj):
        return obj.eco_score

    get_eco_score.short_description = 'Eco Score'

    actions = ['approve_ecoShop']

    def approve_ecoShop(self, request, queryset):
        queryset.update(status='verified')
    approve_ecoShop.short_description = "Mark selected ecoShop as verified"

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'shop_name']
    list_filter = ['role']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]  # Shows items directly inside the order page