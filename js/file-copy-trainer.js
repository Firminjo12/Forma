/* ===================================================================
   Atelier pratique : copier-coller un fichier sous Windows
   =================================================================== */

class FileCopyTrainer {
  constructor() {
    this.practice = document.getElementById('file-copy-practice');
    this.source = document.getElementById('file-copy-source');
    this.copyButton = document.getElementById('file-copy-copy');
    this.pasteButton = document.getElementById('file-copy-paste');
    this.resetButton = document.getElementById('file-copy-reset');
    this.destination = document.getElementById('file-copy-destination');
    this.feedback = document.getElementById('file-copy-feedback');
    this.isSelected = false;
    this.isCopied = false;

    if (this.practice && this.source && this.copyButton && this.pasteButton &&
        this.resetButton && this.destination && this.feedback) {
      this.setupListeners();
    }
  }

  setupListeners() {
    this.source.addEventListener('click', () => {
      this.isSelected = true;
      this.source.classList.add('selected');
      this.source.setAttribute('aria-pressed', 'true');
      this.copyButton.disabled = false;
      this.setFeedback('Fichier sélectionné. Cliquez sur « Copier » ou appuyez sur Ctrl + C.');
    });

    this.copyButton.addEventListener('click', () => this.copyFile());
    this.pasteButton.addEventListener('click', () => this.pasteFile());
    this.resetButton.addEventListener('click', () => this.reset());

    this.practice.addEventListener('keydown', (event) => {
      if (!event.ctrlKey || event.altKey || event.metaKey) return;

      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'v') {
        event.preventDefault();
        if (key === 'c') {
          this.copyFile();
        } else {
          this.pasteFile();
        }
      }
    });
  }

  copyFile() {
    if (!this.isSelected) {
      this.setFeedback('Sélectionnez d’abord le fichier à copier.', 'error');
      return;
    }

    this.isCopied = true;
    this.pasteButton.disabled = false;
    this.setFeedback('Fichier copié. Ouvrez « Mes cours » dans cet exercice, puis collez avec Ctrl + V.');
  }

  pasteFile() {
    if (!this.isCopied) {
      this.setFeedback('Sélectionnez puis copiez le fichier avant de le coller.', 'error');
      return;
    }

    const emptyMessage = this.destination.querySelector('.file-copy-empty');
    if (emptyMessage) emptyMessage.remove();

    const copiedFile = document.createElement('li');
    copiedFile.textContent = '📄 Exercice-Windows.pdf — copie';
    this.destination.append(copiedFile);
    this.setFeedback('Bravo ! Une copie du fichier a été placée dans « Mes cours ». L’original est toujours dans « Téléchargements ».', 'success');
  }

  reset() {
    this.isSelected = false;
    this.isCopied = false;
    this.source.classList.remove('selected');
    this.source.setAttribute('aria-pressed', 'false');
    this.copyButton.disabled = true;
    this.pasteButton.disabled = true;
    this.destination.replaceChildren();

    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'file-copy-empty';
    emptyMessage.textContent = 'Le dossier est vide.';
    this.destination.append(emptyMessage);
    this.setFeedback('Commencez par sélectionner le fichier dans Téléchargements.');
  }

  setFeedback(message, state = '') {
    this.feedback.textContent = message;
    this.feedback.className = `file-copy-feedback${state ? ` ${state}` : ''}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FileCopyTrainer();
});
