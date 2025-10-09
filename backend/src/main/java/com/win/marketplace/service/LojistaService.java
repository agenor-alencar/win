package com.win.marketplace.service;

import com.win.marketplace.dto.request.LojistaCreateRequestDTO;
import com.win.marketplace.dto.response.LojistaResponseDTO;
import com.win.marketplace.dto.mapper.LojistaMapper;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LojistaService {

    private final LojistaRepository lojistaRepository;
    private final UsuarioRepository usuarioRepository;
    private final LojistaMapper lojistaMapper;

    public LojistaResponseDTO criarLojista(LojistaCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se já existe lojista para este usuário
        if (lojistaRepository.findByUsuarioId(requestDTO.usuarioId()).isPresent()) {
            throw new RuntimeException("Usuário já possui perfil de lojista");
        }

        // Verificar se CNPJ já está em uso
        if (lojistaRepository.findByCnpj(requestDTO.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já está sendo utilizado por outro lojista");
        }

        Lojista lojista = lojistaMapper.toEntity(requestDTO);
        lojista.setUsuario(usuario);
        lojista.setDataCriacao(OffsetDateTime.now());
        lojista.setDataAtualizacao(OffsetDateTime.now());

        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }

    @Transactional(readOnly = true)
    public List<LojistaResponseDTO> listarLojistas() {
        List<Lojista> lojistas = lojistaRepository.findAll();
        return lojistaMapper.toResponseDTOList(lojistas);
    }

    @Transactional(readOnly = true)
    public List<LojistaResponseDTO> listarLojistasAtivos() {
        List<Lojista> lojistas = lojistaRepository.findByAtivoTrue();
        return lojistaMapper.toResponseDTOList(lojistas);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorId(UUID id) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));
        return lojistaMapper.toResponseDTO(lojista);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorUsuarioId(UUID usuarioId) {
        Lojista lojista = lojistaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado para este usuário"));
        return lojistaMapper.toResponseDTO(lojista);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorCnpj(String cnpj) {
        Lojista lojista = lojistaRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado com este CNPJ"));
        return lojistaMapper.toResponseDTO(lojista);
    }

    public LojistaResponseDTO atualizarLojista(UUID id, LojistaCreateRequestDTO requestDTO) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        // Verificar se o novo CNPJ já está em uso (se foi alterado)
        if (!lojista.getCnpj().equals(requestDTO.cnpj()) &&
            lojistaRepository.findByCnpj(requestDTO.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já está sendo utilizado por outro lojista");
        }

        lojistaMapper.updateEntityFromDTO(requestDTO, lojista);
        lojista.setDataAtualizacao(OffsetDateTime.now());

        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }

    public void desativarLojista(UUID id) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        lojista.setAtivo(false);
        lojista.setDataAtualizacao(OffsetDateTime.now());

        lojistaRepository.save(lojista);
    }

    public void atualizarAvaliacaoMedia(UUID lojistaId) {
        Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        if (lojista.getAvaliacoes() != null && !lojista.getAvaliacoes().isEmpty()) {
            double media = lojista.getAvaliacoes().stream()
                    .mapToInt(avaliacao -> avaliacao.getNota())
                    .average()
                    .orElse(0.0);

            lojista.setAvaliacaoMedia(java.math.BigDecimal.valueOf(media));
            lojista.setTotalAvaliacoes(lojista.getAvaliacoes().size());
        } else {
            lojista.setAvaliacaoMedia(java.math.BigDecimal.ZERO);
            lojista.setTotalAvaliacoes(0);
        }

        lojistaRepository.save(lojista);
    }
}
