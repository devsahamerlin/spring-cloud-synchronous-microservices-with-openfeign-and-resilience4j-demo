package com.merlin.billingservice.web;

import com.merlin.billingservice.entities.Bill;
import com.merlin.billingservice.feign.CustomerServiceRestClient;
import com.merlin.billingservice.feign.InventoryServiceRestClient;
import com.merlin.billingservice.model.Customer;
import com.merlin.billingservice.repositories.BillRepository;
import com.merlin.billingservice.repositories.ProductItemRepository;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class BillRestController {
    private final BillRepository billRepository;
    private final ProductItemRepository productItemRepository;
    private final CustomerServiceRestClient customerServiceRestClient;
    private final InventoryServiceRestClient inventoryServiceRestClient;

    @GetMapping("/bills/{id}")
    public Bill getBillById(@PathVariable Long id) {
        Bill bill = billRepository.findById(id).orElse(null);
        assert bill != null;
        Customer customer = customerServiceRestClient.findCustomerById(bill.getCustomerId());
        bill.setCustomer(customer);
        bill.getProductItems().forEach(productItem ->
                productItem.setProduct(inventoryServiceRestClient
                .findProductById(productItem.getProductId())));
        return bill;
    }
}
