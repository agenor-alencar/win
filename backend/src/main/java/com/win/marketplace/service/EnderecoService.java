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
    public EnderecoResponseDTO buscarEnderecoPrincipal(UUID usuarioId) {
        Endereco endereco = enderecoRepository.findByUsuarioIdAndPrincipalTrueAndAtivoTrue(usuarioId)
                .orElseThrow(() -> new RuntimeException("Endereço principal não encontrado"));
        return enderecoMapper.toResponseDTO(endereco);
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

        Endereco savedEndereco = enderecoRepository.save(endereco);
        return enderecoMapper.toResponseDTO(savedEndereco);
    }

    public EnderecoResponseDTO definirComoPrincipal(UUID id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!Boolean.TRUE.equals(endereco.getAtivo())) {
            throw new RuntimeException("Não é possível definir um endereço inativo como principal");
        }

        desmarcarEnderecosPrincipais(endereco.getUsuario().getId());
        endereco.setPrincipal(true);

        Endereco savedEndereco = enderecoRepository.save(endereco);
        return enderecoMapper.toResponseDTO(savedEndereco);
    }

    public void deletarEndereco(UUID id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Se for o endereço principal, verificar se há outros endereços ativos
        if (Boolean.TRUE.equals(endereco.getPrincipal())) {
            List<Endereco> outrosEnderecos = enderecoRepository.findByUsuarioIdAndAtivoTrue(endereco.getUsuario().getId())
                    .stream()
                    .filter(e -> !e.getId().equals(id))
                    .toList();

            if (!outrosEnderecos.isEmpty()) {
                // Definir o primeiro endereço encontrado como principal
                Endereco novoEnderecoPrincipal = outrosEnderecos.get(0);
                novoEnderecoPrincipal.setPrincipal(true);
                enderecoRepository.save(novoEnderecoPrincipal);
            }
        }

        endereco.setAtivo(false);
        enderecoRepository.save(endereco);
    }

    private void desmarcarEnderecosPrincipais(UUID usuarioId) {
        List<Endereco> enderecosPrincipais = enderecoRepository.findByUsuarioIdAndAtivoTrue(usuarioId)
                .stream()
                .filter(e -> Boolean.TRUE.equals(e.getPrincipal()))
                .toList();

        enderecosPrincipais.forEach(e -> e.setPrincipal(false));

        enderecoRepository.saveAll(enderecosPrincipais);
    }
}
