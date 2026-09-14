import './review-submit.css';
import logoUrl from '../../alpha-zone-labs-logo.png?url';
import emptyStarUrl from '../emptyStar.png?url';
import fullStarUrl from '../fullStar.png?url';

const app = document.querySelector('#app');
const token = new URLSearchParams(window.location.search).get('token') || '';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

function renderError(message) {
  app.innerHTML = `<section class="submit-shell"><img src="${logoUrl}" alt="Alpha Zone Labs" class="submit-logo"><div class="submit-card"><p class="eyebrow">Review request</p><h1>We could not open this link.</h1><p>${escapeHtml(message)}</p></div></section>`;
}

function renderRatingStars() {
  return [1, 2, 3, 4, 5].map((rating) => `
    <button
      class="rating-star"
      type="button"
      role="radio"
      aria-checked="false"
      aria-label="${rating} star${rating === 1 ? '' : 's'}"
      data-rating="${rating}"
    >
      <img src="${emptyStarUrl}" alt="" aria-hidden="true">
    </button>
  `).join('');
}

function initializeRatingSelector(form) {
  const selector = form.querySelector('#rating-selector');
  const input = form.querySelector('#rating-value');
  const status = form.querySelector('#rating-status');
  const stars = [...selector.querySelectorAll('.rating-star')];
  let selectedRating = 0;

  function paint(rating, commit = false) {
    stars.forEach((star) => {
      const value = Number(star.dataset.rating);
      const isFilled = value <= rating;
      star.querySelector('img').src = isFilled ? fullStarUrl : emptyStarUrl;
      star.classList.toggle('is-filled', isFilled);
      if (commit) star.setAttribute('aria-checked', String(value === rating));
    });
  }

  function selectRating(rating) {
    selectedRating = rating;
    input.value = String(rating);
    status.textContent = `${rating} out of 5 stars selected.`;
    paint(rating, true);
  }

  stars.forEach((star, index) => {
    const rating = Number(star.dataset.rating);

    star.addEventListener('pointerenter', () => paint(rating));
    star.addEventListener('focus', () => paint(rating));
    star.addEventListener('click', () => selectRating(rating));

    star.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextIndex = Math.min(stars.length - 1, index + 1);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextIndex = Math.max(0, index - 1);
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = stars.length - 1;
      stars[nextIndex].focus();
      selectRating(Number(stars[nextIndex].dataset.rating));
    });
  });

  selector.addEventListener('pointerleave', () => paint(selectedRating, true));
  selector.addEventListener('focusout', (event) => {
    if (!selector.contains(event.relatedTarget)) paint(selectedRating, true);
  });
}

function renderForm(invitation) {
  app.innerHTML = `
    <section class="submit-shell">
      <img src="${logoUrl}" alt="Alpha Zone Labs" class="submit-logo">
      <div class="submit-card">
        <p class="eyebrow">Alpha Zone Labs</p>
        <h1>Tell us about your experience.</h1>
        <p>Your feedback may be displayed publicly after it is reviewed and approved.</p>
        <form id="review-form">
          <label for="reviewer-name">Name displayed with review</label>
          <input id="reviewer-name" name="name" type="text" maxlength="120" value="${escapeHtml(invitation.name || '')}" required>
          <label for="reviewer-image">Logo or headshot (optional)</label>
          <input id="reviewer-image" name="image" type="file" accept="image/jpeg,image/png,image/webp">
          <p class="field-help">Use a JPG, PNG, or WebP image under 2 MB.</p>
          <fieldset>
            <legend>Overall rating</legend>
            <div id="rating-selector" class="rating-selector" role="radiogroup" aria-label="Overall rating">
              ${renderRatingStars()}
            </div>
            <input id="rating-value" name="rating" type="hidden" value="">
            <p id="rating-status" class="rating-status" aria-live="polite">Select a rating from 1 to 5 stars.</p>
          </fieldset>
          <label for="review-text">Your review</label>
          <textarea id="review-text" name="review" rows="7" maxlength="3000" minlength="10" required></textarea>
          <button type="submit">Submit review</button>
          <p id="submit-status" class="form-status" role="status"></p>
        </form>
      </div>
    </section>
  `;

  const form = document.querySelector('#review-form');
  initializeRatingSelector(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = document.querySelector('#submit-status');
    const ratingValue = form.querySelector('#rating-value').value;

    if (!ratingValue) {
      status.className = 'form-status error';
      status.textContent = 'Select a star rating before submitting.';
      form.querySelector('.rating-star').focus();
      return;
    }

    const data = new FormData(form);
    data.set('rating', String(Number(data.get('rating'))));
    button.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Submitting your review…';

    try {
      const result = await api(`/api/reviews/invitation/${encodeURIComponent(token)}`, {
        method: 'POST',
        body: data,
      });
      form.innerHTML = `<div class="success-panel"><p class="eyebrow">Submitted</p><h2>Thank you for your feedback.</h2><p>${escapeHtml(result.message)}</p></div>`;
    } catch (error) {
      status.className = 'form-status error';
      status.textContent = error.message;
      button.disabled = false;
    }
  });
}

if (!token) {
  renderError('The review token is missing. Please use the complete link from your email.');
} else {
  api(`/api/reviews/invitation/${encodeURIComponent(token)}`)
    .then(({ invitation }) => renderForm(invitation))
    .catch((error) => renderError(error.message));
}
