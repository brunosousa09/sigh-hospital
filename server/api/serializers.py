from rest_framework import serializers
from .models import Empresa, Transacao
from django.contrib.auth.models import User

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class TransacaoSerializer(serializers.ModelSerializer):
    nome_empresa = serializers.ReadOnlyField(source='empresa.nome')
    
    class Meta:
        model = Transacao
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}} # Password não é obrigatório na edição

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance