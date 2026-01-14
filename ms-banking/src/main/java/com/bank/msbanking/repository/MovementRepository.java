package com.bank.msbanking.repository;

import com.bank.msbanking.entity.Movement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovementRepository extends JpaRepository<Movement, Long> {
    
    @Query("SELECT SUM(m.value) FROM Movement m WHERE m.account.accountNumber = :accountNumber AND m.value < 0 AND m.date BETWEEN :startDate AND :endDate")
    BigDecimal sumDebitsForAccountSince(@Param("accountNumber") Long accountNumber, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT m FROM Movement m WHERE :search IS NULL " +
           "OR CAST(m.movementId AS string) LIKE CONCAT('%', :search, '%') " +
           "OR CAST(m.account.accountNumber AS string) LIKE CONCAT('%', :search, '%') " +
           "OR LOWER(m.movementType) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.account.accountType) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.movementDetail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR CAST(m.value AS string) LIKE CONCAT('%', :search, '%') " +
           "OR CAST(m.balance AS string) LIKE CONCAT('%', :search, '%') " +
           "OR CAST((m.balance - m.value) AS string) LIKE CONCAT('%', :search, '%') " +
           "OR (CASE WHEN m.account.status = true THEN 'true' ELSE 'false' END) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.account.client.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR CAST(m.date AS string) LIKE CONCAT('%', :search, '%') " +
           "OR FUNCTION('TO_CHAR', m.date, 'DD/MM/YYYY') LIKE CONCAT('%', :search, '%') " +
           "OR FUNCTION('TO_CHAR', m.date, 'FMDD/FMMM/YYYY') LIKE CONCAT('%', :search, '%')")
    Page<Movement> searchMovements(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM Movement m WHERE m.date BETWEEN :startDate AND :endDate AND (:clientId IS NULL OR m.account.client.identification = :clientId)")
    List<Movement> getReport(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("clientId") String clientId);
}
