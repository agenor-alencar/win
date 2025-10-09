package com.win.marketplace.service;

import com.win.marketplace.dto.request.EntregadorCreateRequestDTO;
import com.win.marketplace.dto.response.EntregadorResponseDTO;
import com.win.marketplace.dto.mapper.EntregadorMapper;
import com.win.marketplace.model.Entregador;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.EntregadorRepository;
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
public class EntregadorService {

    private final EntregadorRepository entregadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntregadorMapper entregadorMapper;

    public EntregadorResponseDTO criarEntregador(EntregadorCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se já existe entregador para este usuário
        if (entregadorRepository.findByUsuarioId(requestDTO.usuarioId()).isPresent()) {
            throw new RuntimeException("Usuário já possui perfil de entregador");
        }

        Entregador entregador = entregadorMapper.toEntity(requestDTO);
        entregador.setUsuario(usuario);
        entregador.setDataCriacao(OffsetDateTime.now());
        entregador.setDataAtualizacao(OffsetDateTime.now());

        Entregador savedEntregador = entregadorRepository.save(entregador);
        return entregadorMapper.toResponseDTO(savedEntregador);
    }

    @Transactional(readOnly = true)
    public List<EntregadorResponseDTO> listarEntregadores() {
        List<Entregador> entregadores = entregadorRepository.findAll();
        return entregadorMapper.toResponseDTOList(entregadores);
    }

    @Transactional(readOnly = true)
    public List<EntregadorResponseDTO> listarEntregadoresDisponiveis() {
        List<Entregador> entregadores = entregadorRepository.findByDisponivelTrueAndAtivoTrue();
        return entregadorMapper.toResponseDTOList(entregadores);
    }

    @Transactional(readOnly = true)
    public EntregadorResponseDTO buscarPorId(UUID id) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));
        return entregadorMapper.toResponseDTO(entregador);
    }

    @Transactional(readOnly = true)
    public EntregadorResponseDTO buscarPorUsuarioId(UUID usuarioId) {
        Entregador entregador = entregadorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado para este usuário"));
        return entregadorMapper.toResponseDTO(entregador);
    }

    public EntregadorResponseDTO alterarDisponibilidade(UUID id, boolean disponivel) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        entregador.setDisponivel(disponivel);
        entregador.setDataAtualizacao(OffsetDateTime.now());

        Entregador savedEntregador = entregadorRepository.save(entregador);
        return entregadorMapper.toResponseDTO(savedEntregador);
    }

    public EntregadorResponseDTO atualizarEntregador(UUID id, EntregadorCreateRequestDTO requestDTO) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        entregadorMapper.updateEntityFromDTO(requestDTO, entregador);
        entregador.setDataAtualizacao(OffsetDateTime.now());

        Entregador savedEntregador = entregadorRepository.save(entregador);
        return entregadorMapper.toResponseDTO(savedEntregador);
    }

    public void desativarEntregador(UUID id) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        entregador.setAtivo(false);
        entregador.setDisponivel(false);
        entregador.setDataAtualizacao(OffsetDateTime.now());

        entregadorRepository.save(entregador);
    }
}
