package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notas_fiscais")
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false)
    private Lojista lojista;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private StatusNotaFiscal status;

    @Column(name = "chave_acesso", length = 44, unique = true)
    private String chaveAcesso;

    @Column(name = "numero_nota", length = 50)
    private String numeroNota;

    @Column(name = "url_xml", columnDefinition = "TEXT")
    private String urlXml;

    @Column(name = "url_pdf", columnDefinition = "TEXT")
    private String urlPdf;

    @Column(name = "detalhes_erro", columnDefinition = "TEXT")
    private String detalhesErro;

    @Column(name = "emitida_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime emitidaEm;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    public enum StatusNotaFiscal {
        PENDENTE, PROCESSANDO, EMITIDA, ERRO, CANCELADA
    }
}