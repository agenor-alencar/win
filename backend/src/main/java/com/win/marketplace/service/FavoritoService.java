package com.win.marketplace.service;

import com.win.marketplace.dto.request.FavoritoRequestDTO;
import com.win.marketplace.dto.response.FavoritoResponseDTO;
import com.win.marketplace.model.Favorito;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.FavoritoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Busca o usuário autenticado
     */
    private Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    /**
     * Lista todos os favoritos do usuário autenticado
     */
    @Transactional(readOnly = true)
    public List<FavoritoResponseDTO> listarMeusFavoritos() {
        Usuario usuario = getUsuarioAutenticado();
        List<Favorito> favoritos = favoritoRepository.findByUsuarioOrderByCriadoEmDesc(usuario);
        
        return favoritos.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Adiciona um produto aos favoritos
     */
    @Transactional
    public FavoritoResponseDTO adicionarFavorito(FavoritoRequestDTO request) {
        Usuario usuario = getUsuarioAutenticado();
        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Verifica se já existe
        if (favoritoRepository.existsByUsuarioAndProduto(usuario, produto)) {
            throw new RuntimeException("Produto já está nos favoritos");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setProduto(produto);
        
        favorito = favoritoRepository.save(favorito);
        log.info("Favorito adicionado: usuário={}, produto={}", usuario.getEmail(), produto.getNome());
        
        return toResponseDTO(favorito);
    }

    /**
     * Remove um produto dos favoritos
     */
    @Transactional
    public void removerFavorito(UUID produtoId) {
        Usuario usuario = getUsuarioAutenticado();
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        favoritoRepository.deleteByUsuarioAndProduto(usuario, produto);
        log.info("Favorito removido: usuário={}, produto={}", usuario.getEmail(), produto.getNome());
    }

    /**
     * Verifica se um produto está nos favoritos
     */
    @Transactional(readOnly = true)
    public boolean isFavorito(UUID produtoId) {
        Usuario usuario = getUsuarioAutenticado();
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        return favoritoRepository.existsByUsuarioAndProduto(usuario, produto);
    }

    /**
     * Converte Favorito para DTO
     */
    private FavoritoResponseDTO toResponseDTO(Favorito favorito) {
        FavoritoResponseDTO dto = new FavoritoResponseDTO();
        dto.setId(favorito.getId());
        dto.setProdutoId(favorito.getProduto().getId());
        dto.setProdutoNome(favorito.getProduto().getNome());
        dto.setProdutoPreco(favorito.getProduto().getPreco());
        dto.setProdutoEmEstoque(favorito.getProduto().getEstoque() != null && favorito.getProduto().getEstoque() > 0);
        dto.setCriadoEm(favorito.getCriadoEm());

        // Imagem principal
        if (favorito.getProduto().getImagens() != null && !favorito.getProduto().getImagens().isEmpty()) {
            dto.setProdutoImagem(favorito.getProduto().getImagens().iterator().next().getUrl());
        }

        // Lojista
        if (favorito.getProduto().getLojista() != null) {
            FavoritoResponseDTO.LojistaSimples lojista = new FavoritoResponseDTO.LojistaSimples();
            lojista.setId(favorito.getProduto().getLojista().getId());
            lojista.setNomeFantasia(favorito.getProduto().getLojista().getNomeFantasia());
            dto.setLojista(lojista);
        }

        return dto;
    }
}
