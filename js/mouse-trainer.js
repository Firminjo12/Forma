/* ===================================================================
   Atelier Interactif : Entraînement à la Souris
   Niveaux : Clic simple, Double-clic, Glisser-déposer
   =================================================================== */

class MouseTrainer {
  constructor() {
    this.canvas = document.getElementById('mouse-canvas');
    this.scoreDisplay = document.getElementById('mouse-score');
    this.levelSelect = document.getElementById('mouse-level-select');
    this.instruction = document.getElementById('mouse-instruction');
    this.startBtn = document.getElementById('start-mouse-btn');
    
    this.score = 0;
    this.currentLevel = 1; // 1 = Clic, 2 = Double-clic, 3 = Glisser-déposer
    this.isPlaying = false;
    this.spawnTimer = null;
    this.audioCtx = null;

    this.init();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playPopSound(isHigh = false) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigh ? 600 : 440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isHigh ? 900 : 880, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch (e) {
      // Audio fallback silencieux si non disponible
    }
  }

  init() {
    if (!this.canvas || !this.startBtn) return;

    this.startBtn.addEventListener('click', () => {
      this.initAudio();
      this.startGame();
    });

    this.levelSelect.addEventListener('change', (e) => {
      this.currentLevel = parseInt(e.target.value, 10);
      this.resetCanvas();
      this.updateInstructions();
    });

    this.updateInstructions();
  }

  updateInstructions() {
    if (this.currentLevel === 1) {
      this.instruction.textContent = "🎯 Niveau 1 : Cliquez une fois avec le bouton gauche sur chaque cible bleue qui apparaît !";
    } else if (this.currentLevel === 2) {
      this.instruction.textContent = "⚡ Niveau 2 : Faites un double-clic rapide (2 clics successifs) sur les cibles violettes !";
    } else if (this.currentLevel === 3) {
      this.instruction.textContent = "📂 Niveau 3 : Maintenez le clic enfoncé sur le document et faites-le glisser dans le dossier vert !";
    }
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.updateScore();
    this.resetCanvas();
    this.startBtn.textContent = "🔄 Recommencer l'exercice";

    if (this.currentLevel === 1) {
      this.spawnSimpleTarget();
    } else if (this.currentLevel === 2) {
      this.spawnDoubleClickTarget();
    } else if (this.currentLevel === 3) {
      this.setupDragAndDrop();
    }
  }

  resetCanvas() {
    clearInterval(this.spawnTimer);
    this.canvas.innerHTML = '';
  }

  updateScore() {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score : ${this.score} / 5`;
    }
    if (this.score >= 5) {
      this.handleLevelWin();
    }
  }

  handleLevelWin() {
    this.canvas.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #065f46; background: #ecfdf5;">
        <span style="font-size: 3rem;">🎉</span>
        <h3 style="margin: 0.5rem 0;">Bravo, exercice réussi !</h3>
        <p style="color: #047857;">Vous maîtrisez cette compétence à la souris.</p>
      </div>
    `;
    this.playPopSound(true);
  }

  getRandomCoords(elemWidth = 60, elemHeight = 60) {
    const rect = this.canvas.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - elemWidth - 20);
    const maxY = Math.max(0, rect.height - elemHeight - 20);
    const x = Math.floor(Math.random() * maxX) + 10;
    const y = Math.floor(Math.random() * maxY) + 10;
    return { x, y };
  }

  spawnSimpleTarget() {
    if (this.score >= 5) return;
    this.canvas.innerHTML = '';

    const target = document.createElement('div');
    target.className = 'mouse-target';
    const coords = this.getRandomCoords(60, 60);
    target.style.left = `${coords.x}px`;
    target.style.top = `${coords.y}px`;
    target.innerHTML = `<span>👆 Clic</span>`;

    target.addEventListener('click', () => {
      this.playPopSound();
      this.score++;
      this.updateScore();
      if (this.score < 5) {
        this.spawnSimpleTarget();
      }
    });

    this.canvas.appendChild(target);
  }

  spawnDoubleClickTarget() {
    if (this.score >= 5) return;
    this.canvas.innerHTML = '';

    const target = document.createElement('div');
    target.className = 'mouse-target double-click';
    const coords = this.getRandomCoords(65, 65);
    target.style.left = `${coords.x}px`;
    target.style.top = `${coords.y}px`;
    target.innerHTML = `<span>⚡ Double</span>`;

    target.addEventListener('dblclick', () => {
      this.playPopSound(true);
      this.score++;
      this.updateScore();
      if (this.score < 5) {
        this.spawnDoubleClickTarget();
      }
    });

    this.canvas.appendChild(target);
  }

  setupDragAndDrop() {
    this.canvas.innerHTML = '';

    // Zone de dépôt (Dossier vert)
    const dropZone = document.createElement('div');
    dropZone.className = 'drag-target-zone';
    dropZone.innerHTML = `
      <span style="font-size: 2rem;">📁</span>
      <span>Déposez ici</span>
    `;
    this.canvas.appendChild(dropZone);

    // Document à glisser
    const dragItem = document.createElement('div');
    dragItem.className = 'drag-item';
    dragItem.draggable = true;
    dragItem.innerHTML = `📄 Document.txt`;
    dragItem.style.left = '30px';
    dragItem.style.top = '40px';
    this.canvas.appendChild(dragItem);

    dragItem.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'doc');
      dragItem.style.opacity = '0.5';
    });

    dragItem.addEventListener('dragend', () => {
      dragItem.style.opacity = '1';
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      this.playPopSound(true);
      this.score++;
      this.updateScore();

      if (this.score < 5) {
        dragItem.style.left = `${Math.floor(Math.random() * 150) + 20}px`;
        dragItem.style.top = `${Math.floor(Math.random() * 150) + 20}px`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MouseTrainer();
});
