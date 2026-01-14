package com.bank.msbanking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@ToString
@Entity
@Table(name = "movement")
@NoArgsConstructor
@AllArgsConstructor
public class Movement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movement_id")
    private Long movementId;

    @NotNull
    private LocalDateTime date;

    @NotNull
    private String movementType; // Retiro / Deposito

    @NotNull
    private BigDecimal value;

    @Column(name = "movement_detail")
    private String movementDetail; // New Field

    @NotNull
    private BigDecimal balance; // Snapshot balance

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_number")
    @ToString.Exclude
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Account account;
}
