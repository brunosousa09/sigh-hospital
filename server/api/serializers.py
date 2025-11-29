from rest_framework import serializers
from .models import Empresa, Transacao

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class TransacaoSerializer(serializers.ModelSerializer):
    nome_empresa = serializers.ReadOnlyField(source='empresa.nome')
    
    class Meta:
        model = Transacao
        fields = '__all__'