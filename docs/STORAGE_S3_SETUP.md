# Guia de Configuração de Armazenamento de Imagens S3

## 📋 Visão Geral

Sistema de armazenamento de imagens com suporte para:
- ✅ **AWS S3** (Amazon)
- ✅ **DigitalOcean Spaces** (compatível S3)
- ✅ **Armazenamento Local** (fallback/desenvolvimento)
- ✅ **Otimização automática** (thumbnails e versões médias)
- ✅ **Clean Architecture** (fácil trocar de provedor)

## 🚀 Implementação Completa

### 1. Dependências Adicionadas

✅ **AWS SDK S3 v2**: `software.amazon.awssdk:s3:2.20.26`
✅ **Thumbnailator**: `net.coobird:thumbnailator:0.4.20`

### 2. Arquivos Criados

```
backend/src/main/java/com/win/marketplace/
├── config/
│   └── StorageProperties.java          # Configurações
├── service/storage/
│   ├── ImageStorageService.java        # Interface abstrata
│   ├── S3StorageService.java           # Implementação S3
│   └── LocalStorageService.java        # Implementação Local
```

### 3. Configurações no application.yml

```yaml
app:
  storage:
    type: ${STORAGE_TYPE:local}  # local, s3, digitalocean
    s3:
      access-key: ${AWS_ACCESS_KEY_ID:}
      secret-key: ${AWS_SECRET_ACCESS_KEY:}
      region: ${AWS_REGION:sa-east-1}
      bucket: ${S3_BUCKET_NAME:win-marketplace-images}
      endpoint: ${S3_ENDPOINT:}  # DigitalOcean/MinIO
      public-url: ${S3_PUBLIC_URL:}  # CDN opcional
    image:
      max-size-mb: 10
      allowed-types: jpg,jpeg,png,webp,gif
      thumbnail-width: 300
      thumbnail-height: 300
      medium-width: 800
      medium-height: 800
```

## 🔧 Configuração por Provedor

### AWS S3

#### 1. Criar Bucket no AWS Console

```bash
# Via Console: https://console.aws.amazon.com/s3/
# Nome: win-marketplace-images
# Região: sa-east-1 (São Paulo)
# ACL: Desabilitado (usar bucket policy)
```

#### 2. Configurar Permissões Públicas

Adicione esta **Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::win-marketplace-images/*"
    }
  ]
}
```

#### 3. Criar Usuário IAM

```bash
# Console IAM: https://console.aws.amazon.com/iam/
# Criar usuário: win-marketplace-s3-user
# Permissões: AmazonS3FullAccess (ou custom policy abaixo)
```

**Custom IAM Policy** (recomendado - mais restritivo):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::win-marketplace-images",
        "arn:aws:s3:::win-marketplace-images/*"
      ]
    }
  ]
}
```

#### 4. Gerar Access Keys

```bash
# IAM > Usuários > win-marketplace-s3-user > Security credentials
# Criar Access Key > Application running outside AWS
# Copiar: Access Key ID e Secret Access Key
```

#### 5. Configurar .env

```bash
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=sa-east-1
S3_BUCKET_NAME=win-marketplace-images
```

### DigitalOcean Spaces

#### 1. Criar Space

```bash
# Console: https://cloud.digitalocean.com/spaces
# Nome: win-marketplace-images
# Região: NYC3, SFO3, AMS3, etc.
# CDN: Habilitar (opcional)
```

#### 2. Gerar Spaces Access Keys

```bash
# API > Spaces access keys > Generate New Key
# Nome: win-marketplace-production
# Copiar: Access Key ID e Secret Key
```

#### 3. Configurar .env

```bash
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=DO00EXAMPLE
AWS_SECRET_ACCESS_KEY=secretkey+example
AWS_REGION=nyc3
S3_BUCKET_NAME=win-marketplace-images
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
# Opcional: Se habilitou CDN
S3_PUBLIC_URL=https://win-marketplace-images.nyc3.cdn.digitaloceanspaces.com
```

### Armazenamento Local (Desenvolvimento)

```bash
STORAGE_TYPE=local
# Imagens salvas em: backend/uploads/produtos/
```

## 📚 Como Usar no Código

### Exemplo: Upload de Imagem de Produto

```java
@RestController
@RequestMapping("/api/v1/produtos")
public class ProdutoController {
    
    @Autowired
    private ImageStorageService imageStorageService;
    
    @PostMapping("/{id}/imagens")
    public ResponseEntity<?> uploadImagem(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        
        // Validar arquivo
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo vazio");
        }
        
        // Validar tipo
        String contentType = file.getContentType();
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Tipo inválido");
        }
        
        // Fazer upload com thumbnails
        String folderPath = String.format("produtos/lojista-%d/produto-%d", 
            lojistaId, id);
        
        ImageStorageService.ImageUploadResult result = 
            imageStorageService.uploadImageWithThumbnail(
                file.getInputStream(),
                file.getOriginalFilename(),
                contentType,
                folderPath
            );
        
        // Salvar URLs no banco
        ImagemProduto imagem = new ImagemProduto();
        imagem.setEnderecoImagem(result.getOriginalUrl());
        imagem.setEnderecoThumbnail(result.getThumbnailUrl());
        imagem.setEnderecoMedio(result.getMediumUrl());
        imagem.setProduto(produto);
        imagemRepository.save(imagem);
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/{id}/imagens/{imagemId}")
    public ResponseEntity<?> deleteImagem(
        @PathVariable Long id,
        @PathVariable Long imagemId
    ) {
        ImagemProduto imagem = imagemRepository.findById(imagemId)
            .orElseThrow(() -> new NotFoundException("Imagem não encontrada"));
        
        // Remover do storage
        imageStorageService.deleteImage(imagem.getEnderecoImagem());
        
        // Remover do banco
        imagemRepository.delete(imagem);
        
        return ResponseEntity.ok().build();
    }
}
```

### Migração de Dados Existentes

Script para migrar imagens locais para S3:

```java
@Service
public class ImageMigrationService {
    
    @Autowired
    private ImageStorageService imageStorageService;
    
    @Autowired
    private ImagemProdutoRepository imagemRepository;
    
    @Transactional
    public void migrateToS3() throws Exception {
        List<ImagemProduto> imagens = imagemRepository.findAll();
        
        for (ImagemProduto imagem : imagens) {
            String localPath = imagem.getEnderecoImagem();
            
            // Se já está em S3, pular
            if (localPath.contains("s3.amazonaws.com") || 
                localPath.contains("digitaloceanspaces.com")) {
                continue;
            }
            
            // Ler arquivo local
            File localFile = new File(localPath);
            if (!localFile.exists()) {
                logger.warn("Arquivo não encontrado: {}", localPath);
                continue;
            }
            
            // Upload para S3
            String folderPath = String.format("produtos/lojista-%d/produto-%d",
                imagem.getProduto().getLojista().getId(),
                imagem.getProduto().getId());
            
            try (FileInputStream fis = new FileInputStream(localFile)) {
                ImageStorageService.ImageUploadResult result = 
                    imageStorageService.uploadImageWithThumbnail(
                        fis,
                        localFile.getName(),
                        Files.probeContentType(localFile.toPath()),
                        folderPath
                    );
                
                // Atualizar URLs no banco
                imagem.setEnderecoImagem(result.getOriginalUrl());
                imagem.setEnderecoThumbnail(result.getThumbnailUrl());
                imagem.setEnderecoMedio(result.getMediumUrl());
                imagemRepository.save(imagem);
                
                logger.info("Migrada: {} -> {}", localPath, result.getOriginalUrl());
            }
        }
    }
}
```

## 🔒 Segurança e Boas Práticas

### 1. Nunca commitar credenciais

```bash
# Adicionar ao .gitignore
.env
.env.local
.env.production
*.env
```

### 2. Usar variáveis de ambiente em produção

```bash
# No servidor/VPS, adicionar ao .env
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

### 3. Rotacionar credenciais periodicamente

```bash
# AWS: IAM > Usuários > Security credentials > Rotate keys
# DigitalOcean: API > Spaces keys > Regenerate
```

### 4. Implementar rate limiting

```java
@RateLimiter(name = "upload", fallbackMethod = "uploadFallback")
@PostMapping("/upload")
public ResponseEntity<?> upload(...) { }
```

## 📊 Estimativa de Custos

### AWS S3 (Região sa-east-1)

- **Armazenamento**: $0.023/GB/mês
- **Requisições PUT**: $0.005/1.000 requisições
- **Requisições GET**: $0.0004/1.000 requisições
- **Transferência de dados**: Primeiros 10TB/mês: $0.138/GB

**Exemplo**: 10.000 produtos com 3 imagens cada (original + thumb + medium)
- Total de imagens: 30.000
- Tamanho médio: 500KB (original) + 50KB (thumb) + 150KB (medium) = 700KB
- Armazenamento: 30.000 × 0.7MB = 21GB ≈ **$0.48/mês**
- 100.000 visualizações/mês: **$0.40/mês**
- **Total: ~$1/mês**

### DigitalOcean Spaces

- **$5/mês fixo** incluindo:
  - 250GB de armazenamento
  - 1TB de transferência
- Adicional: $0.02/GB armazenamento, $0.01/GB transferência

**Recomendação**: DigitalOcean Spaces para começar (custo previsível)

## 🧪 Testes

```bash
# 1. Testar conexão S3
curl -X POST http://localhost:8080/api/v1/test/s3-connection

# 2. Upload de teste
curl -X POST -F "file=@teste.jpg" \
  http://localhost:8080/api/v1/produtos/1/imagens

# 3. Verificar imagem no S3
aws s3 ls s3://win-marketplace-images/produtos/ --recursive
```

## 🚀 Deployment

### 1. Atualizar docker-compose.yml

```yaml
backend:
  environment:
    - STORAGE_TYPE=s3
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_REGION=sa-east-1
    - S3_BUCKET_NAME=win-marketplace-images
```

### 2. Deploy

```bash
# Rebuild com novas dependências
docker compose build backend

# Restart
docker compose up -d backend

# Verificar logs
docker logs win-marketplace-backend -f
```

## 📖 Próximos Passos

1. ✅ **Implementação Completa** (FEITO)
2. ⏳ **Integrar com Controller de Produtos**
3. ⏳ **Migrar imagens existentes para S3**
4. ⏳ **Adicionar validação de tamanho/tipo**
5. ⏳ **Implementar CDN (CloudFront/DO CDN)**
6. ⏳ **Adicionar WebP conversion**
7. ⏳ **Implementar upload direto do frontend para S3 (signed URLs)**

---

**Documentação criada em**: 29 de dezembro de 2025  
**Status**: ✅ Implementação Completa - Pronto para uso
