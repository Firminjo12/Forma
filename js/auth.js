window.registrationState = { status: 'loading', isAdmin: false };

class SupabaseAuth {
  constructor() {
    this.dialog = document.getElementById('auth-dialog');
    this.form = document.getElementById('auth-form');
    this.emailInput = document.getElementById('auth-email');
    this.emailGroup = document.getElementById('auth-email-group');
    this.passwordInput = document.getElementById('auth-password');
    this.passwordLabel = document.getElementById('auth-password-label');
    this.title = document.getElementById('auth-dialog-title');
    this.description = document.getElementById('auth-description');
    this.message = document.getElementById('auth-message');
    this.submitButton = document.getElementById('auth-submit-btn');
    this.modeToggle = document.getElementById('auth-mode-toggle');
    this.resendButton = document.getElementById('auth-resend-btn');
    this.resetButton = document.getElementById('auth-reset-btn');
    this.openButton = document.getElementById('auth-open-btn');
    this.signOutButton = document.getElementById('auth-signout-btn');
    this.closeButton = document.getElementById('auth-close-btn');
    this.adminNavLink = document.getElementById('admin-nav-link');
    this.adminList = document.getElementById('admin-signup-list');
    this.adminFeedback = document.getElementById('admin-feedback');
    this.adminEmptyState = document.getElementById('admin-empty-state');
    this.adminRefreshButton = document.getElementById('admin-refresh-btn');
    this.adminPendingCount = document.getElementById('admin-pending-count');
    this.mode = 'signin';
    this.client = null;
    this.configurationError = 'Le service de connexion est en cours de chargement.';

    this.bindEvents();
    this.bindAdminActions();
    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        this.setMode(button.getAttribute('data-auth-mode') === 'signup' ? 'signup' : 'signin');
        if (!this.client) {
          this.showMessage(this.configurationError, 'error');
        }
        this.dialog.showModal();
        this.emailInput.focus();
      });
    });
    this.initializeClient();
  }

  bindEvents() {
    this.openButton.addEventListener('click', () => {
      if (this.client) {
        this.clearMessage();
      } else {
        this.showMessage(this.configurationError, 'error');
      }
      this.dialog.showModal();
      this.emailInput.focus();
    });

    this.closeButton.addEventListener('click', () => this.dialog.close());
    window.addEventListener('request-authentication', () => {
      if (!this.client) {
        this.setMode('signin');
        this.showMessage(this.configurationError || 'La connexion n’est pas configurée.', 'error');
      } else {
        this.setMode('signin');
      }
      this.dialog.showModal();
      this.emailInput.focus();
    });
    this.modeToggle.addEventListener('click', () => this.setMode(this.mode === 'signin' ? 'signup' : 'signin'));
    this.resendButton.addEventListener('click', () => this.resendConfirmation());
    this.resetButton.addEventListener('click', () => this.resetPassword());
    this.signOutButton.addEventListener('click', () => this.signOut());
    this.form.addEventListener('submit', (event) => this.submit(event));
    window.addEventListener('request-email-confirmation', () => {
      this.setMode('signin');
      this.dialog.showModal();
      this.emailInput.focus();
      this.showMessage('Saisissez votre adresse e-mail, puis utilisez « Renvoyer le lien de confirmation ».');
    });
    window.addEventListener('refresh-registration-state', () => this.refreshRegistrationState());
  }

  initializeClient() {
    const config = window.SUPABASE_CONFIG;
    if (!config || !config.url || !config.publishableKey) {
      this.configurationError = 'La connexion n’est pas encore configurée. Ajoutez l’URL et la clé publique du projet dans js/supabase-config.js.';
      this.publishRegistrationState('error');
      return;
    }

    this.loadSupabaseSdk().then(() => {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('La bibliothèque Supabase est indisponible.');
      }

      this.client = window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      this.configurationError = '';
      this.client.auth.getSession().then(({ data, error }) => {
        if (error) {
          this.publishRegistrationState('error', false, `Impossible de vérifier la session : ${error.message}`);
          return;
        }
        this.syncSession(data.session);
      }).catch((error) => {
        this.publishRegistrationState('error', false, `Impossible de vérifier la session : ${error.message}`);
      });

      this.client.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          this.setMode('update');
          this.dialog.showModal();
          this.passwordInput.focus();
        }
        setTimeout(() => this.syncSession(session), 0);
      });
    }).catch((error) => {
      this.configurationError = `Le service de connexion Supabase n’a pas pu être chargé. Vérifiez votre connexion Internet. (${error.message})`;
      this.publishRegistrationState('error', false, this.configurationError);
    });
  }

  loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Échec du téléchargement depuis unpkg.com.'));
      document.head.appendChild(script);
    });
  }

  async syncSession(session) {
    this.renderSession(session);
    if (!session?.user) {
      this.publishRegistrationState('signed-out');
      return;
    }

    try {
      const { data, error } = await this.client.rpc('get_current_account_state');
      if (error) {
        this.publishRegistrationState('error', false, `Impossible de vérifier l’approbation du compte : ${error.message}`);
        return;
      }
      const account = Array.isArray(data) ? data[0] : data;
      if (!account) {
        this.publishRegistrationState('error', false, 'Le statut du compte est introuvable. Vérifiez que la configuration Supabase est installée.');
        return;
      }
      const isAdmin = account.is_admin === true;
      const status = isAdmin
        ? 'approved'
        : account.email_confirmed
          ? account.approval_status
          : 'pending-email';
      this.publishRegistrationState(status, isAdmin);
    } catch (error) {
      this.publishRegistrationState('error', false, `Impossible de vérifier l’approbation du compte : ${error.message}`);
    }
  }

  async refreshRegistrationState() {
    if (!this.client) {
      this.publishRegistrationState('error', false, this.configurationError || 'La connexion n’est pas configurée.');
      return;
    }

    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) {
        this.publishRegistrationState('error', false, `Impossible de vérifier la session : ${error.message}`);
        return;
      }
      await this.syncSession(data.session);
    } catch (error) {
      this.publishRegistrationState('error', false, `Impossible de vérifier la session : ${error.message}`);
    }
  }

  publishRegistrationState(status, isAdmin = false, message = '') {
    window.registrationState = { status, isAdmin, message };
    if (this.adminNavLink) {
      this.adminNavLink.hidden = !isAdmin;
    }
    window.dispatchEvent(new CustomEvent('registration-state-changed', {
      detail: window.registrationState
    }));
  }

  bindAdminActions() {
    if (!this.adminList || !this.adminRefreshButton) return;

    this.adminRefreshButton.addEventListener('click', () => this.loadPendingSignups());
    this.adminList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-review-status]');
      if (!button) return;
      return this.reviewSignup(button.dataset.userId, button.dataset.reviewStatus);
    });
    window.addEventListener('admin-section-open', () => this.loadPendingSignups());
  }

  async loadPendingSignups() {
    if (!this.client || !window.registrationState.isAdmin) {
      this.showAdminFeedback('Accès réservé à un administrateur connecté.', true);
      return;
    }

    this.adminRefreshButton.disabled = true;
    this.showAdminFeedback('Chargement des demandes…');
    try {
      const { data, error } = await this.client.rpc('list_pending_signups');
      if (error) {
        this.showAdminFeedback(`Impossible de charger les demandes : ${error.message}`, true);
        return;
      }
      const signups = data || [];
      this.renderPendingSignups(signups);
      this.showAdminFeedback(`${signups.length} demande(s) en attente.`);
    } catch (error) {
      this.showAdminFeedback(`Impossible de charger les demandes : ${error.message}`, true);
    } finally {
      this.adminRefreshButton.disabled = false;
    }
  }

  renderPendingSignups(signups) {
    this.adminList.replaceChildren();
    this.adminEmptyState.hidden = signups.length !== 0;
    if (this.adminPendingCount) {
      this.adminPendingCount.textContent = String(signups.length);
      this.adminPendingCount.hidden = false;
      this.adminPendingCount.setAttribute('aria-label', `${signups.length} demande(s) en attente`);
    }

    signups.forEach((signup) => {
      const item = document.createElement('li');
      item.className = 'admin-signup-item';

      const details = document.createElement('div');
      details.className = 'admin-signup-details';
      const email = document.createElement('strong');
      email.textContent = signup.email || 'Adresse e-mail indisponible';
      const date = document.createElement('span');
      const createdAt = new Date(signup.created_at);
      date.textContent = `Inscrit le ${Number.isNaN(createdAt.getTime()) ? 'date inconnue' : createdAt.toLocaleString('fr-FR')}`;
      details.append(email, date);

      const actions = document.createElement('div');
      actions.className = 'admin-signup-actions';
      actions.append(
        this.createReviewButton('Approuver', 'approved', signup.user_id),
        this.createReviewButton('Refuser', 'rejected', signup.user_id)
      );
      item.append(details, actions);
      this.adminList.append(item);
    });
  }

  createReviewButton(label, status, userId) {
    const button = document.createElement('button');
    button.className = status === 'approved' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    button.type = 'button';
    button.dataset.reviewStatus = status;
    button.dataset.userId = userId;
    button.textContent = label;
    return button;
  }

  async reviewSignup(userId, status) {
    if (!this.client || !window.registrationState.isAdmin) {
      this.showAdminFeedback('Accès réservé à un administrateur connecté.', true);
      return;
    }

    if (status === 'rejected' && !window.confirm('Confirmer le refus de cette inscription ? Le compte ne pourra pas accéder aux formations.')) {
      return;
    }

    this.adminList.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
    try {
      const { error } = await this.client.rpc('review_signup', {
        p_user_id: userId,
        p_status: status
      });
      if (error) {
        this.showAdminFeedback(`La décision n’a pas été enregistrée : ${error.message}`, true);
        return;
      }
      this.showAdminFeedback(status === 'approved' ? 'Inscription approuvée.' : 'Inscription refusée.');
      await this.loadPendingSignups();
    } catch (error) {
      this.showAdminFeedback(`La décision n’a pas été enregistrée : ${error.message}`, true);
    } finally {
      this.adminList.querySelectorAll('button').forEach((button) => {
        button.disabled = false;
      });
    }
  }

  showAdminFeedback(message, isError = false) {
    if (!this.adminFeedback) return;
    this.adminFeedback.textContent = message;
    this.adminFeedback.classList.toggle('error', isError);
  }

  setMode(mode) {
    this.mode = mode;
    const isSignUp = mode === 'signup';
    const isUpdate = mode === 'update';
    this.title.textContent = isUpdate ? 'Choisir un nouveau mot de passe' : isSignUp ? 'Créer un compte' : 'Se connecter';
    this.description.textContent = isUpdate
      ? 'Choisissez un nouveau mot de passe d’au moins 8 caractères.'
      : isSignUp
        ? 'Créez un compte avec votre adresse e-mail et un mot de passe d’au moins 8 caractères.'
        : 'Connectez-vous avec votre adresse e-mail et votre mot de passe. Le profil et la progression restent enregistrés dans ce navigateur.';
    this.emailGroup.hidden = isUpdate;
    this.emailInput.required = !isUpdate;
    this.passwordLabel.textContent = isUpdate ? 'Nouveau mot de passe' : 'Mot de passe';
    this.passwordInput.autocomplete = isSignUp || isUpdate ? 'new-password' : 'current-password';
    this.passwordInput.value = '';
    this.submitButton.textContent = isUpdate ? 'Enregistrer le nouveau mot de passe' : isSignUp ? 'Créer mon compte' : 'Se connecter';
    this.modeToggle.hidden = isUpdate;
    this.resendButton.hidden = isSignUp || isUpdate;
    this.modeToggle.textContent = isSignUp ? 'J’ai déjà un compte' : 'Créer un compte';
    this.resetButton.hidden = isSignUp || isUpdate;
    this.clearMessage();
  }

  async submit(event) {
    event.preventDefault();
    if (!this.client) {
      this.showMessage(this.configurationError || 'La connexion n’est pas configurée.', 'error');
      return;
    }

    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;
    const emailRedirectTo = this.getEmailRedirectUrl();
    if (this.mode === 'signup' && !emailRedirectTo) {
      this.showMessage('Pour créer un compte, ouvrez le site avec un serveur local (http://localhost:8000) ou son adresse web, pas directement depuis un fichier.', 'error');
      return;
    }

    this.setBusy(true);

    try {
      const result = this.mode === 'update'
        ? await this.client.auth.updateUser({ password })
        : this.mode === 'signup'
          ? await this.client.auth.signUp({ email, password, options: { emailRedirectTo } })
          : await this.client.auth.signInWithPassword({ email, password });

      if (result.error) {
        if (this.mode === 'signin' && result.error.code === 'email_not_confirmed') {
          this.publishRegistrationState('pending-email');
          this.showMessage('Votre adresse e-mail n’est pas encore confirmée. Renvoyez le lien de confirmation avant de vous connecter.', 'error');
          return;
        }
        this.showMessage(result.error.message, 'error');
        return;
      }

      if (this.mode === 'update') {
        this.setMode('signin');
        this.showMessage('Votre mot de passe a été modifié.', 'success');
        return;
      }

      if (this.mode === 'signup' && !result.data.session) {
        this.setMode('signin');
        this.emailInput.value = email;
        this.passwordInput.value = '';
        this.publishRegistrationState('pending-email');
        this.showMessage('Votre compte a été créé. Consultez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.', 'success');
        return;
      }

      this.showMessage(this.mode === 'signup' ? 'Votre compte est créé et vous êtes connecté.' : 'Connexion réussie.', 'success');
      this.dialog.close();
    } catch (error) {
      this.showMessage(`La demande a échoué : ${error.message}`, 'error');
    } finally {
      this.passwordInput.value = '';
      this.setBusy(false);
    }
  }

  getEmailRedirectUrl() {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return '';

    const redirectUrl = new URL(window.location.href);
    redirectUrl.hash = '';
    redirectUrl.search = '';
    return redirectUrl.toString();
  }

  async resendConfirmation() {
    if (!this.client) {
      this.showMessage(this.configurationError || 'La connexion n’est pas configurée.', 'error');
      return;
    }

    const email = this.emailInput.value.trim();
    if (!email) {
      this.emailInput.focus();
      this.showMessage('Saisissez votre adresse e-mail pour recevoir un nouveau lien de confirmation.', 'error');
      return;
    }

    const emailRedirectTo = this.getEmailRedirectUrl();
    if (!emailRedirectTo) {
      this.showMessage('Ouvrez le site avec un serveur local (http://localhost:8000) ou son adresse web avant de demander un lien.', 'error');
      return;
    }

    this.setBusy(true);
    try {
      const { error } = await this.client.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo }
      });
      if (error) {
        this.showMessage(`Impossible de renvoyer le lien : ${error.message}`, 'error');
        return;
      }
      this.showMessage('Si ce compte attend une confirmation, un nouveau lien va être envoyé à cette adresse.', 'success');
    } catch (error) {
      this.showMessage(`La demande a échoué : ${error.message}`, 'error');
    } finally {
      this.setBusy(false);
    }
  }

  async resetPassword() {
    if (!this.client) {
      this.showMessage(this.configurationError || 'La connexion n’est pas configurée.', 'error');
      return;
    }

    const email = this.emailInput.value.trim();
    if (!email) {
      this.emailInput.focus();
      this.showMessage('Saisissez votre adresse e-mail pour recevoir le lien de réinitialisation.', 'error');
      return;
    }

    const redirectTo = this.getEmailRedirectUrl();
    if (!redirectTo) {
      this.showMessage('Ouvrez le site avec un serveur local (http://localhost:8000) ou son adresse web avant de demander un lien.', 'error');
      return;
    }

    this.setBusy(true);
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) {
        this.showMessage(`Impossible d’envoyer le lien : ${error.message}`, 'error');
        return;
      }
      this.showMessage('Si un compte existe pour cette adresse, un lien de réinitialisation va vous être envoyé.', 'success');
    } catch (error) {
      this.showMessage(`La demande a échoué : ${error.message}`, 'error');
    } finally {
      this.setBusy(false);
    }
  }

  async signOut() {
    if (!this.client) {
      this.showMessage(this.configurationError || 'La connexion n’est pas configurée.', 'error');
      return;
    }

    this.signOutButton.disabled = true;
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        this.reportError(`La déconnexion a échoué : ${error.message}`);
      }
    } catch (error) {
      this.reportError(`La déconnexion a échoué : ${error.message}`);
    } finally {
      this.signOutButton.disabled = false;
    }
  }

  renderSession(session) {
    const signedIn = Boolean(session?.user);
    this.openButton.hidden = signedIn;
    this.signOutButton.hidden = !signedIn;
    this.signOutButton.textContent = 'Déconnexion';
    this.signOutButton.title = signedIn ? `Déconnexion de ${session.user.email}` : '';
  }

  setBusy(isBusy) {
    this.submitButton.disabled = isBusy;
    this.modeToggle.disabled = isBusy;
    this.resendButton.disabled = isBusy;
    this.resetButton.disabled = isBusy;
    this.submitButton.textContent = isBusy ? 'Veuillez patienter…' : this.mode === 'update'
      ? 'Enregistrer le nouveau mot de passe'
      : this.mode === 'signup' ? 'Créer mon compte' : 'Se connecter';
  }

  showMessage(message, type = '') {
    this.message.textContent = message;
    this.message.className = `auth-message${type ? ` ${type}` : ''}`;
  }

  reportError(message) {
    this.showMessage(message, 'error');
    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  }

  clearMessage() {
    this.showMessage('');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SupabaseAuth();
});
