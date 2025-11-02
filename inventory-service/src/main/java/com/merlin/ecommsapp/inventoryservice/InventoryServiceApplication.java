package com.merlin.ecommsapp.inventoryservice;

import com.merlin.ecommsapp.inventoryservice.entities.Product;
import com.merlin.ecommsapp.inventoryservice.repositories.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class InventoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(ProductRepository productRepository) {
        return args -> {
            productRepository.save(Product.builder().name("HP").price(BigDecimal.valueOf(1200.12)).description("Description").quantity(3).build());
            productRepository.save(Product.builder().name("M3 Pro").price(BigDecimal.valueOf(1500.12)).description("Description").quantity(3).build());
            productRepository.save(Product.builder().name("Dell").price(BigDecimal.valueOf(1000.12)).description("Description").quantity(3).build());
        };
    }
}
