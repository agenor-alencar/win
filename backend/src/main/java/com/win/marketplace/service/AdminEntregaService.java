package com.win.marketplace.service;

import com.win.marketplace.dto.response.AdminEntregaListDTO;
import com.win.marketplace.dto.response.AdminEntregaStatsDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.repository.EntregaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminEntregaService {

    private final EntregaRepository entregaRepository;

    /**
     * Busca estatísticas consolidadas de entregas para o dashboard administrativo
     */
    @Transactional(readOnly = true)
    public AdminEntregaStatsDTO buscarEstatisticasEntregas() {
        log.info("Buscando estatísticas administrativas de entregas");
        
        try {
            Long totalEntregas = entregaRepository.count();
            
            // Contar por status
            Long aguardandoPreparacao = entregaRepository.findByStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO).size() * 1L;
            Long aguardandoMotorista = entregaRepository.findByStatusEntrega(StatusEntrega.AGUARDANDO_MOTORISTA).size() * 1L;
            Long motoristaACaminho = entregaRepository.findByStatusEntrega(StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA).size() * 1L;
            Long emTransito = entregaRepository.findByStatusEntrega(StatusEntrega.EM_TRANSITO).size() * 1L;
            Long entregues = entregaRepository.findByStatusEntrega(StatusEntrega.ENTREGUE).size() * 1L;
            Long canceladas = entregaRepository.findByStatusEntrega(StatusEntrega.CANCELADA).size() * 1L;
            Long falhasSolicitacao = entregaRepository.findByStatusEntrega(StatusEntrega.FALHA_SOLICITACAO).size() * 1L;
            
            AdminEntregaStatsDTO stats = AdminEntregaStatsDTO.criar(
                totalEntregas,
                aguardandoPreparacao,
                aguardandoMotorista,
                motoristaACaminho,
                emTransito,
                entregues,
                canceladas,
                falhasSolicitacao
            );
            
            log.info("Estatísticas de entregas carregadas: {} total, {} entregues", totalEntregas, entregues);
            
            return stats;
            
        } catch (Exception e) {
            log.error("Erro ao buscar estatísticas de entregas", e);
            return AdminEntregaStatsDTO.criar(0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L);
        }
    }

    /**
     * Lista todas as entregas com informações detalhadas para administração
     */
    @Transactional(readOnly = true)
    public List<AdminEntregaListDTO> listarTodasEntregas() {
        log.info("Listando todas as entregas para administração");
        
        return entregaRepository.findAll().stream()
                .map(this::mapearParaAdminListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista entregas filtradas por status
     */
    @Transactional(readOnly = true)
    public List<AdminEntregaListDTO> listarEntregasPorStatus(StatusEntrega status) {
        log.info("Listando entregas com status: {}", status);
        
        return entregaRepository.findByStatusEntrega(status).stream()
                .map(this::mapearParaAdminListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista entregas com problemas (falhas ou aguardando muito tempo)
     */
    @Transactional(readOnly = true)
    public List<AdminEntregaListDTO> listarEntregasComProblemas() {
        log.info("Listando entregas com problemas");
        
        List<Entrega> entregas = entregaRepository.findAll();
        
        return entregas.stream()
                .filter(this::temProblema)
                .map(this::mapearParaAdminListDTO)
                .collect(Collectors.toList());
    }

    // Métodos auxiliares

    private AdminEntregaListDTO mapearParaAdminListDTO(Entrega entrega) {
        var pedido = entrega.getPedido();
        var lojista = pedido.getItens().isEmpty() ? null : pedido.getItens().get(0).getLojista();
        
        return AdminEntregaListDTO.builder()
                .id(entrega.getId())
                .pedidoId(pedido.getId())
                .numeroPedido(pedido.getNumeroPedido())
                .nomeMotorista(entrega.getNomeMotorista())
                .placaVeiculo(entrega.getPlacaVeiculo())
                .contatoMotorista(entrega.getContatoMotorista())
                .clienteNome(entrega.getClienteNome())
                .clienteTelefone(entrega.getClienteTelefone())
                .lojistaFantasia(lojista != null ? lojista.getNomeFantasia() : "N/A")
                .enderecoEntrega(entrega.getEnderecoEntrega())
                .status(entrega.getStatusEntrega())
                .statusDescricao(entrega.getStatusEntrega().getDescricao())
                .tipoVeiculo(entrega.getTipoVeiculoSolicitado())
                .valorFreteCliente(entrega.getValorFreteCliente())
                .tempoEstimado(calcularTempoEstimado(entrega))
                .distanciaEstimada(calcularDistanciaEstimada(entrega))
                .dataHoraSolicitacao(entrega.getDataHoraSolicitacao())
                .dataHoraRetirada(entrega.getDataHoraRetirada())
                .dataHoraEntrega(entrega.getDataHoraEntrega())
                .urlRastreamento(entrega.getUrlRastreamentoUber())
                .codigoRetirada(entrega.getCodigoRetiradaUber())
                .codigoEntrega(entrega.getCodigoEntregaUber())
                .observacoes(entrega.getObservacoes())
                .build();
    }

    private boolean temProblema(Entrega entrega) {
        // Verifica se tem falha na solicitação
        if (entrega.getStatusEntrega() == StatusEntrega.FALHA_SOLICITACAO) {
            return true;
        }
        
        // Verifica se está aguardando motorista há muito tempo (> 30 minutos)
        if (entrega.getStatusEntrega() == StatusEntrega.AGUARDANDO_MOTORISTA 
            && entrega.getDataHoraSolicitacao() != null) {
            long minutosEsperando = Duration.between(
                entrega.getDataHoraSolicitacao(), 
                OffsetDateTime.now()
            ).toMinutes();
            return minutosEsperando > 30;
        }
        
        return false;
    }

    private String calcularTempoEstimado(Entrega entrega) {
        if (entrega.getStatusEntrega() == StatusEntrega.ENTREGUE) {
            return "Concluído";
        }
        
        if (entrega.getStatusEntrega() == StatusEntrega.AGUARDANDO_PREPARACAO) {
            return "Aguardando";
        }
        
        if (entrega.getDataHoraSolicitacao() != null) {
            long minutosDecorridos = Duration.between(
                entrega.getDataHoraSolicitacao(), 
                OffsetDateTime.now()
            ).toMinutes();
            return minutosDecorridos + " min";
        }
        
        return "N/A";
    }

    private String calcularDistanciaEstimada(Entrega entrega) {
        // Estimativa genérica - em produção virá da API da Uber
        return "5.0"; // km
    }
}
