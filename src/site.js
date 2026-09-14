import alphaLogoUrl from '../alpha-zone-labs-logo.png?url';

const brand = {
  name: 'Alpha Zone Labs',
  domain: 'https://alphazonelabs.com',
  email: 'info@alphazonelabs.com',
};

const quoteUrl = 'https://quote.alphazonelabs.com/';
const reviewUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5175/'
  : 'https://review.alphazonelabs.com/';

const pagePaths = {
  home: './index.html',
  services: './services.html',
  portfolio: './portfolio.html',
  about: './about.html',
  contact: './contact.html',
};

const mediaPaths = {
  hero: './hero image.png',
};

const navigation = [
  { key: 'home', label: 'Home', href: pagePaths.home },
  { key: 'about', label: 'About', href: pagePaths.about },
  { key: 'portfolio', label: 'Work', href: pagePaths.portfolio },
  { key: 'services', label: 'Services', href: pagePaths.services },
  { key: 'review', label: 'Admin', href: reviewUrl },
];

const contactRoutes = {
  website: `${quoteUrl}?path=website`,
  automation: `${quoteUrl}?path=automation`,
  app: `${quoteUrl}?path=app`,
  strategy: `${quoteUrl}?path=strategy`,
};

const servicePillars = [
  {
    id: 'websites',
    number: '01',
    title: 'Websites',
    copy: 'We review your current site or idea, identify what is unclear, then build pages that explain your offer, earn trust, and guide visitors toward calls, quotes, bookings, or signups.',
    detail: 'Website projects can include strategy, information architecture, responsive design, development, content structure, contact and quote forms, analytics, launch support, and ongoing improvements. We focus on giving visitors a clear understanding of the business and an obvious next step on every screen size.',
    features: ['New websites', 'Website redesigns', 'Landing pages', 'Mobile optimization', 'Local and AI-ready SEO', 'Forms and lead capture'],
    href: contactRoutes.website,
    cta: 'Start Website Project',
  },
  {
    id: 'automation',
    number: '02',
    title: 'Automation',
    copy: 'We map the repetitive work behind your business, then connect forms, spreadsheets, emails, reminders, and follow-up so important steps happen without constant manual chasing.',
    detail: 'Automation work begins with the complete process, including what starts it, where information is stored, who needs to be notified, and what should happen next. We then build and test connected workflows that reduce duplicate entry, missed follow-up, inconsistent communication, and unnecessary administrative work.',
    features: ['Lead follow-up', 'Registration flows', 'Email reminders', 'Make and Zapier workflows', 'Spreadsheet synchronization', 'Notifications and status updates'],
    href: contactRoutes.automation,
    cta: 'Automate a Workflow',
  },
  {
    id: 'apps-tools',
    number: '03',
    title: 'Apps & Tools',
    copy: 'We build practical dashboards, portals, registration systems, and admin tools that organize information around the way your team already works.',
    detail: 'Custom tools are designed around a specific operational need rather than unnecessary features. Projects may include authenticated portals, internal dashboards, registration and check-in systems, client workspaces, searchable directories, reporting interfaces, or focused software that replaces scattered manual processes.',
    features: ['Dashboards', 'Client portals', 'Admin tools', 'Registration systems', 'Internal databases', 'Custom workflow software'],
    href: contactRoutes.app,
    cta: 'Build a Tool',
  },
  {
    id: 'strategy',
    number: '04',
    title: 'Strategy',
    copy: 'We help you decide what should be fixed first, what should be automated, and what digital pieces need to work together before you invest in a bigger build.',
    detail: 'Strategy engagements clarify the current setup, the highest-impact problems, technical dependencies, user paths, and a realistic order of operations. The result is a focused plan that distinguishes immediate fixes from later improvements and reduces the risk of investing in disconnected tools or unnecessary development.',
    features: ['Site review', 'Workflow mapping', 'Technology cleanup', 'Launch planning', 'Feature prioritization', 'Digital system roadmap'],
    href: contactRoutes.strategy,
    cta: 'Plan the System',
  },
];

const serviceRoutes = Object.fromEntries(
  servicePillars.map((item) => [item.id, `${pagePaths.services}#service-${item.id}`]),
);

const portfolioItems = [
  { type: 'website', label: 'Service website', title: 'Black Bridge Mindset', image: './projects/bbm.png', alt: 'Black Bridge Mindset website screenshot', problem: 'The offer needed to feel clear, credible, and easy to act on.', changed: 'Sharper messaging, stronger trust cues, and a more direct booking path.', impact: 'A stronger first impression and a cleaner path to qualified inquiries.', href: 'https://blackbridgemindset.com/' },
  { type: 'website', label: 'Restaurant website', title: 'Cedar & Gold Lebanese Restaurant', image: './projects/cedar&gold_lebanese.png', alt: 'Cedar and Gold Lebanese restaurant website screenshot', webp: './projects/cedar&gold_lebanese.webp', problem: 'Customers needed menu, location, and business details quickly.', changed: 'A mobile-first layout with key information easier to find.', impact: 'A smoother browsing experience for customers deciding where to eat.', href: 'https://hligon35.github.io/cedarngoldlebanese/' },
  { type: 'website', label: 'Small business website', title: 'Luxurious Cakes Indy', image: './projects/luxurious_cakes.png', alt: 'Luxurious Cakes Indy website screenshot', webp: './projects/luxurious_cakes.webp', problem: 'The business needed stronger product presentation and a clearer inquiry flow.', changed: 'Cleaner browsing, stronger brand trust, and more direct quote support.', impact: 'A more polished online presence for custom-order customers.', href: 'https://www.luxuriouscakesindy.com/' },
  { type: 'systems', label: 'Organization website', title: 'Life Prep Academy Foundation', image: './projects/life_prep_academy_foundation.png', alt: 'Life Prep Academy Foundation website screenshot', problem: 'The organization needed its mission, programs, and next steps to be easier to understand.', changed: 'Improved page hierarchy, trust signals, and program access.', impact: 'A clearer digital home for families, supporters, and partners.', href: 'https://www.lifeprepacademyfoundation.com/' },
];

const approvedReviews = [
  // Add real approved reviews here. Only approved: true items display publicly.
  // Example:
  // { approved: true, rating: 5, review: 'Alpha Zone Labs made the process clear and helped us move forward with confidence.', reviewerFirstName: 'Jane', reviewerLastInitial: 'D' },
];

const pages = {
  home: {
    bodyClass: 'page-home',
    main: `
      <section class="hero-section hero-section--home">
        <div class="hero-shell">
          <div class="hero-copy">
            <p class="eyebrow">Digital solutions for growing businesses</p>
            <h1>Build the system behind your business.</h1>
            <p class="hero-lead">Alpha Zone Labs helps businesses improve their websites, automate daily work, and build practical tools. We start by looking at what you already have, discuss what should improve, then move forward with the cleanest solution.</p>
            <div class="hero-actions hero-actions--home"><a href="${quoteUrl}" class="cta-btn primary">Start a Project</a><a href="${pagePaths.services}" class="cta-btn secondary">View Services</a></div>
            <div class="hero-proof hero-proof--home"><a href="${serviceRoutes.websites}">Websites</a><a href="${serviceRoutes.automation}">Automation</a><a href="${serviceRoutes['apps-tools']}">Apps & tools</a></div>
          </div>
          <aside class="hero-panel" aria-label="What Alpha Zone Labs builds">
            <div class="hero-panel__card hero-panel__card--image"><img class="section-visual__image" src="${mediaPaths.hero}" alt="Website and digital system preview on desktop and mobile screens" loading="eager" decoding="async" /><p class="section-visual__caption">A better digital setup should look professional, explain the next step, and support the work that happens after someone reaches out.</p></div>
            <div class="hero-panel__card hero-panel__card--primary"><p class="hero-panel__label">A clean process:</p><ul class="hero-panel__list"><li>Review what exists or what needs to be built</li><li>Discuss the highest-value improvements</li><li>Build, connect, test, and launch</li></ul></div>
          </aside>
        </div>
      </section>
      ${solutionPathSection()}
      ${processSection()}
      ${workPreviewSection()}
      ${reviewsSection()}
      ${ctaPanel('Ready to clean it up?', 'Share what is not working, what you want people to do, and what would make your business easier to run.', quoteUrl, 'Start a Project', pagePaths.services, 'Explore Services')}
    `,
  },
  services: {
    bodyClass: 'page-interior page-services',
    main: `
      ${pageHero('services', 'Services', 'What we build.', 'Select a service to see the complete scope, common deliverables, and the next step for starting that type of project.')}
      <section class="content-section services-catalog-section"><div class="service-accordion-grid">${servicePillars.map(expandableServiceCard).join('')}</div></section>
      <section class="insight-section">
        <div class="section-header"><p class="eyebrow">Our process</p><h2>Review. Discuss. Build.</h2><p class="section-subtitle">We do not jump straight into design or tools. First, we look at the website, workflow, customer path, or internal process. Then we talk through the improvements that matter most and build the solution that fits.</p></div>
        <div class="problem-grid"><article class="problem-card"><h3>Review</h3><p>We look at your site, forms, tools, customer journey, and manual steps to find where people get stuck or where your team loses time.</p></article><article class="problem-card"><h3>Discuss</h3><p>We walk through what should change, what can wait, and which fixes will create the clearest improvement for your business.</p></article><article class="problem-card"><h3>Build</h3><p>We create the website, automation, app, or connected workflow with a focus on usability, clarity, and long-term usefulness.</p></article><article class="problem-card"><h3>Launch</h3><p>We test the experience, tighten the details, and make sure the final system is ready for real customers and real work.</p></article></div>
      </section>
      ${ctaPanel('Not sure where to start?', 'Tell us what feels broken or outdated. We will help you figure out whether the next move is a site fix, automation, custom tool, or strategy session.', quoteUrl, 'Start a Project', pagePaths.portfolio, 'View Work')}
    `,
  },
  portfolio: {
    bodyClass: 'page-interior page-work',
    main: `
      ${pageHero('portfolio', 'Work', 'Built for clarity.', 'These projects focus on helping people understand the business, trust the offer, and take the next step with less friction.')}
      <section class="portfolio-section portfolio-section--interior"><div class="portfolio-filters"><button class="filter-btn active" data-filter="all">All</button><button class="filter-btn" data-filter="website">Websites</button><button class="filter-btn" data-filter="systems">Systems</button></div><div class="portfolio-grid">${portfolioCards(portfolioItems, true)}</div></section>
      ${ctaPanel('Want a stronger customer path?', 'We can review what you have now, discuss the weak points, and build the pages or systems that move people forward.', quoteUrl, 'Start a Project', pagePaths.services, 'View Services')}
    `,
  },
  about: {
    bodyClass: 'page-interior',
    main: `
      ${pageHero('about', 'About', 'Practical digital help.', 'Alpha Zone Labs builds websites, automations, and tools for businesses that need clearer customer paths and smoother internal systems.')}
      <section class="content-section"><div class="about-layout about-layout--interior"><div class="about-copy"><p class="eyebrow">How we think</p><h2>Make it easier.</h2><p>A good digital system should make something easier for the customer, the team, or both. That might mean a clearer homepage, a better quote form, faster follow-up, a registration flow, or a tool that keeps information organized.</p><p>We keep projects focused. We review what is happening now, discuss improvements in plain language, then build the pieces that solve the real problem.</p></div><div class="about-points"><article class="about-point"><h3>Clear direction</h3><p>We help decide what matters first so the project does not become bigger than it needs to be.</p></article><article class="about-point"><h3>Useful builds</h3><p>We build pages, workflows, and tools that support real business activity, not just ideas on a screen.</p></article><article class="about-point"><h3>Connected thinking</h3><p>We look at what happens before and after a customer submits a form, books, registers, or asks for help.</p></article></div></div></section>
      ${ctaPanel('Have something that needs to work better?', 'Send the goal, the current issue, and what you want to make easier.', quoteUrl, 'Start a Project', pagePaths.services, 'Explore Services')}
    `,
  },
  contact: {
    bodyClass: 'page-interior page-contact',
    main: `
      ${pageHero('contact', 'Start', 'Tell us the goal.', 'You do not need a perfect brief. Share what you have, what feels unclear or manual, and what you want customers or your team to do more easily.')}
      <section class="contact-section contact-section--page"><div class="contact-layout"><div class="contact-copy"><p class="eyebrow">Project request</p><h2>Start with the problem.</h2><p>Maybe your site is not explaining the business well. Maybe leads are not being followed up. Maybe registration, communication, or internal tracking is too manual. We will review the situation, discuss the best improvements, and help you move forward.</p><div class="contact-benefits"><div class="contact-benefit"><strong>Website help</strong><span>We review the current site or idea, identify what is weak, then improve the message, structure, calls to action, and customer flow.</span></div><div class="contact-benefit"><strong>System help</strong><span>We look at the steps behind the scenes and build automations, dashboards, portals, or tools to reduce manual work.</span></div><div class="contact-benefit"><strong>Email</strong><span><a href="mailto:${brand.email}">${brand.email}</a></span></div></div></div><div class="basic-contact-card" aria-label="Project request form"><div class="section-header section-header--left"><h2>Project Request</h2><p class="section-subtitle">Pick the closest fit and tell us what needs to work better.</p></div>${contactForm()}</div></div></section>
    `,
  },
};

export function renderPage(pageKey) {
  const app = document.querySelector('#app');
  if (!app) return;
  const page = pages[pageKey];
  if (!page) { document.body.innerHTML = '<h1>Page not found.</h1>'; return; }
  document.body.className = page.bodyClass || '';
  app.innerHTML = `${header(pageKey)}<main>${page.main}</main>${footer()}`;
  initializeFeatures();
}

function header(activeKey) {
  return `<header class="site-header"><nav class="nav-container" aria-label="Main navigation"><a class="header-logo__link" href="${pagePaths.home}" aria-label="Alpha Zone Labs home"><img class="header-logo__img" src="${alphaLogoUrl}" alt="${brand.name}" loading="eager" decoding="async" /></a><div id="mobile-nav" class="nav-links">${navigation.map((item) => `<a href="${item.href}" class="nav-link${item.key === activeKey ? ' is-active' : ''}"${item.key === activeKey ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}<a href="${quoteUrl}" class="cta-btn nav-cta">Start a Project</a></div><button class="nav-hamburger" type="button" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false"><span class="nav-hamburger__lines" aria-hidden="true"><span class="nav-hamburger__line"></span><span class="nav-hamburger__line"></span><span class="nav-hamburger__line"></span></span></button></nav></header>`;
}

function footer() {
  return `<footer class="footer"><div class="footer-inner"><div class="footer-cta"><div class="footer-cta__text"><h3>Build a cleaner digital system.</h3><p>Websites, automation, and tools that help people take action and help your team keep up after they do.</p></div><div class="footer-cta__actions"><a href="${quoteUrl}" class="cta-btn primary">Start a Project</a><a href="${pagePaths.services}" class="cta-btn secondary">View Services</a></div></div><div class="footer-grid" aria-label="Footer navigation"><div class="footer-col"><h4>Company</h4><a href="${pagePaths.home}">Home</a><a href="${pagePaths.about}">About</a><a href="${quoteUrl}">Start a Project</a></div><div class="footer-col"><h4>Services</h4><a href="${serviceRoutes.websites}">Websites</a><a href="${serviceRoutes.automation}">Automation</a><a href="${serviceRoutes['apps-tools']}">Apps & Tools</a><a href="${serviceRoutes.strategy}">Strategy</a></div><div class="footer-col"><h4>Work</h4><a href="${pagePaths.portfolio}">Portfolio</a><a href="${pagePaths.services}">Services</a></div><div class="footer-col"><h4>Contact</h4><a href="mailto:${brand.email}">${brand.email}</a><a href="${brand.domain}">${brand.domain.replace('https://','')}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</span><span>Websites, automation, apps, and digital systems.</span></div></div></footer>`;
}

function pageHero(page, eyebrow, title, text) {
  return `<section class="page-hero"><div class="section-header"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-lead">${text}</p></div></section>`;
}

function solutionPathSection() {
  return `<section class="solution-path-section"><div class="section-header"><p class="eyebrow">Choose the starting point</p><h2>What needs to work better?</h2><p class="section-subtitle">Start with the outcome, not the technology. We can help you decide whether the best next step is a stronger website, an automation, a custom tool, or a cleaner overall system.</p></div><div class="alpha-path-grid">${servicePillars.map(solutionPathCard).join('')}</div></section>`;
}

function processSection() {
  const steps = [
    ['01', 'Review', 'We look at the current site, tools, forms, and workflow to understand what is happening now.'],
    ['02', 'Discuss', 'We talk through what is not working, what should improve first, and what can wait.'],
    ['03', 'Build', 'We design and connect the website, automation, or tool around the agreed priorities.'],
    ['04', 'Launch', 'We test the complete path, make final adjustments, and prepare the system for real use.'],
  ];
  return `<section class="process-section"><div class="section-header"><p class="eyebrow">How projects move</p><h2>Review. Discuss. Build. Launch.</h2></div><div class="process-grid">${steps.map(([number,title,copy]) => `<article class="process-card"><span class="process-number">${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></section>`;
}

function workPreviewSection() {
  const slides = portfolioItems.slice(0, 3).map((item, index) => `<a class="work-showcase-slide${index === 0 ? ' is-active' : ''}" href="${item.href}" target="_blank" rel="noreferrer" aria-hidden="${index === 0 ? 'false' : 'true'}"><picture>${item.webp ? `<source srcset="${item.webp}" type="image/webp">` : ''}<img src="${item.image}" alt="${item.alt}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"></picture><span>${item.title}</span></a>`).join('');
  return `<section class="portfolio-section work-showcase-section"><div class="work-showcase-layout"><div class="work-showcase-copy"><p class="eyebrow">Selected work</p><h2>Clearer experiences for real businesses.</h2><p class="section-subtitle">A few examples of websites and digital systems built to improve clarity, trust, and action.</p><a href="${pagePaths.portfolio}" class="cta-btn secondary">View More Work</a></div><div class="work-showcase-slider" aria-label="Selected project screenshots">${slides}</div></div></section>`;
}


function reviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const reviewer = `${review.reviewerFirstName || 'Client'} ${review.reviewerLastInitial ? `${review.reviewerLastInitial}.` : ''}`.trim();
  return `<article class="review-card"><div class="review-stars" aria-label="${rating} out of 5 stars">${stars}</div><p>“${review.review}”</p><strong>${reviewer}</strong></article>`;
}

function solutionPathCard(item) {
  return `<article class="user-path-card"><span class="user-path-number">${item.number}</span><h3>${item.title}</h3><p>${item.copy}</p><a href="${serviceRoutes[item.id]}">View ${item.title}</a></article>`;
}

function serviceCard(item) {
  return `<article class="service-card"><span class="service-number">${item.number}</span><h3>${item.title}</h3><p>${item.copy}</p><ul>${item.features.slice(0,4).map((feature) => `<li>${feature}</li>`).join('')}</ul><a href="${serviceRoutes[item.id]}" class="text-link">View ${item.title}</a></article>`;
}

function expandableServiceCard(item) {
  const panelId = `service-panel-${item.id}`;
  return `<article class="service-accordion-card" id="service-${item.id}" data-service="${item.id}"><button class="service-accordion-trigger" type="button" aria-expanded="false" aria-controls="${panelId}"><span class="service-accordion-heading"><span class="service-accordion-number">${item.number}</span><span class="service-accordion-title">${item.title}</span></span><span class="service-accordion-icon" aria-hidden="true">+</span></button><div class="service-accordion-summary"><p>${item.copy}</p></div><div class="service-accordion-panel" id="${panelId}" hidden><p class="service-accordion-detail">${item.detail}</p><ul>${item.features.map((feature) => `<li>${feature}</li>`).join('')}</ul><a href="${item.href}" class="cta-btn primary">${item.cta}</a></div></article>`;
}

function portfolioCards(items, detailed) {
  return items.map((item) => `<article class="portfolio-card" data-category="${item.type}"><picture>${item.webp ? `<source srcset="${item.webp}" type="image/webp">` : ''}<img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async"></picture><div class="portfolio-card__body"><span class="portfolio-label">${item.label}</span><h3>${item.title}</h3>${detailed ? `<div class="portfolio-card__details"><p><strong>Problem</strong><span>${item.problem}</span></p><p><strong>What changed</strong><span>${item.changed}</span></p><p><strong>Impact</strong><span>${item.impact}</span></p></div>` : `<p>${item.changed}</p>`}<a class="cta-btn secondary portfolio-card__button" href="${item.href}" target="_blank" rel="noreferrer">View Live Project</a></div></article>`).join('');
}

function ctaPanel(title, copy, primaryHref, primaryLabel, secondaryHref, secondaryLabel) {
  return `<section class="cta-panel"><div><p class="eyebrow">Next step</p><h2>${title}</h2><p>${copy}</p></div><div class="hero-actions"><a href="${primaryHref}" class="cta-btn primary">${primaryLabel}</a><a href="${secondaryHref}" class="cta-btn secondary">${secondaryLabel}</a></div></section>`;
}

function contactForm() {
  return `<form class="basic-contact-form"><label>Business or project name<input type="text" name="businessName" maxlength="160" required></label><label>Your name<input type="text" name="name" maxlength="120" autocomplete="name" required></label><label>Email<input type="email" name="email" maxlength="254" autocomplete="email" required></label><label>What do you need help with?<select name="projectType" required><option value="">Choose one</option><option value="website">Website</option><option value="automation">Automation</option><option value="app">App or internal tool</option><option value="strategy">Strategy or system planning</option></select></label><label>What should work better?<textarea name="message" rows="6" maxlength="10000" required></textarea></label><label class="visually-hidden" aria-hidden="true">Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label><button type="submit" class="cta-btn primary">Send Project Request</button><p class="form-status" role="status" aria-live="polite"></p></form>`;
}

function initializeFeatures() {
  const menuButton = document.querySelector('.nav-hamburger');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  document.querySelectorAll('.filter-btn, .portfolio-filter').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.filter-btn, .portfolio-filter').forEach((item) => item.classList.remove('active', 'is-active'));
      button.classList.add('active');
      document.querySelectorAll('.portfolio-card').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  const slides = [...document.querySelectorAll('.work-showcase-slide')];
  if (slides.length > 1) {
    let activeSlide = 0;
    window.setInterval(() => {
      slides[activeSlide].classList.remove('is-active');
      slides[activeSlide].setAttribute('aria-hidden', 'true');
      activeSlide = (activeSlide + 1) % slides.length;
      slides[activeSlide].classList.add('is-active');
      slides[activeSlide].setAttribute('aria-hidden', 'false');
    }, 3000);
  }

  const serviceCards = [...document.querySelectorAll('.service-accordion-card')];
  const setServiceOpen = (card, shouldOpen, updateHash = false) => {
    if (!card) return;
    const trigger = card.querySelector('.service-accordion-trigger');
    const panel = card.querySelector('.service-accordion-panel');
    const icon = card.querySelector('.service-accordion-icon');
    trigger?.setAttribute('aria-expanded', String(shouldOpen));
    card.classList.toggle('is-open', shouldOpen);
    if (panel) panel.hidden = !shouldOpen;
    if (icon) icon.textContent = shouldOpen ? '−' : '+';
    if (shouldOpen && updateHash) history.replaceState(null, '', `#${card.id}`);
  };

  serviceCards.forEach((card) => {
    const trigger = card.querySelector('.service-accordion-trigger');
    trigger?.addEventListener('click', () => {
      const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
      serviceCards.forEach((otherCard) => setServiceOpen(otherCard, otherCard === card && shouldOpen));
      if (shouldOpen) history.replaceState(null, '', `#${card.id}`);
      else history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

  const openServiceFromHash = () => {
    if (!window.location.hash.startsWith('#service-')) return;
    const card = document.querySelector(window.location.hash);
    if (!card?.classList.contains('service-accordion-card')) return;
    serviceCards.forEach((otherCard) => setServiceOpen(otherCard, otherCard === card));
    window.setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  };

  openServiceFromHash();
  window.addEventListener('hashchange', openServiceFromHash);

  const contactFormElement = document.querySelector('.basic-contact-form');
  if (contactFormElement) {
    const params = new URLSearchParams(window.location.search);
    const projectType = params.get('path');
    const typeField = contactFormElement.querySelector('[name="projectType"]');
    if (projectType && typeField) typeField.value = projectType;
    contactFormElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = contactFormElement.querySelector('.form-status');
      const button = contactFormElement.querySelector('button[type="submit"]');
      const data = Object.fromEntries(new FormData(contactFormElement));
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8787/api/forms'
        : '/api/forms';
      button.disabled = true;
      status.textContent = 'Sending your request...';
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
          body: JSON.stringify({ formType: 'project', data, honeypot: data.website, pageUrl: window.location.href })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'We could not send your request.');
        status.textContent = payload.duplicate ? 'This request was already received.' : 'Thanks. Your request has been received.';
        contactFormElement.reset();
      } catch (submissionError) {
        status.textContent = submissionError instanceof Error ? submissionError.message : 'We could not send your request.';
      } finally {
        button.disabled = false;
      }
    });
  }
}
