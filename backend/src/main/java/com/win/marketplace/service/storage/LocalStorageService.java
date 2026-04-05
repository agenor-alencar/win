package com.win.marketplace.service.storage;

import com.win.marketplace.config.StorageProperties;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Implementação local do serviço de armazenamento (fallback quando S3 não está configurado)
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements ImageStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocalStorageService.class);
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    
    @Value("${app.upload.dir:uploads/produtos}")
    private String uploadDir;
    
    @Value("${app.upload.base-url:http://localhost:${server.port:8080}/uploads}")
    private String uploadBaseUrl;
    
    private final StorageProperties storageProperties;
    
    public LocalStorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        logger.info("LocalStorageService inicializado - Diretório: {}", uploadDir);
    }
    
    @Override
    public String uploadImage(InputStream file, String fileName, String contentType, String folderPath) throws Exception {
        Path directory = Paths.get(uploadDir, folderPath);
        Files.createDirectories(directory);
        
        String uniqueFileName = generateUniqueFileName(fileName);
        Path filePath = directory.resolve(uniqueFileName);
        
        Files.copy(file, filePath, StandardCopyOption.REPLACE_EXISTING);
        
        String relativePath = Paths.get(folderPath, uniqueFileName).toString().replace("\\", "/");
        logger.info("Imagem salva localmente: {}", relativePath);
        
        return getImageUrl(relativePath);
    }
    
    @Override
    public ImageUploadResult uploadImageWithThumbnail(InputStream file, String fileName, String contentType, String folderPath) throws Exception {
        Path directory = Paths.get(uploadDir, folderPath);
        Files.createDirectories(directory);
        
        String baseName = getFileNameWithoutExtension(fileName);
        String extension = getFileExtension(fileName);
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        // Salvar original
        String originalFileName = String.format("%s-%s-%s.%s", timestamp, uuid, baseName, extension);
        Path originalPath = directory.resolve(originalFileName);
        byte[] originalBytes = file.readAllBytes();
        Files.write(originalPath, originalBytes);
        long originalSize = originalBytes.length;
        
        // Criar thumbnail
        String thumbFileName = String.format("%s-%s-%s-thumb.%s", timestamp, uuid, baseName, extension);
        Path thumbPath = directory.resolve(thumbFileName);
        Thumbnails.of(originalPath.toFile())
            .size(storageProperties.getImage().getThumbnailWidth(), 
                  storageProperties.getImage().getThumbnailHeight())
            .outputFormat(getImageFormat(extension))
            .outputQuality(0.85)
            .toFile(thumbPath.toFile());
        long thumbnailSize = Files.size(thumbPath);
        
        // Criar versão média
        String mediumFileName = String.format("%s-%s-%s-medium.%s", timestamp, uuid, baseName, extension);
        Path mediumPath = directory.resolve(mediumFileName);
        Thumbnails.of(originalPath.toFile())
            .size(storageProperties.getImage().getMediumWidth(), 
                  storageProperties.getImage().getMediumHeight())
            .outputFormat(getImageFormat(extension))
            .outputQuality(0.90)
            .toFile(mediumPath.toFile());
        long mediumSize = Files.size(mediumPath);
        
        String originalUrl = getImageUrl(Paths.get(folderPath, originalFileName).toString().replace("\\", "/"));
        String thumbnailUrl = getImageUrl(Paths.get(folderPath, thumbFileName).toString().replace("\\", "/"));
        String mediumUrl = getImageUrl(Paths.get(folderPath, mediumFileName).toString().replace("\\", "/"));
        
        ImageUploadResult result = new ImageUploadResult(originalUrl, thumbnailUrl, mediumUrl);
        result.setOriginalSize(originalSize);
        result.setThumbnailSize(thumbnailSize);
        result.setMediumSize(mediumSize);
        
        logger.info("Imagem com variações salva localmente - Original: {} bytes, Thumb: {} bytes, Medium: {} bytes", 
            originalSize, thumbnailSize, mediumSize);
        
        return result;
    }
    
    @Override
    public boolean deleteImage(String imageUrl) {
        try {
            String relativePath = extractRelativePath(imageUrl);
            Path filePath = Paths.get(uploadDir, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Imagem removida localmente: {}", relativePath);
                
                // Remover thumbnails associados
                deleteAssociatedImages(filePath);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("Erro ao remover imagem local: {}", imageUrl, e);
            return false;
        }
    }
    
    private void deleteAssociatedImages(Path originalPath) {
        String baseName = getFileNameWithoutExtension(originalPath.getFileName().toString());
        String extension = getFileExtension(originalPath.getFileName().toString());
        Path directory = originalPath.getParent();
        
        try {
            Path thumbPath = directory.resolve(baseName + "-thumb." + extension);
            Files.deleteIfExists(thumbPath);
            
            Path mediumPath = directory.resolve(baseName + "-medium." + extension);
            Files.deleteIfExists(mediumPath);
        } catch (Exception e) {
            logger.debug("Erro ao remover imagens associadas", e);
        }
    }
    
    @Override
    public String getImageUrl(String imagePath) {
        // Remove barras iniciais e duplicadas
        String cleanPath = imagePath.replaceAll("^/+", "").replace("\\", "/");
        String normalizedBaseUrl = uploadBaseUrl.replaceAll("/+$", "");
        return String.format("%s/%s", normalizedBaseUrl, cleanPath);
    }
    
    @Override
    public boolean imageExists(String imagePath) {
        String relativePath = extractRelativePath(imagePath);
        Path filePath = Paths.get(uploadDir, relativePath);
        return Files.exists(filePath);
    }
    
    private String generateUniqueFileName(String originalFileName) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFileName);
        String baseName = getFileNameWithoutExtension(originalFileName);
        
        return String.format("%s-%s-%s.%s", timestamp, uuid, baseName, extension);
    }
    
    private String extractRelativePath(String url) {
        if (!url.startsWith("http")) {
            return url;
        }
        
        if (url.contains("/uploads/")) {
            return url.substring(url.indexOf("/uploads/") + 9);
        }
        
        return url.substring(url.lastIndexOf("/") + 1);
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
            case "webp" -> "webp";
            default -> "jpg";
        };
    }
}
