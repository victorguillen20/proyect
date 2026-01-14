package com.bank.msbanking.services.impl;

import com.bank.msbanking.dto.ReportDto;
import com.bank.msbanking.dto.ReportResponseDto;
import com.bank.msbanking.entity.Account;
import com.bank.msbanking.entity.Movement;
import com.bank.msbanking.repository.AccountRepository;
import com.bank.msbanking.repository.MovementRepository;
import com.bank.msbanking.services.MovementService;
import com.bank.msbanking.services.strategy.TransactionStrategy;
import com.bank.msbanking.util.PdfGenerator;
import com.bank.msbanking.util.exception.DailyLimitExceededException;
import com.bank.msbanking.util.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovementServiceImpl implements MovementService {
    private final MovementRepository movementRepository;
    private final AccountRepository accountRepository;
    private final Map<String, TransactionStrategy> transactionStrategies;
    private final PdfGenerator pdfGenerator;
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("1000");

    @Override
    @Transactional
    public Movement createMovement(Movement movement) {
        if (movement.getAccount() == null || movement.getAccount().getAccountNumber() == null) {
            throw new ResourceNotFoundException("Account Number required");
        }

        Account account = accountRepository.findById(movement.getAccount().getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        String strategyKey = movement.getValue().compareTo(BigDecimal.ZERO) < 0 ? "DEBITO" : "CREDITO";
        
        TransactionStrategy strategy = transactionStrategies.get(strategyKey);
        if (strategy == null) {
             strategyKey = "CREDITO"; 
             strategy = transactionStrategies.get(strategyKey);
        }

        if ("DEBITO".equals(strategyKey)) {
            checkDailyLimit(account.getAccountNumber(), movement.getValue());
        }

        BigDecimal currentBalance = account.getInitialBalance();
        BigDecimal newBalance = strategy.calculateNewBalance(currentBalance, movement.getValue());

        account.setInitialBalance(newBalance);
        accountRepository.save(account);

        movement.setAccount(account);
        movement.setBalance(newBalance);
        movement.setDate(LocalDateTime.now());
        
        return movementRepository.save(movement);
    }

    private void checkDailyLimit(Long accountNumber, BigDecimal amount) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        
        BigDecimal debitsToday = movementRepository.sumDebitsForAccountSince(accountNumber, startOfDay, endOfDay);
        if (debitsToday == null) debitsToday = BigDecimal.ZERO;
        
        BigDecimal totalDebit = debitsToday.add(amount).abs();
        
        if (totalDebit.compareTo(DAILY_LIMIT) > 0) {
            throw new DailyLimitExceededException("Cupo diario Excedido");
        }
    }

    @Override
    public Movement updateMovement(Long id, Movement movement) {
        return movementRepository.save(movement);
    }

    @Override
    public void deleteMovement(Long id) {
        movementRepository.deleteById(id);
    }

    @Override
    public Movement getMovementById(Long id) {
        return movementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Movement not found"));
    }

    @Override
    public Page<Movement> getAllMovements(String search, Pageable pageable) {
         if (search == null || search.trim().isEmpty()) {
            return movementRepository.findAll(pageable);
        }
        return movementRepository.searchMovements(search, pageable);
    }

    @Override
    public ReportResponseDto getReport(String startDate, String endDate, String clientId) {
         
         LocalDate start = LocalDate.parse(startDate);
         LocalDate end = LocalDate.parse(endDate);
         
         List<Movement> movements = movementRepository.getReport(start.atStartOfDay(), end.atTime(LocalTime.MAX), clientId);

         List<ReportDto> reportData = movements.stream().map(m -> ReportDto.builder()
                 .fecha(m.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                 .cliente(m.getAccount().getClient().getName())
                 .numeroCuenta(String.valueOf(m.getAccount().getAccountNumber()))
                 .tipo(m.getAccount().getAccountType())
                 .saldoInicial(m.getBalance().subtract(m.getValue()))
                 .estado(m.getAccount().getStatus())
                 .movimiento(m.getValue())
                 .saldoDisponible(m.getBalance())
                 .build()).collect(Collectors.toList());

         String pdfBase64 = pdfGenerator.generateReportPdf(reportData);

         return ReportResponseDto.builder()
                 .data(reportData)
                 .pdfBase64(pdfBase64)
                 .build();
    }
}
