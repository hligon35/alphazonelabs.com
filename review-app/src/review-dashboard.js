import './review-dashboard.css';
import logoUrl from '../../alpha-zone-labs-logo.png?url';

const app = document.querySelector('#app');

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

async function loadSession() {
  try {
    return await api('/api/auth/session');
  } catch {
    window.location.replace('/');
    return null;
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reviewCard(review) {
  const stars = '★'.repeat(Number(review.rating || 0)) + '☆'.repeat(5 - Number(review.rating || 0));
  const pendingActions = review.status === 'pending'
    ? `<div class="review-actions"><button class="approve" data-review-action="approve" data-review-id="${review.id}">Approve & post</button><button class="deny" data-review-action="reject" data-review-id="${review.id}">Reject</button></div>`
    : '';

  return `
    <article class="review-item" data-review-card="${review.id}">
      <div class="review-item__top">
        ${review.image_url ? `<img class="reviewer-image" src="${escapeHtml(review.image_url)}" alt="" loading="lazy">` : ''}
        <div>
          <h3>${escapeHtml(review.customer_name || 'Customer')}</h3>
          <p>${escapeHtml(review.customer_email)}</p>
        </div>
        <span class="status status--${escapeHtml(review.status)}">${escapeHtml(review.status)}</span>
      </div>
      <p class="stars" aria-label="${review.rating} out of 5 stars">${stars}</p>
      <blockquote>${escapeHtml(review.review_text)}</blockquote>
      <p class="review-date">Submitted ${new Date(review.created_at).toLocaleString()}</p>
      ${pendingActions}
    </article>
  `;
}

async function refreshAnalytics() {
  const host = document.querySelector('#analytics-content');
  try {
    const payload = await api('/api/reviews/analytics');
    const summary = payload.summary || {};
    const ratings = payload.ratings || [];
    const invitations = payload.invitations || [];
    const ratingMap = Object.fromEntries(ratings.map((item) => [item.rating, item.count]));
    host.innerHTML = `
      <div class="metric-grid">
        <div class="metric"><span>Total reviews</span><strong>${summary.total || 0}</strong></div>
        <div class="metric"><span>Pending</span><strong>${summary.pending || 0}</strong></div>
        <div class="metric"><span>Published</span><strong>${summary.approved || 0}</strong></div>
        <div class="metric"><span>Average rating</span><strong>${summary.average_rating || '—'} / 5</strong></div>
      </div>
      <div class="analytics-columns">
        <div><h3>Published ratings</h3>${[5, 4, 3, 2, 1].map((rating) => `<div class="bar-row"><span>${rating} stars</span><div class="bar"><i style="width:${Math.min(100, Number(ratingMap[rating] || 0) * 12)}%"></i></div><b>${ratingMap[rating] || 0}</b></div>`).join('')}</div>
        <div><h3>Invitation status</h3><ul class="status-list">${invitations.length ? invitations.map((item) => `<li><span>${escapeHtml(item.status)}</span><b>${item.count}</b></li>`).join('') : '<li><span>No invitations yet</span><b>0</b></li>'}</ul></div>
      </div>`;
  } catch (error) {
    host.innerHTML = `<p class="form-status error">${escapeHtml(error.message)}</p>`;
  }
}

async function refreshReviews() {
  const host = document.querySelector('#reviews-list');
  const count = document.querySelector('#review-count');
  host.innerHTML = '<p class="muted">Loading reviews…</p>';
  try {
    const payload = await api('/api/reviews');
    const reviews = payload.reviews || [];
    count.textContent = `${reviews.length} total`;
    host.innerHTML = reviews.length ? reviews.map(reviewCard).join('') : '<p class="muted">No reviews have been submitted yet.</p>';
  } catch (error) {
    host.innerHTML = `<p class="form-status error">${escapeHtml(error.message)}</p>`;
  }
}

function render(session) {
  app.innerHTML = `
    <header class="portal-header">
      <a href="/dashboard.html" class="portal-brand">
        <img src="${logoUrl}" alt="Alpha Zone Labs" />
        <span>Review Portal</span>
      </a>
      <div class="portal-user">
        <span>${escapeHtml(session.email)}</span>
        <button id="sign-out" type="button" class="secondary-button">Sign out</button>
      </div>
    </header>
    <main class="dashboard-shell">
      <section class="dashboard-intro">
        <p class="eyebrow">Review management</p>
        <h1>Send, approve, and publish reviews.</h1>
        <p>Email a private review link, moderate the response, and publish approved reviews to the Alpha Zone Labs homepage.</p>
      </section>

      <section class="dashboard-grid">
        <article class="dashboard-card request-card">
          <h2>Send a review request</h2>
          <p>Each customer receives a unique link that can only be submitted once.</p>
          <form id="review-request-form">
            <label for="customer-name">Customer name</label>
            <input id="customer-name" name="name" type="text" autocomplete="name" maxlength="120" />
            <label for="customer-email">Customer email</label>
            <input id="customer-email" name="email" type="email" autocomplete="email" maxlength="254" required />
            <button type="submit">Send review email</button>
            <p id="request-status" class="form-status" role="status"></p>
          </form>
        </article>

        <article class="dashboard-card moderation-card">
          <div class="card-heading">
            <div><p class="eyebrow">Moderation queue</p><h2>Customer reviews</h2></div>
            <div class="card-heading__actions"><span id="review-count" class="count-pill">0 total</span><button id="refresh-reviews" type="button" class="secondary-button">Refresh</button></div>
          </div>
          <div id="reviews-list" class="reviews-list"></div>
        </article>
      </section>
      <section class="dashboard-card analytics-card">
        <div class="card-heading"><div><p class="eyebrow">Analytics</p><h2>Review performance</h2></div><button id="refresh-analytics" type="button" class="secondary-button">Refresh analytics</button></div>
        <div id="analytics-content"><p class="muted">Loading analytics…</p></div>
      </section>
    </main>
  `;

  document.querySelector('#sign-out').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.replace('/');
  });

  document.querySelector('#review-request-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector('#request-status');
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Sending review invitation…';
    try {
      await api('/api/reviews/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      status.className = 'form-status success';
      status.textContent = `Review request sent to ${data.email}.`;
      form.reset();
    } catch (error) {
      status.className = 'form-status error';
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector('#refresh-reviews').addEventListener('click', refreshReviews);
  document.querySelector('#refresh-analytics').addEventListener('click', refreshAnalytics);
  document.querySelector('#reviews-list').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-review-action]');
    if (!button) return;
    button.disabled = true;
    try {
      await api(`/api/reviews/${button.dataset.reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: button.dataset.reviewAction }),
      });
      await refreshReviews();
    } catch (error) {
      window.alert(error.message);
      button.disabled = false;
    }
  });

  refreshReviews();
  refreshAnalytics();
}

loadSession().then((session) => {
  if (session) render(session);
});
