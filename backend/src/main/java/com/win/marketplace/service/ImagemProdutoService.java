package com.win.marketplace.service;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.dto.mapper.ImagemProdutoMapper;
import com.win.marketplace.model.ImagemProduto;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.ImagemProdutoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ImagemProdutoService {

    private final ImagemProdutoRepository imagemProdutoRepository;
    private final ProdutoRepository produtoRepository;
    private final ImagemProdutoMapper imagemProdutoMapper;

    public ImagemProdutoResponseDTO adicionarImagem(UUID produtoId, MultipartFile arquivo, Integer ordemExibicao) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        try {
            ImagemProduto imagemProduto = new ImagemProduto();
            imagemProduto.setProduto(produto);
            imagemProduto.setDados(arquivo.getBytes());
            imagemProduto.setTamanhoArquivo(arquivo.getSize());
            imagemProduto.setTipoArquivo(arquivo.getContentType());
            imagemProduto.setUrl(gerarUrlImagem(produtoId, arquivo.getOriginalFilename()));
            imagemProduto.setTextoAlternativo("Imagem do produto " + produto.getNome());
            imagemProduto.setOrdemExibicao(ordemExibicao != null ? ordemExibicao : 0);
            imagemProduto.setDataCriacao(OffsetDateTime.now());

            ImagemProduto savedImagem = imagemProdutoRepository.save(imagemProduto);
            return imagemProdutoMapper.toResponseDTO(savedImagem);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar arquivo de imagem", e);
        }
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

    @Transactional(readOnly = true)
    public byte[] obterDadosImagem(UUID id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));
        return imagem.getDados();
    }

    public ImagemProdutoResponseDTO atualizarOrdemExibicao(UUID id, Integer novaOrdem) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        imagem.setOrdemExibicao(novaOrdem);
        ImagemProduto savedImagem = imagemProdutoRepository.save(imagem);
        return imagemProdutoMapper.toResponseDTO(savedImagem);
    }

    public void deletarImagem(UUID id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));
        imagemProdutoRepository.delete(imagem);
    }

    public void deletarTodasImagensProduto(UUID produtoId) {
        imagemProdutoRepository.deleteByProdutoId(produtoId);
    }

    private String gerarUrlImagem(UUID produtoId, String nomeOriginal) {
        String extensao = nomeOriginal != null && nomeOriginal.contains(".")
                ? nomeOriginal.substring(nomeOriginal.lastIndexOf("."))
                : ".jpg";
        return "/api/v1/imagem-produto/dados/" + UUID.randomUUID() + extensao;
    }
}
