# InfoDébutant - Plateforme de Formation aux Bases de l'Ordinateur

Une plateforme web éducative, accessible, interactive et moderne conçue pour les grands débutants et les personnes souhaitant apprendre à utiliser un ordinateur pas à pas.

---

## 🎯 Fonctionnalités et Contenus

La plateforme est articulée autour de **5 modules thématiques**, d'ateliers pratiques interactifs, d'un quiz d'évaluation et d'un générateur de certificat :

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

6. **Évaluation Finale (Quiz interactif)**
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

---

## 📁 Structure des fichiers

```
forma/
├── index.html            # Structure HTML sémantique et complète
├── README.md             # Documentation du projet
├── video/                # Vidéo tutorielle (Comment allumer son PC portable)
├── css/
│   └── style.css         # Design responsive, moderne et accessible
├── js/
│   ├── app.js            # Navigation, suivi de progression, accessibilité, synthèse vocale
│   ├── mouse-trainer.js  # Mini-jeu interactif d'entraînement à la souris
│   ├── keyboard-trainer.js # Atelier clavier interactif & détection des touches
│   ├── file-copy-trainer.js # Exercice simulé de copie de fichiers sous Windows
│   ├── desktop-sim.js    # Simulateur de bureau virtuel avec fenêtres
│   └── quiz.js           # Moteur du quiz d'évaluation et validation
└── assets/               # Ressources et icônes
```
