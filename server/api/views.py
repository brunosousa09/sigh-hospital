from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Empresa, Transacao, Notificacao  
from .serializers import EmpresaSerializer, TransacaoSerializer, UserSerializer, NotificacaoSerializer # <--- Adicionado NotificacaoSerializer
from .permissions import IsGestorOrDevOrReadOnly

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsGestorOrDevOrReadOnly] 

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsGestorOrDevOrReadOnly] 

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all().order_by('-criado_em')
    serializer_class = NotificacaoSerializer

    permission_classes = [IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 

    def create(self, request, *args, **kwargs):
        if not request.user.username:
             return Response({"detail": "Erro de autenticação."}, status=status.HTTP_401_UNAUTHORIZED)

        creator_role = request.user.username.split('.')[-1] 
        new_username = request.data.get('username', '')

        if creator_role == 'view':
            return Response({"detail": "Sem permissão para criar usuários."}, status=status.HTTP_403_FORBIDDEN)

        if creator_role == 'gestor':
            if not new_username.endswith('.view'):
                return Response(
                    {"detail": "Gestores só podem criar usuários do tipo Visitante (.view)."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        if not (new_username.endswith('.dev') or new_username.endswith('.gestor') or new_username.endswith('.view')):
             return Response(
                {"detail": "O nome de usuário deve terminar em .dev, .gestor ou .view"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)