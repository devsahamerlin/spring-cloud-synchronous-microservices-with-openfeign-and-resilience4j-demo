package com.merlin.ecommsapp.customerservice;

import com.merlin.ecommsapp.customerservice.entities.Customer;
import com.merlin.ecommsapp.customerservice.repositories.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CustomerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CustomerServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(CustomerRepository customerRepository) {
        return args -> {
            customerRepository.save(new Customer(null,"John", "john@gmail.com"));
            customerRepository.save(new Customer(null,"Merlin", "merlin@gmail.com"));
            customerRepository.save(Customer.builder()
                    .name("Nath").email("nath@gmail.com")
                    .build());
        };
    }

}
