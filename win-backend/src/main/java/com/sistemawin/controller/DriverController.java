package com.sistemawin.controller;

import com.sistemawin.domain.enums.DriverStatus;
import com.sistemawin.dto.request.DriverRequest;
import com.sistemawin.dto.response.DriverResponse;
import com.sistemawin.dto.response.UserResponse;
import com.sistemawin.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT')")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        List<DriverResponse> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'DRIVER') and #id == authentication.principal.id or hasAuthority('ADMIN')")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        DriverResponse driver = driverService.getDriverById(id);
        return ResponseEntity.ok(driver);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'DRIVER') and #id == authentication.principal.id")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        DriverResponse updatedDriver = driverService.updateDriver(id, request);
        return ResponseEntity.ok(updatedDriver);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'DRIVER') and #id == authentication.principal.id")
    public ResponseEntity<DriverResponse> updateDriverStatus(@PathVariable Long id, @RequestParam DriverStatus status) {
        DriverResponse updatedDriver = driverService.updateDriverStatus(id, status);
        return ResponseEntity.ok(updatedDriver);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }
}
