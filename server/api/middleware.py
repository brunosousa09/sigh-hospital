import threading
from rest_framework_simplejwt.authentication import JWTAuthentication

local_storage = threading.local()

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        try:
            auth = JWTAuthentication()
            user_auth = auth.authenticate(request)
            if user_auth is not None:
                request.user = user_auth[0]
        except:
            pass

        setattr(local_storage, 'user', getattr(request, 'user', None))
        
        response = self.get_response(request)
        
        setattr(local_storage, 'user', None)
        
        return response

def get_current_user():
    return getattr(local_storage, 'user', None)