package com.bank.msbanking.services.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component("CREDITO")
public class CreditTransactionStrategy implements TransactionStrategy {
    @Override
    public BigDecimal calculateNewBalance(BigDecimal currentBalance, BigDecimal amount) {
        return currentBalance.add(amount);
    }
}
