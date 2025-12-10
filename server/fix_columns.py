import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def add_column_if_missing(table, column, data_type, default=None):
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='{table}' AND column_name='{column}'
            """)
            if cursor.fetchone():
                print(f"✅ Coluna '{column}' já existe em '{table}'.")
                return

            print(f"⚠️ Coluna '{column}' faltando em '{table}'. Adicionando...")
            
            sql = f"ALTER TABLE {table} ADD COLUMN {column} {data_type}"
            if default is not None:
                sql += f" DEFAULT {default}"
            
            if "NOT NULL" in data_type and default is None:
                 
                 pass

            cursor.execute(sql)
            print(f"🚀 Coluna '{column}' criada com sucesso!")

        except Exception as e:
            print(f"❌ Erro ao adicionar '{column}': {e}")

print("--- INICIANDO ATUALIZAÇÃO DO BANCO LEGADO ---")


add_column_if_missing('api_empresa', 'licitacao', 'boolean DEFAULT false')
add_column_if_missing('api_empresa', 'emendas', 'jsonb DEFAULT \'[]\'::jsonb')

add_column_if_missing('api_empresa', 'tipo', 'jsonb DEFAULT \'[]\'::jsonb')



add_column_if_missing('api_transacao', 'data_entrada', 'date DEFAULT CURRENT_DATE')
add_column_if_missing('api_transacao', 'data_saida', 'date NULL')
add_column_if_missing('api_transacao', 'tipo_material', 'varchar(20) NULL')
add_column_if_missing('api_transacao', 'destino_entrada', 'varchar(30) NULL')
add_column_if_missing('api_transacao', 'emenda_origem', 'varchar(255) NULL')

print("--- FIM DA CORREÇÃO ---")