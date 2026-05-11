from django.urls import path, include
from .views import CategoryRetrieveUpdateDestroyView, ProductListView, UserDetailView, RegisterView, block_or_restore_vendor, clear_cart, create_order, customer_dashboard, get_saved_products, list_public_categories, update_cart_item_quantity, view_cart, add_to_cart, view_orders
from .views import get_all_customers, block_or_restore_customer, get_all_vendors, block_or_restore_vendor, create_product, get_vendor_products, PendingProductListView
from .views import VendorProductListView, VendorProductStockUpdateView, VendorOrderItemListView, VendorOrderItemStatusUpdateView, PendingProductDetailView, ProductMetricApprovalView
from .views import ShopAdminProductListView, ProductDetailView, password_reset, password_reset_confirm, CategoryListCreateView, CategoryRetrieveUpdateDestroyView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('user/me/', UserDetailView.as_view(), name='user-detail'),
    path("register/", RegisterView.as_view(), name="register"),
    path("customers/", get_all_customers, name="get_all_customers"),
    path("customers/<int:user_id>/block_restore/", block_or_restore_customer, name="block_or_restore_customer"),
    path("vendors/", get_all_vendors, name="get_all_vendors"),
    path("vendors/<int:user_id>/block_restore/", block_or_restore_vendor, name="block_or_restore_vendor"),
    path("products/create/", create_product, name="create_product"),
    path("products/vendor/", get_vendor_products, name="get_vendor_products"),
    path("cart/add/", add_to_cart, name="add_to_cart"),
    path("cart/", view_cart, name="view_cart"),
    path("cart/update/", update_cart_item_quantity, name="update_cart_item_quantity"),
    path('api/products/', ProductListView.as_view(), name='product-list'),
    path("saved-products/", get_saved_products, name="get_saved_products"),
    path("cart/clear/", clear_cart, name="clear_cart"),
    path("orders/", create_order, name="create_order"),
    path("orders/view/", view_orders, name="view_orders"),
    path("dashboard/", customer_dashboard, name="customer_dashboard"),
    path("vendor/products/", VendorProductListView.as_view(), name="vendor-products"),
    path("vendor/products/<int:pk>/stock/", VendorProductStockUpdateView.as_view(), name="vendor-product-stock-update"),
    path("vendor/order-items/", VendorOrderItemListView.as_view(), name="vendor-order-items"),
    path("vendor/order-items/<int:pk>/status/", VendorOrderItemStatusUpdateView.as_view(), name="vendor-order-item-status-update"),
    path('shop_admin/pending_products/', PendingProductListView.as_view(), name='pending_products'),
    path('shop-admin/pending-products/<int:pk>/', PendingProductDetailView.as_view()),
    path('shop-admin/pending-products/<int:pk>/approve/', ProductMetricApprovalView.as_view()),
    path('shop_admin/products/', ShopAdminProductListView.as_view(), name='shop-admin-products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path("password_reset/", password_reset, name="password_reset"),
    path("password_reset_confirm/", password_reset_confirm, name="password_reset_confirm"),
    #path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    #path("categories/", get_categories, name="get_categories"),
    # Public
    path("categories/", list_public_categories, name="public-categories"),
    # Admin CRUD
    path("categories/manage/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/manage/<int:pk>/", CategoryRetrieveUpdateDestroyView.as_view(), name="category-detail"),


    
]