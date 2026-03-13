package com.win.marketplace.service;

import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.request.UberWebhookDTO;
import com.win.marketplace.dto.response.DeliveryStatusResponseDTO;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    @SuppressWarnings("unused")
    private final PedidoRepository pedidoRepository;
    private final UberFlashService uberFlashService;

    /**
     * Cria registro inicial de entrega após simulação de frete.
     * Salva Quote ID e valores para uso posterior.
     * 
     * @param pedido Pedido associado à entrega
     * @param simulacao Simulação do frete (sempre executada, mesmo em primeira compra)
     * @param isPrimeiraCompra Se true, WIN paga o frete (cliente não é cobrado)
     */
    @Transactional
    public Entrega criarEntregaInicial(Pedido pedido, SimulacaoFreteResponseDTO simulacao, boolean isPrimeiraCompra) {
        log.info("Criando registro inicial de entrega para pedido: {} (Primeira Compra: {})", 
                pedido.getId(), isPrimeiraCompra);

        var entrega = new Entrega();
        entrega.setPedido(pedido);
        entrega.setTipoVeiculoSolicitado(simulacao.getTipoVeiculo());
        entrega.setValorCorridaUber(simulacao.getValorCorridaUber());
        entrega.setTaxaWinmarket(simulacao.getTaxaWinmarket());
        
        // ✅ Se for primeira compra, cliente paga R$ 0, mas valor real fica registrado
        entrega.setValorFreteCliente(isPrimeiraCompra ? BigDecimal.ZERO : simulacao.getValorFreteTotal());
        entrega.setFreteGratisPrimeiraCompra(isPrimeiraCompra);
        
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);

        // ✅ SALVAR QUOTE ID (essencial para solicitar com preço garantido)
        entrega.setQuoteIdUber(simulacao.getQuoteId());
        entrega.setValorOriginalCotado(simulacao.getValorOriginalCotado());
        entrega.setValorArredondadoCliente(simulacao.getValorFreteTotal());

        // Dados do cliente para auditoria
        entrega.setClienteNome(pedido.getUsuario().getNome());
        entrega.setClienteTelefone(pedido.getUsuario().getTelefone());
        entrega.setEnderecoEntrega(formatarEnderecoCompleto(pedido.getEnderecoEntrega()));

        log.debug("Entrega criada com Quote ID: {}, Valor Original: {}, Valor Cliente: {}", 
                simulacao.getQuoteId(), simulacao.getValorOriginalCotado(), simulacao.getValorFreteTotal());

        return entregaRepository.save(entrega);
    }

    /**
     * Solicita corrida Uber quando pedido estiver PRONTO PARA RETIRADA.
     * 
     * ⚠️ IMPORTANTE: Só deve ser chamado quando lojista marcar como "Pronto para Retirada"
     * Se solicitar muito cedo (logo após pagamento), motorista chega antes do produto estar pronto.
     */
    @Transactional
    public SolicitacaoCorridaUberResponseDTO solicitarCorridaUber(UUID pedidoId) {
        log.info("Solicitando corrida Uber para pedido: {}", pedidoId);

        var entrega = entregaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada para o pedido"));

        // ✅ VALIDAÇÃO: Só permitir se status correto
        if (entrega.getStatusEntrega() != StatusEntrega.AGUARDANDO_PREPARACAO) {
            throw new BusinessException(
                    "Entrega não está aguardando preparação. Status atual: " + 
                    entrega.getStatusEntrega());
        }

        var pedido = entrega.getPedido();
        var lojista = pedido.getLojista();

        // ✅ VALIDAÇÃO DE DADOS COMPLETOS
        validarDadosCompletosParaSolicitacao(entrega, pedido, lojista);

        // Montar request para Uber
        var request = com.win.marketplace.dto.request.SolicitacaoCorridaUberRequestDTO.builder()
                .pedidoId(pedidoId)
                .quoteId(entrega.getQuoteIdUber()) // ✅ PASSAR QUOTE ID
                .tipoVeiculo(entrega.getTipoVeiculoSolicitado())
                .enderecoOrigemCompleto(formatarEnderecoLojista(lojista))
                .nomeLojista(lojista.getNomeFantasia())
                .telefoneLojista(lojista.getTelefone())
                .instrucoesRetirada(montarInstrucoesRetirada(pedido))
                .enderecoDestinoCompleto(entrega.getEnderecoEntrega())
                .nomeCliente(entrega.getClienteNome())
                .telefoneCliente(entrega.getClienteTelefone())
                .valorCorridaUber(entrega.getValorCorridaUber())
                .observacoes("Código de retirada do pedido: " + pedido.getCodigoEntrega())
                // Lat/Long se disponíveis
                .origemLatitude(entrega.getOrigemLatitude())
                .origemLongitude(entrega.getOrigemLongitude())
                .destinoLatitude(entrega.getDestinoLatitude())
                .destinoLongitude(entrega.getDestinoLongitude())
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
            
            log.info("Corrida Uber solicitada com sucesso - ID: {}, Motorista: {}", 
                    response.getIdCorridaUber(), response.getNomeMotorista());
        } else {
            entrega.setStatusEntrega(StatusEntrega.FALHA_SOLICITACAO);
            entrega.setObservacoes("Erro: " + response.getErro());
            entregaRepository.save(entrega);
        }

        return response;
    }

    private String montarInstrucoesRetirada(Pedido pedido) {
        if (pedido.getCodigoEntrega() == null || pedido.getCodigoEntrega().isBlank()) {
            return "Coleta no balcão da loja.";
        }

        return "Coleta no balcão da loja. Código de retirada: " + pedido.getCodigoEntrega();
    }

    /**
     * Alias/wrapper para solicitarCorridaUber - facilita a integração.
     * Útil para chamadas automáticas no fluxo de pedido.
     */
    @Transactional
    public void solicitarEntrega(UUID pedidoId) {
        solicitarCorridaUber(pedidoId);
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
                default -> {
                    // Outros status não requerem atualização de timestamp
                }
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
     * Consulta status em tempo real da entrega na API Uber.
     * Retorna informações atualizadas sobre motorista, localização, ETAs, etc.
     * 
     * ✅ Permite rastreamento em tempo real
     * ✅ Dados sempre atualizados (não usa cache)
     * ✅ Informações de geolocalização do motorista
     * 
     * @param entregaId ID da entrega no sistema WIN
     * @return Status atualizado com dados em tempo real da Uber
     * @throws BusinessException se entrega não encontrada ou sem ID Uber
     */
    @Transactional
    public DeliveryStatusResponseDTO consultarStatusEmTempoReal(UUID entregaId) {
        log.info("Consultando status em tempo real da entrega: {}", entregaId);
        
        var entrega = entregaRepository.findById(entregaId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada"));
        
        if (entrega.getIdCorridaUber() == null) {
            throw new BusinessException("Entrega ainda não foi solicitada na Uber");
        }
        
        // Consultar status atualizado na Uber
        DeliveryStatusResponseDTO status = uberFlashService.consultarStatusEntrega(
                entrega.getIdCorridaUber());
        
        // Atualizar dados no banco de dados se houver mudanças
        if (status != null && status.getStatus() != null) {
            StatusEntrega novoStatus = mapearStatusUberParaWIN(status.getStatus());
            if (novoStatus != null && novoStatus != entrega.getStatusEntrega()) {
                log.info("Atualizando status da entrega {} de {} para {}", 
                        entrega.getId(), entrega.getStatusEntrega(), novoStatus);
                entrega.setStatusEntrega(novoStatus);
                
                // Atualizar dados do motorista se disponíveis
                if (status.getCourier() != null) {
                    if (status.getCourier().getName() != null) {
                        entrega.setNomeMotorista(status.getCourier().getName());
                    }
                    if (status.getCourier().getPhoneNumber() != null) {
                        entrega.setContatoMotorista(status.getCourier().getPhoneNumber());
                    }
                    if (status.getCourier().getVehicle() != null && 
                            status.getCourier().getVehicle().getLicensePlate() != null) {
                        entrega.setPlacaVeiculo(status.getCourier().getVehicle().getLicensePlate());
                    }
                }
                
                // Marcar datas importantes
                if (novoStatus == StatusEntrega.ENTREGUE && entrega.getDataHoraEntrega() == null) {
                    entrega.setDataHoraEntrega(OffsetDateTime.now());
                }
                if (novoStatus == StatusEntrega.EM_TRANSITO && entrega.getDataHoraRetirada() == null) {
                    entrega.setDataHoraRetirada(OffsetDateTime.now());
                }
                
                entregaRepository.save(entrega);
            }
        }
        
        return status;
    }
    
    /**
     * Mapeia status da Uber para status WIN
     */
    private StatusEntrega mapearStatusUberParaWIN(String statusUber) {
        if (statusUber == null) return null;
        
        return switch (statusUber.toLowerCase()) {
            case "pending" -> StatusEntrega.AGUARDANDO_MOTORISTA;
            case "pickup" -> StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA;
            case "pickup_complete" -> StatusEntrega.EM_TRANSITO;
            case "dropoff" -> StatusEntrega.EM_TRANSITO;
            case "delivered" -> StatusEntrega.ENTREGUE;
            case "cancelled" -> StatusEntrega.CANCELADA;
            default -> null;
        };
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

    /**
     * Valida se todos os dados necessários estão disponíveis para solicitar corrida Uber.
     * 
     * A Uber exige:
     * - Endereço completo de origem (lojista) com lat/long (opcional mas recomendado)
     * - Telefone do lojista (formato internacional +55...)
     * - Endereço completo de destino (cliente) com lat/long (opcional)
     * - Telefone do cliente (formato internacional)
     * - Quote ID (para garantir preço)
     * 
     * @throws BusinessException se algum dado obrigatório estiver faltando
     */
    private void validarDadosCompletosParaSolicitacao(
            Entrega entrega, 
            com.win.marketplace.model.Pedido pedido, 
            com.win.marketplace.model.Lojista lojista) {
        
        List<String> erros = new ArrayList<>();
        
        // Validar Quote ID
        if (entrega.getQuoteIdUber() == null || entrega.getQuoteIdUber().isEmpty()) {
            erros.add("Quote ID da Uber não encontrado. Refaça a simulação de frete.");
        }
        
        // Validar dados do lojista
        if (lojista.getTelefone() == null || lojista.getTelefone().isEmpty()) {
            erros.add("Telefone do lojista não cadastrado");
        }
        if (lojista.getLogradouro() == null || lojista.getCep() == null) {
            erros.add("Endereço completo do lojista não cadastrado");
        }
        
        // Validar dados do cliente
        if (entrega.getClienteTelefone() == null || entrega.getClienteTelefone().isEmpty()) {
            erros.add("Telefone do cliente não informado");
        }
        if (entrega.getEnderecoEntrega() == null || entrega.getEnderecoEntrega().isEmpty()) {
            erros.add("Endereço de entrega não informado");
        }
        
        // Avisar se lat/long não estão disponíveis (não é crítico, mas ajuda)
        if (entrega.getOrigemLatitude() == null || entrega.getOrigemLongitude() == null) {
            log.warn("Latitude/Longitude de origem não disponíveis. Uber usará geocoding do endereço.");
        }
        if (entrega.getDestinoLatitude() == null || entrega.getDestinoLongitude() == null) {
            log.warn("Latitude/Longitude de destino não disponíveis. Uber usará geocoding do endereço.");
        }
        
        if (!erros.isEmpty()) {
            String mensagemErro = "Dados incompletos para solicitar entrega Uber:\n- " + 
                    String.join("\n- ", erros);
            log.error("Validação falhou: {}", mensagemErro);
            throw new BusinessException(mensagemErro);
        }
        
        log.debug("Validação de dados completos OK - Quote ID: {}, Telefones: OK, Endereços: OK", 
                entrega.getQuoteIdUber());
    }

    private String formatarEnderecoCompleto(com.win.marketplace.model.Pedido.Endereco endereco) {
        return String.format("%s, %s - %s, %s/%s - CEP: %s",
                endereco.getLogradouro(), endereco.getNumero(),
                endereco.getBairro(), endereco.getCidade(),
                endereco.getUf(), endereco.getCep());
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
