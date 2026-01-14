package com.bank.msbanking.entity;

import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@MappedSuperclass
public class Person {
    @NotEmpty(message = "Name cannot be empty")
    private String name;

    @NotEmpty(message = "Gender cannot be empty")
    private String gender;

    @Min(value = 18, message = "Age must be at least 18")
    private int age;

    @NotEmpty(message = "Identification cannot be empty")
    private String identification;

    @NotEmpty(message = "Address cannot be empty")
    private String address;

    @NotEmpty(message = "Phone cannot be empty")
    @Size(min = 9, message = "Phone must have at least 9 digits")
    private String phone;
}
