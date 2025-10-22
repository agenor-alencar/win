package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "motoristas")
public class Motorista {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    @Column(name = "cnh", length = 11, nullable = false, unique = true)
    private String cnh;

    @Column(name = "categoria_cnh", length = 2, nullable = false)
    private String categoriaCnh;

    @Column(name = "tipo_veiculo", length = 50, nullable = false)
    private String tipoVeiculo;

    @Column(name = "placa_veiculo", length = 7, nullable = false)
    private String placaVeiculo;

    @Column(name = "modelo_veiculo", length = 100, nullable = false)
    private String modeloVeiculo;

    @Column(name = "cor_veiculo", length = 30)
    private String corVeiculo;

    @Column(nullable = false)
    private Boolean disponivel = true;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    @UpdateTimestamp
    private OffsetDateTime dataAtualizacao;

    @OneToMany(mappedBy = "motorista", cascade = CascadeType.ALL)
    private List<Pedido> pedidos;

    @OneToMany(mappedBy = "motorista", cascade = CascadeType.ALL)
    private List<Avaliacao> avaliacoes;
}