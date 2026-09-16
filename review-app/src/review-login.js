import './review-login.css';
import logoUrl from '../../alpha-zone-labs-logo.png?url';

const app = document.querySelector('#app');

app.innerHTML = `
  <section class="auth-shell" aria-labelledby="portal-title">
    <div class="brand-copy">
      <p class="eyebrow">Admin access</p>
      <h1 id="portal-title">Alpha Zone Labs Admin Portal</h1>
      <p>Sign in with an approved Google account to send review requests and moderate customer submissions.</p>
    </div>

    <div class="auth-content">
      <div class="logo-panel" aria-hidden="true">
        <img class="brand-logo" src="${logoUrl}" alt="" />
      </div>

      <div class="signin-panel">
        <div class="signin-card">
          <p class="eyebrow">Authorized access only</p>
          <h2>Sign in</h2>
          <p class="signin-intro">Use a Google account that has been added to the admin allowlist.</p>
          <div id="google-signin" class="google-signin" aria-live="polite"></div>
          <button id="local-dev-login" type="button" hidden>Use local development login</button>
          <p id="auth-status" class="auth-status" role="status"></p>
        </div>
      </div>
    </div>
  </section>
`;

const statusElement = document.querySelector('#auth-status');
const buttonHost = document.querySelector('#google-signin');
const localLoginButton = document.querySelector('#local-dev-login');

function setStatus(message, type = '') {
  statusElement.textContent = message;
  statusElement.dataset.type = type;
}

async function loadGoogleScript() {
  if (window.google?.accounts?.id) return;

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });
}

async function handleCredential(response) {
  setStatus('Verifying your Google account…');

  try {
    const result = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const payload = await result.json().catch(() => ({}));
    if (!result.ok) throw new Error(payload.error || 'Sign-in was not approved.');

    setStatus('Access approved. Redirecting…', 'success');
    window.location.assign('/dashboard.html');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Unable to sign in.', 'error');
  }
}

async function initializeGoogleSignIn() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    localLoginButton.hidden = false;
    localLoginButton.addEventListener('click', async () => {
      localLoginButton.disabled = true;
      try {
        const response = await fetch('/api/auth/local-dev', { method: 'POST', credentials: 'include' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Local authentication is disabled.');
        window.location.assign('/dashboard.html');
      } catch (error) {
        localLoginButton.disabled = false;
        setStatus(error instanceof Error ? error.message : 'Unable to use local authentication.', 'error');
      }
    });
  }
  try {
    const configResponse = await fetch('/api/auth/config', { credentials: 'include' });
    const config = await configResponse.json().catch(() => ({}));
    if (!configResponse.ok || !config.clientId) {
      throw new Error(config.error || 'Google authentication is not configured yet.');
    }

    await loadGoogleScript();
    window.google.accounts.id.initialize({
      client_id: config.clientId,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(buttonHost, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: Math.min(340, buttonHost.clientWidth || 340),
      logo_alignment: 'left',
    });
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Unable to load Google sign-in.', 'error');
  }
}

initializeGoogleSignIn();
