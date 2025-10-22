package com.win.marketplace.service;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.PasswordUpdateRequestDTO;
import com.win.marketplace.dto.request.LojistaRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.dto.mapper.UsuarioMapper;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.PerfilRepository;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final LojistaRepository lojistaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Cria um novo usuário com perfil USER padrão
     */
    public UsuarioResponseDTO criarUsuario(RegisterRequestDTO requestDTO) {
        log.info("Criando novo usuário com email: {}", requestDTO.email());
        
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(requestDTO.email())) {
            throw new BusinessException("Email já está sendo utilizado");
        }

        // Verificar se CPF já existe (se foi informado)
        if (requestDTO.cpf() != null && usuarioRepository.existsByCpf(requestDTO.cpf())) {
            throw new BusinessException("CPF já está sendo utilizado");
        }

        // Criar entidade usuário
        Usuario usuario = usuarioMapper.toEntity(requestDTO);
        usuario.setSenhaHash(passwordEncoder.encode(requestDTO.senha()));

        // Salvar usuário primeiro (para gerar o ID)
        Usuario savedUsuario = usuarioRepository.save(usuario);
        log.info("Usuário criado com sucesso. ID: {}", savedUsuario.getId());
        
        // Buscar perfil USER padrão
        Perfil perfilUser = perfilRepository.findByNome("USER")
            .orElseThrow(() -> new ResourceNotFoundException("Perfil USER não encontrado no sistema"));
        
        // Criar associação usuário-perfil com o ID composto
        UsuarioPerfil usuarioPerfil = new UsuarioPerfil();
        
        // Criar e setar o ID composto
        UsuarioPerfilId usuarioPerfilId = new UsuarioPerfilId();
        usuarioPerfilId.setUsuarioId(savedUsuario.getId());
        usuarioPerfilId.setPerfilId(perfilUser.getId());
        usuarioPerfil.setId(usuarioPerfilId);
        
        usuarioPerfil.setUsuario(savedUsuario);
        usuarioPerfil.setPerfil(perfilUser);
        // dataAtribuicao será setado automaticamente pelo @PrePersist
        
        // Adicionar perfil à lista do usuário
        if (savedUsuario.getUsuarioPerfis() == null) {
            savedUsuario.setUsuarioPerfis(new java.util.HashSet<>());
        }
        savedUsuario.getUsuarioPerfis().add(usuarioPerfil);
        
        // Salvar novamente para persistir o relacionamento
        savedUsuario = usuarioRepository.save(savedUsuario);
        log.info("✅ Perfil USER associado ao usuário: {}", savedUsuario.getEmail());
        
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    /**
     * Lista todos os usuários
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios() {
        log.info("Listando todos os usuários");
        
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        return usuarios.stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista usuários ativos
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuariosAtivos() {
        log.info("Listando usuários ativos");
        
        List<Usuario> usuarios = usuarioRepository.findByAtivoTrue();
        
        return usuarios.stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuário por ID
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(UUID id) {
        log.info("Buscando usuário por ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));
        
        return usuarioMapper.toResponseDTO(usuario);
    }

    /**
     * Busca usuário por email
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        log.info("Buscando usuário por email: {}", email);
        
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com email: " + email));
        
        return usuarioMapper.toResponseDTO(usuario);
    }

    /**
     * Busca usuário por CPF
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorCpf(String cpf) {
        log.info("Buscando usuário por CPF");
        
        Usuario usuario = usuarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com CPF informado"));
        
        return usuarioMapper.toResponseDTO(usuario);
    }

    /**
     * Atualiza dados do usuário
     */
    public UsuarioResponseDTO atualizarUsuario(UUID id, RegisterRequestDTO requestDTO) {
        log.info("Atualizando usuário ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Verificar se o novo email já existe (se foi alterado)
        if (!usuario.getEmail().equals(requestDTO.email()) &&
            usuarioRepository.existsByEmail(requestDTO.email())) {
            throw new BusinessException("Email já está sendo utilizado");
        }

        // Verificar se o novo CPF já existe (se foi alterado)
        if (requestDTO.cpf() != null && 
            !requestDTO.cpf().equals(usuario.getCpf()) &&
            usuarioRepository.existsByCpf(requestDTO.cpf())) {
            throw new BusinessException("CPF já está sendo utilizado");
        }

        usuarioMapper.updateEntityFromDTO(requestDTO, usuario);
        
        // Atualizar senha se foi informada
        if (requestDTO.senha() != null && !requestDTO.senha().isEmpty()) {
            usuario.setSenhaHash(passwordEncoder.encode(requestDTO.senha())); // ✅ senhaHash
        }

        Usuario savedUsuario = usuarioRepository.save(usuario);
        log.info("Usuário atualizado com sucesso");
        
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    /**
     * Atualiza senha do usuário
     */
    public UsuarioResponseDTO atualizarSenha(UUID id, PasswordUpdateRequestDTO dto) {
        log.info("Atualizando senha do usuário ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Verificar senha atual
        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenhaHash())) { // ✅ getSenhaHash()
            throw new BusinessException("Senha atual incorreta");
        }

        // Verificar se nova senha e confirmação são iguais
        if (!dto.novaSenha().equals(dto.confirmarSenha())) {
            throw new BusinessException("Nova senha e confirmação não coincidem");
        }

        usuario.setSenhaHash(passwordEncoder.encode(dto.novaSenha())); // ✅ setSenhaHash()

        Usuario savedUsuario = usuarioRepository.save(usuario);
        log.info("Senha atualizada com sucesso");
        
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    /**
     * Atualiza último acesso do usuário (chamado após login)
     */
    public void atualizarUltimoAcesso(String email) {
        log.info("Atualizando último acesso do usuário: {}", email);
        
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com email: " + email));

        usuario.setUltimoAcesso(OffsetDateTime.now());
        usuarioRepository.save(usuario);
        
        log.info("Último acesso atualizado");
    }

    /**
     * Deleta usuário (soft delete - apenas desativa)
     */
    public void deletarUsuario(UUID id) {
        log.info("Deletando usuário ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        // Verificar se existem pedidos ou outras dependências
        if (usuario.getPedidos() != null && !usuario.getPedidos().isEmpty()) {
            throw new BusinessException("Não é possível deletar usuário que possui pedidos");
        }

        // Soft delete - apenas desativa o usuário
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
        
        log.info("Usuário desativado com sucesso (soft delete)");
    }

    /**
     * Ativa um usuário
     */
    public UsuarioResponseDTO ativarUsuario(UUID id) {
        log.info("Ativando usuário ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        usuario.setAtivo(true);

        Usuario savedUsuario = usuarioRepository.save(usuario);
        log.info("Usuário ativado com sucesso");
        
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    /**
     * Desativa um usuário
     */
    public UsuarioResponseDTO desativarUsuario(UUID id) {
        log.info("Desativando usuário ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        usuario.setAtivo(false);

        Usuario savedUsuario = usuarioRepository.save(usuario);
        log.info("Usuário desativado com sucesso");
        
        return usuarioMapper.toResponseDTO(savedUsuario);
    }

    /**
     * Busca usuários por nome (pesquisa parcial)
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> buscarPorNome(String nome) {
        log.info("Buscando usuários por nome: {}", nome);
        
        List<Usuario> usuarios = usuarioRepository.findByNomeContainingIgnoreCase(nome);
        
        return usuarios.stream()
                .map(usuarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica se email está disponível
     */
    @Transactional(readOnly = true)
    public boolean emailDisponivel(String email) {
        return !usuarioRepository.existsByEmail(email);
    }

    /**
     * Verifica se CPF está disponível
     */
    @Transactional(readOnly = true)
    public boolean cpfDisponivel(String cpf) {
        return !usuarioRepository.existsByCpf(cpf);
    }

    /**
     * Promove um usuário comum (USER) para LOJISTA
     * Este método é chamado quando o usuário clica em "Venda no WIN" e preenche o formulário
     * 
     * @param email Email do usuário que deseja se tornar lojista
     * @param lojistaData Dados da loja a ser cadastrada
     * @return UsuarioResponseDTO com perfis atualizados
     * @throws ResourceNotFoundException se usuário não for encontrado
     * @throws BusinessException se usuário já for lojista ou CNPJ já existir
     */
    public UsuarioResponseDTO promoverParaLojista(String email, LojistaRequestDTO lojistaData) {
        log.info("🏪 Iniciando promoção de usuário {} para LOJISTA", email);
        
        // 1. Buscar usuário pelo email
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        // 2. Verificar se usuário já possui perfil LOJISTA
        boolean jaEhLojista = usuario.getUsuarioPerfis().stream()
            .anyMatch(up -> "LOJISTA".equals(up.getPerfil().getNome()));
        
        if (jaEhLojista) {
            log.warn("❌ Usuário {} já possui perfil de lojista", email);
            throw new BusinessException("Você já possui uma loja cadastrada no WIN");
        }
        
        // 3. Verificar se CNPJ já está cadastrado no sistema
        if (lojistaRepository.existsByCnpj(lojistaData.cnpj())) {
            log.warn("❌ CNPJ {} já cadastrado no sistema", lojistaData.cnpj());
            throw new BusinessException("Este CNPJ já está cadastrado no sistema");
        }
        
        // 4. Criar entidade Lojista
        Lojista lojista = new Lojista();
        lojista.setUsuario(usuario);
        lojista.setCnpj(lojistaData.cnpj());
        lojista.setNomeFantasia(lojistaData.nomeFantasia());
        lojista.setRazaoSocial(lojistaData.razaoSocial());
        lojista.setDescricao(lojistaData.descricao());
        lojista.setTelefone(lojistaData.telefone());
        
        // Campos de endereço
        lojista.setCep(lojistaData.cep());
        lojista.setLogradouro(lojistaData.logradouro());
        lojista.setNumero(lojistaData.numero());
        lojista.setComplemento(lojistaData.complemento());
        lojista.setBairro(lojistaData.bairro());
        lojista.setCidade(lojistaData.cidade());
        lojista.setUf(lojistaData.uf());
        
        lojista.setAtivo(true);
        
        // 5. Salvar lojista no banco
        lojista = lojistaRepository.save(lojista);
        log.info("✅ Lojista criado com sucesso. ID: {}, Nome: {}", lojista.getId(), lojista.getNomeFantasia());
        
        // 6. Buscar perfil LOJISTA
        Perfil perfilLojista = perfilRepository.findByNome("LOJISTA")
            .orElseThrow(() -> new ResourceNotFoundException("Perfil LOJISTA não encontrado no sistema"));
        
        // 7. Criar ID composto para a associação usuário-perfil
        UsuarioPerfilId usuarioPerfilId = new UsuarioPerfilId();
        usuarioPerfilId.setUsuarioId(usuario.getId());
        usuarioPerfilId.setPerfilId(perfilLojista.getId());
        
        // 8. Criar associação usuário-perfil
        UsuarioPerfil usuarioPerfil = new UsuarioPerfil();
        usuarioPerfil.setId(usuarioPerfilId);
        usuarioPerfil.setUsuario(usuario);
        usuarioPerfil.setPerfil(perfilLojista);
        // dataAtribuicao será setado automaticamente pelo @PrePersist
        
        // 9. Adicionar perfil LOJISTA à lista de perfis do usuário
        if (usuario.getUsuarioPerfis() == null) {
            usuario.setUsuarioPerfis(new java.util.HashSet<>());
        }
        usuario.getUsuarioPerfis().add(usuarioPerfil);
        
        // 10. Salvar usuário com novo perfil
        usuario = usuarioRepository.save(usuario);
        log.info("🎉 Perfil LOJISTA adicionado com sucesso ao usuário: {}", usuario.getEmail());
        log.info("📊 Perfis do usuário: {}", 
            usuario.getUsuarioPerfis().stream()
                .map(up -> up.getPerfil().getNome())
                .collect(Collectors.joining(", "))
        );
        
        return usuarioMapper.toResponseDTO(usuario);
    }

    /**
     * Adiciona perfil ADMIN a um usuário existente
     * Método otimizado para promoção rápida
     */
    public void adicionarPerfilAdmin(UUID usuarioId) {
        log.info("🔐 Adicionando perfil ADMIN ao usuário: {}", usuarioId);
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        
        // Buscar perfil ADMIN
        Perfil perfilAdmin = perfilRepository.findByNome("ADMIN")
            .orElseThrow(() -> new BusinessException("Perfil ADMIN não encontrado"));
        
        // Verificar se já tem perfil ADMIN
        boolean jaTemAdmin = usuario.getUsuarioPerfis().stream()
            .anyMatch(up -> "ADMIN".equals(up.getPerfil().getNome()));
        
        if (jaTemAdmin) {
            log.info("⚠️ Usuário {} já possui perfil ADMIN", usuario.getEmail());
            return;
        }
        
        // Criar associação usuario-perfil
        UsuarioPerfil usuarioPerfil = new UsuarioPerfil();
        UsuarioPerfilId id = new UsuarioPerfilId();
        id.setUsuarioId(usuario.getId());
        id.setPerfilId(perfilAdmin.getId());
        usuarioPerfil.setId(id);
        usuarioPerfil.setUsuario(usuario);
        usuarioPerfil.setPerfil(perfilAdmin);
        usuarioPerfil.setDataAtribuicao(OffsetDateTime.now());
        
        // Adicionar perfil à lista
        if (usuario.getUsuarioPerfis() == null) {
            usuario.setUsuarioPerfis(new java.util.HashSet<>());
        }
        usuario.getUsuarioPerfis().add(usuarioPerfil);
        
        // Salvar
        usuarioRepository.save(usuario);
        log.info("✅ Perfil ADMIN adicionado com sucesso ao usuário: {}", usuario.getEmail());
    }
}
