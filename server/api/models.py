from django.db import models

class Empresa(models.Model):
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=20, unique=True)
    tipo = models.CharField(max_length=100) # Ex: Medicamentos, Equipamentos

    def __str__(self):
        return self.nome

class Transacao(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída')
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('pago', 'Pago')
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='transacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente')
    
    nf = models.CharField(max_length=50, blank=True, null=True)
    descricao = models.TextField()
    valor = models.DecimalField(max_digits=15, decimal_places=2) # Suporta até trilhões
    data = models.DateField(auto_now_add=True) # Pega a data de hoje automaticamente

    def __str__(self):
        return f"{self.tipo.upper()} - {self.valor} - {self.empresa.nome}"