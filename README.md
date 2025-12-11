🛡️ Cloud Sentinel
L'Auditeur FinOps Multi-Cloud Intelligent & Open Source

Cloud Sentinel est une plateforme SaaS B2B conçue pour les Data Engineers et les équipes DevOps. Contrairement aux dashboards natifs (AWS Cost Explorer, Azure Cost Management) qui sont passifs, Cloud Sentinel agit comme un auditeur actif. Il analyse les métadonnées de l'infrastructure pour détecter le gaspillage ("Zombie Resources"), prédire les dépassements budgétaires et centraliser la vue Multi-Cloud.

🚀 Fonctionnalités Clés
1. 🌍 Monitoring Multi-Cloud Unifié

Connectez vos comptes AWS et Azure sur une seule interface.

Vue consolidée des dépenses (plus besoin de jongler entre les consoles).

Architecture "Agentless" : Connexion via API (IAM Role / Service Principal).

2. 🧟 Détection de Gaspillage (Waste Detection)

L'algorithme scanne les ressources inutilisées qui continuent d'être facturées :

Zombie Disks : Volumes EBS/Managed Disks non attachés à une VM.

Idle Instances : VMs allumées mais avec CPU < 5% (Roadmap).

Orphan IPs : Adresses IP publiques réservées mais non associées.

3. 💰 Analyse FinOps & Prévisions

Suivi Budgétaire : Coût Month-to-Date (MTD) vs Prévision fin de mois.

Granularité : Analyse des coûts par Service et par Jour.

Alerting : Détection de variations de coûts anormales (+X% vs J-1).

🏗️ Architecture Technique
Cloud Sentinel repose sur une architecture moderne de Data Engineering, séparant strictement la collecte de données (Write) de la visualisation (Read).

La Stack

Backend : FastAPI (Python) - API REST performante et typée.

Workers (Moteur) : Celery + Redis - Gestion asynchrone des scans (Batch processing).

Connecteurs Cloud : Boto3 (AWS SDK) et Azure Identity/Mgmt (Azure SDK).

Database : PostgreSQL - Stockage relationnel et JSONB.

ORM : SQLAlchemy - Gestion des modèles de données.

Frontend (MVP) : Streamlit - Dashboard interactif en Python pur.

Le Flux de Données (Data Pipeline)

Collecte (La Nuit) : Celery lance les scans, déchiffre les clés API, interroge les Clouds, et stocke les résultats bruts (ScanResult).

Transformation : Les données brutes sont parsées pour remplir les tables analytiques (DailyCosts, Anomalies).

Restitution (Le Jour) : L'API sert les données agrégées au Frontend instantanément sans réinterroger AWS/Azure.

🔒 Sécurité & Chiffrement
La sécurité est la priorité absolue du projet. Nous appliquons le principe de Défense en Profondeur.

1. Protection des Credentials (Key Wrapping)

Les secrets cloud (AWS_SECRET_ACCESS_KEY) ne sont jamais stockés en clair.

Niveau 1 : Le secret est chiffré par une clé unique par compte (DEK - Data Encryption Key).

Niveau 2 : La DEK est chiffrée par une clé maîtresse (KEK - Key Encryption Key) stockée uniquement en variable d'environnement.

Algorithme : AES-256 via cryptography.fernet.

2. Accès Base de Données

L'identifiant public (Access Key ID) est stocké en clair (pour l'affichage et la recherche).

Les mots de passe utilisateurs sont hachés (Bcrypt via passlib).

📊 Modèle de Données (Schema)
User : L'utilisateur de la plateforme.

CloudAccount : Contient les identifiants et la configuration (Provider, Name).

ScanResult : Historique brut (JSONB) des réponses API (Audit log).

DailyCosts : Agrégation des coûts par jour et par service (Anti-doublons via UniqueConstraint).

Anomalies : Liste des ressources gaspillées détectées (avec sévérité et coût estimé).

🖥️ Les Vues du Dashboard
Le Cockpit (Home) : Météo immédiate. Jauge de budget, courbe de tendance des 30 derniers jours, KPI de gaspillage total identifié.

Audit & Anomalies : Tableau d'actions. Liste priorisée des ressources à nettoyer (High/Medium/Low). Bouton pour ignorer ou marquer comme résolu.

Analytics : Explorateur de données. Graphiques détaillés par service pour comprendre "Qui dépense quoi ?".

🗺️ Roadmap de Développement
Phase 1 : Core Engine (POC) ✅

[x] Scripts Python de connexion AWS (Boto3).

[x] Algorithme de détection des disques orphelins (Pagination incluse).

[x] Calculs de base (Coût MTD, Prévisions).

Phase 2 : Backend Foundation (En cours) 🚧

[ ] Structure FastAPI propre (Architecture en couches).

[ ] Docker & Docker Compose (Postgres).

[ ] Modèles SQLAlchemy & Migrations Alembic.

[ ] Implémentation du chiffrement (Security Utils).

Phase 3 : API & Worker

[ ] Routes API (/scan, /accounts, /dashboard).

[ ] Intégration de Celery + Redis pour les tâches asynchrone.

[ ] Orchestrateur de scan (AWSService class).

Phase 4 : Frontend MVP

[ ] Interface Streamlit connectée à l'API.

[ ] Visualisation des graphiques et alertes.

Phase 5 : Hardening (V2)

[ ] Implémentation complète du Key Wrapping (Rotation des clés).

[ ] Support Azure complet.

[ ] Authentification OAuth2 / JWT.

🛠️ Installation & Démarrage
Pré-requis

Docker & Docker Compose

Python 3.10+

Lancement Local

Cloner le dépôt

Bash
git clone https://github.com/votre-user/cloud-sentinel.git
cd cloud-sentinel
Configuration Copier le fichier d'exemple et générer une clé de chiffrement.

Bash
cp .env.example .env
# Générer une clé Fernet (python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
# Coller la clé dans ENCRYPTION_KEY dans le .env
Lancer la Stack

Bash
docker-compose up --build
Accès

Backend API (Docs): http://localhost:8000/docs

Frontend Dashboard: http://localhost:8501

Database (Admin): http://localhost:8080 (Adminer)

📝 Licence
Ce projet est distribué sous licence MIT pour la version Community. Une version Enterprise (Self-Hosted) est disponible sur demande.

Auteur : Vincent Parra - Data Engineer