package com.win.marketplace.model;

import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.model.enums.TipoVeiculoUber;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que representa uma entrega terceirizada via Uber Flash.
 * 
 * Esta entidade registra todo o ciclo de vida da entrega, desde a simulação
 * do frete até a confirmação de entrega ao cliente final, incluindo:
 * - Valores (corrida Uber, frete cliente, taxa Win)
 * - Dados do motorista (nome, placa, contato)
 * - Códigos de confirmação (retirada e entrega)
 * - Status e timestamps de cada etapa
 * - Dados de auditoria (cliente, endereço)
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "entregas", indexes = {
    @Index(name = "idx_entrega_pedido_id", columnList = "pedido_id"),
    @Index(name = "idx_entrega_status", columnList = "status_entrega"),
    @Index(name = "idx_entrega_corrida_uber", columnList = "id_corrida_uber"),
    @Index(name = "idx_entrega_data_solicitacao", columnList = "data_hora_solicitacao")
})
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ========================================
    // Relacionamento com Pedido
    // ========================================
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    // ========================================
    // Tipo de Veículo e Valores
    // ========================================
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_veiculo_solicitado", nullable = false, length = 50)
    private TipoVeiculoUber tipoVeiculoSolicitado;

    @Column(name = "valor_corrida_uber", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorCorridaUber; // Valor bruto cobrado pela Uber

    @Column(name = "valor_frete_cliente", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorFreteCliente; // Valor total cobrado do cliente (com taxa 10%)

    @Column(name = "taxa_winmarket", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaWinmarket; // Margem de lucro do Win (10%)

    // ========================================
    // Status e Controle
    // ========================================
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status_entrega", nullable = false, length = 50)
    private StatusEntrega statusEntrega = StatusEntrega.AGUARDANDO_PREPARACAO;

    // ========================================
    // Dados do Motorista (preenchidos após aceite)
    // ========================================
    
    @Column(name = "nome_motorista", length = 255)
    private String nomeMotorista;

    @Column(name = "placa_veiculo", length = 20)
    private String placaVeiculo;

    @Column(name = "contato_motorista", length = 20)
    private String contatoMotorista;

    // ========================================
    // IDs e Códigos Uber
    // ========================================
    
    @Column(name = "id_corrida_uber", length = 255)
    private String idCorridaUber; // ID único retornado pela Uber

    @Column(name = "codigo_retirada_uber", length = 50)
    private String codigoRetiradaUber; // Lojista confirma ao motorista

    @Column(name = "codigo_entrega_uber", length = 50)
    private String codigoEntregaUber; // Motorista confirma ao cliente

    @Column(name = "url_rastreamento_uber", length = 500)
    private String urlRastreamentoUber; // Link de rastreamento em tempo real

    // ========================================
    // Quote ID e Valores (para garantir preço)
    // ========================================
    
    @Column(name = "quote_id_uber", length = 255)
    private String quoteIdUber; // ID da cotação retornado pela Uber
    
    @Column(name = "valor_original_cotado", precision = 10, scale = 2)
    private BigDecimal valorOriginalCotado; // Valor exato da cotação (antes do arredondamento)
    
    @Column(name = "valor_arredondado_cliente", precision = 10, scale = 2)
    private BigDecimal valorArredondadoCliente; // Valor arredondado mostrado ao cliente

    // ========================================
    // Geolocalização (Lat/Long)
    // ========================================
    
    @Column(name = "origem_latitude")
    private Double origemLatitude;
    
    @Column(name = "origem_longitude")
    private Double origemLongitude;
    
    @Column(name = "destino_latitude")
    private Double destinoLatitude;
    
    @Column(name = "destino_longitude")
    private Double destinoLongitude;

    // ========================================
    // Flag para Primeira Compra Grátis
    // ========================================
    
    @Column(name = "frete_gratis_primeira_compra", nullable = false)
    private Boolean freteGratisPrimeiraCompra = false; // Se true, WIN paga o frete (marketing)

    // ========================================
    // Timestamps das Etapas
    // ========================================
    
    @Column(name = "data_hora_solicitacao")
    private OffsetDateTime dataHoraSolicitacao; // Quando solicitou à Uber

    @Column(name = "data_hora_retirada")
    private OffsetDateTime dataHoraRetirada; // Quando motorista retirou

    @Column(name = "data_hora_entrega")
    private OffsetDateTime dataHoraEntrega; // Quando foi entregue

    // ========================================
    // Dados de Auditoria
    // ========================================
    
    @Column(name = "cliente_nome", nullable = false, length = 255)
    private String clienteNome;

    @Column(name = "cliente_telefone", nullable = false, length = 20)
    private String clienteTelefone;

    @Column(name = "endereco_entrega", nullable = false, columnDefinition = "TEXT")
    private String enderecoEntrega;

    // ========================================
    // Observações
    // ========================================
    
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // ========================================
    // Timestamps de Controle
    // ========================================
    
    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;

    // ========================================
    // Métodos Auxiliares
    // ========================================
    
    /**
     * Calcula o valor da taxa Win (10% do valor da corrida Uber).
     */
    public void calcularTaxaWinmarket() {
        if (this.valorCorridaUber != null) {
            this.taxaWinmarket = this.valorCorridaUber.multiply(BigDecimal.valueOf(0.10));
        }
    }
    
    /**
     * Calcula o valor total do frete cobrado do cliente (valor Uber + 10%).
     */
    public void calcularValorFreteCliente() {
        if (this.valorCorridaUber != null) {
            calcularTaxaWinmarket();
            this.valorFreteCliente = this.valorCorridaUber.add(this.taxaWinmarket);
        }
    }
    
    /**
     * Verifica se a entrega pode ser cancelada.
     */
    public boolean podeCancelar() {
        return !statusEntrega.isFinal();
    }
    
    /**
     * Verifica se a entrega está em andamento (motorista aceito).
     */
    public boolean estaEmAndamento() {
        return statusEntrega.isEmAndamento();
    }
}
