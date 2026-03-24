package com.win.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Criar diretório se não existir
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadPathStr = uploadPath.toUri().toString();

        // Mapear /uploads/produtos/** para a pasta física
        registry.addResourceHandler("/uploads/produtos/**")
                .addResourceLocations(uploadPathStr);
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // Origens permitidas para upload de arquivos
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        
        // Padrão: localhost para desenvolvimento
        java.util.List<String> allowedOrigins = new java.util.ArrayList<>();
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("http://localhost:5173");
        allowedOrigins.add("http://127.0.0.1:3000");
        
        // Adiciona origens da variável de ambiente (VPS/produção)
        if (allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            String[] origins = allowedOriginsEnv.split(",");
            for (String origin : origins) {
                allowedOrigins.add(origin.trim());
            }
        }
        
        registry.addMapping("/uploads/produtos/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET");
    }
}
