from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, TransacaoViewSet, UserViewSet

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'transacoes', TransacaoViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]