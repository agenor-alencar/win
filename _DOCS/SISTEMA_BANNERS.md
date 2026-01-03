# 🎨 Sistema de Banners Dinâmicos - WIN Marketplace

Sistema completo de gerenciamento de banners para a home page do WIN Marketplace, com carrossel animado e painel administrativo.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Deploy e Configuração](#deploy-e-configuração)
5. [Uso do Sistema](#uso-do-sistema)
6. [API Endpoints](#api-endpoints)
7. [Componentes Frontend](#componentes-frontend)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Sistema que permite:
- **Home Page**: Carrossel de banners com animações suaves (Swiper.js + Framer Motion)
- **Admin Panel**: Gerenciamento completo de banners (CRUD) com upload de imagens
- **Storage**: Imagens armazenadas no DigitalOcean Spaces
- **Lazy Loading**: Otimização de performance para VPS
- **Responsivo**: Design adaptado para mobile, tablet e desktop

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Spring Boot 3.x** - Framework Java
- **PostgreSQL** - Banco de dados
- **AWS SDK** - Upload para DigitalOcean Spaces (compatível com S3)
- **Spring Security** - Autenticação e autorização (Role ADMIN)

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Swiper.js 11** - Carrossel de banners
- **Framer Motion 12** - Animações
- **Tailwind CSS** - Estilização
- **Axios** - Requisições HTTP

---

## 📁 Estrutura do Projeto

### Backend

```
backend/src/main/java/com/win/marketplace/
├── model/
│   └── Banner.java                          # Entidade JPA
├── repository/
│   └── BannerRepository.java                # Repository Spring Data
├── service/
│   └── BannerService.java                   # Lógica de negócio
├── controller/
│   └── BannerController.java                # Endpoints REST
└── dto/
    ├── request/
    │   ├── BannerCreateRequestDTO.java
    │   └── BannerUpdateRequestDTO.java
    ├── response/
    │   └── BannerResponseDTO.java
    └── mapper/
        └── BannerMapper.java
```

### Frontend

```
win-frontend/src/
├── components/
│   └── MainCarousel.tsx                     # Carrossel da home
├── pages/
│   └── admin/
│       └── AdminBanners.tsx                 # Painel admin
└── lib/
    └── bannerApi.ts                         # Serviço de API
```

### Database

```
database/migrations/
└── 005_create_banners_table.sql             # Migration do banco
```

---

## 🚀 Deploy e Configuração

### Passo 1: Aplicar Migration no Banco de Dados

```bash
# Na VPS, conectar ao PostgreSQL
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql

# Verificar se a tabela foi criada
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d banners"
```

**Você deve ver:**
- Tabela `banners` com colunas: id, titulo, subtitulo, imagem_url, link_url, ordem, ativo, criado_em, atualizado_em
- 3 banners de exemplo inseridos automaticamente

### Passo 2: Instalar Dependências do Frontend

```bash
cd win-frontend
npm install
```

**Dependência adicionada:**
- `swiper@^11.1.15` (Framer Motion já estava instalado)

### Passo 3: Rebuild do Backend

```bash
# Na VPS
cd /root/win-marketplace

# Parar containers
docker compose down

# Rebuild do backend (incluir novas classes Java)
docker compose build backend --no-cache

# Subir containers
docker compose up -d

# Verificar logs
docker compose logs -f backend
```

### Passo 4: Build do Frontend

```bash
# Local ou na VPS
cd win-frontend
npm run build
```

### Passo 5: Criar Pasta no DigitalOcean Spaces

Via painel da DigitalOcean:
1. Acesse: https://cloud.digitalocean.com/spaces/win-marketplace-storage
2. Crie a pasta: `banners/`
3. (Opcional) Faça upload de imagens de teste

---

## 📖 Uso do Sistema

### Como Admin

1. **Acessar painel:**
   - Login com conta ADMIN
   - Ir para: `/admin/banners`

2. **Criar novo banner:**
   - Clicar em "Novo Banner"
   - Preencher formulário:
     - **Título**: Ex: "Ferragens e Ferramentas"
     - **Subtítulo**: Ex: "As melhores marcas: Ingco, Bosch, Makita"
     - **Link URL**: Ex: "/categoria/ferragens" (opcional)
     - **Ordem**: Número de exibição (1 = primeiro)
     - **Imagem**: Selecionar arquivo (máximo 10MB)
     - **Ativo**: Checkbox para ativar/desativar
   - Clicar em "Criar Banner"

3. **Editar banner:**
   - Clicar no botão "Editar" na listagem
   - Alterar campos desejados
   - Salvar alterações

4. **Ativar/Desativar:**
   - Clicar no botão "Ativar/Desativar"
   - Banner desativado não aparece na home

5. **Excluir banner:**
   - Clicar no botão "Excluir"
   - Confirmar exclusão
   - Imagem será removida do Spaces

### Como Visitante (Home Page)

Os banners aparecem automaticamente no topo da página inicial:
- **Carrossel automático**: Troca a cada 5 segundos
- **Navegação manual**: Setas laterais (aparecem ao passar o mouse)
- **Paginação**: Bolinhas na parte inferior
- **Animações**: Textos e botões com efeito de entrada suave
- **Lazy loading**: Imagens carregam sob demanda

---

## 🔌 API Endpoints

### Públicos

```http
GET /api/v1/banners
```
**Descrição**: Lista banners ativos ordenados por ordem  
**Autenticação**: Não requerida  
**Resposta**: `Banner[]`

### Admin (Requer Role ADMIN)

```http
GET /api/v1/admin/banners
```
**Descrição**: Lista todos os banners (incluindo inativos)  
**Resposta**: `Banner[]`

---

```http
GET /api/v1/admin/banners/{id}
```
**Descrição**: Busca um banner por ID  
**Resposta**: `Banner`

---

```http
POST /api/v1/admin/banners
Content-Type: multipart/form-data
```
**Descrição**: Cria novo banner com upload de imagem  
**Body**:
- `titulo` (string, obrigatório)
- `subtitulo` (string, opcional)
- `linkUrl` (string, opcional)
- `ordem` (number, obrigatório)
- `ativo` (boolean, opcional, padrão: true)
- `file` (File, obrigatório)

**Resposta**: `Banner`

---

```http
PUT /api/v1/admin/banners/{id}
Content-Type: application/json
```
**Descrição**: Atualiza dados de um banner  
**Body**: `BannerUpdateRequest`  
**Resposta**: `Banner`

---

```http
PUT /api/v1/admin/banners/{id}/imagem
Content-Type: multipart/form-data
```
**Descrição**: Atualiza apenas a imagem  
**Body**: `file` (File)  
**Resposta**: `Banner`

---

```http
PATCH /api/v1/admin/banners/{id}/toggle
```
**Descrição**: Ativa/desativa um banner  
**Resposta**: `Banner`

---

```http
DELETE /api/v1/admin/banners/{id}
```
**Descrição**: Exclui um banner e sua imagem  
**Resposta**: `204 No Content`

---

## 🎨 Componentes Frontend

### MainCarousel

**Localização**: `win-frontend/src/components/MainCarousel.tsx`

**Props**: Nenhuma (busca dados da API automaticamente)

**Recursos**:
- Carrossel automático com loop infinito
- Efeito fade entre slides
- Navegação por setas (visível ao hover)
- Paginação customizada
- Animações Framer Motion nos textos
- Lazy loading de imagens
- Responsivo (mobile-first)

**Uso**:
```tsx
import MainCarousel from "@/components/MainCarousel";

function HomePage() {
  return (
    <div>
      <MainCarousel />
    </div>
  );
}
```

### AdminBanners

**Localização**: `win-frontend/src/pages/admin/AdminBanners.tsx`

**Recursos**:
- Listagem de todos os banners
- Formulário de criação com upload
- Edição de metadados (sem imagem)
- Toggle de ativação rápida
- Exclusão com confirmação
- Stats: Total, Ativos, Inativos

---

## 🎯 Exemplos de Banners

### Banner 1 - Ferragens JC Ferragens
```
Título: Ferragens e Ferramentas de Qualidade
Subtítulo: JC Ferragens - Marca líder em ferragens para construção
Link: /categoria/ferragens
Ordem: 1
```

### Banner 2 - Marcas Parceiras
```
Título: As Melhores Marcas Estão Aqui
Subtítulo: Ingco • Bosch • Hafele • Makita • Dewalt • Stanley
Link: /produtos
Ordem: 2
```

### Banner 3 - Promoção
```
Título: Promoções Imperdíveis
Subtítulo: Ferramentas FGVTN e Irwin com até 30% OFF + Frete Grátis
Link: /promocoes
Ordem: 3
```

---

## 🎨 Recomendações de Design

### Dimensões de Imagem
- **Desktop**: 1920x500px (formato widescreen)
- **Mobile**: 1200x800px (imagem cortada automaticamente)
- **Formato**: JPG (menor tamanho) ou PNG (melhor qualidade)
- **Peso**: Máximo 2MB (comprimida)

### Cores da Marca WIN
- **Primary**: `#3DBEAB` (Verde-água)
- **Secondary**: `#2D9CDB` (Azul)
- **Gradiente**: `linear-gradient(to right, #3DBEAB, #2D9CDB)`

### Dicas de Composição
1. **Texto no lado esquerdo**: Deixe 40% da imagem livre à esquerda para o texto
2. **Contraste**: Use fundo escuro ou overlay para legibilidade
3. **Foco no produto**: Mostre produtos ou logo das marcas em destaque
4. **Call-to-action**: Botão visível com cor contrastante

---

## 🔧 Troubleshooting

### Problema: Banners não aparecem na home

**Causa**: Nenhum banner ativo no banco

**Solução**:
```bash
# Verificar se existem banners
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT * FROM banners WHERE ativo = true;"

# Se vazio, inserir banners de exemplo
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql
```

---

### Problema: Erro 403 ao fazer upload

**Causa**: Permissões incorretas no Spaces

**Solução**:
1. Verificar SPACES_ACCESS_KEY e SPACES_SECRET_KEY no `.env`
2. Verificar se o bucket existe: `win-marketplace-storage`
3. No painel Spaces, configurar **File Listing**: Public ou Private (recomendado: Public)

---

### Problema: Imagem não carrega (404)

**Causa**: URL incorreta ou imagem não enviada ao Spaces

**Solução**:
1. Verificar URL no banco:
```bash
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT id, titulo, imagem_url FROM banners;"
```

2. Acessar a URL diretamente no navegador
3. Se não existir, reenviar imagem pelo admin

---

### Problema: Carrossel não funciona

**Causa**: Swiper.js não instalado

**Solução**:
```bash
cd win-frontend
npm install swiper@^11.1.15
npm run build
```

---

### Problema: Acesso negado ao painel admin

**Causa**: Usuário sem role ADMIN

**Solução**:
```sql
-- Adicionar role ADMIN ao usuário
INSERT INTO usuario_perfil (usuario_id, perfil_id)
VALUES (
  (SELECT id FROM usuarios WHERE email = 'seuemail@exemplo.com'),
  (SELECT id FROM perfis WHERE nome = 'ADMIN')
);
```

---

## 📊 Monitoramento

### Verificar uso do Spaces

```bash
# Acesse: https://cloud.digitalocean.com/spaces/win-marketplace-storage
# Vá em: Settings → Usage
```

**Custos estimados (Janeiro 2026)**:
- 5 banners (~10MB): $0.0002/mês de armazenamento
- 1000 visualizações/dia: ~$0.30/mês de transferência
- **Total**: ~$0.30/mês

---

## 🔐 Segurança

### Endpoints Protegidos

Todos os endpoints `/api/v1/admin/banners/**` requerem:
- Autenticação via JWT
- Role `ADMIN`

### Validações

- Tamanho máximo: 10MB
- Tipos permitidos: `image/jpeg`, `image/png`, `image/gif`
- Campos obrigatórios: titulo, ordem, file (no create)

---

## 📝 Logs

### Backend
```bash
docker compose logs backend | grep -i banner
```

### Erros comuns nos logs

```
"AccessDenied" → Chaves do Spaces incorretas
"NoSuchBucket" → Bucket não existe
"Banner não encontrado" → ID inválido
```

---

## ✅ Checklist de Deploy

- [ ] Migration 005 aplicada no banco
- [ ] Pasta `banners/` criada no Spaces
- [ ] Dependência Swiper instalada no frontend
- [ ] Backend rebuilt com `--no-cache`
- [ ] Frontend built com `npm run build`
- [ ] Containers reiniciados
- [ ] Rota `/admin/banners` acessível
- [ ] Upload de banner testado
- [ ] Banner aparece na home
- [ ] Navegação do carrossel funciona
- [ ] Animações suaves ao carregar

---

## 🎉 Próximos Passos

### Melhorias Futuras

1. **Analytics**: Rastrear cliques nos banners
2. **A/B Testing**: Testar diferentes variações
3. **Agendamento**: Programar banners para datas específicas
4. **Segmentação**: Banners diferentes por categoria de produto
5. **Vídeos**: Suporte para banners em vídeo MP4
6. **Editor de Imagem**: Crop e ajuste direto no admin

---

## 📞 Suporte

- **Logs**: `docker compose logs backend --tail=100`
- **Banco**: `docker exec -it win-marketplace-db psql -U postgres -d win_marketplace`
- **Documentação Spaces**: [DigitalOcean Spaces Docs](https://docs.digitalocean.com/products/spaces/)

---

**Última atualização**: 03/01/2026  
**Versão**: 1.0.0  
**Autor**: Sistema WIN Marketplace
