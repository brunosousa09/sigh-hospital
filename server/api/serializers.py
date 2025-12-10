from rest_framework import serializers
from .models import Empresa, Transacao, Notificacao
from django.contrib.auth.models import User
from datetime import date

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class TransacaoSerializer(serializers.ModelSerializer):
    nome_empresa = serializers.ReadOnlyField(source='empresa.nome')
    
    class Meta:
        model = Transacao
        fields = '__all__'

    def validate(self, data):
        """
        Validações de segurança para garantir integridade das datas
        """
        hoje = date.today()
        
        entrada = data.get('data_entrada')
        saida = data.get('data_saida')

        if self.instance and not entrada:
            entrada = self.instance.data_entrada

        if entrada and entrada > hoje:
            raise serializers.ValidationError({"data_entrada": "A data de entrada não pode ser futura."})

        if saida and saida > hoje:
            raise serializers.ValidationError({"data_saida": "A data de baixa não pode ser futura."})

        if saida and entrada and saida < entrada:
             raise serializers.ValidationError({
                 "data_saida": f"Erro Cronológico: A baixa ({saida}) não pode ocorrer antes da entrada da nota ({entrada})."
             })

        return data

class NotificacaoSerializer(serializers.ModelSerializer):

    criado_em = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Notificacao
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

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