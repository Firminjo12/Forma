# InfoDébutant - Plateforme de Formation aux Bases de l'Ordinateur

Une plateforme web éducative, accessible, interactive et moderne conçue pour les grands débutants et les personnes souhaitant apprendre à utiliser un ordinateur pas à pas.

---

## 🎯 Fonctionnalités et Contenus

La plateforme propose deux cours distincts : le parcours **Bases de l'ordinateur** (5 modules et un quiz) et le cours indépendant **Bureautique**.

1. **Module 1 : Anatomie & Matériel**
   - Distinction matérielle (*Hardware*) et logicielle (*Software*).
   - Ordinateur portable vs Tour fixe de bureau.
   - **Tutoriel vidéo intégré :** vidéo pas à pas pour savoir où se trouve le bouton Marche/Arrêt et comment allumer son ordinateur portable (fichier dans `video/`).
   - Schéma interactif pour explorer chaque composant (Écran, Unité centrale, Processeur CPU, Mémoire RAM, Disque SSD/Dur).
   - Les connectiques indispensables (USB, HDMI, Alimentation).

2. **Module 2 : Présentation du Bureau**
   - Comprendre Windows, macOS et Linux.
   - Éléments du bureau : fond d'écran, barre des tâches, menu Démarrer et Corbeille.
   - **Tutoriel vidéo intégré :** présentation du Bureau de Windows (fichier local dans `video/`).
   - **Simulateur de bureau virtuel :** manipulation de vraies fenêtres (Explorateur de fichiers, Bloc-notes pour écrire, calculatrice fonctionnelle, vidage de la corbeille, extinction sécurisée).

3. **Module 3 : Souris & Clavier**
   - Les gestes fondamentaux : Clic gauche, double-clic, clic droit et molette de défilement.
   - **Atelier interactif Souris :** mini-jeu avec 3 niveaux (cibles à cliquer, bulles de double-clic, glisser-déposer de fichiers avec effets sonores).
   - Les touches indispensables du clavier (Entrée, Effacer, Espace, Majuscule, Ctrl, Échap).
   - **Vidéo intégrée :** explication du fonctionnement du clavier et des touches essentielles.
   - **Atelier interactif Clavier :** clavier virtuel AZERTY qui s'illumine en temps réel selon les touches pressées et atelier de dactylographie débutant.

4. **Module 4 : Gérer ses Fichiers & Dossiers**
   - Analogie du bureau réel : chemise cartonnée (dossier) vs feuille de papier (fichier).
   - Décryptage des extensions courantes (`.pdf`, `.docx`, `.jpg`, `.mp3`).
   - **Vidéo intégrée :** démonstration pratique pour créer un nouveau dossier sur le bureau.
   - Guide pas-à-pas pour créer, renommer et ranger ses dossiers.
   - **Étape pratique Copier-Coller sous Windows :** vidéo de démonstration, explication de `Ctrl + C` et `Ctrl + V`, différence entre copier et couper, et exercice simulé pour copier un fichier vers un autre dossier.

5. **Module 5 : Internet & La Sécurité**
   - Comprendre le Web et les navigateurs (Chrome, Firefox, Edge).
   - Différence entre barre d'adresse et moteur de recherche.
   - Les 4 règles d'or de la cybersécurité (mots de passe forts, détection du phishing / hameçonnage, cadenas HTTPS).

**Cours indépendant : Bureautique**
   - Premiers pas en traitement de texte avec Word ou LibreOffice Writer.
   - Organisation des données et formules de base avec Excel ou LibreOffice Calc.
   - Création d'un diaporama avec PowerPoint ou LibreOffice Impress.
   - Enregistrement des documents, raccourcis utiles et export en PDF.

**Évaluation finale du cours Bases de l'ordinateur (Quiz interactif)**
   - 10 questions à choix multiples avec explications immédiates et calcul du score.
   - Déblocage de l'attestation de réussite dès 7/10.

7. **Certificat / Diplôme personnalisé**
   - Attestation officielle avec nom et prénom de l'apprenant, date du jour générée automatiquement et sceau officiel.
   - Bouton d'impression et d'export en PDF adapté pour impression physique.

8. **Glossaire Facile (A-Z)**
   - Recherche en direct pour retrouver la définition simple des termes du quotidien informatique.

9. **Outils d'accessibilité inclus :**
   - Ajustement de la taille du texte (A, A+, A++).
   - Mode sombre (Dark mode) avec mémorisation.
   - Synthèse vocale intégrée (*Web Speech API*) pour écouter la leçon lue à voix haute.
   - Suivi de progression automatique avec sauvegarde locale (*localStorage*).
   - Profil apprenant local : prénom, nom, avatar, progression des modules et dernier score du quiz, enregistrés dans le navigateur sans compte.

---

## 🚀 Comment lancer la plateforme ?

### Méthode 1 : Ouverture directe (Sans installation)
Double-cliquez simplement sur le fichier **`index.html`** pour l'ouvrir dans votre navigateur web préféré (Google Chrome, Firefox, Edge, Safari...).

### Méthode 2 : Avec un serveur local (Optionnel)
Si vous disposez de Python sur votre machine, ouvrez un terminal dans ce dossier et lancez :
```bash
python3 -m http.server 8000
```
Puis ouvrez votre navigateur à l'adresse : [http://localhost:8000](http://localhost:8000).

### Configurer l'inscription et la connexion
L'authentification utilise Supabase. Pour l'activer :

1. Créez un projet Supabase, activez l'authentification par e-mail et mot de passe et laissez activée la confirmation d'adresse e-mail.
2. Dans les paramètres d'authentification Supabase, définissez l'URL du site et autorisez son URL locale (par exemple `http://localhost:8000`) ainsi que l'URL de production.
3. Récupérez l'URL du projet et sa **clé publishable** (ou l'ancienne clé `anon`) dans les paramètres API.
4. Remplacez les deux valeurs vides dans `js/supabase-config.js`.
5. Ouvrez le site avec un serveur HTTP, par exemple `python3 -m http.server 8000`. La connexion ne fonctionne pas en ouvrant directement `index.html` en `file://`.

La page s'affiche sans attendre le chargement du SDK Supabase. La connexion et l'inscription nécessitent toutefois une connexion Internet permettant d'accéder à `unpkg.com` et à votre projet Supabase. Les liens de confirmation reviennent vers l'adresse depuis laquelle l'inscription a été faite : utilisez un serveur local (`http://localhost:8000`), pas `file://`.

Dans **Authentication → URL Configuration** de Supabase, ajoutez l'adresse locale utilisée (par exemple `http://localhost:8000/**`) à **Redirect URLs**. Le lien de confirmation envoyé précédemment peut encore pointer vers l'ancienne adresse ; ouvrez le formulaire de connexion, saisissez la même adresse e-mail et cliquez sur **Renvoyer le lien de confirmation**.

La clé publishable est destinée au navigateur ; ne mettez jamais une clé `service_role` ou une clé secrète dans ce fichier. L'inscription, la connexion, la confirmation d'adresse e-mail, la récupération du mot de passe et la déconnexion sont gérées par Supabase. Pour l'instant, le profil apprenant et la progression restent enregistrés dans le navigateur et ne sont pas synchronisés entre appareils.

### Activer l'approbation par un administrateur
Les nouvelles inscriptions sont en attente par défaut. Pour activer l'espace d'administration :

1. Après avoir configuré Supabase, exécutez le fichier `supabase/migrations/20261112205000_registration_approval.sql` dans le SQL Editor de votre projet.
2. Créez un compte normal avec l'adresse e-mail qui doit devenir administrateur, puis confirmez cette adresse.
3. Dans le SQL Editor Supabase, attribuez le rôle administrateur à ce compte en remplaçant l'adresse dans cette commande :
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict (user_id) do nothing;
   ```
4. Connectez-vous avec ce compte. Le lien **Administration** apparaît dans le menu des formations et permet d'approuver ou de refuser les inscriptions en attente.

Les contrôles de rôle et les décisions d'approbation sont exécutés par les fonctions SQL Supabase et vérifiés côté base de données. Le site étant statique, cette approbation contrôle l'accès aux parcours dans l'interface ; le contenu HTML public ne doit pas servir à protéger des informations confidentielles.

---

## 📁 Structure des fichiers

```
forma/
├── index.html            # Structure HTML sémantique et complète
├── README.md             # Documentation du projet
├── assets/               # Ressources et icônes
├── video/                # Vidéo tutorielle (Comment allumer son PC portable)
├── css/
│   └── style.css         # Design responsive, moderne et accessible
├── js/
│   ├── app.js            # Navigation, suivi de progression, accessibilité, synthèse vocale
│   ├── mouse-trainer.js  # Mini-jeu interactif d'entraînement à la souris
│   ├── keyboard-trainer.js # Atelier clavier interactif & détection des touches
│   ├── file-copy-trainer.js # Exercice simulé de copie de fichiers sous Windows
│   ├── desktop-sim.js    # Simulateur de bureau virtuel avec fenêtres
│   ├── quiz.js           # Moteur du quiz d'évaluation et validation
│   ├── auth.js           # Inscription, connexion et récupération du mot de passe Supabase
│   └── supabase-config.js # URL et clé publique du projet Supabase
└── supabase/
    └── migrations/
        └── 20261112205000_registration_approval.sql # Comptes en attente et fonctions admin sécurisées
```
