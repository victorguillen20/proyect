package com.bank.msbanking.repository;

import com.bank.msbanking.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    @Query("SELECT c FROM Client c WHERE :search IS NULL " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR c.identification LIKE CONCAT('%', :search, '%') " +
           "OR LOWER(c.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR c.phone LIKE CONCAT('%', :search, '%') " +
           "OR CAST(c.age AS string) LIKE CONCAT('%', :search, '%') " +
           "OR (CASE WHEN c.status = true THEN 'true' ELSE 'false' END) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Client> searchClients(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Client c WHERE c.identification = :identification")
    java.util.Optional<Client> findByIdentification(@Param("identification") String identification);

    boolean existsByIdentification(String identification);
}

