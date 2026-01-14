package com.bank.msbanking.repository;

import com.bank.msbanking.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    @Query("SELECT a FROM Account a WHERE :search IS NULL " +
           "OR CAST(a.accountNumber AS string) LIKE CONCAT('%', :search, '%') " +
           "OR LOWER(a.accountType) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR CAST(a.initialBalance AS string) LIKE CONCAT('%', :search, '%') " +
           "OR (CASE WHEN a.status = true THEN 'true' ELSE 'false' END) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.client.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Account> searchAccounts(@Param("search") String search, Pageable pageable);
}
