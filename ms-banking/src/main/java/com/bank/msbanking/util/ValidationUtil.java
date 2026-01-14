package com.bank.msbanking.util;

public class ValidationUtil {
    
    public static void validateAge(int age) {
        if (age < 18) {
            throw new IllegalArgumentException("Client age must be 18 or older");
        }
    }
}
