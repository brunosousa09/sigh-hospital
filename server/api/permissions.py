from rest_framework import permissions

class IsGestorOrDevOrReadOnly(permissions.BasePermission):
    """
    - .dev e .gestor: Podem tudo.
    - .view: Só podem ler (GET), não podem criar/editar/excluir.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        username = request.user.username
        if username.endswith('.view'):
            return False 
        
        return True 