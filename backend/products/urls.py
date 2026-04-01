from django.urls import path
from .views import ProductListView, UserDetailView, RegisterView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('user/me/', UserDetailView.as_view(), name='user-detail'),
    path("register/", RegisterView.as_view(), name="register"),
]