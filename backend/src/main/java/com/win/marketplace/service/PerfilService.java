package com.win.marketplace.service;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.dto.mapper.PerfilMapper;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.repository.PerfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final PerfilMapper perfilMapper;

    public PerfilResponseDTO criar(PerfilRequestDTO requestDTO) {
        // Verificar se já existe perfil com o mesmo tipo
        if (perfilRepository.findByTipo(Perfil.TipoPerfil.valueOf(requestDTO.tipo())).isPresent()) {
            throw new RuntimeException("Já existe um perfil com este tipo");
        }

        Perfil perfil = perfilMapper.toEntity(requestDTO);
        perfil.setDataCriacao(OffsetDateTime.now());
        perfil.setDataAtualizacao(OffsetDateTime.now());

        Perfil savedPerfil = perfilRepository.save(perfil);
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    @Transactional(readOnly = true)
    public PerfilResponseDTO buscarPorId(UUID id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        return perfilMapper.toResponseDTO(perfil);
    }

    @Transactional(readOnly = true)
    public PerfilResponseDTO buscarPorTipo(Perfil.TipoPerfil tipo) {
        Perfil perfil = perfilRepository.findByTipo(tipo)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        return perfilMapper.toResponseDTO(perfil);
    }

    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarTodos() {
        List<Perfil> perfis = perfilRepository.findAll();
        return perfilMapper.toResponseDTOList(perfis);
    }

    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarAtivos() {
        List<Perfil> perfis = perfilRepository.findByAtivoTrue();
        return perfilMapper.toResponseDTOList(perfis);
    }

    public PerfilResponseDTO atualizar(UUID id, PerfilRequestDTO requestDTO) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        // Verificar se o novo tipo já existe (se foi alterado)
        Perfil.TipoPerfil novoTipo = Perfil.TipoPerfil.valueOf(requestDTO.tipo());
        if (!perfil.getTipo().equals(novoTipo) &&
            perfilRepository.findByTipo(novoTipo).isPresent()) {
            throw new RuntimeException("Já existe um perfil com este tipo");
        }

        perfilMapper.updateEntityFromDTO(requestDTO, perfil);
        perfil.setDataAtualizacao(OffsetDateTime.now());

        Perfil savedPerfil = perfilRepository.save(perfil);
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    public void deletar(UUID id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        // Verificar se existem usuários com este perfil
        if (!perfil.getUsuarioPerfis().isEmpty()) {
            throw new RuntimeException("Não é possível deletar perfil que possui usuários associados");
        }

        perfilRepository.delete(perfil);
    }

    public PerfilResponseDTO ativar(UUID id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        perfil.setAtivo(true);
        perfil.setDataAtualizacao(OffsetDateTime.now());

        Perfil savedPerfil = perfilRepository.save(perfil);
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    public PerfilResponseDTO desativar(UUID id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        perfil.setAtivo(false);
        perfil.setDataAtualizacao(OffsetDateTime.now());

        Perfil savedPerfil = perfilRepository.save(perfil);
        return perfilMapper.toResponseDTO(savedPerfil);
    }
}
