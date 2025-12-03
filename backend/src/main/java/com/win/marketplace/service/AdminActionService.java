package com.win.marketplace.service;

import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service para ações administrativas críticas
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminActionService {

    private final PedidoRepository pedidoRepository;
    private final LojistaRepository lojistaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Atualiza status de um pedido (ação administrativa)
     */
    @Transactional
    public void atualizarStatusPedido(UUID pedidoId, String novoStatus) {
        log.info("Admin atualizando status do pedido {} para {}", pedidoId, novoStatus);
        
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado"));
        
        try {
            Pedido.StatusPedido status = Pedido.StatusPedido.valueOf(novoStatus);
            pedido.setStatus(status);
            
            pedidoRepository.save(pedido);
            log.info("Status do pedido {} atualizado com sucesso para {}", pedidoId, novoStatus);
        } catch (IllegalArgumentException e) {
            log.error("Status inválido: {}", novoStatus);
            throw new IllegalArgumentException("Status de pedido inválido: " + novoStatus);
        }
    }

    /**
     * Cancela um pedido (ação administrativa forçada)
     */
    @Transactional
    public void cancelarPedido(UUID pedidoId, String motivo) {
        log.info("Admin cancelando pedido {} - Motivo: {}", pedidoId, motivo);
        
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado"));
        
        if (pedido.getStatus() == Pedido.StatusPedido.CANCELADO) {
            throw new IllegalStateException("Pedido já está cancelado");
        }
        
        if (pedido.getStatus() == Pedido.StatusPedido.ENTREGUE) {
            throw new IllegalStateException("Não é possível cancelar pedido já entregue");
        }
        
        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        // Adicionar motivo em observações se houver campo
        
        pedidoRepository.save(pedido);
        log.info("Pedido {} cancelado com sucesso pelo admin", pedidoId);
    }

    /**
     * Ativa ou desativa uma loja (suspensão administrativa)
     */
    @Transactional
    public void toggleStatusLojista(UUID lojistaId, boolean ativar) {
        log.info("Admin {} lojista {}", ativar ? "ativando" : "desativando", lojistaId);
        
        Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado"));
        
        lojista.setAtivo(ativar);
        lojista.setAtualizadoEm(OffsetDateTime.now());
        
        lojistaRepository.save(lojista);
        log.info("Lojista {} {} com sucesso", lojistaId, ativar ? "ativado" : "desativado");
    }

    /**
     * Ativa ou desativa um produto
     */
    @Transactional
    public void toggleStatusProduto(UUID produtoId, boolean ativar) {
        log.info("Admin {} produto {}", ativar ? "ativando" : "desativando", produtoId);
        
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        
        produto.setAtivo(ativar);
        produto.setAtualizadoEm(OffsetDateTime.now());
        
        produtoRepository.save(produto);
        log.info("Produto {} {} com sucesso", produtoId, ativar ? "ativado" : "desativado");
    }

    /**
     * Reseta senha de um usuário (gera senha temporária)
     */
    @Transactional
    public String resetarSenhaUsuario(UUID usuarioId) {
        log.info("Admin resetando senha do usuário {}", usuarioId);
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        // Gerar senha temporária
        String senhaTemporaria = gerarSenhaTemporaria();
        String senhaCriptografada = passwordEncoder.encode(senhaTemporaria);
        
        usuario.setSenhaHash(senhaCriptografada);
        usuario.setAtualizadoEm(OffsetDateTime.now());
        
        usuarioRepository.save(usuario);
        log.info("Senha do usuário {} resetada com sucesso", usuarioId);
        
        return senhaTemporaria;
    }

    /**
     * Bloqueia ou desbloqueia um usuário
     */
    @Transactional
    public void toggleStatusUsuario(UUID usuarioId, boolean ativar) {
        log.info("Admin {} usuário {}", ativar ? "ativando" : "bloqueando", usuarioId);
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        usuario.setAtivo(ativar);
        usuario.setAtualizadoEm(OffsetDateTime.now());
        
        usuarioRepository.save(usuario);
        log.info("Usuário {} {} com sucesso", usuarioId, ativar ? "ativado" : "bloqueado");
    }

    /**
     * Gera uma senha temporária aleatória
     */
    private String gerarSenhaTemporaria() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
        StringBuilder senha = new StringBuilder();
        
        for (int i = 0; i < 10; i++) {
            int index = (int) (Math.random() * caracteres.length());
            senha.append(caracteres.charAt(index));
        }
        
        return senha.toString();
    }
}
