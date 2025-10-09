package com.win.marketplace.service;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.PasswordUpdateRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.dto.mapper.UsuarioMapper;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponseDTO criarUsuario(RegisterRequestDTO requestDTO) {
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(requestDTO.email())) {
            throw new RuntimeException("Email já está sendo utilizado");
        }

        // Verificar se CPF já existe
        if (usuarioRepository.existsByCpf(requestDTO.cpf())) {
            throw new RuntimeException("CPF já está sendo utilizado");
        }

        Usuario usuario = usuarioMapper.toEntity(requestDTO);
        usuario.setSenha(passwordEncoder.encode(requestDTO.senha()));
        usuario.setDataCriacao(OffsetDateTime.now());
        usuario.setDataAtualizacao(OffsetDateTime.now());

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarioMapper.toResponseDTOList(usuarios);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuariosAtivos() {
        List<Usuario> usuarios = usuarioRepository.findByAtivoTrue();
        return usuarioMapper.toResponseDTOList(usuarios);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuarioMapper.toResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuarioMapper.toResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorCpf(String cpf) {
        Usuario usuario = usuarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuarioMapper.toResponseDTO(usuario);
    }

    public UsuarioResponseDTO atualizarUsuario(UUID id, RegisterRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se o novo email já existe (se foi alterado)
        if (!usuario.getEmail().equals(requestDTO.email()) &&
            usuarioRepository.existsByEmail(requestDTO.email())) {
            throw new RuntimeException("Email já está sendo utilizado");
        }

        // Verificar se o novo CPF já existe (se foi alterado)
        if (!usuario.getCpf().equals(requestDTO.cpf()) &&
            usuarioRepository.existsByCpf(requestDTO.cpf())) {
            throw new RuntimeException("CPF já está sendo utilizado");
        }

        usuarioMapper.updateEntityFromDTO(requestDTO, usuario);
        if (requestDTO.senha() != null && !requestDTO.senha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(requestDTO.senha()));
        }
        usuario.setDataAtualizacao(OffsetDateTime.now());

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    public UsuarioResponseDTO atualizarSenha(UUID id, PasswordUpdateRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar senha atual
        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }

        // Verificar se nova senha e confirmação são iguais
        if (!dto.novaSenha().equals(dto.confirmarSenha())) {
            throw new RuntimeException("Nova senha e confirmação não coincidem");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuario.setDataAtualizacao(OffsetDateTime.now());

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    public void atualizarUltimoAcesso(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setUltimoAcesso(OffsetDateTime.now());
        usuarioRepository.save(usuario);
    }

    public void deletarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se existem pedidos ou outras dependências
        if (!usuario.getPedidos().isEmpty()) {
            throw new RuntimeException("Não é possível deletar usuário que possui pedidos");
        }

        usuario.setAtivo(false);
        usuario.setDataAtualizacao(OffsetDateTime.now());
        usuarioRepository.save(usuario);
    }

    public UsuarioResponseDTO ativarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(true);
        usuario.setDataAtualizacao(OffsetDateTime.now());

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    public UsuarioResponseDTO desativarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(false);
        usuario.setDataAtualizacao(OffsetDateTime.now());

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return usuarioMapper.toResponseDTO(savedUsuario);
    }
}
