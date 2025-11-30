from rest_framework import viewsets
from .models import Empresa, Transacao
from .serializers import EmpresaSerializer, TransacaoSerializer
from .permissions import IsGestorOrDevOrReadOnly
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, EmpresaSerializer, TransacaoSerializer

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsGestorOrDevOrReadOnly] 

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsGestorOrDevOrReadOnly] 


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 

    def create(self, request, *args, **kwargs):
        creator_role = request.user.username.split('.')[-1] 
        new_username = request.data.get('username', '')

        if creator_role == 'view':
            return Response({"detail": "Sem permissão."}, status=status.HTTP_403_FORBIDDEN)

        if creator_role == 'gestor':
            if not new_username.endswith('.view'):
                return Response(
                    {"detail": "Gestores só podem criar usuários do tipo Visitante (.view)."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        if not (new_username.endswith('.dev') or new_username.endswith('.gestor') or new_username.endswith('.view')):
             return Response(
                {"detail": "O usuário deve terminar em .dev, .gestor ou .view"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)
    