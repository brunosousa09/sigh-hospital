from django.db import models
from datetime import date 

class Empresa(models.Model):
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=20, unique=True)
    tipo = models.JSONField(default=list, blank=True, help_text="Lista de ramos de atividade")    
    licitacao = models.BooleanField(default=False, help_text="Possui licitação vigente?")
    emendas = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.nome

class Transacao(models.Model):
    TIPO_CHOICES = [('entrada', 'Entrada'), ('saida', 'Saída')]
    STATUS_CHOICES = [('pendente', 'Pendente'), ('pago', 'Pago')]

    MATERIAL_CHOICES = [
        ('laboratorio', 'Laboratório'),
        ('medicamentos', 'Medicamentos'),
        ('insumo', 'Insumo'),
    ]
    DESTINO_CHOICES = [
        ('atencao_primaria', 'Atenção Primária'),
        ('hospital', 'Hospital'),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='transacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente')
    
    nf = models.CharField(max_length=50, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    
    data = models.DateField(auto_now_add=True) 

    data_entrada = models.DateField(default=date.today) 
    
    data_saida = models.DateField(null=True, blank=True) 

    tipo_material = models.CharField(
        max_length=20, 
        choices=MATERIAL_CHOICES, 
        blank=True, 
        null=True,
        help_text="Tipo do material (Laboratório, Medicamentos, Insumo)"
    )
    destino_entrada = models.CharField(
        max_length=30, 
        choices=DESTINO_CHOICES, 
        blank=True, 
        null=True,
        help_text="Destino inicial (Atenção Primária ou Hospital)"
    )
    
    emenda_origem = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.tipo.upper()} - {self.valor}"

class Notificacao(models.Model):
    TIPO_CHOICES = [
        ('aviso', '🔴 Aviso Crítico (Bloqueante)'),
        ('pendencia', '🟡 Pendência / Alerta'),
        ('update', '🟢 Novidade / Atualização'),
    ]
    
    ALVO_CHOICES = [
        ('todos', 'Todos os Usuários'),
        ('gestor', 'Apenas Gestores'),
        ('view', 'Apenas Visitantes'),
        ('dev', 'Apenas Desenvolvedores'),
    ]

    titulo = models.CharField(max_length=100)
    mensagem = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='pendencia')
    alvo = models.CharField(max_length=20, choices=ALVO_CHOICES, default='todos')
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.tipo.upper()}] {self.titulo}"