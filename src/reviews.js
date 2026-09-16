const REVIEWS_ENDPOINT = 'https://admin.alphazonelabs.com/api/reviews/published';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating || 5)));
  return `
    <article class="published-review-card">
      <div class="published-review-card__identity">${review.image_url ? `<img src="${escapeHtml(review.image_url)}" alt="" loading="lazy">` : '<span class="published-review-card__avatar" aria-hidden="true"></span>'}<strong>${escapeHtml(review.customer_name || 'Alpha Zone Labs customer')}</strong></div>
      <p class="published-review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>
      <blockquote>“${escapeHtml(review.review_text)}”</blockquote>
    </article>
  `;
}

export async function renderPublishedReviews() {
  if (!document.body.classList.contains('page-home')) return;
  const footer = document.querySelector('.footer');
  if (!footer) return;

  try {
    const response = await fetch(REVIEWS_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    if (!reviews.length) return;

    const section = document.createElement('section');
    section.className = 'published-reviews-section';
    section.setAttribute('aria-labelledby', 'customer-reviews-title');
    section.innerHTML = `
      <div class="published-reviews-shell">
        <div class="published-reviews-heading">
          <p class="eyebrow">Customer feedback</p>
          <h2 id="customer-reviews-title">What clients say.</h2>
          <p>Approved feedback from businesses and organizations that have worked with Alpha Zone Labs.</p>
        </div>
        <div class="published-reviews-grid">${reviews.slice(0, 6).map(reviewCard).join('')}</div>
      </div>
    `;
    footer.before(section);
  } catch {
    // Reviews should never block the main site from rendering.
  }
}
