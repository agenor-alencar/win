package com.win.marketplace.service;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.dto.mapper.UsuarioPerfilMapper;
import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.repository.UsuarioPerfilRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.PerfilRepository;
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioPerfilService {

    private final UsuarioPerfilRepository usuarioPerfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final UsuarioPerfilMapper usuarioPerfilMapper;

    /**
     * Atribui um perfil a um usuário
     */
    public UsuarioPerfilResponseDTO atribuirPerfil(UsuarioPerfilRequestDTO requestDTO) {
        log.info("Atribuindo perfil {} ao usuário {}", requestDTO.perfilId(), requestDTO.usuarioId());
        
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + requestDTO.usuarioId()));

        Perfil perfil = perfilRepository.findById(requestDTO.perfilId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado com ID: " + requestDTO.perfilId()));

        // Verificar se a associação já existe
        UsuarioPerfilId id = new UsuarioPerfilId(requestDTO.usuarioId(), requestDTO.perfilId());
        if (usuarioPerfilRepository.existsById(id)) {
            throw new BusinessException("Usuário já possui este perfil");
        }

        UsuarioPerfil usuarioPerfil = usuarioPerfilMapper.toEntity(requestDTO);
        usuarioPerfil.setUsuario(usuario);
        usuarioPerfil.setPerfil(perfil);
        usuarioPerfil.setDataAtribuicao(OffsetDateTime.now());

        UsuarioPerfil savedUsuarioPerfil = usuarioPerfilRepository.save(usuarioPerfil);
        log.info("Perfil atribuído com sucesso");
        
        return usuarioPerfilMapper.toResponseDTO(savedUsuarioPerfil);
    }

    /**
     * Lista todas as associações usuário-perfil
     */
    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> listarTodos() {
        log.info("Listando todas as associações usuário-perfil");
        
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findAll();
        
        return usuarioPerfis.stream()
                .map(usuarioPerfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca perfis de um usuário específico
     */
    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorUsuario(UUID usuarioId) {
        log.info("Buscando perfis do usuário ID: {}", usuarioId);
        
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByUsuarioId(usuarioId);
        
        return usuarioPerfis.stream()
                .map(usuarioPerfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuários com um perfil específico
     */
    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorPerfil(UUID perfilId) {
        log.info("Buscando usuários do perfil ID: {}", perfilId);
        
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByPerfilId(perfilId);
        
        return usuarioPerfis.stream()
                .map(usuarioPerfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca perfis de um usuário por nome do perfil
     */
    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorUsuarioENomePerfil(UUID usuarioId, String nomePerfil) {
        log.info("Buscando perfil '{}' do usuário ID: {}", nomePerfil, usuarioId);
        
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByUsuarioIdAndPerfilNome(usuarioId, nomePerfil);
        
        return usuarioPerfis.stream()
                .map(usuarioPerfilMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica se usuário possui um perfil específico pelo nome
     */
    @Transactional(readOnly = true)
    public boolean usuarioPossuiPerfil(UUID usuarioId, String nomePerfil) {
        log.info("Verificando se usuário ID: {} possui perfil '{}'", usuarioId, nomePerfil);
        
        return usuarioPerfilRepository.existsByUsuarioIdAndPerfilNome(usuarioId, nomePerfil);
    }

    /**
     * Verifica se usuário é ADMIN
     */
    @Transactional(readOnly = true)
    public boolean isUsuarioAdmin(UUID usuarioId) {
        log.info("Verificando se usuário ID: {} é ADMIN", usuarioId);
        
        return usuarioPerfilRepository.isUsuarioAdmin(usuarioId);
    }

    /**
     * Verifica se usuário é LOJISTA
     */
    @Transactional(readOnly = true)
    public boolean isUsuarioLojista(UUID usuarioId) {
        log.info("Verificando se usuário ID: {} é LOJISTA", usuarioId);
        
        return usuarioPerfilRepository.isUsuarioLojista(usuarioId);
    }

    /**
     * Verifica se usuário é MOTORISTA
     */
    @Transactional(readOnly = true)
    public boolean isUsuarioMotorista(UUID usuarioId) {
        log.info("Verificando se usuário ID: {} é MOTORISTA", usuarioId);
        
        return usuarioPerfilRepository.isUsuarioMotorista(usuarioId);
    }

    /**
     * Verifica se usuário é CLIENTE
     */
    @Transactional(readOnly = true)
    public boolean isUsuarioCliente(UUID usuarioId) {
        log.info("Verificando se usuário ID: {} é CLIENTE", usuarioId);
        
        return usuarioPerfilRepository.isUsuarioCliente(usuarioId);
    }

    /**
     * Remove um perfil específico de um usuário
     */
    public void removerPerfil(UUID usuarioId, UUID perfilId) {
        log.info("Removendo perfil ID: {} do usuário ID: {}", perfilId, usuarioId);
        
        UsuarioPerfilId id = new UsuarioPerfilId(usuarioId, perfilId);
        UsuarioPerfil usuarioPerfil = usuarioPerfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Associação usuário-perfil não encontrada"));

        usuarioPerfilRepository.delete(usuarioPerfil);
        log.info("Perfil removido com sucesso");
    }

    /**
     * Remove todos os perfis de um usuário
     */
    public void removerTodosPerfisUsuario(UUID usuarioId) {
        log.info("Removendo todos os perfis do usuário ID: {}", usuarioId);
        
        usuarioPerfilRepository.deleteByUsuarioId(usuarioId);
        log.info("Todos os perfis do usuário foram removidos");
    }

    /**
     * Remove todos os usuários de um perfil
     */
    public void removerTodosUsuariosPerfil(UUID perfilId) {
        log.info("Removendo todos os usuários do perfil ID: {}", perfilId);
        
        usuarioPerfilRepository.deleteByPerfilId(perfilId);
        log.info("Todos os usuários do perfil foram removidos");
    }
}
