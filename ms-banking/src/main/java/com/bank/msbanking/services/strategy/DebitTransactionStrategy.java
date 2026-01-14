package com.bank.msbanking.services.strategy;

import com.bank.msbanking.util.exception.InsufficientBalanceException;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component("DEBITO")
public class DebitTransactionStrategy implements TransactionStrategy {
    @Override
    public BigDecimal calculateNewBalance(BigDecimal currentBalance, BigDecimal amount) {
        
        BigDecimal newBalance = currentBalance.add(amount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new InsufficientBalanceException("Saldo no disponible");
        }
        return newBalance;
    }
}
