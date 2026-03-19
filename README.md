# Micro-services E-Commerce avec Spring Cloud, Keycloak et Angular

> Projet pédagogique illustrant la mise en œuvre d'une architecture micro-services synchrone, sécurisée et dotée d'un frontend Angular, en s'appuyant sur l'écosystème **Spring Cloud**, **Keycloak** et **Angular 21**.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture Technique](#2-architecture-technique)
3. [Stack Technologique](#3-stack-technologique)
4. [Prérequis et Démarrage](#4-prérequis-et-démarrage)
5. [Gestion des Identités et des Accès — Keycloak](#5-gestion-des-identités-et-des-accès--keycloak)
6. [Validation et Tests](#6-validation-et-tests)
7. [Sécurisation des Micro-services](#7-sécurisation-des-micro-services)
8. [Frontend Angular](#8-frontend-angular)
9. [Conclusion et Perspectives](#9-conclusion-et-perspectives)

---

## 1. Vue d'ensemble

Ce projet met en œuvre une architecture **micro-services synchrone** pour une application e-commerce simplifiée. Les services communiquent entre eux via **OpenFeign** (appels HTTP synchrones), et la résilience est assurée par **Resilience4j** (Circuit Breaker, Retry, TimeLimiter).

La configuration externalisée de tous les services est hébergée dans un dépôt Git dédié :
 [spring-cloud-synchronous-microservices-config-repo](https://github.com/devsahamerlin/spring-cloud-synchronous-microservices-config-repo)

### Flux global

```
Navigateur / Client HTTP
        │
        ▼
  [Gateway Service :8888]   ← Point d'entrée unique (authentification JWT)
        │
        ├──► [Customer Service :8081]   ← Données clients
        ├──► [Inventory Service :8082]  ← Catalogue produits
        └──► [Billing Service :8083]    ← Factures (orchestre Customer + Inventory)

  [Discovery Service :8761]   ← Registre Eureka (tous les services s'y enregistrent)
  [Config Service :9999]      ← Serveur de configuration centralisée
  [Keycloak :9997]            ← Serveur d'autorisation OAuth2/OIDC
```

---

## 2. Architecture Technique

### Description des services

| Service               | Port  | Rôle                                                                                      |
|-----------------------|-------|-------------------------------------------------------------------------------------------|
| `config-service`      | 9999  | Distribue les fichiers de configuration à tous les micro-services via un dépôt Git        |
| `discovery-service`   | 8761  | Registre Eureka : enregistrement et découverte dynamique des instances                    |
| `gateway-service`     | 8888  | Point d'entrée unique : routage, équilibrage de charge, validation des tokens JWT         |
| `customer-service`    | 8081  | CRUD clients, exposé via la Gateway, protégé par OAuth2 Resource Server                  |
| `inventory-service`   | 8082  | CRUD produits, exposé via la Gateway, protégé par OAuth2 Resource Server                 |
| `billing-service`     | 8083  | Orchestrateur : consolide les factures en appelant Customer et Inventory via OpenFeign    |

### Dépendances inter-services

```
billing-service
    ├── → customer-service   (via OpenFeign + Circuit Breaker)
    └── → inventory-service  (via OpenFeign, sans circuit breaker par défaut)
```

Le `billing-service` joue le rôle d'**agrégateur** : pour construire une facture complète, il appelle synchroniquement les deux autres services métiers. En cas d'indisponibilité du `customer-service`, le Circuit Breaker de Resilience4j renvoie une réponse de repli (*fallback*) pour maintenir la disponibilité.

---

## 3. Stack Technologique

| Catégorie          | Technologie                                         | Version         |
|--------------------|-----------------------------------------------------|-----------------|
| Langage            | Java                                                | 21              |
| Framework          | Spring Boot                                         | 3.5.7           |
| Spring Cloud       | Spring Cloud (Config, Gateway, Eureka, OpenFeign)   | 2025.0.0        |
| Résilience         | Resilience4j (Circuit Breaker, Retry, TimeLimiter)  | intégré à Boot  |
| Sécurité           | Spring Security OAuth2 Resource Server + Keycloak   | 26.1.4          |
| Build              | Maven                                               | wrapper inclus  |
| Frontend           | Angular + TailwindCSS                               | 21 / 4.x        |
| Auth Frontend      | keycloak-angular                                    | 21.0.0          |
| Conteneurisation   | Docker + Docker Compose                             | —               |
| Base de données    | H2 (en mémoire, pour le développement)             | —               |

---

## 4. Prérequis et Démarrage

### Prérequis

- **Java 21** (JDK)
- **Maven 3.9+** (ou utiliser le wrapper `./mvnw` inclus)
- **Docker** et **Docker Compose**
- **Node.js 20+** et **npm 10+** (pour le frontend Angular)
- **Angular CLI 21** (`npm install -g @angular/cli`)

### Ordre de démarrage recommandé

Les services ont des dépendances au démarrage. Le respect de l'ordre suivant est **obligatoire** :

```
1. Keycloak          (via Docker Compose)
2. config-service    (distribue les configs aux autres)
3. discovery-service (registre Eureka)
4. customer-service
5. inventory-service
6. billing-service
7. gateway-service
8. ecom-frontend     (ng serve)
```

### Lancement de l'infrastructure (Keycloak + PostgreSQL)

```shell
cd infra
docker-compose -f common.yml -f keycloak.yml up -d
```

Keycloak sera accessible sur `http://localhost:9997`.

### Lancement des micro-services Spring Boot

Depuis la racine de chaque module (ou via votre IDE) :

```shell
# Exemple pour billing-service
cd billing-service
./mvnw spring-boot:run
```

### Lancement du frontend Angular

```shell
cd ecom-frontend
npm install
ng serve
```

Application disponible sur `http://localhost:4200`.

---

## 5. Gestion des Identités et des Accès — Keycloak

La sécurisation est entièrement déléguée à **Keycloak**, qui joue le rôle de serveur d'autorisation **OAuth2 / OIDC**. Les micro-services Spring Boot configurés en mode *Resource Server* valident les tokens JWT émis par Keycloak sans stocker aucun état de session (*stateless*).

> La procédure complète de configuration Keycloak (Realm, Clients, Rôles, Utilisateurs) est documentée ici : **[Guide de mise en œuvre Keycloak](infra/README.md)**

### Configuration OAuth2 Resource Server (Spring Boot)

Chaque service sécurisé déclare l'URI du serveur Keycloak dans son `application.properties` :

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9997/realms/ecom-ms-realm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:9997/realms/ecom-ms-realm/protocol/openid-connect/certs
```

Le filtre de sécurité valide ensuite chaque requête entrante en vérifiant la signature JWT et en extrayant les rôles depuis le claim `roles` :

```java
@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
    converter.setAuthoritiesClaimName("roles");
    converter.setAuthorityPrefix("ROLE_");
    JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
    jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
    return jwtConverter;
}
```

### Flux d'obtention d'un token (Client Credentials)

```
Client → POST http://localhost:9997/realms/ecom-ms-realm/protocol/openid-connect/token
         Body: grant_type=client_credentials&client_id=...&client_secret=...
         ↓
       Access Token JWT
         ↓
Client → GET http://localhost:8888/BILLING-SERVICE/api/bills
         Header: Authorization: Bearer <access_token>
```

![Obtention du token Keycloak](images/get-access-token.png)

---

## 6. Validation et Tests

### 6.1 Service de Découverte (Eureka)

Tableau de bord Eureka accessible sur `http://localhost:8761`. Il affiche les instances enregistrées en temps réel.

![Tableau de bord Eureka](images/ereuka-discovery.png)

---

### 6.2 Configuration Centralisée

Le `config-service` (port `9999`) sert les fichiers de configuration depuis le dépôt Git distant. Validation des profils :

*Billing Service — profil Production*
![config-server-billing-service-prod.png](images/config-server-billing-service-prod.png)

*Customer Service — profil Production*
![config-server-customer-service-prod.png](images/config-server-customer-service-prod.png)

*Inventory Service — profil Développement*
![config-server-inventory-service-dev.png](images/config-server-inventory-service-dev.png)

---

### 6.3 Accès aux Services via l'API Gateway

Tous les services métiers sont exposés **uniquement** via la passerelle `http://localhost:8888`. L'accès direct aux ports internes n'est pas nécessaire.

| Service           | URL via Gateway                                   |
|-------------------|---------------------------------------------------|
| Customer Service  | `http://localhost:8888/CUSTOMER-SERVICE/customers` |
| Inventory Service | `http://localhost:8888/INVENTORY-SERVICE/products` |
| Billing Service   | `http://localhost:8888/BILLING-SERVICE/api/bills`  |

*Customer Service*
![customer-service.png](images/customer-service.png)

*Inventory Service*
![inventory-service.png](images/inventory-service.png)

*Billing Service — liste des factures*
![bills.png](images/bills.png)

---

### 6.4 Mécanismes de Résilience (Resilience4j)

Le `billing-service` intègre des patterns de résilience pour gérer les défaillances de ses dépendances.

**Circuit Breaker actif — Customer Service indisponible :**
Lorsque le `customer-service` est arrêté, le Circuit Breaker s'ouvre et renvoie une réponse de repli (*fallback*) au lieu de propager l'erreur.

![Circuit Breaker actif sur Customer Service](images/customer-service-circuit-breaker.png)

**Sans Circuit Breaker — Inventory Service indisponible :**
Sans mécanisme de protection, l'erreur remonte directement au client.

![Inventory Service hors ligne sans Circuit Breaker](images/Inventory-service-down-without-circuit-breaker.png)

---

## 7. Sécurisation des Micro-services

### 7.1 Périmètre de Sécurisation

| Service              | OAuth2 Resource Server | Justification                                            |
|----------------------|:---------------------:|----------------------------------------------------------|
| `inventory-service`  |         ✅ Oui         | Service métier exposé via la Gateway                     |
| `customer-service`   |         ✅ Oui         | Service métier exposé via la Gateway                     |
| `billing-service`    |         ✅ Oui         | Service métier exposé via la Gateway                     |
| `gateway-service`    |         ✅ Oui         | Point d'entrée unique — valide les tokens JWT entrants   |
| `discovery-service`  |         ✅ Oui         | Console Eureka à protéger contre les accès non autorisés |
| `config-service`     |         ❌ Non         | Infrastructure interne — risque de démarrage circulaire  |

> **Pourquoi le `config-service` n'est-il pas sécurisé ?**
> Les autres services contactent le `config-service` dès leur démarrage, avant même d'avoir reçu un token. Sécuriser ce service créerait une dépendance circulaire impossible à résoudre au boot.

---

### 7.2 Principe CORS dans une architecture Gateway

> **Règle fondamentale :** dans une architecture avec API Gateway, **la configuration CORS ne doit exister qu'en un seul endroit : la Gateway**.

Si les services en aval (`billing-service`, `customer-service`, `inventory-service`) définissent également leurs propres règles CORS, le navigateur reçoit l'en-tête `Access-Control-Allow-Origin` **en double**, ce qui est considéré comme invalide et provoque une erreur CORS malgré un statut `200 OK`.

**Ce qui est observé dans les outils de développement du navigateur :**
```
CORS error — bills — xhr — billing.ts:21
Status Code: 200 OK  ← la requête aboutit côté serveur
access-control-allow-origin: http://localhost:4200   ← ajouté par la Gateway
access-control-allow-origin: http://localhost:4200   ← ajouté en double par le service en aval
```

**Solution appliquée : `cors.disable()` dans la `SecurityConfig` de chaque service en aval, et gestion CORS centralisée dans la Gateway uniquement.**

```java
// billing-service / customer-service / inventory-service — SecurityConfig.java
http
    .cors(cors -> cors.disable())  // CORS géré exclusivement par la Gateway
    ...
```

```java
// gateway-service — SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

### 7.3 Test de l'API Gateway avec un Access Token

Une fois la sécurité activée, tout accès sans token est rejeté avec **HTTP 401**.

**Accès refusé sur le navigateur :**
![api-gateway-401-on-browser.png](images/api-gateway-401-on-browser.png)

**Accès refusé sur Postman :**
![api-gateway-401-on-postman.png](images/api-gateway-401-on-postman.png)

**Étape 1 — Générer un Access Token depuis Keycloak :**
![get-access-token.png](images/get-access-token.png)

**Étape 2 — Utiliser le token dans l'en-tête `Authorization: Bearer` :**
![api-gateway-with-access-token.png](images/api-gateway-with-access-token.png)

---

## 8. Frontend Angular

### 8.1 Création du projet

```shell
ng new ecom-frontend   # TailwindCSS sélectionné lors de la génération
cd ecom-frontend
ng serve
```

Application accessible sur `http://localhost:4200` :

![Page initiale Angular](images/angular-initial-app.png)

---

### 8.2 Intégration de Keycloak dans Angular

#### Installation de la librairie

```shell
npm i keycloak-angular
```

La librairie `keycloak-angular` (v21) enveloppe le SDK officiel Keycloak JS pour l'intégrer nativement dans le cycle de vie Angular.

#### Configuration dans `app.config.ts`

L'initialisation de Keycloak se fait via un `APP_INITIALIZER` qui charge la session avant le rendu de l'application :

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (keycloak: KeycloakService) => () =>
        keycloak.init({
          config: {
            url: 'http://localhost:9997',
            realm: 'ecom-ms-realm',
            clientId: 'ecom-frontend-app',
          },
          initOptions: { onLoad: 'check-sso' },
        }),
      deps: [KeycloakService],
      multi: true,
    },
    KeycloakService,
  ],
};
```

#### Garde d'authentification `auth.guard.ts`

Les routes protégées sont sécurisées via un `CanActivate` qui redirige vers Keycloak si l'utilisateur n'est pas authentifié :

```typescript
export const authGuard: CanActivateFn = () => {
  const keycloak = inject(KeycloakService);
  if (keycloak.isLoggedIn()) return true;
  keycloak.login();
  return false;
};
```

---

### 8.3 Configuration du Client Keycloak pour le Frontend

Dans la console Keycloak, créer un client `ecom-frontend-app` avec les paramètres suivants :

| Champ                  | Valeur                   |
|------------------------|--------------------------|
| **Root URL**           | `http://localhost:4200`  |
| **Valid Redirect URIs**| `http://localhost:4200/*`|
| **Web Origins**        | `http://localhost:4200`  |

![Configuration du client Keycloak](images/frontend-keycloak-client-with-rorigin.png)

> Renseigner **Web Origins** est indispensable : c'est ce champ qui autorise Keycloak à répondre aux requêtes CORS depuis l'application Angular (appels aux endpoints `/token`, `/userinfo`, etc.).

Il est également possible d'activer l'auto-inscription des utilisateurs :

![Activation de l'enregistrement utilisateur](images/keycloak-eneble-user-registration.png)

---

### 8.4 Parcours utilisateur

**Page d'accueil** (avant connexion) :

![Page d'accueil](images/frontend-welcome-page.png)

**Cliquer sur "Se connecter avec Keycloak"** — la page de login Keycloak s'affiche.
Utiliser les identifiants configurés (`user1@gmail.com` / `12345`) :

![Page de connexion Keycloak](images/keycloak-frontend-login-page.png)

**Après connexion** — l'utilisateur connecté est affiché :

![Utilisateur connecté](images/frontend-connected-user.png)

**Accès sécurisé aux factures :**

![Liste des factures](images/frontend-securelly-access-bills.png)

**Détail d'une facture :**

![Détail de facture](images/frontend-securelly-access-bill-details.png)

---

## 9. Conclusion et Perspectives

L'application dispose désormais d'une architecture micro-services complète et sécurisée :

- ✅ Services métiers enregistrés dans Eureka et configurés via le Config Server
- ✅ Communication synchrone inter-services avec OpenFeign
- ✅ Résilience aux pannes avec Resilience4j (Circuit Breaker)
- ✅ Sécurisation par tokens JWT via Keycloak (OAuth2 / OIDC)
- ✅ CORS géré de façon centralisée dans la Gateway (pas de doublon)
- ✅ Frontend Angular authentifié via `keycloak-angular`

### Prochaine étape : Contrôle d'accès par rôles (RBAC)

La prochaine évolution consiste à restreindre l'accès aux ressources en fonction des **rôles** de l'utilisateur (ex : `ROLE_ADMIN`, `ROLE_USER`). Cette approche est déjà mise en œuvre dans le projet monolithique de référence :

[e-banking-backend — Contrôle d'accès par rôles](https://github.com/devsahamerlin/e-banking-backend)
