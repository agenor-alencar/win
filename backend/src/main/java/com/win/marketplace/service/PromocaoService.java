package com.win.marketplace.service;

import com.win.marketplace.dto.request.PromocaoRequestDTO;
import com.win.marketplace.dto.response.PromocaoResponseDTO;
import com.win.marketplace.dto.mapper.PromocaoMapper;
import com.win.marketplace.model.Promocao;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.PromocaoRepository;
import com.win.marketplace.repository.ProdutoRepository;
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
public class PromocaoService {

    private final PromocaoRepository promocaoRepository;
    private final ProdutoRepository produtoRepository;
    private final PromocaoMapper promocaoMapper;

    /**
     * Cria uma nova promoção
     */
    public PromocaoResponseDTO criarPromocao(PromocaoRequestDTO requestDTO) {
        log.info("Criando promoção para produto ID: {}", requestDTO.produtoId());
        
        Produto produto = produtoRepository.findById(requestDTO.produtoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + requestDTO.produtoId()));

        // Verificar se as datas são válidas
        if (requestDTO.dataFim().isBefore(requestDTO.dataInicio())) {
            throw new BusinessException("Data de fim deve ser posterior à data de início");
        }

        // Verificar se não há promoção ativa para o mesmo período
        List<Promocao> promocoesConflitantes = promocaoRepository
                .findPromocoesSobrepostasAtivasPorProduto(
                    requestDTO.produtoId(), 
                    requestDTO.dataInicio(), 
                    requestDTO.dataFim()
                );

        if (!promocoesConflitantes.isEmpty()) {
            throw new BusinessException("Já existe uma promoção ativa para este produto no período informado");
        }

        Promocao promocao = promocaoMapper.toEntity(requestDTO);
        promocao.setProduto(produto);

        Promocao savedPromocao = promocaoRepository.save(promocao);
        log.info("Promoção criada com sucesso. ID: {}", savedPromocao.getId());
        
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    /**
     * Lista todas as promoções
     */
    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoes() {
        log.info("Listando todas as promoções");
        
        List<Promocao> promocoes = promocaoRepository.findAll();
        
        return promocoes.stream()
                .map(promocaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista promoções ativas
     */
    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesAtivas() {
        log.info("Listando promoções ativas");
        
        List<Promocao> promocoes = promocaoRepository.findByAtivaTrue();
        
        return promocoes.stream()
                .map(promocaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista promoções de um produto
     */
    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesPorProduto(UUID produtoId) {
        log.info("Listando promoções do produto ID: {}", produtoId);
        
        List<Promocao> promocoes = promocaoRepository.findByProdutoIdOrderByDataInicioDesc(produtoId);
        
        return promocoes.stream()
                .map(promocaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista promoções vigentes (dentro do período e ativas)
     */
    @Transactional(readOnly = true)
    public List<PromocaoResponseDTO> listarPromocoesVigentes() {
        log.info("Listando promoções vigentes");
        
        OffsetDateTime agora = OffsetDateTime.now();
        List<Promocao> promocoes = promocaoRepository.findPromocoesVigentesAtivas(agora);
        
        return promocoes.stream()
                .map(promocaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca promoção por ID
     */
    @Transactional(readOnly = true)
    public PromocaoResponseDTO buscarPorId(UUID id) {
        log.info("Buscando promoção ID: {}", id);
        
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promoção não encontrada com ID: " + id));
        
        return promocaoMapper.toResponseDTO(promocao);
    }

    /**
     * Atualiza uma promoção
     */
    public PromocaoResponseDTO atualizarPromocao(UUID id, PromocaoRequestDTO requestDTO) {
        log.info("Atualizando promoção ID: {}", id);
        
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promoção não encontrada com ID: " + id));

        // Verificar se as datas são válidas
        if (requestDTO.dataFim().isBefore(requestDTO.dataInicio())) {
            throw new BusinessException("Data de fim deve ser posterior à data de início");
        }

        // Se o produto foi alterado, validar se existe
        if (!promocao.getProduto().getId().equals(requestDTO.produtoId())) {
            Produto novoProduto = produtoRepository.findById(requestDTO.produtoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + requestDTO.produtoId()));
            promocao.setProduto(novoProduto);
        }

        // Verificar conflitos (excluindo a promoção atual)
        List<Promocao> promocoesConflitantes = promocaoRepository
                .findPromocoesSobrepostasAtivasPorProduto(
                    requestDTO.produtoId(), 
                    requestDTO.dataInicio(), 
                    requestDTO.dataFim()
                )
                .stream()
                .filter(p -> !p.getId().equals(id))
                .collect(Collectors.toList());

        if (!promocoesConflitantes.isEmpty()) {
            throw new BusinessException("Há conflito com outras promoções ativas para este produto");
        }

        promocaoMapper.updateEntityFromDTO(requestDTO, promocao);

        Promocao savedPromocao = promocaoRepository.save(promocao);
        log.info("Promoção atualizada com sucesso");
        
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    /**
     * Ativa uma promoção
     */
    public PromocaoResponseDTO ativarPromocao(UUID id) {
        log.info("Ativando promoção ID: {}", id);
        
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promoção não encontrada com ID: " + id));

        // Verificar se não há conflito com outras promoções ativas
        List<Promocao> promocoesConflitantes = promocaoRepository
                .findPromocoesSobrepostasAtivasPorProduto(
                    promocao.getProduto().getId(),
                    promocao.getDataInicio(),
                    promocao.getDataFim()
                )
                .stream()
                .filter(p -> !p.getId().equals(id))
                .collect(Collectors.toList());

        if (!promocoesConflitantes.isEmpty()) {
            throw new BusinessException("Há conflito com outras promoções ativas para este produto");
        }

        promocao.setAtiva(true);

        Promocao savedPromocao = promocaoRepository.save(promocao);
        log.info("Promoção ativada com sucesso");
        
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    /**
     * Desativa uma promoção
     */
    public PromocaoResponseDTO desativarPromocao(UUID id) {
        log.info("Desativando promoção ID: {}", id);
        
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promoção não encontrada com ID: " + id));

        promocao.setAtiva(false);

        Promocao savedPromocao = promocaoRepository.save(promocao);
        log.info("Promoção desativada com sucesso");
        
        return promocaoMapper.toResponseDTO(savedPromocao);
    }

    /**
     * Deleta uma promoção
     */
    public void deletarPromocao(UUID id) {
        log.info("Deletando promoção ID: {}", id);
        
        Promocao promocao = promocaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promoção não encontrada com ID: " + id));

        // Só permitir deletar se a promoção não estiver ativa
        if (promocao.getAtiva()) {
            throw new BusinessException("Não é possível deletar promoção ativa. Desative-a primeiro.");
        }

        promocaoRepository.delete(promocao);
        log.info("Promoção deletada com sucesso");
    }

    /**
     * Verifica e atualiza promoções expiradas (job agendado)
     */
    public void verificarEAtualizarPromocoesExpiradas() {
        log.info("Verificando promoções expiradas");
        
        OffsetDateTime agora = OffsetDateTime.now();
        int quantidadeDesativadas = promocaoRepository.desativarPromocoesExpiradas(agora);
        
        if (quantidadeDesativadas > 0) {
            log.info("{} promoções expiradas foram desativadas", quantidadeDesativadas);
        } else {
            log.info("Nenhuma promoção expirada encontrada");
        }
    }
}
