package com.win.marketplace.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    
    private String type = "local"; // local, s3, digitalocean, gcs
    private S3Properties s3 = new S3Properties();
    private ImageProperties image = new ImageProperties();
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public S3Properties getS3() {
        return s3;
    }
    
    public void setS3(S3Properties s3) {
        this.s3 = s3;
    }
    
    public ImageProperties getImage() {
        return image;
    }
    
    public void setImage(ImageProperties image) {
        this.image = image;
    }
    
    public static class S3Properties {
        private String accessKey;
        private String secretKey;
        private String region = "sa-east-1";
        private String bucket;
        private String endpoint; // Para DigitalOcean Spaces ou MinIO
        private String publicUrl; // URL pública do CDN
        
        public String getAccessKey() {
            return accessKey;
        }
        
        public void setAccessKey(String accessKey) {
            this.accessKey = accessKey;
        }
        
        public String getSecretKey() {
            return secretKey;
        }
        
        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
        
        public String getRegion() {
            return region;
        }
        
        public void setRegion(String region) {
            this.region = region;
        }
        
        public String getBucket() {
            return bucket;
        }
        
        public void setBucket(String bucket) {
            this.bucket = bucket;
        }
        
        public String getEndpoint() {
            return endpoint;
        }
        
        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }
        
        public String getPublicUrl() {
            return publicUrl;
        }
        
        public void setPublicUrl(String publicUrl) {
            this.publicUrl = publicUrl;
        }
    }
    
    public static class ImageProperties {
        private int maxSizeMb = 10;
        private String allowedTypes = "jpg,jpeg,png,webp,gif";
        private int thumbnailWidth = 300;
        private int thumbnailHeight = 300;
        private int mediumWidth = 800;
        private int mediumHeight = 800;
        
        public int getMaxSizeMb() {
            return maxSizeMb;
        }
        
        public void setMaxSizeMb(int maxSizeMb) {
            this.maxSizeMb = maxSizeMb;
        }
        
        public String getAllowedTypes() {
            return allowedTypes;
        }
        
        public void setAllowedTypes(String allowedTypes) {
            this.allowedTypes = allowedTypes;
        }
        
        public int getThumbnailWidth() {
            return thumbnailWidth;
        }
        
        public void setThumbnailWidth(int thumbnailWidth) {
            this.thumbnailWidth = thumbnailWidth;
        }
        
        public int getThumbnailHeight() {
            return thumbnailHeight;
        }
        
        public void setThumbnailHeight(int thumbnailHeight) {
            this.thumbnailHeight = thumbnailHeight;
        }
        
        public int getMediumWidth() {
            return mediumWidth;
        }
        
        public void setMediumWidth(int mediumWidth) {
            this.mediumWidth = mediumWidth;
        }
        
        public int getMediumHeight() {
            return mediumHeight;
        }
        
        public void setMediumHeight(int mediumHeight) {
            this.mediumHeight = mediumHeight;
        }
    }
}
