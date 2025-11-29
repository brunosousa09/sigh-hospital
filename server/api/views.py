from rest_framework import viewsets
from .models import Empresa, Transacao
from .serializers import EmpresaSerializer, TransacaoSerializer
from rest_framework.permissions import IsAuthenticated

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated] 

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsAuthenticated]