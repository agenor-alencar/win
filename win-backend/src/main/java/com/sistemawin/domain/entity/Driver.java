package com.sistemawin.domain.entity;

import com.sistemawin.domain.enums.DriverStatus;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.locationtech.jts.geom.Point;

import java.util.UUID;

@Entity
@Table(name = "drivers")
@PrimaryKeyJoinColumn(name = "id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Driver extends User {

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String cpf;

    @Column(unique = true, nullable = false)
    private String cnh;

    @Column(name = "cnh_category", nullable = false)
    private String cnhCategory;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "vehicle_plate")
    private String vehiclePlate;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = false;

    @Column(name = "current_location", columnDefinition = "GEOMETRY(Point, 4326)")
    private Point currentLocation;

    @Column(columnDefinition = "DECIMAL(3,2)")
    private Double rating = 0.00;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;

    @Column(name = "total_earnings", columnDefinition = "DECIMAL(10,2)")
    private Double totalEarnings = 0.00;

    @Type(JsonType.class)
    @Column(name = "bank_account", columnDefinition = "jsonb")
    private String bankAccount; // JSONB
}
