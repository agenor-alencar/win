package com.win.marketplace.service;

import com.win.marketplace.dto.response.AdminChartDataDTO;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service para gerar dados de gráficos do dashboard administrativo
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminChartService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    /**
     * Busca dados consolidados para gráficos do dashboard
     * - Vendas por mês (últimos 7 meses)
     * - Receitas por mês (últimos 7 meses)
     * - Produtos por categoria (todas)
     */
    @Transactional(readOnly = true)
    public AdminChartDataDTO buscarDadosGraficos() {
        log.info("Buscando dados de gráficos para o dashboard administrativo");
        
        try {
            // Gerar lista dos últimos 7 meses
            List<MesReferencia> ultimos7Meses = gerarUltimos7Meses();
            
            // Buscar todos os pedidos
            List<Pedido> todosPedidos = pedidoRepository.findAll();
            
            // === VENDAS POR MÊS ===
            List<AdminChartDataDTO.VendaMensal> vendasMensais = ultimos7Meses.stream()
                    .map(mesRef -> {
                        long quantidade = todosPedidos.stream()
                                .filter(p -> p.getCriadoEm() != null)
                                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                                .filter(p -> isMesmoMes(p.getCriadoEm(), mesRef))
                                .count();
                        
                        return AdminChartDataDTO.VendaMensal.builder()
                                .mes(mesRef.nomeAbreviado)
                                .quantidade(quantidade)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // === RECEITAS POR MÊS ===
            List<AdminChartDataDTO.ReceitaMensal> receitasMensais = ultimos7Meses.stream()
                    .map(mesRef -> {
                        BigDecimal receita = todosPedidos.stream()
                                .filter(p -> p.getCriadoEm() != null)
                                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                                .filter(p -> isMesmoMes(p.getCriadoEm(), mesRef))
                                .map(Pedido::getTotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        
                        return AdminChartDataDTO.ReceitaMensal.builder()
                                .mes(mesRef.nomeAbreviado)
                                .valor(receita)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // === PRODUTOS POR CATEGORIA ===
            List<Produto> todosProdutos = produtoRepository.findAll();
            
            Map<String, Long> produtosPorCategoria = todosProdutos.stream()
                    .collect(Collectors.groupingBy(
                            p -> p.getCategoria() != null ? p.getCategoria().getNome() : "Sem Categoria",
                            Collectors.counting()
                    ));
            
            List<AdminChartDataDTO.ProdutoPorCategoria> categorias = produtosPorCategoria.entrySet().stream()
                    .map(entry -> AdminChartDataDTO.ProdutoPorCategoria.builder()
                            .nome(entry.getKey())
                            .quantidade(entry.getValue())
                            .build())
                    .sorted(Comparator.comparing(AdminChartDataDTO.ProdutoPorCategoria::getQuantidade).reversed())
                    .collect(Collectors.toList());
            
            AdminChartDataDTO chartData = AdminChartDataDTO.builder()
                    .vendas(vendasMensais)
                    .receitas(receitasMensais)
                    .categorias(categorias)
                    .build();
            
            log.info("Dados de gráficos carregados: {} meses de vendas, {} categorias", 
                    vendasMensais.size(), categorias.size());
            
            return chartData;
            
        } catch (Exception e) {
            log.error("Erro ao buscar dados de gráficos", e);
            // Retornar dados vazios em caso de erro
            return AdminChartDataDTO.builder()
                    .vendas(Collections.emptyList())
                    .receitas(Collections.emptyList())
                    .categorias(Collections.emptyList())
                    .build();
        }
    }

    /**
     * Gera lista com os últimos 7 meses em ordem cronológica
     */
    private List<MesReferencia> gerarUltimos7Meses() {
        List<MesReferencia> meses = new ArrayList<>();
        LocalDate hoje = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate data = hoje.minusMonths(i);
            meses.add(new MesReferencia(
                    data.getMonthValue(),
                    data.getYear(),
                    data.getMonth().getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
            ));
        }
        
        return meses;
    }

    /**
     * Verifica se uma data pertence ao mesmo mês de referência
     */
    private boolean isMesmoMes(OffsetDateTime data, MesReferencia mesRef) {
        return data.getMonthValue() == mesRef.mes && data.getYear() == mesRef.ano;
    }

    /**
     * Classe auxiliar para representar um mês de referência
     */
    private static class MesReferencia {
        final int mes;
        final int ano;
        final String nomeAbreviado;

        MesReferencia(int mes, int ano, String nomeAbreviado) {
            this.mes = mes;
            this.ano = ano;
            this.nomeAbreviado = nomeAbreviado;
        }
    }
}
