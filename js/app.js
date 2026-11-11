/* ===================================================================
   Application Principale : Navigation, Accessibilité, État & Certificat
   =================================================================== */

class App {
  constructor() {
    this.currentSection = 'home';
    this.completedModules = JSON.parse(localStorage.getItem('infodebutant_completed') || '[]');
    this.profile = JSON.parse(localStorage.getItem('infodebutant_profile') || '{"firstName":"","lastName":"","avatar":"🙂"}');
    this.quizScore = JSON.parse(localStorage.getItem('infodebutant_quiz_score') || 'null');
    this.totalModules = 6; // modules 1 to 5 + quiz
    
    // Synthèse vocale
    this.speechSynth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupProfile();
    this.setupAccessibility();
    this.setupComputerDiagram();
    this.setupGlossary();
    this.setupCertificate();
    this.setupVideos();
    this.updateProgressUI();
  }

  setupVideos() {
    document.querySelectorAll('video').forEach((v) => {
      v.addEventListener('play', () => {
        this.stopSpeaking();
      });
    });
  }

  /* ---------------- Navigation ---------------- */
  setupNavigation() {
    // Liens sidebar et liens d'action
    document.querySelectorAll('[data-target-section]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target-section');
        this.navigateTo(target);

        // Fermer le menu mobile si ouvert
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Bouton menu mobile
    const toggleBtn = document.getElementById('btn-mobile-menu');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Gestion du retour / hash URL éventuel
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) this.navigateTo(hash, false);
    });

    if (window.location.hash) {
      this.navigateTo(window.location.hash.replace('#', ''), false);
    }
  }

  navigateTo(sectionId, updateHash = true) {
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (!targetSection) return;

    // Arrêter la lecture vocale si active
    this.stopSpeaking();

    // Mettre en pause toutes les vidéos en cours de lecture
    document.querySelectorAll('video').forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });

    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    // Afficher la section cible
    targetSection.classList.add('active');
    this.currentSection = sectionId;

    // Mettre à jour l'état actif dans la sidebar
    document.querySelectorAll('.module-link').forEach((link) => {
      if (link.getAttribute('data-target-section') === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (updateHash) {
      window.location.hash = sectionId;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  markCompleted(moduleId) {
    if (!this.completedModules.includes(moduleId)) {
      this.completedModules.push(moduleId);
      localStorage.setItem('infodebutant_completed', JSON.stringify(this.completedModules));
      this.updateProgressUI();
    }
  }

  recordQuizScore(score, total) {
    this.quizScore = { score, total };
    localStorage.setItem('infodebutant_quiz_score', JSON.stringify(this.quizScore));
    this.updateProfileSummary();
  }

  updateProgressUI() {
    const percent = Math.min(100, Math.round((this.completedModules.length / this.totalModules) * 100));
    const progressBar = document.getElementById('global-progress-bar');
    const progressLabel = document.getElementById('global-progress-label');

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}%`;

    // Mettre à jour les badges de statut dans la sidebar
    this.completedModules.forEach((mod) => {
      const link = document.querySelector(`.module-link[data-target-section="${mod}"]`);
      if (link) {
        link.classList.add('completed');
        const status = link.querySelector('.module-status');
        if (status) status.innerHTML = '✓';
      }
    });
    this.updateProfileSummary();
  }

  setupProfile() {
    const dialog = document.getElementById('profile-dialog');
    const form = document.getElementById('profile-form');
    const openButton = document.getElementById('profile-open-btn');
    const closeButton = document.getElementById('profile-close-btn');
    const cancelButton = document.getElementById('profile-cancel-btn');
    const firstNameInput = document.getElementById('profile-first-name');
    const lastNameInput = document.getElementById('profile-last-name');
    const avatarInput = document.getElementById('profile-avatar');

    if (!dialog || !form || !openButton || !closeButton || !cancelButton ||
        !firstNameInput || !lastNameInput || !avatarInput) return;

    firstNameInput.value = this.profile.firstName || '';
    lastNameInput.value = this.profile.lastName || '';
    avatarInput.value = this.profile.avatar || '🙂';
    this.updateProfileSummary();

    openButton.addEventListener('click', () => {
      firstNameInput.value = this.profile.firstName || '';
      lastNameInput.value = this.profile.lastName || '';
      avatarInput.value = this.profile.avatar || '🙂';
      dialog.showModal();
    });
    closeButton.addEventListener('click', () => dialog.close());
    cancelButton.addEventListener('click', () => dialog.close());

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.profile = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        avatar: avatarInput.value
      };
      localStorage.setItem('infodebutant_profile', JSON.stringify(this.profile));
      this.updateProfileSummary();

      const certificateNameInput = document.getElementById('certif-name-input');
      if (certificateNameInput) {
        certificateNameInput.value = `${this.profile.firstName} ${this.profile.lastName}`.trim();
        certificateNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      dialog.close();
    });
  }

  updateProfileSummary() {
    const avatar = document.getElementById('profile-nav-avatar');
    const name = document.getElementById('profile-nav-name');
    const progress = document.getElementById('profile-progress-value');
    const score = document.getElementById('profile-quiz-score');
    const completedCount = Math.min(this.completedModules.length, this.totalModules);
    const percent = Math.min(100, Math.round((completedCount / this.totalModules) * 100));
    const fullName = `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();

    if (avatar) avatar.textContent = this.profile.avatar || '🙂';
    if (name) name.textContent = fullName || 'Mon profil';
    if (progress) progress.textContent = `${percent} % (${completedCount} / ${this.totalModules} modules)`;
    if (score) {
      score.textContent = this.quizScore
        ? `${this.quizScore.score} / ${this.quizScore.total}`
        : 'Pas encore de score';
    }
  }

  /* ---------------- Accessibilité ---------------- */
  setupAccessibility() {
    // Agrandissement police
    const fontNormal = document.getElementById('btn-font-normal');
    const fontLarge = document.getElementById('btn-font-large');
    const fontXLarge = document.getElementById('btn-font-xlarge');

    if (fontNormal) {
      fontNormal.addEventListener('click', () => {
        document.body.classList.remove('font-large', 'font-xlarge');
        this.updateFontBtnActive(fontNormal);
      });
    }
    if (fontLarge) {
      fontLarge.addEventListener('click', () => {
        document.body.classList.remove('font-xlarge');
        document.body.classList.add('font-large');
        this.updateFontBtnActive(fontLarge);
      });
    }
    if (fontXLarge) {
      fontXLarge.addEventListener('click', () => {
        document.body.classList.remove('font-large');
        document.body.classList.add('font-xlarge');
        this.updateFontBtnActive(fontXLarge);
      });
    }

    // Mode Sombre
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      const isDark = localStorage.getItem('infodebutant_theme') === 'dark';
      if (isDark) {
        document.body.classList.add('dark-mode');
        themeBtn.textContent = '☀️ Thème clair';
      }

      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const active = document.body.classList.contains('dark-mode');
        localStorage.setItem('infodebutant_theme', active ? 'dark' : 'light');
        themeBtn.textContent = active ? '☀️ Thème clair' : '🌙 Thème sombre';
      });
    }

    // Synthèse Vocale (Lecture à voix haute)
    document.querySelectorAll('.read-aloud-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetContainer = btn.closest('.content-section');
        if (this.isSpeaking) {
          this.stopSpeaking();
          btn.classList.remove('playing');
          btn.innerHTML = '🔊 Écouter la leçon';
        } else {
          this.readSectionAloud(targetContainer, btn);
        }
      });
    });
  }

  updateFontBtnActive(activeBtn) {
    document.querySelectorAll('.btn-font-size').forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  readSectionAloud(container, btn) {
    if (!this.speechSynth) {
      alert("Votre navigateur ne prend pas en charge la lecture vocale.");
      return;
    }

    this.stopSpeaking();

    // Extraire le texte des paragraphes et titres
    const texts = Array.from(container.querySelectorAll('h1, h2, h3, p, .callout-content p'))
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0)
      .join('. ');

    this.currentUtterance = new SpeechSynthesisUtterance(texts);
    this.currentUtterance.lang = 'fr-FR';
    this.currentUtterance.rate = 0.95; // Légèrement plus lent pour une meilleure compréhension

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      btn.classList.add('playing');
      btn.innerHTML = '⏹️ Arrêter la lecture';
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      btn.classList.remove('playing');
      btn.innerHTML = '🔊 Écouter la leçon';
    };

    this.currentUtterance.onerror = () => {
      this.isSpeaking = false;
      btn.classList.remove('playing');
      btn.innerHTML = '🔊 Écouter la leçon';
    };

    this.speechSynth.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.speechSynth && this.isSpeaking) {
      this.speechSynth.cancel();
      this.isSpeaking = false;
      document.querySelectorAll('.read-aloud-btn').forEach((b) => {
        b.classList.remove('playing');
        b.innerHTML = '🔊 Écouter la leçon';
      });
    }
  }

  /* ---------------- Schéma Interactif Composants ---------------- */
  setupComputerDiagram() {
    const data = {
      ecran: {
        title: "🖥️ L'Écran (Le Moniteur)",
        role: "Périphérique d'affichage",
        desc: "C'est la fenêtre visuelle de votre ordinateur. Il affiche en temps réel les images, les textes, les vidéos et les logiciels que vous utilisez. Sa taille se mesure en pouces (ex: 24 pouces)."
      },
      tour: {
        title: "📦 L'Unité Centrale (Le Boîtier)",
        role: "Le cœur de la machine",
        desc: "C'est la boîte qui renferme tous les composants électroniques indispensables : le processeur, la mémoire vive (RAM), le disque de stockage et l'alimentation. Sur un ordinateur portable, tout cela est intégré sous le clavier."
      },
      souris: {
        title: "🖱️ La Souris (ou Pavé tactile)",
        role: "Périphérique de pointage",
        desc: "Elle permet de diriger le curseur (la petite flèche blanche à l'écran), de cliquer sur des boutons, de sélectionner des éléments et de faire défiler des pages grâce à la molette."
      },
      clavier: {
        title: "⌨️ Le Clavier",
        role: "Périphérique de saisie de texte",
        desc: "Composé de lettres, de chiffres et de touches spéciales, il sert à taper du texte, renseigner des mots de passe et utiliser des raccourcis pratiques (comme copier ou coller)."
      },
      cpu: {
        title: "🧠 Le Processeur (CPU)",
        role: "Le Cerveau électronique",
        desc: "Il exécute des milliards d'opérations et de calculs par seconde. C'est lui qui fait tourner le système et ouvre vos logiciels le plus vite possible."
      },
      ram: {
        title: "⚡ La Mémoire Vive (RAM)",
        role: "La Mémoire à court terme",
        desc: "Elle stocke temporairement les informations des programmes actuellement ouverts pour un accès ultra-rapide. Quand on éteint l'ordinateur, cette mémoire se vide complètement."
      },
      stockage: {
        title: "💽 Le Disque Dur / Disque SSD",
        role: "La Mémoire à long terme (L'armoire de rangement)",
        desc: "C'est ici que sont conservés tous vos souvenirs : photos, documents, musiques et le système Windows/Mac. Contrairement à la RAM, les données y restent gravées même quand l'ordinateur est éteint."
      }
    };

    const tabButtons = document.querySelectorAll('.diagram-tab-btn');
    const displayArea = document.getElementById('diagram-detail-view');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-component');
        const comp = data[key];

        if (comp && displayArea) {
          displayArea.innerHTML = `
            <div class="component-detail">
              <h3>${comp.title}</h3>
              <span class="role">${comp.role}</span>
              <p>${comp.desc}</p>
            </div>
          `;
        }
      });
    });
  }

  /* ---------------- Glossaire ---------------- */
  setupGlossary() {
    const searchInput = document.getElementById('glossary-search-input');
    const items = document.querySelectorAll('.glossary-item');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        items.forEach((item) => {
          const text = item.innerText.toLowerCase();
          if (text.includes(query)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
  }

  /* ---------------- Certificat ---------------- */
  setupCertificate() {
    const nameInput = document.getElementById('certif-name-input');
    const certifName = document.getElementById('certif-recipient-name');
    const certifDate = document.getElementById('certif-date-display');
    const printBtn = document.getElementById('btn-print-certificate');

    // Date du jour en français
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('fr-FR', options);

    if (certifDate) {
      certifDate.textContent = `Délivré le ${formattedDate}`;
    }

    if (nameInput && certifName) {
      nameInput.value = `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
      certifName.textContent = nameInput.value || 'Votre Nom et Prénom';
      nameInput.addEventListener('input', (e) => {
        certifName.textContent = e.target.value.trim() || 'Votre Nom et Prénom';
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
}

// Initialisation globale
window.addEventListener('DOMContentLoaded', () => {
  window.appState = new App();
});
