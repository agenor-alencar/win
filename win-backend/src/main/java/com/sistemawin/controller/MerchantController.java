package com.sistemawin.controller;

import com.sistemawin.dto.request.MerchantRequest;
import com.sistemawin.dto.response.MerchantResponse;
import com.sistemawin.dto.response.UserResponse;
import com.sistemawin.service.MerchantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {

    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<MerchantResponse>> getAllMerchants() {
        List<MerchantResponse> merchants = merchantService.getAllMerchants();
        return ResponseEntity.ok(merchants);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT') and #id == authentication.principal.id or hasAuthority('ADMIN')")
    public ResponseEntity<MerchantResponse> getMerchantById(@PathVariable Long id) {
        MerchantResponse merchant = merchantService.getMerchantById(id);
        return ResponseEntity.ok(merchant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT') and #id == authentication.principal.id")
    public ResponseEntity<MerchantResponse> updateMerchant(@PathVariable Long id, @Valid @RequestBody MerchantRequest request) {
        MerchantResponse updatedMerchant = merchantService.updateMerchant(id, request);
        return ResponseEntity.ok(updatedMerchant);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteMerchant(@PathVariable Long id) {
        merchantService.deleteMerchant(id);
        return ResponseEntity.noContent().build();
    }
}
