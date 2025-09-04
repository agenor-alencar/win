package com.sistemawin.service;

import com.sistemawin.domain.entity.Product;
import com.sistemawin.domain.entity.Store;
import com.sistemawin.domain.enums.ProductStatus;
import com.sistemawin.dto.request.ProductRequest;
import com.sistemawin.dto.response.ProductResponse;
import com.sistemawin.repository.ProductRepository;
import com.sistemawin.repository.StoreRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    public ProductService(ProductRepository productRepository, StoreRepository storeRepository) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
    }

    // Cria um novo produto
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Loja não encontrada com ID: " + request.getStoreId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setStatus(ProductStatus.AVAILABLE); // Status inicial padrão
        product.setStore(store);

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    // Busca todos os produtos
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // Busca um produto por ID
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + id));
        return mapToProductResponse(product);
    }

    // Atualiza um produto existente
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + id));

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Loja não encontrada com ID: " + request.getStoreId()));

        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setCategory(request.getCategory());
        existingProduct.setStore(store); // Permite mudar a loja do produto

        // O status pode ser atualizado separadamente se houver um endpoint para isso
        // Ou você pode adicionar o status no ProductRequest se for sempre atualizável
        // existingProduct.setStatus(request.getStatus());

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToProductResponse(updatedProduct);
    }

    // Deleta um produto
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado com ID: " + id);
        }
        productRepository.deleteById(id);
    }

    // Busca produtos por ID da loja
    public List<ProductResponse> getProductsByStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Loja não encontrada com ID: " + storeId));
        return productRepository.findByStoreId(storeId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // Método para mapear a entidade Product para o DTO de resposta
    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory());
        response.setStatus(product.getStatus());
        response.setStoreId(product.getStore().getId());
        response.setStoreName(product.getStore().getName());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}
