package com.win.marketplace.service;

import com.win.marketplace.dto.request.PromocaoRequestDTO;
import com.win.marketplace.dto.response.PromocaoResponseDTO;
import com.win.marketplace.dto.mapper.PromocaoMapper;
import com.win.marketplace.model.Promocao;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.PromocaoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PromocaoService {

    private final PromocaoRepository promocaoRepository;
    private final ProdutoRepository produtoRepository;
    private final PromocaoMapper promocaoMapper;

    public PromocaoResponseDTO criarPromocao(PromocaoRequestDTO requestDTO) {
        Produto produto = produtoRepository.findById(requestDTO.produtoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Verificar se as datas são válidas
        if (requestDTO.dataFim().isBefore(requestDTO.dataInicio())) {
            throw new RuntimeException("Data de fim deve ser posterior à data de início");
        }

        // Verificar se não há promoção ativa para o mesmo período
        List<Promocao> promocoesConflitantes = promocaoRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(requestDTO.dataFim(), requestDTO.dataInicio())
                .stream()
                .filter(p -> p.getProduto().getId().equals(requestDTO.produtoId()) && p.getAtiva())
                .toList();

        if (!promocoesConflitantes.isEmpty()) {
            throw new RuntimeException("Já existe uma promoção ativa para este produto no período informado");
        }

        Promocao promocao = promocaoMapper.toEntity(requestDTO);
        promocao.setProduto(produto);
        promocao.setDataCriacao(LocalDateTime.now());
        promocao.setDataAtualizacao(LocalDateTime.now());

        Promocao savedPromocao = promocaoRepository.save(promocao);
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoes() {
        List<Promocao> promocoes = promocaoRepository.findAll();
        return promocaoMapper.toResponseDTOList(promocoes);
    }

    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesAtivas() {
        List<Promocao> promocoes = promocaoRepository.findByAtivaTrue();
        return promocaoMapper.toResponseDTOList(promocoes);
    }

    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesPorProduto(UUID produtoId) {
        List<Promocao> promocoes = promocaoRepository.findByProdutoId(produtoId);
        return promocaoMapper.toResponseDTOList(promocoes);
    }

    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesVigentes() {
        LocalDateTime agora = LocalDateTime.now();
        List<Promocao> promocoes = promocaoRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(agora, agora)
                .stream()
                .filter(Promocao::getAtiva)
                .toList();
        return promocaoMapper.toResponseDTOList(promocoes);
    }

    @Transactional(readOnly = true)
    public PromocaoResponseDTO buscarPorId(UUID id) {
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoção não encontrada"));
        return promocaoMapper.toResponseDTO(promocao);
    }

    public PromocaoResponseDTO atualizarPromocao(UUID id, PromocaoRequestDTO requestDTO) {
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoção não encontrada"));

        // Verificar se as datas são válidas
        if (requestDTO.dataFim().isBefore(requestDTO.dataInicio())) {
            throw new RuntimeException("Data de fim deve ser posterior à data de início");
        }

        // Se o produto foi alterado, validar se existe
        if (!promocao.getProduto().getId().equals(requestDTO.produtoId())) {
            Produto novoProduto = produtoRepository.findById(requestDTO.produtoId())
                    .orElseThrow(() -> new RuntimeException("Novo produto não encontrado"));
            promocao.setProduto(novoProduto);
        }

        promocaoMapper.updateEntityFromDTO(requestDTO, promocao);
        promocao.setDataAtualizacao(LocalDateTime.now());

        Promocao savedPromocao = promocaoRepository.save(promocao);
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    public PromocaoResponseDTO ativarPromocao(UUID id) {
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoção não encontrada"));

        // Verificar se não há conflito com outras promoções ativas
        List<Promocao> promocoesConflitantes = promocaoRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(promocao.getDataFim(), promocao.getDataInicio())
                .stream()
                .filter(p -> p.getProduto().getId().equals(promocao.getProduto().getId()) &&
                           p.getAtiva() && !p.getId().equals(id))
                .toList();

        if (!promocoesConflitantes.isEmpty()) {
            throw new RuntimeException("Há conflito com outras promoções ativas para este produto");
        }

        promocao.setAtiva(true);
        promocao.setDataAtualizacao(LocalDateTime.now());

        Promocao savedPromocao = promocaoRepository.save(promocao);
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    public PromocaoResponseDTO desativarPromocao(UUID id) {
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoção não encontrada"));

        promocao.setAtiva(false);
        promocao.setDataAtualizacao(LocalDateTime.now());

        Promocao savedPromocao = promocaoRepository.save(promocao);
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    public void deletarPromocao(UUID id) {
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoção não encontrada"));

        // Só permitir deletar se a promoção não estiver ativa
        if (promocao.getAtiva()) {
            throw new RuntimeException("Não é possível deletar promoção ativa. Desative-a primeiro.");
        }

        promocaoRepository.delete(promocao);
    }

    public void verificarEAtualizarPromocoesExpiradas() {
        LocalDateTime agora = LocalDateTime.now();
        List<Promocao> promocoesExpiradas = promocaoRepository.findByAtivaTrue()
                .stream()
                .filter(p -> p.getDataFim().isBefore(agora))
                .toList();

        promocoesExpiradas.forEach(promocao -> {
            promocao.setAtiva(false);
            promocao.setDataAtualizacao(agora);
        });

        promocaoRepository.saveAll(promocoesExpiradas);
    }
}
