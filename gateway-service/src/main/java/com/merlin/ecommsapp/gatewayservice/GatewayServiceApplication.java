package com.merlin.ecommsapp.gatewayservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator;
import org.springframework.cloud.gateway.discovery.DiscoveryLocatorProperties;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }

    //@Bean
    RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("customer-service-route", predicateSpec ->
                        predicateSpec.path("/customers/**").uri("lb://CUSTOMER-SERVICE"))
                .route("inventory-service-route", predicateSpec ->
                        predicateSpec.path("/inventories/**").uri("lb://INVENTORY-SERVICE"))
                .build();
    }

    @Bean
    DiscoveryClientRouteDefinitionLocator dynamicRouteLocator(ReactiveDiscoveryClient discoveryClient,
                                                              DiscoveryLocatorProperties properties) {
        return new DiscoveryClientRouteDefinitionLocator(discoveryClient, properties);
    }

}
