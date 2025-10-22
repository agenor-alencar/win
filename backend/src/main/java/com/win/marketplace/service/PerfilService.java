package com.win.marketplace.service;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.dto.mapper.PerfilMapper;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.repository.PerfilRepository;
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final PerfilMapper perfilMapper;

    /**
     * Cria um novo perfil
     */
    public PerfilResponseDTO criar(PerfilRequestDTO requestDTO) {
        log.info("Criando novo perfil: {}", requestDTO.nome());
        
        // Verificar se já existe perfil com o mesmo nome
        if (perfilRepository.findByNome(requestDTO.nome()).isPresent()) {
            throw new BusinessException("Já existe um perfil com este nome: " + requestDTO.nome());
        }

        Perfil perfil = perfilMapper.toEntity(requestDTO);

        Perfil savedPerfil = perfilRepository.save(perfil);
        log.info("Perfil criado com sucesso. ID: {}", savedPerfil.getId());
        
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    /**
     * Busca perfil por ID
     */
    @Transactional(readOnly = true)
    public PerfilResponseDTO buscarPorId(UUID id) {
        log.info("Buscando perfil por ID: {}", id);
        
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + id));
        
        return perfilMapper.toResponseDTO(perfil);
    }

    /**
     * Busca perfil por nome
     */
    @Transactional(readOnly = true)
    public PerfilResponseDTO buscarPorNome(String nome) {
        log.info("Buscando perfil por nome: {}", nome);
        
        Perfil perfil = perfilRepository.findByNome(nome)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com nome: " + nome));
        
        return perfilMapper.toResponseDTO(perfil);
    }

    /**
     * Lista todos os perfis
     */
    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarTodos() {
        log.info("Listando todos os perfis");
        
        List<Perfil> perfis = perfilRepository.findAll();
        
        // ✅ Usar stream() ao invés de toResponseDTOList()
        return perfis.stream()
                .map(perfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lista perfis ativos
     */
    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarAtivos() {
        log.info("Listando perfis ativos");
        
        List<Perfil> perfis = perfilRepository.findByAtivoTrue();
        
        return perfis.stream()
                .map(perfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza um perfil existente
     */
    public PerfilResponseDTO atualizar(UUID id, PerfilRequestDTO requestDTO) {
        log.info("Atualizando perfil ID: {}", id);
        
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + id));

        // Verificar se o novo nome já existe (se foi alterado)
        if (!perfil.getNome().equalsIgnoreCase(requestDTO.nome()) &&
            perfilRepository.findByNome(requestDTO.nome()).isPresent()) {
            throw new BusinessException("Já existe um perfil com este nome: " + requestDTO.nome());
        }

        // ✅ CORRIGIDO: Atualizar manualmente ao invés de usar método que não existe
        if (requestDTO.nome() != null) {
            perfil.setNome(requestDTO.nome());
        }
        if (requestDTO.descricao() != null) {
            perfil.setDescricao(requestDTO.descricao());
        }
        if (requestDTO.ativo() != null) {
            perfil.setAtivo(requestDTO.ativo());
        }

        Perfil savedPerfil = perfilRepository.save(perfil);
        log.info("Perfil atualizado com sucesso. ID: {}", savedPerfil.getId());
        
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    /**
     * Deleta um perfil (verifica se não tem usuários associados)
     */
    public void deletar(UUID id) {
        log.info("Deletando perfil ID: {}", id);
        
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + id));

        // Verificar se existem usuários com este perfil
        long countUsuarios = perfilRepository.countUsuariosByPerfilId(id);
        if (countUsuarios > 0) {
            throw new BusinessException(
                "Não é possível deletar perfil que possui " + countUsuarios + " usuário(s) associado(s)"
            );
        }

        perfilRepository.delete(perfil);
        log.info("Perfil deletado com sucesso. ID: {}", id);
    }

    /**
     * Ativa um perfil
     */
    public PerfilResponseDTO ativar(UUID id) {
        log.info("Ativando perfil ID: {}", id);
        
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + id));

        perfil.setAtivo(true);

        Perfil savedPerfil = perfilRepository.save(perfil);
        log.info("Perfil ativado com sucesso. ID: {}", savedPerfil.getId());
        
        return perfilMapper.toResponseDTO(savedPerfil);
    }

    /**
     * Desativa um perfil
     */
    public PerfilResponseDTO desativar(UUID id) {
        log.info("Desativando perfil ID: {}", id);
        
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + id));

        perfil.setAtivo(false);

        Perfil savedPerfil = perfilRepository.save(perfil);
        log.info("Perfil desativado com sucesso. ID: {}", savedPerfil.getId());
        
        return perfilMapper.toResponseDTO(savedPerfil);
    }
}
