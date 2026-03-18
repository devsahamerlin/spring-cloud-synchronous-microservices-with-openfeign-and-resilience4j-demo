# Architecture Micro-services Synchrone avec Spring Cloud

## 1. Vue d'ensemble

Ce projet illustre la mise en œuvre d'une architecture micro-services synchrone basée sur l'écosystème **Spring Cloud**. La communication inter-services est assurée par **OpenFeign**, tandis que la tolérance aux pannes est garantie par **Resilience4j**.

La configuration centralisée est disponible dans le dépôt dédié : [Config Repository](https://github.com/devsahamerlin/spring-cloud-synchronous-microservices-config-repo).

---

## 2. Architecture Technique

Le système s'articule autour de composants autonomes interconnectés :

-   **Billing Service** : Agissant comme orchestrateur, ce service sollicite de manière synchrone les *Customer Service* et *Inventory Service* pour consolider les factures. L'intégration de circuits breakers (Resilience4j) permet de maintenir la continuité de service en isolant les défaillances des dépendances.
-   **Customer Service** : Service dédié à la gestion des données clients.
-   **Inventory Service** : Service responsable du catalogue produits et des stocks.
-   **Discovery Service** : Registre basé sur Eureka permettant l'enregistrement et la découverte dynamique des instances de services.
-   **Gateway Service** : Point d'entrée unique (API Gateway) assurant le routage des requêtes vers les services backend.
-   **Config Service** : Serveur de configuration distribuant les propriétés à l'ensemble des micro-services.

---

## 3. Gestion des Identités et des Accès (IAM)

La sécurisation de l'infrastructure est déléguée à **Keycloak**. Ce service prend en charge l'authentification unique (SSO) et la gestion centralisée des autorisations. Il permet de dissocier la logique de sécurité du code métier des applications.

Pour le déploiement, la configuration initiale et la validation des flux d'authentification, une documentation spécifique est disponible :

**[Guide de mise en œuvre Keycloak](infra/README.md)**

---

## 4. Stack Technologique

-   **Core** : Spring Boot, Spring Cloud.
-   **Communication** : OpenFeign (Synchronous).
-   **Résilience** : Resilience4j (Circuit Breaker, Retry, TimeLimiter).
-   **Service Discovery** : Netflix Eureka.
-   **Routing** : Spring Cloud Gateway.
-   **Configuration** : Spring Cloud Config Server.
-   **Sécurité** : Keycloak (IAM).
-   **Déploiement** : Docker (Support conteneurisation).

---

## 5. Validation et Tests

### Service de Découverte (Eureka)
Le tableau de bord permet de visualiser les instances enregistrées : `http://localhost:8761`.
![ereuka-discovery.png](images/ereuka-discovery.png)

### Configuration Centralisée
Validation du chargement des configurations via le Config Service : `http://localhost:9999`.

*Configuration Billing Service (Prod)*
![config-server-billing-service-prod.png](images/config-server-billing-service-prod.png)

*Configuration Customer Service (Prod)*
![config-server-customer-service-prod.png](images/config-server-customer-service-prod.png)

*Configuration Inventory Service (Dev)*
![config-server-inventory-service-prod.png](images/config-server-inventory-service-dev.png)

### Accès via API Gateway
Les services métiers sont exposés via la passerelle : `http://localhost:8888`.

*Customer Service* (`/CUSTOMER-SERVICE/customers`)
![customer-service.png](images/customer-service.png)

*Inventory Service* (`/INVENTORY-SERVICE/products`)
![inventory-service.png](images/inventory-service.png)

*Billing Service* (`/BILLING-SERVICE/api/bills`)
![bills.png](images/bills.png)

### Mécanismes de Résilience
Démonstration de la gestion des pannes lors de l'indisponibilité d'un service dépendant.

*Customer Service indisponible (Circuit Breaker actif avec réponse par défaut)*
![customer-service-circuit-breaker.png](images/customer-service-circuit-breaker.png)

*Inventory Service indisponible (Sans Circuit Breaker - Erreur propagée)*
![Inventory-service-down-without-circuit-breaker.png](images/Inventory-service-down-without-circuit-breaker.png)

---

## 6. Prochaines Étapes : Sécurisation des Micro-services

L'intégration de la couche de sécurité constitue la prochaine phase d'évolution pour garantir l'intégrité et la confidentialité des échanges au sein de l'architecture distribuée.
