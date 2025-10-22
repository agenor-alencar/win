package com.win.marketplace.service;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.dto.mapper.ImagemProdutoMapper;
import com.win.marketplace.model.ImagemProduto;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.ImagemProdutoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImagemProdutoService {

    private final ImagemProdutoRepository imagemProdutoRepository;
    private final ProdutoRepository produtoRepository;
    private final ImagemProdutoMapper imagemProdutoMapper;
    private final FileStorageService fileStorageService;

    public ImagemProdutoResponseDTO adicionarImagem(UUID produtoId, MultipartFile arquivo, Integer ordemExibicao) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Validar tipo de arquivo
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Tipo de arquivo inválido. Apenas imagens são permitidas.");
        }

        // Validar tamanho do arquivo (5MB)
        long tamanhoMaximo = 5 * 1024 * 1024;
        if (arquivo.getSize() > tamanhoMaximo) {
            throw new RuntimeException("Tamanho do arquivo excede o limite de 5MB.");
        }

        try {
            // Salvar arquivo na pasta local
            String url = fileStorageService.salvarArquivo(arquivo, produtoId);

            ImagemProduto imagemProduto = new ImagemProduto();
            imagemProduto.setProduto(produto);
            imagemProduto.setUrl(url);
            imagemProduto.setTextoAlternativo("Imagem do produto " + produto.getNome());
            imagemProduto.setOrdemExibicao(ordemExibicao != null ? ordemExibicao : 0);

            ImagemProduto savedImagem = imagemProdutoRepository.save(imagemProduto);
            log.info("Imagem adicionada ao produto {}: {}", produtoId, url);
            
            return imagemProdutoMapper.toResponseDTO(savedImagem);

        } catch (IOException e) {
            log.error("Erro ao salvar arquivo de imagem", e);
            throw new RuntimeException("Erro ao salvar arquivo de imagem: " + e.getMessage(), e);
        }
    }

    public ImagemProdutoResponseDTO adicionarImagemComUrl(UUID produtoId, String url, String textoAlternativo, Integer ordemExibicao) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        ImagemProduto imagemProduto = new ImagemProduto();
        imagemProduto.setProduto(produto);
        imagemProduto.setUrl(url);
        imagemProduto.setTextoAlternativo(textoAlternativo != null ? textoAlternativo : "Imagem do produto " + produto.getNome());
        imagemProduto.setOrdemExibicao(ordemExibicao != null ? ordemExibicao : 0);

        ImagemProduto savedImagem = imagemProdutoRepository.save(imagemProduto);
        log.info("Imagem com URL externa adicionada ao produto {}: {}", produtoId, url);
        
        return imagemProdutoMapper.toResponseDTO(savedImagem);
    }

    @Transactional(readOnly = true)
    public List<ImagemProdutoResponseDTO> listarImagensPorProduto(UUID produtoId) {
        List<ImagemProduto> imagens = imagemProdutoRepository.findByProdutoIdOrderByOrdemExibicao(produtoId);
        return imagemProdutoMapper.toResponseDTOList(imagens);
    }

    @Transactional(readOnly = true)
    public ImagemProdutoResponseDTO buscarPorId(UUID id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));
        return imagemProdutoMapper.toResponseDTO(imagem);
    }

    public ImagemProdutoResponseDTO atualizarOrdemExibicao(UUID id, Integer novaOrdem) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        imagem.setOrdemExibicao(novaOrdem);
        ImagemProduto savedImagem = imagemProdutoRepository.save(imagem);
        return imagemProdutoMapper.toResponseDTO(savedImagem);
    }

    public ImagemProdutoResponseDTO atualizarTextoAlternativo(UUID id, String novoTexto) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        imagem.setTextoAlternativo(novoTexto);
        ImagemProduto savedImagem = imagemProdutoRepository.save(imagem);
        return imagemProdutoMapper.toResponseDTO(savedImagem);
    }

    public void deletarImagem(UUID id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        // Deletar arquivo físico
        try {
            fileStorageService.deletarArquivo(imagem.getUrl());
        } catch (IOException e) {
            log.error("Erro ao deletar arquivo físico: {}", imagem.getUrl(), e);
        }

        imagemProdutoRepository.delete(imagem);
        log.info("Imagem deletada: {}", id);
    }

    public void deletarTodasImagensProduto(UUID produtoId) {
        List<ImagemProduto> imagens = imagemProdutoRepository.findByProdutoId(produtoId);
        
        // Deletar arquivos físicos
        for (ImagemProduto imagem : imagens) {
            try {
                fileStorageService.deletarArquivo(imagem.getUrl());
            } catch (IOException e) {
                log.error("Erro ao deletar arquivo físico: {}", imagem.getUrl(), e);
            }
        }

        imagemProdutoRepository.deleteByProdutoId(produtoId);
        log.info("Todas as imagens do produto {} foram deletadas", produtoId);
    }
}
