/* ===================================================================
   Atelier Interactif : Entraînement au Clavier
   Disposition AZERTY adaptée avec mise en valeur des touches pressées
   =================================================================== */

class KeyboardTrainer {
  constructor() {
    this.container = document.getElementById('keyboard-container');
    this.textPrompt = document.getElementById('typing-target');
    this.typingInput = document.getElementById('typing-input');
    this.feedback = document.getElementById('typing-feedback');
    this.keyPressDisplay = document.getElementById('active-key-name');

    this.sentences = [
      "bonjour",
      "ordinateur",
      "clavier et souris",
      "apprendre l'informatique",
      "bravo vous reussissez !"
    ];
    this.currentIndex = 0;

    this.init();
  }

  init() {
    if (!this.typingInput || !this.textPrompt) return;

    this.loadSentence();
    this.setupListeners();
  }

  loadSentence() {
    this.textPrompt.textContent = this.sentences[this.currentIndex];
    this.typingInput.value = '';
    this.feedback.textContent = 'Tapez le texte ci-dessus dans la zone ci-dessous.';
    this.feedback.className = 'quiz-feedback show';
    this.feedback.style.color = 'var(--text-muted)';
  }

  setupListeners() {
    this.typingInput.addEventListener('input', (e) => {
      const val = this.typingInput.value;
      const target = this.sentences[this.currentIndex];

      if (val === target) {
        this.feedback.textContent = "✨ Excellent ! Vous avez correctement tapé cette phrase.";
        this.feedback.className = 'quiz-feedback show success';
        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % this.sentences.length;
          this.loadSentence();
        }, 1500);
      } else if (target.startsWith(val)) {
        this.feedback.textContent = "👍 En bonne voie, continuez !";
        this.feedback.className = 'quiz-feedback show';
        this.feedback.style.color = 'var(--primary)';
      } else {
        this.feedback.textContent = "⚠️ Une erreur de frappe. Utilisez la touche 'Effacer' (Retour arrière) pour corriger.";
        this.feedback.className = 'quiz-feedback show error';
      }
    });

    // Écoute des touches pour illuminer le clavier virtuel
    window.addEventListener('keydown', (e) => {
      this.highlightKey(e.key.toUpperCase(), true);
      if (this.keyPressDisplay) {
        let name = e.key;
        if (e.key === ' ') name = 'Espace';
        if (e.key === 'Backspace') name = 'Effacer (Retour arrière)';
        if (e.key === 'Enter') name = 'Entrée';
        this.keyPressDisplay.textContent = `Touche appuyée : ${name}`;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.highlightKey(e.key.toUpperCase(), false);
    });
  }

  highlightKey(keyChar, isPressed) {
    const keyElements = document.querySelectorAll('.key-cap');
    keyElements.forEach((el) => {
      const keyVal = el.getAttribute('data-key');
      if (keyVal && (keyVal.toUpperCase() === keyChar || (keyChar === ' ' && keyVal === 'SPACE'))) {
        if (isPressed) {
          el.classList.add('pressed');
        } else {
          el.classList.remove('pressed');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KeyboardTrainer();
});
