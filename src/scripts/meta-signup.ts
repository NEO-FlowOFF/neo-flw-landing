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

type EmbeddedSignupSession = {
  phone_number_id?: string;
  waba_id?: string;
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
      extras: {
        version: 'v4';
      };
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

const button = document.getElementById(
  'btn-meta-signup'
) as HTMLButtonElement | null;
const spinnerHost =
  button?.querySelector<HTMLElement>('[data-spinner-host]') || null;
const spinner = spinnerHost
  ? createSpinner({ container: spinnerHost, size: 18, color: '#ffffff' })
  : null;

const metaAppId = button?.dataset.metaAppId || '';
const metaConfigId = button?.dataset.metaConfigId || '';
const graphApiVersion = button?.dataset.graphApiVersion || '';
let latestEmbeddedSignupSession: EmbeddedSignupSession = {};

const displayNameInput = document.getElementById(
  'display-name-input'
) as HTMLInputElement | null;
const validationError = document.getElementById('validation-error');
if (displayNameInput && validationError) {
  displayNameInput.addEventListener('input', () => {
    validationError.hidden = true;
    validationError.textContent = '';
  });
}

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

function parseEmbeddedSignupSession(data: unknown): EmbeddedSignupSession {
  if (!data || typeof data !== 'object') return {};

  const payload = data as {
    data?: {
      phone_number_id?: unknown;
      waba_id?: unknown;
    };
  };
  const session = payload.data || {};
  const phoneNumberId = String(session.phone_number_id || '').replace(
    /\D/g,
    ''
  );
  const wabaId = String(session.waba_id || '').replace(/\D/g, '');

  return {
    ...(phoneNumberId ? { phone_number_id: phoneNumberId } : {}),
    ...(wabaId ? { waba_id: wabaId } : {}),
  };
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
      grantedScopes:
        authResponse.grantedScopes || authResponse.granted_scopes || '',
      ...latestEmbeddedSignupSession,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || 'embedded_signup_not_confirmed');
  }

  return payload;
}

window.addEventListener('message', (event) => {
  if (
    !/^https:\/\/(www\.)?(facebook|business)\.facebook\.com$/.test(event.origin)
  ) {
    return;
  }

  let data: unknown = event.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return;
    }
  }

  latestEmbeddedSignupSession = {
    ...latestEmbeddedSignupSession,
    ...parseEmbeddedSignupSession(data),
  };
});

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
    setSignupStatus(
      'O SDK da Meta ainda está inicializando. Aguarde 2 segundos e tente novamente.',
      'error'
    );
    return;
  }

  if (!metaConfigId) {
    setSignupStatus(
      'A configuração oficial do Login for Business não foi carregada. Tente novamente em instantes.',
      'error'
    );
    return;
  }

  // Validação do Nome de Exibição (WABA Display Name)
  if (displayNameInput && validationError) {
    const value = displayNameInput.value.trim();

    if (!value) {
      validationError.textContent =
        'Por favor, insira o Nome de Exibição (Display Name) desejado.';
      validationError.hidden = false;
      displayNameInput.focus();
      return;
    }

    const allowedRegex = /^[a-zA-Z0-9 ]+$/;
    if (!allowedRegex.test(value)) {
      validationError.textContent =
        'Use só letras e números, sem caracteres especiais. Ex: Flowoff Agency';
      validationError.hidden = false;
      displayNameInput.focus();
      return;
    }

    if (value === value.toUpperCase() && /[a-zA-Z]/.test(value)) {
      validationError.textContent =
        'Não use apenas letras maiúsculas. Use iniciais maiúsculas. Ex: Flowoff Agency';
      validationError.hidden = false;
      displayNameInput.focus();
      return;
    }

    const lowercaseValue = value.toLowerCase();
    const forbiddenWords = [
      'atendimento',
      'teste',
      'suporte',
      'waba',
      'temp',
      'homologacao',
      'homologação',
      'admin',
      'administrator',
      'wpp',
    ];
    const hasForbidden = forbiddenWords.some((word) =>
      lowercaseValue.includes(word)
    );
    if (hasForbidden) {
      validationError.textContent =
        'O nome não pode conter palavras como "Atendimento", "Teste", etc. Use o nome comercial da sua empresa.';
      validationError.hidden = false;
      displayNameInput.focus();
      return;
    }

    validationError.hidden = true;
    validationError.textContent = '';
  }

  setButtonLoading(true);
  setSignupStatus('Conectando à API oficial da Meta...', 'info');

  window.FB.login(
    function (response) {
      if (response?.authResponse) {
        setSignupStatus(
          'Confirmando vinculação segura com o backend da NEØ FlowOFF...',
          'info'
        );
        confirmEmbeddedSignup(response.authResponse)
          .then(function () {
            setSignupStatus(
              '✓ Conexão concluída com sucesso! Sua conta foi vinculada à infraestrutura soberana.',
              'success'
            );
          })
          .catch(function () {
            setSignupStatus(
              'A autorização foi concedida na Meta, mas aguarda sincronização final com o servidor.',
              'warning'
            );
          })
          .finally(function () {
            setButtonLoading(false);
          });
        return;
      }

      setSignupStatus(
        'O fluxo de autorização da Meta foi fechado ou não concluído.',
        'error'
      );
      setButtonLoading(false);
    },
    {
      config_id: metaConfigId,
      extras: {
        version: 'v4',
      },
      response_type: 'code',
      override_default_response_type: true,
    }
  );
};
