from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, TransacaoViewSet

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'transacoes', TransacaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]