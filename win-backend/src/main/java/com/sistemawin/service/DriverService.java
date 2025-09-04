package com.sistemawin.service;

import com.sistemawin.domain.entity.Driver;
import com.sistemawin.domain.enums.DriverStatus;
import com.sistemawin.dto.request.DriverRequest;
import com.sistemawin.dto.response.DriverResponse;
import com.sistemawin.repository.DriverRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToDriverResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com ID: " + id));
        return mapToDriverResponse(driver);
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com ID: " + id));

        existingDriver.setName(request.getName());
        existingDriver.setEmail(request.getEmail());
        existingDriver.setLicenseNumber(request.getLicenseNumber());
        existingDriver.setVehicleType(request.getVehicleType());
        if (request.getStatus() != null) {
            existingDriver.setStatus(request.getStatus());
        }

        Driver updatedDriver = driverRepository.save(existingDriver);
        return mapToDriverResponse(updatedDriver);
    }

    @Transactional
    public DriverResponse updateDriverStatus(Long id, DriverStatus newStatus) {
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com ID: " + id));
        existingDriver.setStatus(newStatus);
        Driver updatedDriver = driverRepository.save(existingDriver);
        return mapToDriverResponse(updatedDriver);
    }

    @Transactional
    public void deleteDriver(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new EntityNotFoundException("Motorista não encontrado com ID: " + id);
        }
        driverRepository.deleteById(id);
    }

    private DriverResponse mapToDriverResponse(Driver driver) {
        DriverResponse response = new DriverResponse();
        response.setId(driver.getId());
        response.setName(driver.getName());
        response.setEmail(driver.getEmail());
        response.setRole(driver.getRole());
        response.setLicenseNumber(driver.getLicenseNumber());
        response.setVehicleType(driver.getVehicleType());
        response.setStatus(driver.getStatus());
        response.setCreatedAt(driver.getCreatedAt());
        response.setUpdatedAt(driver.getUpdatedAt());
        return response;
    }
}
