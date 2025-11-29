
# SIGH - Sistema Integrado de Gestão Hospitalar

Sistema web completo para controle de entrada e saída de medicamentos, gestão de notas fiscais e análise financeira do **Hospital José Leite da Silva** (Tavares - PB).

O projeto utiliza uma arquitetura **Monorepo** (Client + Server) moderna, separando a API REST do Frontend.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Tecnologias Utilizadas

### Frontend (Client)
* **React.js** (Vite)
* **Tailwind CSS** (Estilização moderna e responsiva)
* **Chart.js** (Gráficos interativos)
* **Lucide React** (Ícones)
* **Axios** (Comunicação com API)

### Backend (Server)
* **Python 3**
* **Django REST Framework** (API)
* **SimpleJWT** (Autenticação segura via Token)
* **PostgreSQL** (Banco de Dados)
* **Python-Dotenv** (Segurança de variáveis)

---

## 📂 Estrutura do Projeto

```text
sigh-hospital/
├── client/             # Frontend React
│   ├── src/
│   ├── public/
│   └── ...
├── server/             # Backend Django
│   ├── api/            # Apps e Lógica de Negócio
│   ├── core/           # Configurações do Projeto
│   └── manage.py
└── README.md
````

-----

## 🛠️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:

1.  **Node.js** e **NPM**
2.  **Python 3.10+**
3.  **PostgreSQL** (Com um banco de dados vazio criado, ex: `sigh_db`)

-----

## ⚙️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### 1\. Clonar o Repositório

```bash
git clone [https://github.com/SEU-USUARIO/sigh-hospital.git](https://github.com/SEU-USUARIO/sigh-hospital.git)
cd sigh-hospital
```

### 2\. Configurando o Backend (Server)

```bash
# Entre na pasta server
cd server

# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install django djangorestframework psycopg2-binary django-cors-headers djangorestframework-simplejwt python-dotenv

# Crie o arquivo .env na raiz da pasta server/ e configure:
# SECRET_KEY=sua_chave_secreta
# DEBUG=True
# DB_NAME=sigh_db
# DB_USER=postgres
# DB_PASSWORD=sua_senha_simples
# DB_HOST=localhost
# DB_PORT=5432

# Execute as migrações no banco
python manage.py migrate

# Crie um superusuário para acessar o sistema
python manage.py createsuperuser
```

### 3\. Configurando o Frontend (Client)

Abra um **novo terminal** na raiz do projeto:

```bash
# Entre na pasta client
cd client

# Instale as dependências
npm install

# Crie o arquivo .env na raiz da pasta client/ e configure:
# VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
```

-----

## ▶️ Como Rodar o Projeto

Você precisará de dois terminais abertos simultaneamente.

**Terminal 1 (Backend):**

```bash
cd server
venv\Scripts\activate  # Lembre de ativar o venv
python manage.py runserver
```

**Terminal 2 (Frontend):**

```bash
cd client
npm run dev
```

Acesse o sistema em: **`http://localhost:5173`**

-----

## 🔐 Funcionalidades Principais

  * [x] **Login Seguro:** Autenticação via JWT com animação de boot.
  * [x] **Dashboard:** Gráficos de fluxo financeiro e KPIs em tempo real.
  * [x] **Responsividade:** Layout adaptável para Mobile, Tablet e Desktop.
  * [ ] **Gestão de Empresas:** Cadastro e listagem de fornecedores.
  * [ ] **Entrada de Notas:** Registro de compras e estoque.
  * [ ] **Controle de Saídas:** Baixa de medicamentos e pagamentos.
  * [ ] **Relatórios:** Impressão de extratos e comparativos.

-----

## 🐛 Solução de Problemas Comuns

  * **Erro de Encoding no Windows (0xe7):** Verifique se a senha do seu banco PostgreSQL contém caracteres especiais (ç, ã). Recomenda-se usar senhas alfanuméricas simples em ambiente local (ex: `admin123`).
  * **Erro no Tailwind:** Certifique-se de que está usando a versão compatível com o `postcss.config.js` (Recomendado v3.4.17).

-----

Desenvolvido para o **Hospital José Leite da Silva - HJLS - Tavares/PB**.
