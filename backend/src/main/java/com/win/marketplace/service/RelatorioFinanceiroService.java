package com.win.marketplace.service;

import com.win.marketplace.dto.response.*;
import com.win.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RelatorioFinanceiroService {

    private final PedidoRepository pedidoRepository;
    private final DevolucaoRepository devolucaoRepository;
    private final PagamentoRepository pagamentoRepository;

    /**
     * Gera relatório financeiro completo para um lojista
     */
    public RelatorioFinanceiroLojistaDTO gerarRelatorioLojista(UUID lojistaId, OffsetDateTime dataInicio, OffsetDateTime dataFim) {
        log.info("Gerando relatório financeiro para lojista: {} - Período: {} a {}", lojistaId, dataInicio, dataFim);

        // Buscar pedidos do período
        List<Object[]> pedidosData = pedidoRepository.findPedidosFinanceirosPorLojista(lojistaId, dataInicio, dataFim);
        
        // Calcular métricas
        BigDecimal receitaTotal = BigDecimal.ZERO;
        Integer totalPedidos = 0;
        Integer pedidosPendentes = 0;
        Integer pedidosCompletados = 0;
        Integer pedidosCancelados = 0;
        
        for (Object[] row : pedidosData) {
            BigDecimal valor = (BigDecimal) row[0];
            String status = (String) row[1];
            
            receitaTotal = receitaTotal.add(valor);
            totalPedidos++;
            
            switch (status) {
                case "PENDENTE":
                case "PROCESSANDO":
                case "EM_SEPARACAO":
                    pedidosPendentes++;
                    break;
                case "ENTREGUE":
                case "FINALIZADO":
                    pedidosCompletados++;
                    break;
                case "CANCELADO":
                    pedidosCancelados++;
                    break;
            }
        }

        // Calcular ticket médio
        BigDecimal ticketMedio = totalPedidos > 0 
            ? receitaTotal.divide(BigDecimal.valueOf(totalPedidos), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Calcular comissão (exemplo: 10%)
        BigDecimal comissaoPlataforma = receitaTotal.multiply(new BigDecimal("0.10"));
        
        // Calcular taxas de transação (exemplo: 3%)
        BigDecimal taxasTransacao = receitaTotal.multiply(new BigDecimal("0.03"));
        
        // Calcular receita líquida
        BigDecimal receitaLiquida = receitaTotal.subtract(comissaoPlataforma).subtract(taxasTransacao);

        // Buscar devoluções
        List<Object[]> devolucoesData = devolucaoRepository.findDevolucoesPorLojista(lojistaId, dataInicio, dataFim);
        Integer totalDevolucoes = devolucoesData.size();
        BigDecimal valorDevolucoes = devolucoesData.stream()
            .map(row -> (BigDecimal) row[0])
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Receita do mês atual e anterior (últimos 30 e 60 dias)
        OffsetDateTime mesAtualInicio = OffsetDateTime.now().minusDays(30);
        OffsetDateTime mesAnteriorInicio = OffsetDateTime.now().minusDays(60);
        
        BigDecimal receitaMesAtual = calcularReceitaPorPeriodo(lojistaId, mesAtualInicio, OffsetDateTime.now());
        BigDecimal receitaMesAnterior = calcularReceitaPorPeriodo(lojistaId, mesAnteriorInicio, mesAtualInicio);

        // Receita por dia
        List<ReceitaPorPeriodoDTO> receitaPorDia = calcularReceitaPorDia(lojistaId, dataInicio, dataFim);
        
        // Receita por mês
        List<ReceitaPorPeriodoDTO> receitaPorMes = calcularReceitaPorMes(lojistaId, dataInicio, dataFim);
        
        // Top produtos
        List<ProdutoVendasDTO> topProdutos = buscarTopProdutos(lojistaId, dataInicio, dataFim);
        
        // Pagamentos por método
        List<PagamentoPorMetodoDTO> pagamentosPorMetodo = buscarPagamentosPorMetodo(lojistaId, dataInicio, dataFim);

        return new RelatorioFinanceiroLojistaDTO(
            receitaTotal,
            receitaMesAtual,
            receitaMesAnterior,
            ticketMedio,
            totalPedidos,
            pedidosPendentes,
            pedidosCompletados,
            pedidosCancelados,
            comissaoPlataforma,
            taxasTransacao,
            receitaLiquida,
            totalDevolucoes,
            valorDevolucoes,
            dataInicio,
            dataFim,
            receitaPorDia,
            receitaPorMes,
            topProdutos,
            pagamentosPorMetodo
        );
    }

    private BigDecimal calcularReceitaPorPeriodo(UUID lojistaId, OffsetDateTime inicio, OffsetDateTime fim) {
        List<Object[]> result = pedidoRepository.findPedidosFinanceirosPorLojista(lojistaId, inicio, fim);
        return result.stream()
            .map(row -> (BigDecimal) row[0])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReceitaPorPeriodoDTO> calcularReceitaPorDia(UUID lojistaId, OffsetDateTime inicio, OffsetDateTime fim) {
        List<Object[]> result = pedidoRepository.findReceitaPorDia(lojistaId, inicio, fim);
        return result.stream()
            .map(row -> new ReceitaPorPeriodoDTO(
                ((java.sql.Date) row[0]).toLocalDate(),
                (BigDecimal) row[1],
                ((Long) row[2]).intValue()
            ))
            .collect(Collectors.toList());
    }

    private List<ReceitaPorPeriodoDTO> calcularReceitaPorMes(UUID lojistaId, OffsetDateTime inicio, OffsetDateTime fim) {
        List<Object[]> result = pedidoRepository.findReceitaPorMes(lojistaId, inicio, fim);
        return result.stream()
            .map(row -> new ReceitaPorPeriodoDTO(
                LocalDate.of(((Integer) row[0]), ((Integer) row[1]), 1),
                (BigDecimal) row[2],
                ((Long) row[3]).intValue()
            ))
            .collect(Collectors.toList());
    }

    private List<ProdutoVendasDTO> buscarTopProdutos(UUID lojistaId, OffsetDateTime inicio, OffsetDateTime fim) {
        List<Object[]> result = pedidoRepository.findTopProdutosPorLojista(lojistaId, inicio, fim);
        return result.stream()
            .limit(10)
            .map(row -> new ProdutoVendasDTO(
                (UUID) row[0],
                (String) row[1],
                ((Long) row[2]).intValue(),
                (BigDecimal) row[3],
                (BigDecimal) row[4]
            ))
            .collect(Collectors.toList());
    }

    private List<PagamentoPorMetodoDTO> buscarPagamentosPorMetodo(UUID lojistaId, OffsetDateTime inicio, OffsetDateTime fim) {
        List<Object[]> result = pagamentoRepository.findPagamentosPorMetodo(lojistaId, inicio, fim);
        
        BigDecimal totalGeral = result.stream()
            .map(row -> (BigDecimal) row[2])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return result.stream()
            .map(row -> {
                BigDecimal valor = (BigDecimal) row[2];
                BigDecimal percentual = totalGeral.compareTo(BigDecimal.ZERO) > 0
                    ? valor.divide(totalGeral, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;
                
                return new PagamentoPorMetodoDTO(
                    (String) row[0],
                    ((Long) row[1]).intValue(),
                    valor,
                    percentual
                );
            })
            .collect(Collectors.toList());
    }
}
