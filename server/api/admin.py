from django.contrib import admin
from .models import Empresa, Transacao

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cnpj', 'licitacao', 'tipo_display')
    search_fields = ('nome', 'cnpj')
    list_filter = ('licitacao',)

    def tipo_display(self, obj):
        return ", ".join(obj.tipo)
    tipo_display.short_description = 'Ramos'

@admin.register(Transacao)
class TransacaoAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'valor', 'empresa', 'data', 'status', 'nf')
    list_filter = ('tipo', 'status', 'data', 'empresa')
    search_fields = ('descricao', 'nf', 'empresa__nome')
    ordering = ('-data',)