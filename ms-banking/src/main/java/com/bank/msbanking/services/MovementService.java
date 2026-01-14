package com.bank.msbanking.services;

import com.bank.msbanking.entity.Movement;
import com.bank.msbanking.dto.ReportResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovementService {
    Movement createMovement(Movement movement);
    Movement updateMovement(Long id, Movement movement);
    void deleteMovement(Long id);
    Movement getMovementById(Long id);
    Page<Movement> getAllMovements(String search, Pageable pageable);
    ReportResponseDto getReport(String startDate, String endDate, String clientId);
}
