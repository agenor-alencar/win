package com.win.marketplace.service;

import com.win.marketplace.dto.request.CategoriaCreateRequestDTO;
import com.win.marketplace.dto.response.CategoriaResponseDTO;
import com.win.marketplace.dto.mapper.CategoriaMapper;
import com.win.marketplace.model.Categoria;
import com.win.marketplace.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;

    public CategoriaResponseDTO criarCategoria(CategoriaCreateRequestDTO requestDTO) {
        Categoria categoria = categoriaMapper.toEntity(requestDTO);
        categoria.setDataCriacao(OffsetDateTime.now());
        categoria.setDataAtualizacao(OffsetDateTime.now());

        Categoria savedCategoria = categoriaRepository.save(categoria);
        return categoriaMapper.toResponseDTO(savedCategoria);
    }

    public CategoriaResponseDTO criarSubCategoria(UUID categoriaPaiId, CategoriaCreateRequestDTO requestDTO) {
        Categoria categoriaPai = categoriaRepository.findById(categoriaPaiId)
                .orElseThrow(() -> new RuntimeException("Categoria pai não encontrada"));

        Categoria categoria = categoriaMapper.toEntity(requestDTO);
        categoria.setCategoriaPai(categoriaPai);
        categoria.setDataCriacao(OffsetDateTime.now());
        categoria.setDataAtualizacao(OffsetDateTime.now());

        Categoria savedCategoria = categoriaRepository.save(categoria);
        return categoriaMapper.toResponseDTO(savedCategoria);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarCategorias() {
        List<Categoria> categorias = categoriaRepository.findAll();
        return categoriaMapper.toResponseDTOList(categorias);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarCategoriasPrincipais() {
        List<Categoria> categorias = categoriaRepository.findByCategoriaPaiIsNull();
        return categoriaMapper.toResponseDTOList(categorias);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarSubCategorias(UUID categoriaPaiId) {
        List<Categoria> categorias = categoriaRepository.findByCategoriaPaiId(categoriaPaiId);
        return categoriaMapper.toResponseDTOList(categorias);
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        return categoriaMapper.toResponseDTO(categoria);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> buscarPorNome(String nome) {
        List<Categoria> categorias = categoriaRepository.findByNomeContainingIgnoreCase(nome);
        return categoriaMapper.toResponseDTOList(categorias);
    }

    public CategoriaResponseDTO atualizarCategoria(UUID id, CategoriaCreateRequestDTO requestDTO) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        categoriaMapper.updateEntityFromDTO(requestDTO, categoria);
        categoria.setDataAtualizacao(OffsetDateTime.now());

        Categoria savedCategoria = categoriaRepository.save(categoria);
        return categoriaMapper.toResponseDTO(savedCategoria);
    }

    public void deletarCategoria(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        if (!categoria.getSubcategorias().isEmpty()) {
            throw new RuntimeException("Não é possível deletar categoria que possui subcategorias");
        }

        if (!categoria.getProdutos().isEmpty()) {
            throw new RuntimeException("Não é possível deletar categoria que possui produtos");
        }

        categoriaRepository.delete(categoria);
    }
}
