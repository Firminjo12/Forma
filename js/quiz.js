/* ===================================================================
   Quiz Interactif d'Évaluation Finale & Certificat
   =================================================================== */

const QUIZ_DATA = [
  {
    question: "1. Quel composant est considéré comme le « cerveau » de l'ordinateur qui effectue les calculs ?",
    options: [
      { text: "L'écran (le moniteur)", correct: false },
      { text: "Le processeur (CPU)", correct: true },
      { text: "La souris", correct: false },
      { text: "Le clavier", correct: false }
    ],
    explanation: "Le processeur (CPU) exécute les instructions et effectue tous les calculs nécessaires au fonctionnement de la machine."
  },
  {
    question: "2. Quelle action effectue-t-on avec la souris pour ouvrir un fichier ou un dossier sur le bureau ?",
    options: [
      { text: "Un clic droit", correct: false },
      { text: "Un simple survol", correct: false },
      { text: "Un double-clic gauche rapide", correct: true },
      { text: "Tourner la molette", correct: false }
    ],
    explanation: "Le double-clic avec le bouton gauche est le geste standard pour lancer un programme ou ouvrir un dossier."
  },
  {
    question: "3. Quelle touche du clavier permet de passer à la ligne suivante ou de valider une action ?",
    options: [
      { text: "La touche Échap (Esc)", correct: false },
      { text: "La touche Entrée (Enter)", correct: true },
      { text: "La barre d'espace", correct: false },
      { text: "La touche Contrôle (Ctrl)", correct: false }
    ],
    explanation: "La touche Entrée confirme une action ou renvoie le curseur à la ligne suivante dans un texte."
  },
  {
    question: "4. Qu'est-ce que le « Bureau » d'un ordinateur ?",
    options: [
      { text: "Le meuble en bois sur lequel est posé l'écran", correct: false },
      { text: "L'écran d'accueil principal qui s'affiche après le démarrage", correct: true },
      { text: "Un logiciel payant de traitement de texte", correct: false },
      { text: "Le câble de branchement électrique", correct: false }
    ],
    explanation: "En informatique, le Bureau est l'espace de travail virtuel où se trouvent vos icônes, dossiers et raccourcis."
  },
  {
    question: "5. Si un document porte le nom « recette.pdf », que signifie le « .pdf » ?",
    options: [
      { text: "C'est le mot de passe secret du document", correct: false },
      { text: "C'est l'extension qui indique le format du fichier", correct: true },
      { text: "C'est le nom de la personne qui l'a créé", correct: false },
      { text: "C'est une erreur de l'ordinateur", correct: false }
    ],
    explanation: "L'extension (comme .pdf, .docx, .jpg) indique à l'ordinateur quel type de document c'est et avec quel logiciel l'ouvrir."
  },
  {
    question: "6. Lorsqu'on supprime un fichier, où est-il d'abord envoyé pour pouvoir être récupéré si besoin ?",
    options: [
      { text: "Dans la Corbeille", correct: true },
      { text: "Directement sur Internet", correct: false },
      { text: "Dans le menu Démarrer", correct: false },
      { text: "Dans la mémoire vive (RAM)", correct: false }
    ],
    explanation: "La Corbeille conserve vos fichiers supprimés temporairement au cas où vous souhaiteriez les restaurer."
  },
  {
    question: "7. Parmi ces logiciels, lequel est un navigateur Web qui permet de consulter des sites Internet ?",
    options: [
      { text: "Bloc-notes", correct: false },
      { text: "Google Chrome (ou Mozilla Firefox)", correct: true },
      { text: "Calculatrice", correct: false },
      { text: "Lecteur Windows Media", correct: false }
    ],
    explanation: "Chrome, Firefox, Safari ou Edge sont des navigateurs Web indispensables pour explorer Internet."
  },
  {
    question: "8. Quelle est la bonne pratique pour éteindre correctement son ordinateur ?",
    options: [
      { text: "Débrancher immédiatement la prise électrique du mur", correct: false },
      { text: "Passer par le menu Démarrer et cliquer sur « Éteindre » ou « Arrêter »", correct: true },
      { text: "Fermer brusquement l'écran sans rien sauvegarder", correct: false },
      { text: "Taper sur le clavier", correct: false }
    ],
    explanation: "Passer par le menu Démarrer permet au système de fermer les fichiers ouverts et d'éviter d'endommager les données."
  },
  {
    question: "9. Parmi ces exemples, lequel représente le mot de passe le plus robuste et sécurisé ?",
    options: [
      { text: "123456", correct: false },
      { text: "motdepasse", correct: false },
      { text: "M0n@Chat#2026!", correct: true },
      { text: "azerty", correct: false }
    ],
    explanation: "Un bon mot de passe mélange des majuscules, minuscules, chiffres et symboles spéciaux, et ne doit pas être évident."
  },
  {
    question: "10. Si vous recevez un e-mail alarmiste demandant d'urgence vos identifiants bancaires, que devez-vous faire ?",
    options: [
      { text: "Répondre tout de suite avec les identifiants", correct: false },
      { text: "Cliquer sur tous les liens du message pour vérifier", correct: false },
      { text: "Ne pas cliquer, ne pas répondre et le supprimer (tentative d'hameçonnage / phishing)", correct: true },
      { text: "Transférer l'e-mail à tous vos amis", correct: false }
    ],
    explanation: "Aucune banque ni organisme officiel ne demande vos mots de passe par e-mail. C'est du phishing !"
  }
];

class QuizApp {
  constructor() {
    this.container = document.getElementById('quiz-questions-container');
    this.resultsBanner = document.getElementById('quiz-results');
    this.scoreText = document.getElementById('quiz-score-text');
    this.userScore = 0;
    this.answeredCount = 0;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderQuiz();
  }

  renderQuiz() {
    this.container.innerHTML = '';
    this.userScore = 0;
    this.answeredCount = 0;

    QUIZ_DATA.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.id = `quiz-card-${index}`;

      let optionsHtml = '';
      item.options.forEach((opt, optIndex) => {
        optionsHtml += `
          <div class="quiz-option-label" data-index="${index}" data-opt="${optIndex}">
            <input type="radio" name="question-${index}" id="q${index}-opt${optIndex}">
            <label for="q${index}-opt${optIndex}" style="cursor:pointer; flex:1;">${opt.text}</label>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="quiz-question-title">${item.question}</div>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
        <div class="quiz-feedback" id="feedback-${index}">
          <strong>Explication :</strong> ${item.explanation}
        </div>
      `;

      this.container.appendChild(card);
    });

    this.attachEvents();
  }

  attachEvents() {
    document.querySelectorAll('.quiz-option-label').forEach((label) => {
      label.addEventListener('click', (e) => {
        const qIndex = parseInt(label.getAttribute('data-index'), 10);
        const optIndex = parseInt(label.getAttribute('data-opt'), 10);
        this.handleSelect(qIndex, optIndex, label);
      });
    });
  }

  handleSelect(qIndex, optIndex, selectedElement) {
    const card = document.getElementById(`quiz-card-${qIndex}`);
    if (card.dataset.answered === 'true') return; // Déjà répondu

    card.dataset.answered = 'true';
    this.answeredCount++;

    const isCorrect = QUIZ_DATA[qIndex].options[optIndex].correct;
    const feedback = document.getElementById(`feedback-${qIndex}`);

    // Coloration des options
    const allOptions = card.querySelectorAll('.quiz-option-label');
    allOptions.forEach((optEl, idx) => {
      optEl.style.pointerEvents = 'none';
      if (QUIZ_DATA[qIndex].options[idx].correct) {
        optEl.classList.add('correct');
      }
    });

    if (isCorrect) {
      this.userScore++;
      feedback.classList.add('show', 'success');
      feedback.innerHTML = `✅ <strong>Correct !</strong> ${QUIZ_DATA[qIndex].explanation}`;
    } else {
      selectedElement.classList.add('incorrect');
      feedback.classList.add('show', 'error');
      feedback.innerHTML = `❌ <strong>Incorrect.</strong> ${QUIZ_DATA[qIndex].explanation}`;
    }

    if (this.answeredCount === QUIZ_DATA.length) {
      this.showFinalScore();
    }
  }

  showFinalScore() {
    if (!this.resultsBanner) return;
    this.resultsBanner.classList.add('show');
    this.scoreText.textContent = `Votre score final est de : ${this.userScore} / ${QUIZ_DATA.length}`;
    if (window.appState) {
      window.appState.recordQuizScore(this.userScore, QUIZ_DATA.length);
    }

    const certifLink = document.getElementById('unlock-certif-btn');
    if (this.userScore >= 7) {
      if (certifLink) certifLink.style.display = 'inline-flex';
      // Marquer le module comme complété dans la progression
      if (window.appState) window.appState.markCompleted('quiz');
    } else {
      if (certifLink) certifLink.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});
