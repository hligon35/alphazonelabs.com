import{r as n}from"./site-DrUATrrS.js";const o="https://review.alphazonelabs.com/api/reviews/published";function r(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function l(e){const t=Math.max(1,Math.min(5,Number(e.rating||5)));return`
    <article class="published-review-card">
      <div class="published-review-card__identity">${e.image_url?`<img src="${r(e.image_url)}" alt="" loading="lazy">`:'<span class="published-review-card__avatar" aria-hidden="true"></span>'}<strong>${r(e.customer_name||"Alpha Zone Labs customer")}</strong></div>
      <p class="published-review-stars" aria-label="${t} out of 5 stars">${"★".repeat(t)}${"☆".repeat(5-t)}</p>
      <blockquote>“${r(e.review_text)}”</blockquote>
    </article>
  `}async function c(){if(!document.body.classList.contains("page-home"))return;const e=document.querySelector(".footer");if(e)try{const t=await fetch(o,{headers:{Accept:"application/json"}});if(!t.ok)return;const s=await t.json(),a=Array.isArray(s.reviews)?s.reviews:[];if(!a.length)return;const i=document.createElement("section");i.className="published-reviews-section",i.setAttribute("aria-labelledby","customer-reviews-title"),i.innerHTML=`
      <div class="published-reviews-shell">
        <div class="published-reviews-heading">
          <p class="eyebrow">Customer feedback</p>
          <h2 id="customer-reviews-title">What clients say.</h2>
          <p>Approved feedback from businesses and organizations that have worked with Alpha Zone Labs.</p>
        </div>
        <div class="published-reviews-grid">${a.slice(0,6).map(l).join("")}</div>
      </div>
    `,e.before(i)}catch{}}const d=[{title:"Black Bridge Mindset",image:"./projects/bbm.png",alt:"Black Bridge Mindset website screenshot",href:"https://blackbridgemindset.com/"},{title:"Cedar & Gold Lebanese Restaurant",image:"./projects/cedar&gold_lebanese.png",alt:"Cedar and Gold Lebanese restaurant website screenshot",href:"https://hligon35.github.io/cedarngoldlebanese/"},{title:"Luxurious Cakes Indy",image:"./projects/luxurious_cakes.png",alt:"Luxurious Cakes Indy website screenshot",href:"https://www.luxuriouscakesindy.com/"},{title:"Life Prep Academy Foundation",image:"./projects/life_prep_academy_foundation.png",alt:"Life Prep Academy Foundation website screenshot",href:"https://www.lifeprepacademyfoundation.com/"},{title:"The Bear Voice",image:"./projects/bearVoice.png",alt:"The Bear Voice interactive website screenshot",href:"https://hligon35.github.io/thebearvoice/"},{title:"MMBC",image:"./projects/non-profit.png",alt:"MMBC digital business card tool screenshot",href:"https://hligon35.github.io/mmmbc/"}];function u(){const e=document.querySelector(".work-showcase-slider");if(!e)return;e.innerHTML=d.map((a,i)=>`
    <a
      class="work-showcase-slide${i===0?" is-active":""}"
      href="${a.href}"
      target="_blank"
      rel="noreferrer"
      aria-hidden="${i===0?"false":"true"}"
    >
      <picture>
        <img
          src="${a.image}"
          alt="${a.alt}"
          loading="${i===0?"eager":"lazy"}"
          decoding="async"
        >
      </picture>
      <span>${a.title}</span>
    </a>
  `).join("");const t=[...e.querySelectorAll(".work-showcase-slide")];if(t.length<2)return;let s=0;window.setInterval(()=>{t[s].classList.remove("is-active"),t[s].setAttribute("aria-hidden","true"),s=(s+1)%t.length,t[s].classList.add("is-active"),t[s].setAttribute("aria-hidden","false")},3e3)}n("home");u();c();
