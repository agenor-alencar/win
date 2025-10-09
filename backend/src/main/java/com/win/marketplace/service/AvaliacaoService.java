package com.win.marketplace.service;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.dto.mapper.AvaliacaoMapper;
import com.win.marketplace.model.Avaliacao;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.AvaliacaoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final LojistaRepository lojistaRepository;
    private final ProdutoRepository produtoRepository;
    private final AvaliacaoMapper avaliacaoMapper;

    public AvaliacaoResponseDTO criarAvaliacaoLojista(UUID clienteId, AvaliacaoRequestDTO requestDTO) {
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pedido pedido = pedidoRepository.findById(requestDTO.pedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        Lojista lojista = lojistaRepository.findById(requestDTO.avaliadoId())
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        Avaliacao avaliacao = avaliacaoMapper.toEntity(requestDTO);
        avaliacao.setCliente(cliente);
        avaliacao.setPedido(pedido);
        avaliacao.setLojista(lojista);
        avaliacao.setDataAvaliacao(OffsetDateTime.now());

        Avaliacao savedAvaliacao = avaliacaoRepository.save(avaliacao);
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    public AvaliacaoResponseDTO criarAvaliacaoProduto(UUID clienteId, AvaliacaoRequestDTO requestDTO) {
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pedido pedido = pedidoRepository.findById(requestDTO.pedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        Produto produto = produtoRepository.findById(requestDTO.avaliadoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        Avaliacao avaliacao = avaliacaoMapper.toEntity(requestDTO);
        avaliacao.setCliente(cliente);
        avaliacao.setPedido(pedido);
        avaliacao.setProduto(produto);
        avaliacao.setDataAvaliacao(OffsetDateTime.now());

        Avaliacao savedAvaliacao = avaliacaoRepository.save(avaliacao);
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorLojista(UUID lojistaId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByLojistaId(lojistaId);
        return avaliacoes.stream()
                .map(avaliacaoMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorUsuario(UUID usuarioId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByClienteId(usuarioId);
        return avaliacoes.stream()
                .map(avaliacaoMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorProduto(UUID produtoId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoId(produtoId);
        return avaliacoes.stream()
                .map(avaliacaoMapper::toResponseDTO)
                .toList();
    }
}
