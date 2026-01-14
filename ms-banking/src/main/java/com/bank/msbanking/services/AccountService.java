package com.bank.msbanking.services;

import com.bank.msbanking.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AccountService {
    Account createAccount(Account account);
    Account updateAccount(Long id, Account account);
    void deleteAccount(Long id);
    Account getAccountById(Long id);
    Page<Account> getAllAccounts(String search, Pageable pageable);
}
