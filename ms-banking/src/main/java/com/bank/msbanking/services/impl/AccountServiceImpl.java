package com.bank.msbanking.services.impl;

import com.bank.msbanking.entity.Account;
import com.bank.msbanking.services.AccountService;
import com.bank.msbanking.repository.ClientRepository;
import com.bank.msbanking.repository.AccountRepository;
import com.bank.msbanking.util.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;

    @Override
    public Account createAccount(Account account) {
        if (account.getAccountNumber() != null && accountRepository.existsById(account.getAccountNumber())) {
            throw new IllegalArgumentException("Ya existe una cuenta con el número " + account.getAccountNumber());        
        }
        
        Account newAccount = new Account();
        newAccount.setAccountNumber(account.getAccountNumber());
        newAccount.setAccountType(account.getAccountType());
        newAccount.setInitialBalance(account.getInitialBalance());
        newAccount.setStatus(account.getStatus());

        if (account.getClient() != null && account.getClient().getIdentification() != null) {
            String identification = account.getClient().getIdentification();
            com.bank.msbanking.entity.Client client = clientRepository.findByIdentification(identification)
                .orElseThrow(() -> new ResourceNotFoundException("Client with identification " + identification + " not found"));
            newAccount.setClient(client);
        } else if (account.getClient() == null || (account.getClient().getClientId() == null && account.getClient().getIdentification() == null)) {
             throw new IllegalArgumentException("Client Identification is required");
        }
        
        return accountRepository.save(newAccount);
    }


    @Override
    public Account updateAccount(Long id, Account account) {
        return accountRepository.findById(id).map(existing -> {
            existing.setAccountType(account.getAccountType());
            existing.setInitialBalance(account.getInitialBalance());
            existing.setStatus(account.getStatus());
            return accountRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Account not found");
        }
        accountRepository.deleteById(id);
    }

    @Override
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public Page<Account> getAllAccounts(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return accountRepository.findAll(pageable);
        }
        return accountRepository.searchAccounts(search, pageable);
    }
}
