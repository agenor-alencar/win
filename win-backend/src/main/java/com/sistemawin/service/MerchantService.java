package com.sistemawin.service;

import com.sistemawin.domain.entity.Merchant;
import com.sistemawin.dto.request.MerchantRequest;
import com.sistemawin.dto.response.MerchantResponse;
import com.sistemawin.repository.MerchantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MerchantService {

    private final MerchantRepository merchantRepository;

    public MerchantService(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    public List<MerchantResponse> getAllMerchants() {
        return merchantRepository.findAll().stream()
                .map(this::mapToMerchantResponse)
                .collect(Collectors.toList());
    }

    public MerchantResponse getMerchantById(Long id) {
        Merchant merchant = merchantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado com ID: " + id));
        return mapToMerchantResponse(merchant);
    }

    @Transactional
    public MerchantResponse updateMerchant(Long id, MerchantRequest request) {
        Merchant existingMerchant = merchantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lojista não encontrado com ID: " + id));

        existingMerchant.setName(request.getName());
        existingMerchant.setEmail(request.getEmail());
        existingMerchant.setCnpj(request.getCnpj());
        existingMerchant.setStoreName(request.getStoreName());

        Merchant updatedMerchant = merchantRepository.save(existingMerchant);
        return mapToMerchantResponse(updatedMerchant);
    }

    @Transactional
    public void deleteMerchant(Long id) {
        if (!merchantRepository.existsById(id)) {
            throw new EntityNotFoundException("Lojista não encontrado com ID: " + id);
        }
        merchantRepository.deleteById(id);
    }

    private MerchantResponse mapToMerchantResponse(Merchant merchant) {
        MerchantResponse response = new MerchantResponse();
        response.setId(merchant.getId());
        response.setName(merchant.getName());
        response.setEmail(merchant.getEmail());
        response.setRole(merchant.getRole());
        response.setCnpj(merchant.getCnpj());
        response.setStoreName(merchant.getStoreName());
        response.setCreatedAt(merchant.getCreatedAt());
        response.setUpdatedAt(merchant.getUpdatedAt());
        return response;
    }
}
