package com.bank.msbanking.services.strategy;

import java.math.BigDecimal;

public interface TransactionStrategy {
    BigDecimal calculateNewBalance(BigDecimal currentBalance, BigDecimal amount);
}
