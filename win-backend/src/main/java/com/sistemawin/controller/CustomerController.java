package com.sistemawin.controller;

import com.sistemawin.dto.request.CustomerRequest;
import com.sistemawin.dto.request.PaymentMethodRequest;
import com.sistemawin.dto.response.CustomerResponse;
import com.sistemawin.dto.response.PaymentMethodResponse;
import com.sistemawin.service.CustomerService;
import com.sistemawin.service.PaymentMethodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final PaymentMethodService paymentMethodService;

    public CustomerController(CustomerService customerService, PaymentMethodService paymentMethodService) {
        this.customerService = customerService;
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #id == authentication.principal.id or hasAuthority('ADMIN')")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #id == authentication.principal.id")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updatedCustomer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoints para métodos de pagamento do cliente
    @PostMapping("/{id}/payment-methods")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #id == authentication.principal.id")
    public ResponseEntity<PaymentMethodResponse> addPaymentMethod(@PathVariable Long id, @Valid @RequestBody PaymentMethodRequest request) {
        request.setCustomerId(id);
        PaymentMethodResponse paymentMethod = paymentMethodService.addPaymentMethod(request);
        return new ResponseEntity<>(paymentMethod, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/payment-methods")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #id == authentication.principal.id")
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods(@PathVariable Long id) {
        List<PaymentMethodResponse> methods = paymentMethodService.getPaymentMethodsByCustomer(id);
        return ResponseEntity.ok(methods);
    }

    @DeleteMapping("/{customerId}/payment-methods/{paymentMethodId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #customerId == authentication.principal.id")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long customerId, @PathVariable Long paymentMethodId) {
        // TODO: Adicionar lógica para verificar se o método de pagamento pertence ao cliente
        paymentMethodService.deletePaymentMethod(paymentMethodId);
        return ResponseEntity.noContent().build();
    }
}
