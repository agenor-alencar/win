package com.win.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;

/**
 * Serviço para upload de arquivos no DigitalOcean Spaces
 * Utiliza AWS S3 SDK compatível com DigitalOcean Spaces
 * 
 * Este serviço só será ativado se as credenciais do DigitalOcean Spaces estiverem configuradas.
 * Para habilitar, defina as variáveis de ambiente:
 * - SPACES_ACCESS_KEY
 * - SPACES_SECRET_KEY
 */
@Slf4j
@Service
@ConditionalOnProperty(
    prefix = "spaces.access",
    name = "key",
    havingValue = "",
    matchIfMissing = false
)
public class DigitalOceanSpacesService {

    @Value("${spaces.access.key:}")
    private String accessKey;

    @Value("${spaces.secret.key:}")
    private String secretKey;

    @Value("${spaces.bucket.name:win-marketplace-storage}")
    private String bucketName;

    @Value("${spaces.endpoint:https://sfo3.digitaloceanspaces.com}")
    private String endpoint;

    @Value("${spaces.region:sfo3}")
    private String region;

    private S3Client s3Client;

    /**
     * Inicializa o cliente S3 com as credenciais do DigitalOcean Spaces
     * Só executa se as credenciais estiverem configuradas
     */
    @PostConstruct
    public void initializeS3Client() {
        // Verificar se as credenciais foram fornecidas
        if (accessKey == null || accessKey.trim().isEmpty() || 
            secretKey == null || secretKey.trim().isEmpty()) {
            log.warn("⚠️  DigitalOcean Spaces não configurado - credenciais ausentes");
            log.warn("   Para habilitar, configure: SPACES_ACCESS_KEY e SPACES_SECRET_KEY");
            return;
        }

        log.info("Inicializando DigitalOcean Spaces client...");
        log.info("Endpoint: {}", endpoint);
        log.info("Bucket: {}", bucketName);
        log.info("Region: {}", region);

        try {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

            this.s3Client = S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .build();

            log.info("✅ DigitalOcean Spaces client inicializado com sucesso!");
        } catch (Exception e) {
            log.error("❌ Erro ao inicializar DigitalOcean Spaces client", e);
            throw new RuntimeException("Falha ao conectar com DigitalOcean Spaces", e);
        }
    }

    /**
     * Faz upload de um arquivo para o DigitalOcean Spaces
     * 
     * @param file Arquivo enviado via MultipartFile
     * @param folderPath Caminho da pasta no bucket (ex: "produtos/123")
     * @return URL pública do arquivo no CDN do DigitalOcean
     * @throws IOException Se houver erro ao ler o arquivo
     */
    public String uploadFile(MultipartFile file, String folderPath) throws IOException {
        // Gerar nome único para o arquivo
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
        
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String fullKey = folderPath.endsWith("/") 
                ? folderPath + uniqueFilename 
                : folderPath + "/" + uniqueFilename;

        log.info("Iniciando upload para DigitalOcean Spaces...");
        log.info("Bucket: {}", bucketName);
        log.info("Key: {}", fullKey);
        log.info("Content-Type: {}", file.getContentType());
        log.info("Tamanho: {} bytes", file.getSize());

        try {
            // Configurar request com permissão de leitura pública
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fullKey)
                    .contentType(file.getContentType())
                    .acl(ObjectCannedACL.PUBLIC_READ)  // Permissão pública
                    .build();

            // Fazer upload
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Construir URL pública (CDN do DigitalOcean)
            String publicUrl = String.format("https://%s.%s/%s", 
                    bucketName, 
                    endpoint.replace("https://", ""), 
                    fullKey);

            log.info("Upload concluído com sucesso!");
            log.info("URL pública: {}", publicUrl);

            return publicUrl;

        } catch (Exception e) {
            log.error("Erro ao fazer upload para DigitalOcean Spaces", e);
            throw new RuntimeException("Falha no upload do arquivo", e);
        }
    }

    /**
     * Faz upload de um arquivo para a pasta raiz do bucket
     * 
     * @param file Arquivo enviado via MultipartFile
     * @return URL pública do arquivo
     * @throws IOException Se houver erro ao ler o arquivo
     */
    public String uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, "uploads");
    }

    /**
     * Deleta um arquivo do DigitalOcean Spaces
     * 
     * @param fileUrl URL completa do arquivo a ser deletado
     * @return true se deletado com sucesso, false caso contrário
     */
    public boolean deleteFile(String fileUrl) {
        try {
            // Extrair a key da URL
            String key = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);
            
            log.info("Deletando arquivo do DigitalOcean Spaces: {}", key);
            
            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key(key)
                    .build());
            
            log.info("Arquivo deletado com sucesso!");
            return true;
            
        } catch (Exception e) {
            log.error("Erro ao deletar arquivo do DigitalOcean Spaces: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * Verifica se um arquivo existe no bucket
     * 
     * @param fileUrl URL completa do arquivo
     * @return true se o arquivo existe, false caso contrário
     */
    public boolean fileExists(String fileUrl) {
        try {
            String key = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);
            
            s3Client.headObject(builder -> builder
                    .bucket(bucketName)
                    .key(key)
                    .build());
            
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
}
