import { createSpinner } from '../lib/spinner';

type SignupTone = 'info' | 'success' | 'warning' | 'error';

type MetaAuthResponse = {
  code?: string;
  grantedScopes?: string;
  granted_scopes?: string;
};

type MetaLoginResponse = {
  authResponse?: MetaAuthResponse;
};

type MetaSdk = {
  init(options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: MetaLoginResponse) => void,
    options: {
      config_id: string;
      override_default_response_type: true;
      response_type: 'code';
    }
  ): void;
};

declare global {
  interface Window {
    FB?: MetaSdk;
    fbAsyncInit?: () => void;
    launchWhatsAppSignup?: () => void;
  }
}

const button = document.getElementById('btn-meta-signup') as HTMLButtonElement | null;
const spinnerHost = button?.querySelector<HTMLElement>('[data-spinner-host]') || null;
const spinner = spinnerHost
  ? createSpinner({ container: spinnerHost, size: 18, color: '#ffffff' })
  : null;

const metaAppId = button?.dataset.metaAppId || '';
const metaConfigId = button?.dataset.metaConfigId || '';
const graphApiVersion = button?.dataset.graphApiVersion || '';

function setSignupStatus(message: string, tone: SignupTone = 'info') {
  const statusDiv = document.getElementById('signup-status');
  if (!statusDiv) return;
  statusDiv.hidden = false;
  statusDiv.className = `status-box ${tone}`;
  statusDiv.textContent = message;
}

function setButtonLoading(isLoading: boolean) {
  if (!button) return;

  if (isLoading) {
    button.setAttribute('disabled', 'disabled');
    spinnerHost?.classList.add('is-active');
    spinner?.mount();
    return;
  }

  button.removeAttribute('disabled');
  spinner?.unmount();
  spinnerHost?.classList.remove('is-active');
}

async function confirmEmbeddedSignup(authResponse: MetaAuthResponse) {
  const code = authResponse?.code;
  if (!code) {
    throw new Error('missing_authorization_code');
  }

  const response = await fetch('/api/meta/embedded-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      grantedScopes: authResponse.grantedScopes || authResponse.granted_scopes || '',
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || 'embedded_signup_not_confirmed');
  }

  return payload;
}

window.fbAsyncInit = function () {
  if (!window.FB) return;

  window.FB.init({
    appId: metaAppId,
    cookie: true,
    xfbml: true,
    version: graphApiVersion,
  });
};

window.launchWhatsAppSignup = function () {
  if (!window.FB) {
    setSignupStatus('O SDK da Meta ainda está inicializando. Aguarde 2 segundos e tente novamente.', 'error');
    return;
  }

  if (!metaConfigId) {
    setSignupStatus('A configuração oficial do Login for Business não foi carregada. Tente novamente em instantes.', 'error');
    return;
  }

  setButtonLoading(true);
  setSignupStatus('Conectando à API oficial da Meta...', 'info');

  window.FB.login(
    function (response) {
      if (response?.authResponse) {
        setSignupStatus('Confirmando vinculação segura com o backend da NEØ FlowOFF...', 'info');
        confirmEmbeddedSignup(response.authResponse)
          .then(function () {
            setSignupStatus('✓ Conexão concluída com sucesso! Sua conta foi vinculada à infraestrutura soberana.', 'success');
          })
          .catch(function () {
            setSignupStatus('A autorização foi concedida na Meta, mas aguarda sincronização final com o servidor.', 'warning');
          })
          .finally(function () {
            setButtonLoading(false);
          });
        return;
      }

      setSignupStatus('O fluxo de autorização da Meta foi fechado ou não concluído.', 'error');
      setButtonLoading(false);
    },
    {
      config_id: metaConfigId,
      response_type: 'code',
      override_default_response_type: true,
    }
  );
};
