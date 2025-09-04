package com.sistemawin.service;

import com.sistemawin.domain.entity.Customer;
import com.sistemawin.domain.entity.Driver;
import com.sistemawin.domain.entity.Merchant;
import com.sistemawin.domain.entity.User;
import com.sistemawin.domain.enums.DriverStatus;
import com.sistemawin.domain.enums.UserRole;
import com.sistemawin.dto.request.LoginRequest;
import com.sistemawin.dto.request.RegisterRequest;
import com.sistemawin.dto.response.AuthResponse;
import com.sistemawin.repository.CustomerRepository;
import com.sistemawin.repository.DriverRepository;
import com.sistemawin.repository.MerchantRepository;
import com.sistemawin.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final MerchantRepository merchantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, CustomerRepository customerRepository, DriverRepository driverRepository, MerchantRepository merchantRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.merchantRepository = merchantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        User newUser;
        Map<String, Object> extraClaims = new HashMap<>();

        if (request.getRole() == UserRole.CUSTOMER) {
            Customer customer = new Customer();
            customer.setName(request.getName());
            customer.setEmail(request.getEmail());
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
            customer.setRole(UserRole.CUSTOMER);
            customer.setPhoneNumber(request.getPhoneNumber());
            customer.setAddressLine1(request.getAddressLine1());
            customer.setAddressLine2(request.getAddressLine2());
            customer.setCity(request.getCity());
            customer.setState(request.getState());
            customer.setZipCode(request.getZipCode());
            newUser = customerRepository.save(customer);
        } else if (request.getRole() == UserRole.DRIVER) {
            Driver driver = new Driver();
            driver.setName(request.getName());
            driver.setEmail(request.getEmail());
            driver.setPassword(passwordEncoder.encode(request.getPassword()));
            driver.setRole(UserRole.DRIVER);
            driver.setLicenseNumber(request.getLicenseNumber());
            driver.setVehicleType(request.getVehicleType());
            driver.setStatus(DriverStatus.OFFLINE); // Status inicial padrão
            newUser = driverRepository.save(driver);
        } else if (request.getRole() == UserRole.MERCHANT) {
            Merchant merchant = new Merchant();
            merchant.setName(request.getName());
            merchant.setEmail(request.getEmail());
            merchant.setPassword(passwordEncoder.encode(request.getPassword()));
            merchant.setRole(UserRole.MERCHANT);
            merchant.setCnpj(request.getCnpj());
            merchant.setStoreName(request.getStoreName());
            newUser = merchantRepository.save(merchant);
        } else {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());
            newUser = userRepository.save(user);
        }

        extraClaims.put("userId", newUser.getId());
        extraClaims.put("role", newUser.getRole().name());

        String jwtToken = jwtService.generateToken(extraClaims, new org.springframework.security.core.userdetails.User(
                newUser.getEmail(), newUser.getPassword(), new java.util.ArrayList<>()
        ));

        return new AuthResponse(jwtToken, newUser.getEmail(), newUser.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());

        String jwtToken = jwtService.generateToken(extraClaims, new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new java.util.ArrayList<>()
        ));

        return new AuthResponse(jwtToken, user.getEmail(), user.getRole().name());
    }
}
