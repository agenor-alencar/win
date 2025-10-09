package com.win.marketplace.service;

import com.win.marketplace.dto.request.EnderecoRequestDTO;
import com.win.marketplace.dto.response.EnderecoResponseDTO;
import com.win.marketplace.dto.mapper.EnderecoMapper;
import com.win.marketplace.model.Endereco;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.EnderecoRepository;
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
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoMapper enderecoMapper;

    public EnderecoResponseDTO criarEndereco(UUID usuarioId, EnderecoRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Endereco endereco = enderecoMapper.toEntity(requestDTO);
        endereco.setUsuario(usuario);
        endereco.setDataCriacao(OffsetDateTime.now());
        endereco.setDataAtualizacao(OffsetDateTime.now());

        // Se este for o primeiro endereço ou for marcado como principal,
        // desmarcar outros endereços principais
        if (Boolean.TRUE.equals(requestDTO.principal()) ||
            enderecoRepository.findByUsuarioIdAndAtivoTrue(usuarioId).isEmpty()) {
            desmarcarEnderecosPrincipais(usuarioId);
            endereco.setPrincipal(true);
        }

        Endereco savedEndereco = enderecoRepository.save(endereco);
        return enderecoMapper.toResponseDTO(savedEndereco);
    }

    @Transactional(readOnly = true)
    public List<EnderecoResponseDTO> listarEnderecosPorUsuario(UUID usuarioId) {
        List<Endereco> enderecos = enderecoRepository.findByUsuarioIdAndAtivoTrue(usuarioId);
        return enderecoMapper.toResponseDTOList(enderecos);
    }

    @Transactional(readOnly = true)
    public EnderecoResponseDTO buscarPorId(UUID id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
        return enderecoMapper.toResponseDTO(endereco);
    }

    public EnderecoResponseDTO atualizarEndereco(UUID id, EnderecoRequestDTO requestDTO) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Se está sendo marcado como principal, desmarcar outros
        if (Boolean.TRUE.equals(requestDTO.principal()) && !Boolean.TRUE.equals(endereco.getPrincipal())) {
            desmarcarEnderecosPrincipais(endereco.getUsuario().getId());
        }

        enderecoMapper.updateEntityFromDTO(requestDTO, endereco);
        endereco.setDataAtualizacao(OffsetDateTime.now());

        Endereco savedEndereco = enderecoRepository.save(endereco);
        return enderecoMapper.toResponseDTO(savedEndereco);
    }

    public void deletarEndereco(UUID id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        endereco.setAtivo(false);
        endereco.setDataAtualizacao(OffsetDateTime.now());
        enderecoRepository.save(endereco);
    }

    private void desmarcarEnderecosPrincipais(UUID usuarioId) {
        List<Endereco> enderecosPrincipais = enderecoRepository.findByUsuarioIdAndAtivoTrue(usuarioId)
                .stream()
                .filter(e -> Boolean.TRUE.equals(e.getPrincipal()))
                .toList();

        enderecosPrincipais.forEach(e -> {
            e.setPrincipal(false);
            e.setDataAtualizacao(OffsetDateTime.now());
        });

        enderecoRepository.saveAll(enderecosPrincipais);
    }
}
