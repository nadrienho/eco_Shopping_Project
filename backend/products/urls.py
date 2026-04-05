from django.urls import path
from .views import ProductListView, UserDetailView, RegisterView, block_or_restore_vendor
from .views import get_all_customers, block_or_restore_customer, get_all_vendors, block_or_restore_vendor


urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('user/me/', UserDetailView.as_view(), name='user-detail'),
    path("register/", RegisterView.as_view(), name="register"),
    path("customers/", get_all_customers, name="get_all_customers"),
    path("customers/<int:user_id>/block_restore/", block_or_restore_customer, name="block_or_restore_customer"),
    path("vendors/", get_all_vendors, name="get_all_vendors"),
    path("vendors/<int:user_id>/block_restore/", block_or_restore_vendor, name="block_or_restore_vendor"),
]