package com.sistemawin.controller;

import com.sistemawin.dto.request.ProductRequest;
import com.sistemawin.dto.response.ProductResponse;
import com.sistemawin.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MERCHANT')") // Apenas lojistas podem criar produtos
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MERCHANT')") // Apenas lojistas podem atualizar seus produtos
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        // TODO: Adicionar lógica para verificar se o lojista logado é o dono da loja do produto
        ProductResponse updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MERCHANT') or hasAuthority('ADMIN')") // Lojistas e ADMIN podem deletar produtos
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        // TODO: Adicionar lógica para verificar se o lojista logado é o dono da loja do produto
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-store/{storeId}")
    public ResponseEntity<List<ProductResponse>> getProductsByStore(@PathVariable Long storeId) {
        List<ProductResponse> products = productService.getProductsByStore(storeId);
        return ResponseEntity.ok(products);
    }
}
