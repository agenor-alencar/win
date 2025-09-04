package com.sistemawin.domain.entity;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "merchants")
@PrimaryKeyJoinColumn(name = "id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Merchant extends User {

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(unique = true, nullable = false)
    private String cnpj;

    @Column(name = "cpf_owner", nullable = false)
    private String cpfOwner;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "approval_date")
    private Timestamp approvalDate;

    @Column(name = "commission_rate", columnDefinition = "DECIMAL(5,2)")
    private Double commissionRate = 5.00;

    @Column(name = "total_sales", columnDefinition = "DECIMAL(12,2)")
    private Double totalSales = 0.00;

    @Column(name = "rating", columnDefinition = "DECIMAL(3,2)")
    private Double rating = 0.00;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Type(JsonType.class)
    @Column(name = "operating_hours", columnDefinition = "jsonb")
    private String operatingHours; // JSONB

    @Column(name = "delivery_radius")
    private Integer deliveryRadius = 10; // em km

    @Column(name = "minimum_order", columnDefinition = "DECIMAL(8,2)")
    private Double minimumOrder = 0.00;
}
