/* ===================================================================
   Application Principale : Navigation, Accessibilité, État & Certificat
   =================================================================== */

class App {
  constructor() {
    this.currentSection = 'home';
    this.completedModules = JSON.parse(localStorage.getItem('infodebutant_completed') || '[]');
    this.profile = JSON.parse(localStorage.getItem('infodebutant_profile') || '{"firstName":"","lastName":"","avatar":"🙂"}');
    this.quizScore = JSON.parse(localStorage.getItem('infodebutant_quiz_score') || 'null');
    this.baseCourseModules = ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'quiz'];
    this.totalModules = this.baseCourseModules.length;
    
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
    window.addEventListener('registration-state-changed', (event) => {
      this.renderAccountStatus(event.detail);
      const currentSection = document.getElementById(`section-${this.currentSection}`);
      const currentCourse = currentSection?.dataset.course;
      if (!event.detail.isAdmin && event.detail.status !== 'approved' && currentCourse) {
        this.navigateTo('home');
      }

      if (event.detail.status === 'approved' || event.detail.isAdmin) {
        const pendingTarget = window.pendingCourseTarget;
        window.pendingCourseTarget = '';
        if (pendingTarget) this.navigateTo(pendingTarget);
      } else if (event.detail.status === 'pending' || event.detail.status === 'pending-email' ||
          event.detail.status === 'rejected') {
        window.pendingCourseTarget = '';
      } else if (event.detail.status === 'signed-out' && window.pendingCourseTarget) {
        window.dispatchEvent(new Event('request-authentication'));
      }
    });

    window.addEventListener('course-access-denied', (event) => {
      const state = window.registrationState || {};
      if (state.status === 'signed-out' || state.status === 'loading') {
        window.dispatchEvent(new Event('request-authentication'));
      }
      this.renderAccountStatus({ ...state, message: event.detail.message });
    });

    // Liens sidebar et liens d'action
    document.querySelectorAll('[data-target-section]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target-section');
        this.navigateTo(target);

        // Fermer le menu mobile si ouvert
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && link.closest('.sidebar') && sidebar.classList.contains('open')) {
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
    const previousSection = this.currentSection;
    const registrationState = window.registrationState || { status: 'loading', isAdmin: false };
    const requiredCourse = targetSection.dataset.course;
    const isAdmin = registrationState.isAdmin === true;
    const isAllowed = requiredCourse === 'admin'
      ? isAdmin
      : !requiredCourse || requiredCourse === 'shared' || isAdmin || registrationState.status === 'approved';

    if (!isAllowed) {
      window.pendingCourseTarget = requiredCourse === 'admin' ? '' : sectionId;
      const messages = {
        loading: 'Vérification de votre inscription en cours. Veuillez réessayer dans un instant.',
        'signed-out': 'Connectez-vous pour accéder aux cours.',
        'pending-email': 'Confirmez votre adresse e-mail avant que votre inscription puisse être examinée.',
        pending: 'Votre inscription est en attente d’approbation par un administrateur.',
        rejected: 'Votre inscription n’a pas été approuvée. Contactez l’administrateur.',
        error: 'Impossible de vérifier l’état de votre inscription. Réessayez plus tard.'
      };
      const message = requiredCourse === 'admin'
        ? 'L’accès à l’administration est réservé aux administrateurs.'
        : messages[registrationState.status] || messages.error;
      window.dispatchEvent(new CustomEvent('course-access-denied', { detail: { message } }));
      if (this.currentSection !== 'home') this.navigateTo('home', updateHash);
      return;
    }

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

    const appLayout = document.querySelector('.app-layout');
    const course = targetSection.dataset.course ||
      (sectionId === 'certificat' ? 'base' : sectionId === 'glossaire' ? 'shared' : '');
    if (appLayout) {
      appLayout.classList.toggle('home-view', sectionId === 'home');
      appLayout.dataset.currentCourse = course;
    }
    document.body.classList.toggle('home-page', sectionId === 'home');
    const sidebar = document.querySelector('.sidebar');
    if (sectionId !== 'home' && previousSection === 'home' &&
        window.matchMedia('(max-width: 900px)').matches && sidebar) {
      sidebar.classList.add('open');
    }

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

    if (sectionId === 'admin') {
      window.dispatchEvent(new Event('admin-section-open'));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderAccountStatus(state) {
    const banner = document.getElementById('account-status-banner');
    const title = document.getElementById('account-status-title');
    const messageElement = document.getElementById('account-status-message');
    const actions = document.getElementById('account-status-actions');
    if (!banner || !title || !messageElement || !actions) return;

    const statuses = {
      loading: {
        title: 'Vérification de votre inscription',
        message: 'Veuillez patienter pendant la vérification de votre compte.'
      },
      'pending-email': {
        title: 'Adresse e-mail à confirmer',
        message: 'Confirmez votre adresse e-mail pour que l’administrateur puisse examiner votre demande.'
      },
      pending: {
        title: 'Demande en attente',
        message: 'Votre adresse est confirmée. Un administrateur doit encore approuver votre accès aux formations.'
      },
      approved: {
        title: state.isAdmin ? 'Accès administrateur actif' : 'Compte approuvé',
        message: 'Votre compte est approuvé. Vous pouvez accéder aux formations.'
      },
      rejected: {
        title: 'Inscription non approuvée',
        message: 'Votre compte n’a pas été approuvé. Contactez l’administrateur si vous pensez qu’il s’agit d’une erreur.'
      },
      error: {
        title: 'Vérification impossible',
        message: 'Impossible de vérifier l’état de votre inscription. Réessayez.'
      },
      'signed-out': {
        title: 'Connexion nécessaire',
        message: 'Connectez-vous pour accéder aux formations.'
      }
    };
    const status = statuses[state.status];
    if (!status || (state.status === 'signed-out' && !state.message)) {
      banner.hidden = true;
      actions.replaceChildren();
      return;
    }

    title.textContent = status.title;
    messageElement.textContent = state.message || status.message;
    banner.hidden = false;
    banner.classList.toggle('error', state.status === 'rejected' || state.status === 'error');
    banner.classList.toggle('success', state.status === 'approved');
    actions.replaceChildren();

    if (state.status === 'pending-email') {
      const resendButton = document.createElement('button');
      resendButton.className = 'btn btn-outline btn-sm';
      resendButton.type = 'button';
      resendButton.textContent = 'Renvoyer le lien de confirmation';
      resendButton.addEventListener('click', () => {
        window.dispatchEvent(new Event('request-email-confirmation'));
      });
      actions.append(resendButton);
    } else if (state.status === 'approved') {
      const coursesButton = document.createElement('button');
      coursesButton.className = 'btn btn-primary btn-sm';
      coursesButton.type = 'button';
      coursesButton.textContent = 'Voir les formations';
      coursesButton.addEventListener('click', () => this.navigateTo('cours-bases'));
      actions.append(coursesButton);
    } else if (state.status === 'signed-out') {
      const signInButton = document.createElement('button');
      signInButton.className = 'btn btn-primary btn-sm';
      signInButton.type = 'button';
      signInButton.textContent = 'Se connecter';
      signInButton.addEventListener('click', () => {
        window.dispatchEvent(new Event('request-authentication'));
      });
      actions.append(signInButton);
    } else {
      const refreshButton = document.createElement('button');
      refreshButton.className = 'btn btn-outline btn-sm';
      refreshButton.type = 'button';
      refreshButton.textContent = 'Actualiser mon statut';
      refreshButton.addEventListener('click', () => {
        window.dispatchEvent(new Event('refresh-registration-state'));
      });
      actions.append(refreshButton);
    }
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
    const completedBaseModules = this.baseCourseModules.filter((moduleId) => this.completedModules.includes(moduleId));
    const percent = Math.round((completedBaseModules.length / this.totalModules) * 100);
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
    const completedCount = this.baseCourseModules.filter((moduleId) => this.completedModules.includes(moduleId)).length;
    const percent = Math.round((completedCount / this.totalModules) * 100);
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
