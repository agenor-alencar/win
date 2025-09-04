package com.sistemawin.controller;

import com.sistemawin.dto.request.StoreRequest;
import com.sistemawin.dto.response.StoreResponse;
import com.sistemawin.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MERCHANT')")
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody StoreRequest request) {
        StoreResponse store = storeService.createStore(request);
        return new ResponseEntity<>(store, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StoreResponse>> getAllStores() {
        List<StoreResponse> stores = storeService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreResponse> getStoreById(@PathVariable Long id) {
        StoreResponse store = storeService.getStoreById(id);
        return ResponseEntity.ok(store);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MERCHANT')")
    public ResponseEntity<StoreResponse> updateStore(@PathVariable Long id, @Valid @RequestBody StoreRequest request) {
        // TODO: Adicionar lógica para verificar se o lojista logado é o dono da loja
        StoreResponse updatedStore = storeService.updateStore(id, request);
        return ResponseEntity.ok(updatedStore);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MERCHANT') or hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        // TODO: Adicionar lógica para verificar se o lojista logado é o dono da loja
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-merchant/{merchantId}")
    @PreAuthorize("hasAuthority('MERCHANT') or hasAuthority('ADMIN')")
    public ResponseEntity<List<StoreResponse>> getStoresByMerchant(@PathVariable Long merchantId) {
        List<StoreResponse> stores = storeService.getStoresByMerchant(merchantId);
        return ResponseEntity.ok(stores);
    }
}
