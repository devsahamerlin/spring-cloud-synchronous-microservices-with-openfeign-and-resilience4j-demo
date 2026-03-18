# Documentation Keycloak

Cette documentation détaille la mise en place, la configuration et la validation du service de gestion des identités Keycloak.

## 1. Déploiement et Initialisation

L'infrastructure micro-services nécessite un service centralisé pour la gestion des identités et des accès (IAM). Pour déployer une instance Keycloak de manière automatisée et reproductible, l'orchestrateur Docker Compose est utilisé.

Exécuter les commandes suivantes dans le dossier `infra` :
```shell
cd infra
docker-compose -f common.yml -f keycloak.yml up -d
```

Une fois le service démarré, l'interface est accessible via `http://localhost:9997`. La configuration initiale requiert la définition des identifiants administrateur, soit par les variables d'environnement (en copiant `.env.example` vers `.env`) ou via la page d'accueil au premier lancement.

![Keycloak Console login](../images/keycloak-console-1.png)

---

## 2. Gestion des Royaumes (Realms)

Keycloak utilise la notion de "Realm" (Royaume) pour isoler les configurations (clients, rôles, utilisateurs) de différents tenants ou environnements. Le royaume par défaut "Master" étant réservé à l'administration du serveur, il ne doit pas héberger les configurations applicatives. Il est donc nécessaire de créer un nouveau Realm dédié au projet (ex: `ecom-ms-app`) via la console d'administration.

![Keycloak Console Realm](../images/keycloak-console-realm.png)

---

## 3. Enregistrement des Applications (Clients)

Pour déléguer l'authentification à Keycloak, l'application cliente doit être reconnue et autorisée à interagir avec le service d'authentification. Cela implique la création d'un nouveau "Client" (ex: `ecom-ms-app`) en conservant les paramètres par défaut.

Pour les applications Frontend (SPA), il est impératif de configurer les "Web Origins" afin d'autoriser les requêtes Cross-Origin (CORS) depuis l'URL de l'application (ex: `http://localhost:4200`).

![Keycloak Console Client](../images/keycloak-console-client.png)
![Keycloak Console Client Web Origins](../images/keycloak-console-clients-web-origin.png)

---

## 4. Modélisation des Rôles (RBAC)

La sécurité applicative repose sur une gestion des droits basée sur les rôles (RBAC - Role Based Access Control). Pour définir une structure de permissions claire et hiérarchisée, des rôles sont créés au niveau du Realm (Realm Roles) via l'onglet dédié (ex: `admin`, `user`). L'utilisation de rôles composites permet ensuite de grouper plusieurs permissions sous un même rôle fonctionnel (Associate Role).

![Keycloak Console Roles](../images/keycloak-console-roles.png)
![Keycloak Realm Roles - Associate Role](../images/realm-role-asscociae-role.png)
![Keycloak Realm Roles - Associate Role list](../images/realm-role-asscociae-role-list.png)

---

## 5. Gestion des Utilisateurs

Les utilisateurs finaux doivent disposer d'un compte pour accéder aux applications. La création d'identités numériques s'effectue via le menu "Users". Une fois l'utilisateur créé, ses identifiants de connexion (mot de passe) doivent être définis via l'onglet "Credentials" pour sécuriser l'accès.

![Keycloak Console User Password](../images/keycloak-console-user-password.png)

---

## 6. Assignation des Droits

Un utilisateur nouvellement créé ne dispose par défaut d'aucun privilège spécifique. Pour l'associer aux permissions définies, il est nécessaire d'utiliser le "Role Mapping" dans la fiche utilisateur. L'opération consiste à filtrer pour afficher les "Realm Roles", sélectionner les rôles souhaités (ex: `admin`) et les assigner via le bouton "Add selected".

![Keycloak Users - Assign roles to user - Filter](../images/keycloak-users-assign-roles-to-user-filter.png)
![Keycloak Users - Assign roles to user - Assign](../images/keycloak-users-assign-roles-to-user-asign.png)

---

## 7. Validation et Exploitation (Testing)

Avant intégration, la validation du bon fonctionnement des flux d'authentification (OIDC) est critique pour vérifier l'émission et la validité des jetons d'accès (Tokens). L'utilisation d'un outil comme Postman permet de simuler ces requêtes.

**Récupération de la configuration :**
Accéder à `Realm Settings > Endpoints > OpenID Endpoint Configuration` permet d'obtenir les URLs nécessaires, notamment le `token_endpoint`.

![Keycloak Token endpoint](../images/keycloak-token-endpoint.png)

**Test du flux "Password Grant" :**
Une requête POST vers le `token_endpoint` avec le login et le mot de passe utilisateur permet de vérifier l'obtention du token.

![postman-users-with-password](../images/postman-users-with-password.png)

**Analyse du Token :**
Le contenu du JWT (Access Token et Refresh Token) doit être vérifié via un décodeur (ex: jwt.io ou inspection interne).

![jwt-point-io-token-details](../images/jwt-point-io-token-details.png)

**Test du "Refresh Token" :**
Le Refresh Token est utilisé pour obtenir un nouvel Access Token sans ressaisir les identifiants, validant ainsi le mécanisme de rafraîchissement de session.

![postman-with-refresh-token](../images/postman-with-refresh-token.png)

**Test "Client Credentials" :**
(Pour les services backend)
Pour valider l'authentification de service à service :
1. Activer "Client authentication" dans les paramètres du client Keycloak.
2. Récupérer le "Client Secret" dans l'onglet Credentials.
3. Tester l'authentification avec le couple Client ID / Client Secret.

![client-authentication](../images/client-authentication.png)
![client-scredentials](../images/client-scredentials.png)
![postman-client-secret-token](../images/postman-client-secret-token.png)
