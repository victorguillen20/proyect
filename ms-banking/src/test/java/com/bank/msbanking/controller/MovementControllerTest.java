package com.bank.msbanking.controller;

import com.bank.msbanking.dto.ReportDto;
import com.bank.msbanking.dto.ReportResponseDto;
import com.bank.msbanking.entity.Movement;
import com.bank.msbanking.services.MovementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MovementController.class)
public class MovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MovementService movementService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getReports_ShouldReturnReportResponse() throws Exception {
        ReportDto reportItem = ReportDto.builder()
                .fecha("2024-01-01")
                .cliente("Test Client")
                .numeroCuenta("123456")
                .tipo("Ahorro")
                .saldoInicial(BigDecimal.valueOf(100))
                .estado(true)
                .movimiento(BigDecimal.valueOf(50))
                .saldoDisponible(BigDecimal.valueOf(150))
                .build();

        ReportResponseDto response = ReportResponseDto.builder()
                .data(Arrays.asList(reportItem))
                .pdfBase64("dummybase64")
                .build();

        given(movementService.getReport(anyString(), anyString(), any())).willReturn(response);

        mockMvc.perform(get("/movimientos/reportes")
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-01-31")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void createMovement_ShouldReturnCreated() throws Exception {
        Movement movement = new Movement();
        movement.setValue(BigDecimal.valueOf(100));
        movement.setMovementType("Deposito");

        given(movementService.createMovement(any(Movement.class))).willReturn(movement);

        mockMvc.perform(post("/movimientos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(movement)))
                .andExpect(status().isCreated());
    }
}
