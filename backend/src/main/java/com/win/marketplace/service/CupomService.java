package com.win.marketplace.service;

import com.win.marketplace.dto.request.CupomRequestDTO;
import com.win.marketplace.dto.response.CupomResponseDTO;
import com.win.marketplace.dto.mapper.CupomMapper;
import com.win.marketplace.model.Cupom;
import com.win.marketplace.repository.CupomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CupomService {

    private final CupomRepository cupomRepository;
    private final CupomMapper cupomMapper;

    public CupomResponseDTO criarCupom(CupomRequestDTO requestDTO) {
        // Verificar se já existe cupom com o mesmo código
        if (cupomRepository.findByCodigo(requestDTO.codigo()).isPresent()) {
            throw new RuntimeException("Já existe um cupom com este código");
        }

        Cupom cupom = cupomMapper.toEntity(requestDTO);
        
        // Valores padrão
        if (cupom.getAtivo() == null) {
            cupom.setAtivo(true);
        }
        if (cupom.getVezesUsado() == null) {
            cupom.setVezesUsado(0);
        }

        Cupom savedCupom = cupomRepository.save(cupom);
        return cupomMapper.toResponseDTO(savedCupom);
    }

    @Transactional(readOnly = true)
    public List<CupomResponseDTO> listarCupons() {
        List<Cupom> cupons = cupomRepository.findAll();
        return cupomMapper.toResponseDTOList(cupons);
    }

    @Transactional(readOnly = true)
    public List<CupomResponseDTO> listarCuponsAtivos() {
        List<Cupom> cupons = cupomRepository.findByAtivoTrue();
        return cupomMapper.toResponseDTOList(cupons);
    }

    @Transactional(readOnly = true)
    public List<CupomResponseDTO> listarCuponsValidos() {
        OffsetDateTime agora = OffsetDateTime.now();
        List<Cupom> cupons = cupomRepository.findByAtivoTrueAndDataInicioBeforeAndDataFimAfter(agora, agora);
        return cupomMapper.toResponseDTOList(cupons);
    }

    @Transactional(readOnly = true)
    public CupomResponseDTO buscarPorId(UUID id) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        return cupomMapper.toResponseDTO(cupom);
    }

    @Transactional(readOnly = true)
    public CupomResponseDTO buscarPorCodigo(String codigo) {
        Cupom cupom = cupomRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        return cupomMapper.toResponseDTO(cupom);
    }

    @Transactional(readOnly = true)
    public CupomResponseDTO validarCupom(String codigo) {
        Cupom cupom = cupomRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        OffsetDateTime agora = OffsetDateTime.now();

        if (!cupom.getAtivo()) {
            throw new RuntimeException("Cupom não está ativo");
        }

        if (agora.isBefore(cupom.getDataInicio())) {
            throw new RuntimeException("Cupom ainda não está válido");
        }

        if (agora.isAfter(cupom.getDataFim())) {
            throw new RuntimeException("Cupom expirado");
        }

        if (cupom.getLimiteUso() != null && cupom.getVezesUsado() >= cupom.getLimiteUso()) {
            throw new RuntimeException("Cupom atingiu o limite de uso");
        }

        return cupomMapper.toResponseDTO(cupom);
    }

    public CupomResponseDTO atualizarCupom(UUID id, CupomRequestDTO requestDTO) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        // Verificar se o novo código já existe (se foi alterado)
        if (!cupom.getCodigo().equals(requestDTO.codigo()) &&
            cupomRepository.findByCodigo(requestDTO.codigo()).isPresent()) {
            throw new RuntimeException("Já existe um cupom com este código");
        }

        cupomMapper.updateEntityFromDTO(requestDTO, cupom);

        Cupom savedCupom = cupomRepository.save(cupom);
        return cupomMapper.toResponseDTO(savedCupom);
    }

    public CupomResponseDTO ativarCupom(UUID id) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        cupom.setAtivo(true);
        Cupom savedCupom = cupomRepository.save(cupom);
        return cupomMapper.toResponseDTO(savedCupom);
    }

    public CupomResponseDTO desativarCupom(UUID id) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        cupom.setAtivo(false);
        Cupom savedCupom = cupomRepository.save(cupom);
        return cupomMapper.toResponseDTO(savedCupom);
    }

    public CupomResponseDTO incrementarUso(UUID cupomId) {
        Cupom cupom = cupomRepository.findById(cupomId)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        // Validar antes de incrementar
        if (cupom.getLimiteUso() != null && cupom.getVezesUsado() >= cupom.getLimiteUso()) {
            throw new RuntimeException("Cupom atingiu o limite de uso");
        }

        cupom.setVezesUsado(cupom.getVezesUsado() + 1);
        Cupom savedCupom = cupomRepository.save(cupom);
        return cupomMapper.toResponseDTO(savedCupom);
    }

    public void deletarCupom(UUID id) {
        Cupom cupom = cupomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));

        if (cupom.getVezesUsado() > 0) {
            throw new RuntimeException("Não é possível deletar cupom que já foi utilizado");
        }

        cupomRepository.delete(cupom);
    }
}
