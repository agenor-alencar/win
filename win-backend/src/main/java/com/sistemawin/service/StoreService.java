package com.sistemawin.service;

import com.sistemawin.domain.entity.Merchant;
import com.sistemawin.domain.entity.Store;
import com.sistemawin.dto.request.StoreRequest;
import com.sistemawin.dto.response.StoreResponse;
import com.sistemawin.repository.MerchantRepository;
import com.sistemawin.repository.StoreRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final MerchantRepository merchantRepository;

    public StoreService(StoreRepository storeRepository, MerchantRepository merchantRepository) {
        this.storeRepository = storeRepository;
        this.merchantRepository = merchantRepository;
    }

    @Transactional
    public StoreResponse createStore(StoreRequest request) {
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado com ID: " + request.getMerchantId()));

        Store store = new Store();
        store.setName(request.getName());
        store.setDescription(request.getDescription());
        store.setCategory(request.getCategory());
        store.setMerchant(merchant);

        Store savedStore = storeRepository.save(store);
        return mapToStoreResponse(savedStore);
    }

    public List<StoreResponse> getAllStores() {
        return storeRepository.findAll().stream()
                .map(this::mapToStoreResponse)
                .collect(Collectors.toList());
    }

    public StoreResponse getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Loja não encontrada com ID: " + id));
        return mapToStoreResponse(store);
    }

    @Transactional
    public StoreResponse updateStore(Long id, StoreRequest request) {
        Store existingStore = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Loja não encontrada com ID: " + id));

        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado com ID: " + request.getMerchantId()));

        existingStore.setName(request.getName());
        existingStore.setDescription(request.getDescription());
        existingStore.setCategory(request.getCategory());
        existingStore.setMerchant(merchant);

        Store updatedStore = storeRepository.save(existingStore);
        return mapToStoreResponse(updatedStore);
    }

    @Transactional
    public void deleteStore(Long id) {
        if (!storeRepository.existsById(id)) {
            throw new EntityNotFoundException("Loja não encontrada com ID: " + id);
        }
        storeRepository.deleteById(id);
    }

    public List<StoreResponse> getStoresByMerchant(Long merchantId) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado com ID: " + merchantId));
        return storeRepository.findByMerchantId(merchantId).stream()
                .map(this::mapToStoreResponse)
                .collect(Collectors.toList());
    }

    private StoreResponse mapToStoreResponse(Store store) {
        StoreResponse response = new StoreResponse();
        response.setId(store.getId());
        response.setName(store.getName());
        response.setDescription(store.getDescription());
        response.setCategory(store.getCategory());
        response.setMerchantId(store.getMerchant().getId());
        response.setMerchantName(store.getMerchant().getName());
        response.setCreatedAt(store.getCreatedAt());
        response.setUpdatedAt(store.getUpdatedAt());
        return response;
    }
}
