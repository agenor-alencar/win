package com.win.marketplace.service;

import com.win.marketplace.dto.response.AdminChartDataDTO;
import com.win.marketplace.model.Pedido;
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
            // Calcular data de início (7 meses atrás)
            OffsetDateTime dataInicio = OffsetDateTime.now().minusMonths(7).withDayOfMonth(1);
            
            // Gerar lista dos últimos 7 meses
            List<MesReferencia> ultimos7Meses = gerarUltimos7Meses();
            
            // === VENDAS POR MÊS - OTIMIZADO ===
            List<Object[]> vendasDoBanco = pedidoRepository.contarVendasPorMes(dataInicio, Pedido.StatusPedido.CANCELADO);
            Map<String, Long> vendasMap = new HashMap<>();
            
            // Mapear resultados do banco
            for (Object[] row : vendasDoBanco) {
                int ano = ((Number) row[0]).intValue();
                int mes = ((Number) row[1]).intValue();
                long quantidade = ((Number) row[2]).longValue();
                String chave = ano + "-" + mes;
                vendasMap.put(chave, quantidade);
            }
            
            // Criar lista com todos os meses (incluindo zeros)
            List<AdminChartDataDTO.VendaMensal> vendasMensais = ultimos7Meses.stream()
                    .map(mesRef -> {
                        String chave = mesRef.ano + "-" + mesRef.mes;
                        long quantidade = vendasMap.getOrDefault(chave, 0L);
                        
                        return AdminChartDataDTO.VendaMensal.builder()
                                .mes(mesRef.nomeAbreviado)
                                .quantidade(quantidade)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // === RECEITAS POR MÊS - OTIMIZADO ===
            List<Object[]> receitasDoBanco = pedidoRepository.somarReceitaPorMes(dataInicio, Pedido.StatusPedido.CANCELADO);
            Map<String, BigDecimal> receitasMap = new HashMap<>();
            
            // Mapear resultados do banco
            for (Object[] row : receitasDoBanco) {
                int ano = ((Number) row[0]).intValue();
                int mes = ((Number) row[1]).intValue();
                BigDecimal receita = (BigDecimal) row[2];
                String chave = ano + "-" + mes;
                receitasMap.put(chave, receita);
            }
            
            // Criar lista com todos os meses (incluindo zeros)
            List<AdminChartDataDTO.ReceitaMensal> receitasMensais = ultimos7Meses.stream()
                    .map(mesRef -> {
                        String chave = mesRef.ano + "-" + mesRef.mes;
                        BigDecimal receita = receitasMap.getOrDefault(chave, BigDecimal.ZERO);
                        
                        return AdminChartDataDTO.ReceitaMensal.builder()
                                .mes(mesRef.nomeAbreviado)
                                .valor(receita)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // === PRODUTOS POR CATEGORIA - OTIMIZADO ===
            List<Object[]> categoriasDoBanco = produtoRepository.contarProdutosPorCategoria();
            
            List<AdminChartDataDTO.ProdutoPorCategoria> categorias = categoriasDoBanco.stream()
                    .map(row -> AdminChartDataDTO.ProdutoPorCategoria.builder()
                            .nome((String) row[0])
                            .quantidade(((Number) row[1]).longValue())
                            .build())
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
