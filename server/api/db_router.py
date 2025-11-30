from .middleware import get_current_user

class UserBasedRouter:
    """
    Roteador: 
    - Tabelas do sistema (auth, admin) -> Sempre 'default'
    - Usuário termina em .dev -> Banco 'tests'
    - Outros -> Banco 'default'
    """
    
    system_apps = {'auth', 'admin', 'contenttypes', 'sessions', 'messages', 'staticfiles', 'token_blacklist'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.system_apps:
            return 'default'

        try:
            user = get_current_user()
            if user and user.is_authenticated and user.username.endswith('.dev'):
                return 'tests'
        except:
            return 'default'
            
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.system_apps:
            return 'default'

        try:
            user = get_current_user()
            if user and user.is_authenticated and user.username.endswith('.dev'):
                return 'tests'
        except:
            return 'default'
            
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True