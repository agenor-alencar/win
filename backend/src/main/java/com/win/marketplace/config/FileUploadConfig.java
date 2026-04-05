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

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173}")
    private String allowedOriginsProperty;

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
        String[] allowedOrigins = java.util.Arrays.stream(allowedOriginsProperty.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .distinct()
                .toArray(String[]::new);
        
        registry.addMapping("/uploads/produtos/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET");
    }
}
