package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de resposta para relatório financeiro do lojista
 */
public record RelatorioFinanceiroLojistaDTO(
    // Resumo geral
    BigDecimal receitaTotal,
    BigDecimal receitaMesAtual,
    BigDecimal receitaMesAnterior,
    BigDecimal ticketMedio,
    Integer totalPedidos,
    Integer pedidosPendentes,
    Integer pedidosCompletados,
    Integer pedidosCancelados,
    
    // Comissões e taxas
    BigDecimal comissaoPlataforma,
    BigDecimal taxasTransacao,
    BigDecimal receitaLiquida,
    
    // Saldo e Recebimentos
    BigDecimal saldoDisponivel,
    BigDecimal saldoPendente,
    BigDecimal totalRecebidoMesAtual,
    
    // Devoluções
    Integer totalDevolucoes,
    BigDecimal valorDevolucoes,
    
    // Período
    OffsetDateTime periodoInicio,
    OffsetDateTime periodoFim,
    
    // Detalhamento por período
    List<ReceitaPorPeriodoDTO> receitaPorDia,
    List<ReceitaPorPeriodoDTO> receitaPorMes,
    
    // Top produtos
    List<ProdutoVendasDTO> topProdutos,
    
    // Métodos de pagamento
    List<PagamentoPorMetodoDTO> pagamentosPorMetodo
) {}
