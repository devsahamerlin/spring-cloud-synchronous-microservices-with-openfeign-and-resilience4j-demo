package com.merlin.billingservice.feign;

import com.merlin.billingservice.entities.Product;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface InventoryServiceRestClient {

    @GetMapping("/products/{id}")
    @CircuitBreaker(name = "inventory-service", fallbackMethod = "getDefaultProduct")
    Product findProductById(@PathVariable Long id);

    default Product getDefaultProduct(Long id, Exception exception) {
        return Product.builder()
                .id(id)
                .price(0).quantity(0).build();
    }
}
