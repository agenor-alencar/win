package com.win.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String salvarArquivo(MultipartFile arquivo, UUID produtoId) throws IOException {
        // Criar diretório se não existir
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Diretório de upload criado: {}", uploadPath);
        }

        // Validar extensão
        String extensao = obterExtensao(arquivo.getOriginalFilename());
        if (!isExtensaoValida(extensao)) {
            throw new RuntimeException("Extensão de arquivo não permitida: " + extensao);
        }

        // Gerar nome único para o arquivo
        String nomeArquivo = produtoId + "_" + UUID.randomUUID() + extensao;
        Path filePath = uploadPath.resolve(nomeArquivo);

        // Salvar arquivo
        Files.copy(arquivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Arquivo salvo: {}", filePath);

        // Retornar URL relativa
        return "/uploads/produtos/" + nomeArquivo;
    }

    public void deletarArquivo(String url) throws IOException {
        if (url == null || !url.startsWith("/uploads/produtos/")) {
            log.warn("URL inválida para deletar: {}", url);
            return;
        }

        String nomeArquivo = url.substring("/uploads/produtos/".length());
        Path filePath = Paths.get(uploadDir).resolve(nomeArquivo);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("Arquivo deletado: {}", filePath);
        } else {
            log.warn("Arquivo não encontrado para deletar: {}", filePath);
        }
    }

    private String obterExtensao(String nomeArquivo) {
        if (nomeArquivo == null || !nomeArquivo.contains(".")) {
            return "";
        }
        return nomeArquivo.substring(nomeArquivo.lastIndexOf(".")).toLowerCase();
    }

    private boolean isExtensaoValida(String extensao) {
        return extensao.matches("\\.(jpg|jpeg|png|gif|webp|bmp)");
    }
}
