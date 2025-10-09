package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.CategoriaCreateRequestDTO;
import com.win.marketplace.dto.response.CategoriaResponseDTO;
import com.win.marketplace.model.Categoria;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoriaPai", ignore = true)
    @Mapping(target = "subcategorias", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Categoria toEntity(CategoriaCreateRequestDTO requestDTO);

    @Mapping(source = "categoriaPai.id", target = "categoriaPaiId")
    @Mapping(source = "categoriaPai.nome", target = "categoriaPaiNome")
    @Mapping(source = "subcategorias", target = "subcategorias")
    CategoriaResponseDTO toResponseDTO(Categoria categoria);

    List<CategoriaResponseDTO> toResponseDTOList(List<Categoria> categorias);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoriaPai", ignore = true)
    @Mapping(target = "subcategorias", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    void updateEntityFromDTO(CategoriaCreateRequestDTO requestDTO, @MappingTarget Categoria categoria);
}
