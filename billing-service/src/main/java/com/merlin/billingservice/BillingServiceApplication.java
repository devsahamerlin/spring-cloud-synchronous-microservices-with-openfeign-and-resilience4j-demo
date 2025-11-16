package com.merlin.billingservice;

import com.merlin.billingservice.entities.Bill;
import com.merlin.billingservice.entities.ProductItem;
import com.merlin.billingservice.repositories.BillRepository;
import com.merlin.billingservice.repositories.ProductItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

import java.util.Date;
import java.util.List;
import java.util.Random;

@SpringBootApplication
@EnableFeignClients
public class BillingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BillingServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(BillRepository billRepository, ProductItemRepository productItemRepository) {
        return args -> {
            List<Long> customersIds = List.of(1L, 2L, 3L);
            List<Long> productsIds = List.of(1L, 2L, 3L);

            customersIds.forEach(customerId -> {
                Bill bill = new Bill();
                bill.setCustomerId(customerId);
                bill.setBillingDate(new Date());
                billRepository.save(bill);

                productsIds.forEach(productId -> {
                    ProductItem productItem = new ProductItem();
                    productItem.setProductId(productId);
                    productItem.setPrice(1000*Math.random()*600);
                    productItem.setQuantity(1+new Random().nextInt(20));
                    productItem.setBill(bill);
                    productItemRepository.save(productItem);
                });
            });
        };
    }
}