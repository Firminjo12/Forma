/* ===================================================================
   Simulateur de Bureau Virtuel Interactif
   Permet d'expérimenter la navigation d'un système d'exploitation
   =================================================================== */

class DesktopSimulator {
  constructor() {
    this.startBtn = document.getElementById('sim-start-btn');
    this.startMenu = document.getElementById('sim-start-menu');
    this.clockEl = document.getElementById('sim-clock');

    this.init();
  }

  init() {
    this.setupClock();
    this.setupStartMenu();
    this.setupIcons();
    this.setupCalculator();
  }

  setupClock() {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      if (this.clockEl) {
        this.clockEl.textContent = `${hours}:${minutes}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupStartMenu() {
    if (!this.startBtn || !this.startMenu) return;

    this.startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!this.startMenu.contains(e.target) && e.target !== this.startBtn) {
        this.startMenu.classList.remove('open');
      }
    });

    // Bouton éteindre
    const shutdownBtn = document.getElementById('sim-shutdown');
    if (shutdownBtn) {
      shutdownBtn.addEventListener('click', () => {
        this.startMenu.classList.remove('open');
        this.simulateShutdown();
      });
    }
  }

  simulateShutdown() {
    const desktop = document.querySelector('.desktop-simulator');
    if (!desktop) return;

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = '#090d16';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100';
    overlay.innerHTML = `
      <span style="font-size: 3rem; margin-bottom: 1rem;">💤</span>
      <h3>Ordinateur éteint</h3>
      <p style="color: #94a3b8; margin: 0.5rem 0 1.5rem 0;">Vous avez éteint l'ordinateur proprement via le menu Démarrer.</p>
      <button class="btn btn-primary" id="sim-restart-btn">⚡ Rallumer l'ordinateur</button>
    `;

    desktop.appendChild(overlay);

    document.getElementById('sim-restart-btn').addEventListener('click', () => {
      overlay.remove();
    });
  }

  setupIcons() {
    // Boutons d'ouverture de fenêtres
    document.querySelectorAll('[data-open-window]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const winId = btn.getAttribute('data-open-window');
        this.openWindow(winId);
        if (this.startMenu) {
          this.startMenu.classList.remove('open');
        }
      });
    });

    // Boutons de fermeture de fenêtres
    document.querySelectorAll('.sim-window-close').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => {
        const win = closeBtn.closest('.sim-window');
        if (win) {
          win.classList.remove('active');
        }
      });
    });

    // Vider la corbeille
    const emptyTrashBtn = document.getElementById('sim-empty-trash-btn');
    if (emptyTrashBtn) {
      emptyTrashBtn.addEventListener('click', () => {
        const trashContent = document.getElementById('sim-trash-items');
        if (trashContent) {
          trashContent.innerHTML = '<p style="color: #64748b; font-style: italic;">La corbeille est vide.</p>';
        }
      });
    }
  }

  openWindow(winId) {
    const win = document.getElementById(`window-${winId}`);
    if (win) {
      win.classList.add('active');
      // Placer la fenêtre active au-dessus des autres
      document.querySelectorAll('.sim-window').forEach((w) => (w.style.zIndex = '10'));
      win.style.zIndex = '15';
    }
  }

  setupCalculator() {
    const display = document.getElementById('calc-display');
    if (!display) return;

    let currentInput = '0';

    document.querySelectorAll('.calc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'C') {
          currentInput = '0';
        } else if (val === '=') {
          try {
            // Evaluation sécurisée pour simples calculs arithmétiques
            const sanitized = currentInput.replace(/[^0-9+\-*/.]/g, '');
            currentInput = String(Function(`'use strict'; return (${sanitized})`)());
          } catch (e) {
            currentInput = 'Erreur';
          }
        } else {
          if (currentInput === '0' || currentInput === 'Erreur') {
            currentInput = val;
          } else {
            currentInput += val;
          }
        }
        display.textContent = currentInput;
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DesktopSimulator();
});
