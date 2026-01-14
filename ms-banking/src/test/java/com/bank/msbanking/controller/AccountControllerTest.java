package com.bank.msbanking.controller;

import com.bank.msbanking.entity.Account;
import com.bank.msbanking.services.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
public class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllAccounts_ShouldReturnList() throws Exception {
        Account account = new Account();
        account.setAccountNumber(123456L);
        account.setAccountType("Ahorros");
        List<Account> accounts = new ArrayList<>();
        accounts.add(account);
        Page<Account> accountPage = new PageImpl<>(accounts, PageRequest.of(0, 10), 1);

        // Use ArgumentMatchers.any() to be explicit
        given(accountService.getAllAccounts(ArgumentMatchers.any(), ArgumentMatchers.any(Pageable.class)))
                .willReturn(accountPage);

        mockMvc.perform(get("/cuentas")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].accountType").value("Ahorros"));
    }

    @Test
    void createAccount_ShouldReturnCreated() throws Exception {
        Account account = new Account();
        account.setAccountNumber(123456L);
        account.setInitialBalance(BigDecimal.valueOf(100));
        account.setStatus(true);

        given(accountService.createAccount(any(Account.class))).willReturn(account);

        mockMvc.perform(post("/cuentas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(account)))
                .andExpect(status().isCreated());
    }
}
