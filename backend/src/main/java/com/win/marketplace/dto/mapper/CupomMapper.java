package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.CupomRequestDTO;
import com.win.marketplace.dto.response.CupomResponseDTO;
import com.win.marketplace.model.Cupom;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CupomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "vezesUsado", constant = "0")
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Cupom toEntity(CupomRequestDTO requestDTO);

    CupomResponseDTO toResponseDTO(Cupom cupom);

    List<CupomResponseDTO> toResponseDTOList(List<Cupom> cupons);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "vezesUsado", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    void updateEntityFromDTO(CupomRequestDTO requestDTO, @MappingTarget Cupom cupom);
}
