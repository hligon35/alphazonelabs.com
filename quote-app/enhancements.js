(function () {
  'use strict';

  const originalSubmit = HTMLFormElement.prototype.submit;
  let submissionInProgress = false;

  function dispatchResult(type) {
    window.postMessage({ type }, window.location.origin);
  }

  HTMLFormElement.prototype.submit = function patchedSubmit() {
    const actionUrl = new URL(this.action, window.location.href);
    const isQuoteSubmission = actionUrl.pathname === '/api/quotes' && this.target === 'quoteSubmissionFrame';

    if (!isQuoteSubmission) {
      return originalSubmit.call(this);
    }

    if (submissionInProgress) return;
    submissionInProgress = true;

    const form = this;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    const rawPayload = new URLSearchParams(new FormData(form)).get('payload');
    const body = JSON.stringify(rawPayload ? JSON.parse(rawPayload) : {});

    fetch(actionUrl.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body,
      signal: controller.signal,
      keepalive: true
    })
      .then(() => dispatchResult('ALPHA_QUOTE_SUCCESS'))
      .catch(() => {
        submissionInProgress = false;
        dispatchResult('ALPHA_QUOTE_ERROR');
      })
      .finally(() => {
        window.clearTimeout(timeout);
        form.remove();
      });
  };

  const exclusiveValues = {
    offerModels: ['Multiple types'],
    paymentModels: ['No online payments'],
    requiredIntegrations: ['No integrations needed', 'Unsure'],
    migrationTypes: ['No migration needed', 'Unsure'],
    contentAssets: ['Very little is ready'],
    sensitiveData: ['No sensitive information', 'Unsure'],
    compliance: ['No known requirements', 'Unsure'],
    communications: ['No automated communication'],
    reportingNeeds: ['Basic analytics only'],
    supportNeeds: ['No ongoing support', 'Unsure']
  };

  const maxSelections = {
    offerModels: 4,
    customerFeatures: 7,
    ownerFeatures: 7,
    selectedPlatforms: 12,
    problems: 6,
    goals: 6,
    paymentModels: 5,
    requiredIntegrations: 8,
    migrationTypes: 6,
    contentAssets: 9,
    userRoles: 7,
    sensitiveData: 6,
    compliance: 6,
    communications: 7,
    reportingNeeds: 8,
    internalUsers: 6,
    supportNeeds: 7
  };

  function setFormError(message) {
    const error = document.getElementById('errorMessage');
    if (error) error.textContent = message;
  }

  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox' || !input.name) return;

    const group = [...document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(input.name)}"]`)];
    const exclusive = exclusiveValues[input.name] || [];

    if (input.checked && exclusive.includes(input.value)) {
      group.forEach((item) => {
        if (item !== input) item.checked = false;
      });
      setFormError('');
      return;
    }

    if (input.checked && exclusive.length) {
      group.forEach((item) => {
        if (exclusive.includes(item.value)) item.checked = false;
      });
    }

    const max = maxSelections[input.name];
    const selected = group.filter((item) => item.checked);
    if (input.checked && max && selected.length > max) {
      input.checked = false;
      setFormError(`Select no more than ${max} options for this question.`);
      input.focus();
      return;
    }

    setFormError('');
  });
})();