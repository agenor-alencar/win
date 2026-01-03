package com.win.marketplace.service.storage;

import com.win.marketplace.config.StorageProperties;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Implementação do serviço de armazenamento usando AWS S3 ou compatíveis (DigitalOcean Spaces, MinIO)
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3StorageService implements ImageStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(S3StorageService.class);
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    
    private final S3Client s3Client;
    private final StorageProperties storageProperties;
    
    public S3StorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.s3Client = createS3Client();
        logger.info("S3StorageService inicializado - Bucket: {}, Region: {}", 
            storageProperties.getS3().getBucket(), 
            storageProperties.getS3().getRegion());
    }
    
    private S3Client createS3Client() {
        var s3Config = storageProperties.getS3();
        
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            s3Config.getAccessKey(),
            s3Config.getSecretKey()
        );
        
        var clientBuilder = S3Client.builder()
            .region(Region.of(s3Config.getRegion()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials));
        
        // Se tem endpoint customizado (DigitalOcean Spaces, MinIO, etc.)
        if (s3Config.getEndpoint() != null && !s3Config.getEndpoint().isEmpty()) {
            clientBuilder.endpointOverride(URI.create(s3Config.getEndpoint()));
            logger.info("Usando endpoint customizado: {}", s3Config.getEndpoint());
        }
        
        return clientBuilder.build();
    }
    
    @Override
    public String uploadImage(InputStream file, String fileName, String contentType, String folderPath) throws Exception {
        String key = buildObjectKey(fileName, folderPath);
        
        byte[] fileBytes = file.readAllBytes();
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(storageProperties.getS3().getBucket())
            .key(key)
            .contentType(contentType)
            .acl(ObjectCannedACL.PUBLIC_READ) // Tornar público
            .build();
        
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
        
        String imageUrl = getImageUrl(key);
        logger.info("Imagem enviada para S3: {}", imageUrl);
        
        return imageUrl;
    }
    
    @Override
    public ImageUploadResult uploadImageWithThumbnail(InputStream file, String fileName, String contentType, String folderPath) throws Exception {
        String baseName = getFileNameWithoutExtension(fileName);
        String extension = getFileExtension(fileName);
        
        // Ler bytes do arquivo original
        byte[] originalBytes = file.readAllBytes();
        
        // Upload da imagem original
        String originalKey = buildObjectKey(fileName, folderPath);
        uploadBytes(originalBytes, originalKey, contentType);
        String originalUrl = getImageUrl(originalKey);
        long originalSize = originalBytes.length;
        
        // Para thumbnails, sempre usar JPG se o formato original não for suportado (WebP)
        String outputFormat = getImageFormat(extension);
        String thumbExtension = "webp".equalsIgnoreCase(extension) ? "jpg" : extension;
        String thumbContentType = "webp".equalsIgnoreCase(extension) ? "image/jpeg" : contentType;
        
        // Criar e fazer upload do thumbnail
        ByteArrayOutputStream thumbnailOutput = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(originalBytes))
            .size(storageProperties.getImage().getThumbnailWidth(), 
                  storageProperties.getImage().getThumbnailHeight())
            .outputFormat(outputFormat)
            .outputQuality(0.85)
            .toOutputStream(thumbnailOutput);
        
        byte[] thumbnailBytes = thumbnailOutput.toByteArray();
        String thumbnailKey = buildObjectKey(baseName + "-thumb." + thumbExtension, folderPath);
        uploadBytes(thumbnailBytes, thumbnailKey, thumbContentType);
        String thumbnailUrl = getImageUrl(thumbnailKey);
        long thumbnailSize = thumbnailBytes.length;
        
        // Criar e fazer upload da versão média
        ByteArrayOutputStream mediumOutput = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(originalBytes))
            .size(storageProperties.getImage().getMediumWidth(), 
                  storageProperties.getImage().getMediumHeight())
            .outputFormat(outputFormat)
            .outputQuality(0.90)
            .toOutputStream(mediumOutput);
        
        byte[] mediumBytes = mediumOutput.toByteArray();
        String mediumKey = buildObjectKey(baseName + "-medium." + thumbExtension, folderPath);
        uploadBytes(mediumBytes, mediumKey, thumbContentType);
        String mediumUrl = getImageUrl(mediumKey);
        long mediumSize = mediumBytes.length;
        
        ImageUploadResult result = new ImageUploadResult(originalUrl, thumbnailUrl, mediumUrl);
        result.setOriginalSize(originalSize);
        result.setThumbnailSize(thumbnailSize);
        result.setMediumSize(mediumSize);
        
        logger.info("Imagem com variações enviada - Original: {} bytes, Thumb: {} bytes, Medium: {} bytes", 
            originalSize, thumbnailSize, mediumSize);
        
        return result;
    }
    
    private void uploadBytes(byte[] bytes, String key, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(storageProperties.getS3().getBucket())
            .key(key)
            .contentType(contentType)
            .acl(ObjectCannedACL.PUBLIC_READ)
            .build();
        
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
    }
    
    @Override
    public boolean deleteImage(String imageUrl) {
        try {
            String key = extractKeyFromUrl(imageUrl);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(storageProperties.getS3().getBucket())
                .key(key)
                .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            logger.info("Imagem removida do S3: {}", key);
            
            // Tentar remover thumbnails e versões médias associadas
            deleteAssociatedImages(key);
            
            return true;
        } catch (Exception e) {
            logger.error("Erro ao remover imagem do S3: {}", imageUrl, e);
            return false;
        }
    }
    
    private void deleteAssociatedImages(String originalKey) {
        String baseName = getFileNameWithoutExtension(originalKey);
        String extension = getFileExtension(originalKey);
        
        // Tentar remover thumb e medium
        try {
            String thumbKey = baseName + "-thumb." + extension;
            s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(storageProperties.getS3().getBucket())
                .key(thumbKey)
                .build());
        } catch (Exception e) {
            // Ignorar se não existir
        }
        
        try {
            String mediumKey = baseName + "-medium." + extension;
            s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(storageProperties.getS3().getBucket())
                .key(mediumKey)
                .build());
        } catch (Exception e) {
            // Ignorar se não existir
        }
    }
    
    @Override
    public String getImageUrl(String imagePath) {
        var s3Config = storageProperties.getS3();
        
        // Se tem URL pública customizada (CDN)
        if (s3Config.getPublicUrl() != null && !s3Config.getPublicUrl().isEmpty()) {
            return s3Config.getPublicUrl() + "/" + imagePath;
        }
        
        // Se tem endpoint customizado (DigitalOcean Spaces)
        if (s3Config.getEndpoint() != null && !s3Config.getEndpoint().isEmpty()) {
            return s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + imagePath;
        }
        
        // URL padrão AWS S3
        return String.format("https://%s.s3.%s.amazonaws.com/%s", 
            s3Config.getBucket(), 
            s3Config.getRegion(), 
            imagePath);
    }
    
    @Override
    public boolean imageExists(String imagePath) {
        try {
            String key = extractKeyFromUrl(imagePath);
            
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(storageProperties.getS3().getBucket())
                .key(key)
                .build();
            
            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            logger.error("Erro ao verificar existência da imagem: {}", imagePath, e);
            return false;
        }
    }
    
    /**
     * Constrói a chave do objeto no S3 seguindo o padrão:
     * produtos/{lojistaId}/{produtoId}/{timestamp}-{uuid}-{nome}.ext
     */
    private String buildObjectKey(String fileName, String folderPath) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String safeName = sanitizeFileName(fileName);
        
        return String.format("%s/%s-%s-%s", 
            folderPath.replaceAll("^/|/$", ""), // Remove barras do início/fim
            timestamp, 
            uuid, 
            safeName);
    }
    
    /**
     * Extrai a key do S3 de uma URL completa
     */
    private String extractKeyFromUrl(String url) {
        // Se já é uma key (não começa com http)
        if (!url.startsWith("http")) {
            return url;
        }
        
        // Extrair da URL
        String bucket = storageProperties.getS3().getBucket();
        
        // Tentar diferentes formatos de URL
        if (url.contains(bucket + "/")) {
            return url.substring(url.indexOf(bucket + "/") + bucket.length() + 1);
        }
        
        if (url.contains(".amazonaws.com/")) {
            return url.substring(url.lastIndexOf(".amazonaws.com/") + 15);
        }
        
        // Fallback: última parte da URL
        return url.substring(url.lastIndexOf("/") + 1);
    }
    
    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9.-]", "_").toLowerCase();
    }
    
    private String getFileNameWithoutExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
    }
    
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "jpg";
    }
    
    private String getImageFormat(String extension) {
        return switch (extension.toLowerCase()) {
            case "png" -> "png";
            case "gif" -> "gif";
            case "webp" -> "jpg"; // Thumbnailator não suporta WebP output, converter para JPG
            default -> "jpg";
        };
    }
}
