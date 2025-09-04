package com.sistemawin.domain.entity;

import com.sistemawin.domain.enums.UserRole;
import com.sistemawin.domain.enums.UserStatus;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 50)
    private String role = "ADMIN";

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String permissions; // JSONB

    @Column(name = "last_activity")
    private Timestamp lastActivity;
}
