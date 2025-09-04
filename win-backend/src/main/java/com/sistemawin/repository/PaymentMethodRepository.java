package com.sistemawin.repository;

import com.sistemawin.domain.entity.Customer;
import com.sistemawin.domain.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByCustomer(Customer customer);
    List<PaymentMethod> findByCustomerAndIsDefault(Customer customer, Boolean isDefault);
}
