package com.sistemawin.service;

import com.sistemawin.domain.entity.Customer;
import com.sistemawin.domain.entity.PaymentMethod;
import com.sistemawin.dto.request.PaymentMethodRequest;
import com.sistemawin.dto.response.PaymentMethodResponse;
import com.sistemawin.repository.CustomerRepository;
import com.sistemawin.repository.PaymentMethodRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final CustomerRepository customerRepository;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository, CustomerRepository customerRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public PaymentMethodResponse addPaymentMethod(PaymentMethodRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + request.getCustomerId()));

        // Define o método como padrão, desativando os outros
        if (request.getIsDefault()) {
            List<PaymentMethod> existingMethods = paymentMethodRepository.findByCustomerAndIsDefault(customer, true);
            existingMethods.forEach(method -> method.setIsDefault(false));
            paymentMethodRepository.saveAll(existingMethods);
        }

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setCustomer(customer);
        paymentMethod.setCardType(request.getCardType());
        paymentMethod.setLastFourDigits(request.getLastFourDigits());
        paymentMethod.setCardToken(request.getCardToken());
        paymentMethod.setIsDefault(request.getIsDefault());

        PaymentMethod savedMethod = paymentMethodRepository.save(paymentMethod);
        return mapToPaymentMethodResponse(savedMethod);
    }

    public List<PaymentMethodResponse> getPaymentMethodsByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + customerId));
        return paymentMethodRepository.findByCustomer(customer).stream()
                .map(this::mapToPaymentMethodResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePaymentMethod(Long id) {
        if (!paymentMethodRepository.existsById(id)) {
            throw new EntityNotFoundException("Método de pagamento não encontrado com ID: " + id);
        }
        paymentMethodRepository.deleteById(id);
    }

    private PaymentMethodResponse mapToPaymentMethodResponse(PaymentMethod paymentMethod) {
        PaymentMethodResponse response = new PaymentMethodResponse();
        response.setId(paymentMethod.getId());
        response.setCustomerId(paymentMethod.getCustomer().getId());
        response.setCardType(paymentMethod.getCardType());
        response.setLastFourDigits(paymentMethod.getLastFourDigits());
        response.setIsDefault(paymentMethod.getIsDefault());
        response.setCreatedAt(paymentMethod.getCreatedAt());
        return response;
    }
}
