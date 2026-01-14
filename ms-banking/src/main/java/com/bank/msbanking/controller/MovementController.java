package com.bank.msbanking.controller;

import com.bank.msbanking.dto.ReportResponseDto;
import com.bank.msbanking.entity.Movement;
import com.bank.msbanking.services.MovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
public class MovementController {
    private final MovementService movementService;

    @GetMapping
    public ResponseEntity<Page<Movement>> getAllMovements(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(movementService.getAllMovements(search, pageable));
    }

     @GetMapping("/reportes")
    public ResponseEntity<ReportResponseDto> getReport(@RequestParam String startDate, @RequestParam String endDate, @RequestParam(required = false) String clientId) {
        return ResponseEntity.ok(movementService.getReport(startDate, endDate, clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movement> getMovementById(@PathVariable Long id) {
        return ResponseEntity.ok(movementService.getMovementById(id));
    }

    @PostMapping
    public ResponseEntity<Movement> createMovement(@RequestBody Movement movement) {
        return new ResponseEntity<>(movementService.createMovement(movement), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movement> updateMovement(@PathVariable Long id, @RequestBody Movement movement) {
        return ResponseEntity.ok(movementService.updateMovement(id, movement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovement(@PathVariable Long id) {
        movementService.deleteMovement(id);
        return ResponseEntity.noContent().build();
    }
}
