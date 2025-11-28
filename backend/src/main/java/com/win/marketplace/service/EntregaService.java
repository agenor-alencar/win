package com.win.marketplace.service;

import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.request.UberWebhookDTO;
import com.win.marketplace.dto.response.EntregaResponseDTO;
import com.win.marketplace.dto.response.SimulacaoFreteResponseDTO;
import com.win.marketplace.dto.response.SolicitacaoCorridaUberResponseDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.repository.EntregaRepository;
import com.win.marketplace.repository.PedidoRepository;
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
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final PedidoRepository pedidoRepository;
    private final UberFlashService uberFlashService;

    /**
     * Cria registro inicial de entrega após simulação de frete.
     */
    @Transactional
    public Entrega criarEntregaInicial(Pedido pedido, SimulacaoFreteResponseDTO simulacao) {
        log.info("Criando registro inicial de entrega para pedido: {}", pedido.getId());

        var entrega = new Entrega();
        entrega.setPedido(pedido);
        entrega.setTipoVeiculoSolicitado(simulacao.getTipoVeiculo());
        entrega.setValorCorridaUber(simulacao.getValorCorridaUber());
        entrega.setTaxaWinmarket(simulacao.getTaxaWinmarket());
        entrega.setValorFreteCliente(simulacao.getValorFreteTotal());
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);

        // Dados do cliente para auditoria
        entrega.setClienteNome(pedido.getUsuario().getNome());
        entrega.setClienteTelefone(pedido.getUsuario().getTelefone());
        entrega.setEnderecoEntrega(formatarEnderecoCompleto(pedido.getEnderecoEntrega()));

        return entregaRepository.save(entrega);
    }

    /**
     * Solicita corrida Uber quando pedido estiver pronto.
     */
    @Transactional
    public SolicitacaoCorridaUberResponseDTO solicitarCorridaUber(UUID pedidoId) {
        log.info("Solicitando corrida Uber para pedido: {}", pedidoId);

        var entrega = entregaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada para o pedido"));

        if (entrega.getStatusEntrega() != StatusEntrega.AGUARDANDO_PREPARACAO) {
            throw new BusinessException("Entrega não está aguardando preparação");
        }

        var pedido = entrega.getPedido();
        var lojista = pedido.getLojista();

        // Montar request para Uber
        var request = com.win.marketplace.dto.request.SolicitacaoCorridaUberRequestDTO.builder()
                .pedidoId(pedidoId)
                .tipoVeiculo(entrega.getTipoVeiculoSolicitado())
                .enderecoOrigemCompleto(formatarEnderecoLojista(lojista))
                .nomeLojista(lojista.getNomeFantasia())
                .telefoneLojista(lojista.getTelefone())
                .enderecoDestinoCompleto(entrega.getEnderecoEntrega())
                .nomeCliente(entrega.getClienteNome())
                .telefoneCliente(entrega.getClienteTelefone())
                .valorCorridaUber(entrega.getValorCorridaUber())
                .build();

        var response = uberFlashService.solicitarCorrida(request);

        if (response.getSucesso()) {
            // Atualizar entrega com dados da corrida
            entrega.setIdCorridaUber(response.getIdCorridaUber());
            entrega.setNomeMotorista(response.getNomeMotorista());
            entrega.setPlacaVeiculo(response.getPlacaVeiculo());
            entrega.setContatoMotorista(response.getContatoMotorista());
            entrega.setCodigoRetiradaUber(response.getCodigoRetirada());
            entrega.setCodigoEntregaUber(response.getCodigoEntrega());
            entrega.setUrlRastreamentoUber(response.getUrlRastreamento());
            entrega.setDataHoraSolicitacao(OffsetDateTime.now());
            entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_MOTORISTA);
            entregaRepository.save(entrega);
        } else {
            entrega.setStatusEntrega(StatusEntrega.FALHA_SOLICITACAO);
            entrega.setObservacoes("Erro: " + response.getErro());
            entregaRepository.save(entrega);
        }

        return response;
    }

    /**
     * Processa webhook da Uber com atualização de status.
     */
    @Transactional
    public void processarWebhookUber(UberWebhookDTO webhook) {
        log.info("Processando webhook Uber - Corrida: {}, Status: {}",
                webhook.getIdCorridaUber(), webhook.getStatusUber());

        var entrega = entregaRepository.findByIdCorridaUber(webhook.getIdCorridaUber())
                .orElseThrow(() -> new BusinessException("Entrega não encontrada para corrida Uber"));

        var novoStatus = webhook.mapearStatusEntrega();
        if (novoStatus != null && novoStatus != entrega.getStatusEntrega()) {
            entrega.setStatusEntrega(novoStatus);

            // Atualizar timestamps conforme status
            switch (novoStatus) {
                case EM_TRANSITO -> entrega.setDataHoraRetirada(OffsetDateTime.now());
                case ENTREGUE -> entrega.setDataHoraEntrega(OffsetDateTime.now());
            }

            entregaRepository.save(entrega);
            log.info("Status da entrega {} atualizado para: {}", entrega.getId(), novoStatus);
        }
    }

    /**
     * Busca entrega por pedido.
     */
    public EntregaResponseDTO buscarPorPedido(UUID pedidoId) {
        var entrega = entregaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada"));
        return mapearParaDTO(entrega);
    }

    /**
     * Lista entregas do lojista.
     */
    public List<EntregaResponseDTO> listarPorLojista(UUID lojistaId) {
        return entregaRepository.findByLojistaId(lojistaId).stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista entregas em andamento do lojista.
     */
    public List<EntregaResponseDTO> listarEmAndamentoPorLojista(UUID lojistaId) {
        return entregaRepository.findEntregasEmAndamentoByLojistaId(lojistaId).stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cancela entrega.
     */
    @Transactional
    public void cancelarEntrega(UUID entregaId) {
        var entrega = entregaRepository.findById(entregaId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada"));

        if (!entrega.podeCancelar()) {
            throw new BusinessException("Entrega não pode ser cancelada neste status");
        }

        if (entrega.getIdCorridaUber() != null) {
            uberFlashService.cancelarCorrida(entrega.getIdCorridaUber());
        }

        entrega.setStatusEntrega(StatusEntrega.CANCELADA);
        entregaRepository.save(entrega);
    }

    // Métodos auxiliares

    private String formatarEnderecoCompleto(com.win.marketplace.model.Pedido.Endereco endereco) {
        return String.format("%s, %s - %s, %s/%s - CEP: %s",
                endereco.getLogradouro(), endereco.getNumero(),
                endereco.getBairro(), endereco.getCidade(),
                endereco.getEstado(), endereco.getCep());
    }

    private String formatarEnderecoLojista(com.win.marketplace.model.Lojista lojista) {
        return String.format("%s, %s - %s, %s/%s - CEP: %s",
                lojista.getLogradouro(), lojista.getNumero(),
                lojista.getBairro(), lojista.getCidade(),
                lojista.getUf(), lojista.getCep());
    }

    private EntregaResponseDTO mapearParaDTO(Entrega entrega) {
        return EntregaResponseDTO.builder()
                .id(entrega.getId())
                .pedidoId(entrega.getPedido().getId())
                .tipoVeiculo(entrega.getTipoVeiculoSolicitado())
                .valorCorridaUber(entrega.getValorCorridaUber())
                .valorFreteCliente(entrega.getValorFreteCliente())
                .taxaWinmarket(entrega.getTaxaWinmarket())
                .statusEntrega(entrega.getStatusEntrega())
                .statusDescricao(entrega.getStatusEntrega().getDescricao())
                .nomeMotorista(entrega.getNomeMotorista())
                .placaVeiculo(entrega.getPlacaVeiculo())
                .contatoMotorista(entrega.getContatoMotorista())
                .codigoRetirada(entrega.getCodigoRetiradaUber())
                .codigoEntrega(entrega.getCodigoEntregaUber())
                .urlRastreamento(entrega.getUrlRastreamentoUber())
                .dataHoraSolicitacao(entrega.getDataHoraSolicitacao())
                .dataHoraRetirada(entrega.getDataHoraRetirada())
                .dataHoraEntrega(entrega.getDataHoraEntrega())
                .clienteNome(entrega.getClienteNome())
                .clienteTelefone(entrega.getClienteTelefone())
                .enderecoEntrega(entrega.getEnderecoEntrega())
                .observacoes(entrega.getObservacoes())
                .criadoEm(entrega.getCriadoEm())
                .atualizadoEm(entrega.getAtualizadoEm())
                .build();
    }
}
