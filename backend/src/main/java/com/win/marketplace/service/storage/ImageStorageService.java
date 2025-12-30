package com.win.marketplace.service.storage;

import java.io.InputStream;

/**
 * Interface para abstração do serviço de armazenamento de imagens.
 * Permite trocar facilmente entre diferentes provedores (S3, DigitalOcean, local, etc.)
 * seguindo princípios de Clean Architecture.
 */
public interface ImageStorageService {
    
    /**
     * Faz upload de uma imagem e retorna a URL pública
     * 
     * @param file InputStream do arquivo
     * @param fileName Nome original do arquivo
     * @param contentType Tipo de conteúdo (image/jpeg, image/png, etc.)
     * @param folderPath Caminho da pasta no storage (ex: produtos/lojista-123/produto-456)
     * @return URL pública da imagem
     */
    String uploadImage(InputStream file, String fileName, String contentType, String folderPath) throws Exception;
    
    /**
     * Faz upload de uma imagem otimizada com thumbnail
     * 
     * @param file InputStream do arquivo
     * @param fileName Nome original do arquivo
     * @param contentType Tipo de conteúdo
     * @param folderPath Caminho da pasta
     * @return Objeto com URLs da imagem original e thumbnail
     */
    ImageUploadResult uploadImageWithThumbnail(InputStream file, String fileName, String contentType, String folderPath) throws Exception;
    
    /**
     * Remove uma imagem do storage
     * 
     * @param imageUrl URL completa ou path da imagem
     * @return true se removida com sucesso
     */
    boolean deleteImage(String imageUrl);
    
    /**
     * Obtém a URL pública completa de uma imagem
     * 
     * @param imagePath Caminho relativo da imagem
     * @return URL pública completa
     */
    String getImageUrl(String imagePath);
    
    /**
     * Verifica se uma imagem existe no storage
     * 
     * @param imagePath Caminho da imagem
     * @return true se existe
     */
    boolean imageExists(String imagePath);
    
    /**
     * Classe para resultado de upload com múltiplas versões
     */
    class ImageUploadResult {
        private String originalUrl;
        private String thumbnailUrl;
        private String mediumUrl;
        private long originalSize;
        private long thumbnailSize;
        private long mediumSize;
        
        public ImageUploadResult() {}
        
        public ImageUploadResult(String originalUrl, String thumbnailUrl, String mediumUrl) {
            this.originalUrl = originalUrl;
            this.thumbnailUrl = thumbnailUrl;
            this.mediumUrl = mediumUrl;
        }
        
        // Getters and Setters
        public String getOriginalUrl() { return originalUrl; }
        public void setOriginalUrl(String originalUrl) { this.originalUrl = originalUrl; }
        
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        
        public String getMediumUrl() { return mediumUrl; }
        public void setMediumUrl(String mediumUrl) { this.mediumUrl = mediumUrl; }
        
        public long getOriginalSize() { return originalSize; }
        public void setOriginalSize(long originalSize) { this.originalSize = originalSize; }
        
        public long getThumbnailSize() { return thumbnailSize; }
        public void setThumbnailSize(long thumbnailSize) { this.thumbnailSize = thumbnailSize; }
        
        public long getMediumSize() { return mediumSize; }
        public void setMediumSize(long mediumSize) { this.mediumSize = mediumSize; }
    }
}
