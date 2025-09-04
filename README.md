Sistema WIN
Este repositório contém o projeto WIN, uma aplicação web completa com frontend em React (Vite + Tailwind CSS) e backend em Java (Spring Boot) com banco de dados PostgreSQL.

Estrutura do Projeto
O projeto está organizado em duas pastas principais:

sistema-win/
├── win-frontend/    # Frontend com React + Vite + Tailwind CSS
└── win-backend/     # Backend com Java (Spring Boot)

Tecnologias Utilizadas
Backend: Java 17 (ou superior), Spring Boot, Spring Data JPA, Spring Security (com JWT), PostgreSQL, Lombok, Jakarta Validation.

Frontend: React, Vite, TypeScript, Tailwind CSS, Axios.

Comunicação: REST API.

Banco de Dados: PostgreSQL.

Orquestração: Docker Compose (para PostgreSQL).

Pré-requisitos
Antes de começar, certifique-se de ter o seguinte instalado em sua máquina:

Java Development Kit (JDK) 17 ou superior

Maven (para o backend Spring Boot)

Node.js (LTS recomendado)

npm (gerenciador de pacotes do Node.js) ou Yarn

Docker e Docker Compose (essencial para o banco de dados PostgreSQL)

Configuração e Execução do Projeto
Siga os passos abaixo para configurar e rodar o projeto completo:

1. Clonar o Repositório
Se você ainda não clonou o repositório, faça-o:

git clone https://github.com/agenor-alencar/sistema-win.git
cd sistema-win

2. Configuração do Banco de Dados (PostgreSQL com Docker Compose)
É altamente recomendado usar o Docker Compose para configurar o banco de dados PostgreSQL.

Navegue até a raiz do projeto sistema-win/ (onde o docker-compose.yml está localizado):

# Se você já está na pasta 'sistema-win', não precisa deste comando
# Caso contrário, navegue para ela
cd sistema-win

Inicie o serviço PostgreSQL usando Docker Compose:

docker-compose up -d postgres

Isso iniciará um contêiner PostgreSQL em localhost:5432 com as seguintes credenciais e nome de banco de dados:

Nome do Banco de Dados: sistema_win

Usuário: postgres

Senha: 0102 (Lembre-se de alterar esta senha em win-backend/src/main/resources/application.properties para uma mais segura em produção).

Você pode verificar o status do contêiner com:

docker-compose ps

3. Configuração e Execução do Backend (Spring Boot)
Navegue até o diretório do backend:

cd win-backend

Configure as variáveis de ambiente do banco de dados e JWT:
Abra o arquivo src/main/resources/application.properties e atualize a senha do PostgreSQL e a chave secreta do JWT:

# ... outras configurações ...

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://postgres:5432/sistema_win
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_DO_POSTGRES # <-- ALtere esta linha

# ... outras configurações ...

# JWT Configuration (para autenticação opcional)
jwt.secret=SUA_CHAVE_SECRETA_MUITO_LONGA_E_SEGURA_PARA_JWT_AQUI_MINIMO_32_CARACTERES # <-- ALtere esta linha
jwt.expiration=86400000 # 24 horas em milissegundos (24 * 60 * 60 * 1000)

Importante: Se você não usou o Docker Compose para o PostgreSQL, altere spring.datasource.url para jdbc:postgresql://localhost:5432/sistema_win e atualize username e password conforme suas configurações locais.

Compile e execute o backend:

./mvnw clean install # Para compilar e baixar dependências
./mvnw spring-boot:run # Para executar a aplicação

(No Windows, use mvnw.cmd clean install e mvnw.cmd spring-boot:run)

O backend será iniciado na porta 8080. Você pode acessá-lo em http://localhost:8080.

4. Configuração e Execução do Frontend (React)
Navegue até o diretório do frontend:

cd ../win-frontend

Configure a URL da API do backend:
Crie ou abra o arquivo .env na raiz do diretório win-frontend/ e adicione a seguinte linha:

VITE_API_URL=http://localhost:8080

Instale as dependências:

npm install
# ou
yarn install

Execute o frontend:

npm run dev
# ou
yarn dev

O frontend será iniciado na porta 5173. Você pode acessá-lo em http://localhost:5173.

Testando a Conexão e Funcionalidades
Após iniciar o banco de dados, o backend e o frontend:

Acesse o Frontend: Abra seu navegador e acesse http://localhost:5173.

Registro de Usuários:

Vá para a página de registro (se houver uma rota para ela no seu frontend, ou crie uma temporariamente).

Tente registrar diferentes tipos de usuários (CUSTOMER, MERCHANT, DRIVER) para popular o banco de dados.

Exemplo de registro via Postman/Insomnia (para teste direto do backend):

URL: http://localhost:8080/api/auth/register

Método: POST

Body (JSON):

{
    "name": "Cliente Teste",
    "email": "cliente@example.com",
    "password": "password123",
    "role": "CUSTOMER"
}

Repita para MERCHANT e DRIVER.

Login:

Tente fazer login com os usuários que você registrou. O frontend deve receber um token JWT.

Exemplo de login via Postman/Insomnia:

URL: http://localhost:8080/api/auth/login

Método: POST

Body (JSON):

{
    "email": "cliente@example.com",
    "password": "password123"
}

Testar Listagem de Produtos:

A página inicial (Index.tsx) do frontend deve tentar buscar produtos. Inicialmente, o banco de dados estará vazio.

Crie uma loja e um produto via Postman/Insomnia (usando o token JWT de um MERCHANT):

Login como MERCHANT para obter o token.

Criar Loja:

URL: http://localhost:8080/api/stores

Método: POST

Headers: Authorization: Bearer SEU_TOKEN_JWT_AQUI

Body (JSON):

{
    "name": "Minha Loja de Eletrônicos",
    "description": "Vendemos os melhores eletrônicos.",
    "category": "ELECTRONICS",
    "merchantId": SEU_ID_DE_LOJISTA_AQUI
}

Anote o id da loja criada.

Criar Produto:

URL: http://localhost:8080/api/products

Método: POST

Headers: Authorization: Bearer SEU_TOKEN_JWT_AQUI

Body (JSON):

{
    "name": "Smartphone X",
    "description": "O mais novo smartphone com câmera incrível.",
    "price": 1999.99,
    "category": "ELECTRONICS",
    "storeId": SEU_ID_DE_LOJA_AQUI
}

Recarregue a página inicial do frontend para ver os produtos.

Testar Criação de Pedidos:

Login como CUSTOMER para obter o token.

Criar Pedido:

URL: http://localhost:8080/api/orders

Método: POST

Headers: Authorization: Bearer SEU_TOKEN_JWT_AQUI

Body (JSON):

{
    "customerId": SEU_ID_DE_CLIENTE_AQUI,
    "items": [
        {
            "productId": ID_DO_SMARTPHONE_X_AQUI,
            "quantity": 1
        }
    ],
    "deliveryAddress": "Rua Exemplo, 123, Cidade, Estado"
}

Verifique as listagens de pedidos no frontend (se implementadas) ou diretamente no banco de dados.

Observações Adicionais
Autenticação JWT: O backend já implementa autenticação JWT básica. O token retornado no login deve ser incluído em todas as requisições subsequentes a endpoints protegidos no cabeçalho Authorization no formato Bearer SEU_TOKEN_AQUI. O frontend já está configurado para usar Axios, que pode ser facilmente adaptado para incluir este token (ex: usando interceptors).

Autorização (@PreAuthorize): As anotações @PreAuthorize foram adicionadas aos controladores para demonstrar o controle de acesso baseado em papéis. Você pode ajustá-las conforme as regras de negócio do seu aplicativo.

Tratamento de Erros: O backend retorna respostas HTTP apropriadas (ex: 404 Not Found, 400 Bad Request) para erros comuns. O frontend está configurado para exibir mensagens de erro/sucesso.

Testes Automatizados: O pom.xml inclui dependências para testes. Você pode adicionar testes de unidade e integração para o backend.

Melhorias Futuras:

Implementar lógica de autorização mais granular nos controladores (ex: um lojista só pode gerenciar seus próprios produtos e lojas).

Adicionar validações de negócio mais complexas nos serviços.

Implementar paginação para listagens grandes.

Adicionar endpoints para atualização de perfil de usuário (além do registro inicial).

Mapeamento mais detalhado entre entidades e DTOs para cenários específicos.