import{l as b}from"./alpha-zone-labs-logo-D7k3N0Cj.js";const y="/assets/emptyStar-ckygngO8.png",v="/assets/fullStar-sC4Rq0a0.png",w=document.querySelector("#app"),p=new URLSearchParams(window.location.search).get("token")||"";function g(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}async function h(e,r={}){const c=await fetch(e,r),l=await c.json().catch(()=>({}));if(!c.ok)throw new Error(l.error||"Request failed.");return l}function f(e){w.innerHTML=`<section class="submit-shell"><img src="${b}" alt="Alpha Zone Labs" class="submit-logo"><div class="submit-card"><p class="eyebrow">Review request</p><h1>We could not open this link.</h1><p>${g(e)}</p></div></section>`}function S(){return[1,2,3,4,5].map(e=>`
    <button
      class="rating-star"
      type="button"
      role="radio"
      aria-checked="false"
      aria-label="${e} star${e===1?"":"s"}"
      data-rating="${e}"
    >
      <img src="${y}" alt="" aria-hidden="true">
    </button>
  `).join("")}function k(e){const r=e.querySelector("#rating-selector"),c=e.querySelector("#rating-value"),l=e.querySelector("#rating-status"),a=[...r.querySelectorAll(".rating-star")];let m=0;function s(t,d=!1){a.forEach(o=>{const i=Number(o.dataset.rating),n=i<=t;o.querySelector("img").src=n?v:y,o.classList.toggle("is-filled",n),d&&o.setAttribute("aria-checked",String(i===t))})}function u(t){m=t,c.value=String(t),l.textContent=`${t} out of 5 stars selected.`,s(t,!0)}a.forEach((t,d)=>{const o=Number(t.dataset.rating);t.addEventListener("pointerenter",()=>s(o)),t.addEventListener("focus",()=>s(o)),t.addEventListener("click",()=>u(o)),t.addEventListener("keydown",i=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(i.key))return;i.preventDefault();let n=d;(i.key==="ArrowRight"||i.key==="ArrowUp")&&(n=Math.min(a.length-1,d+1)),(i.key==="ArrowLeft"||i.key==="ArrowDown")&&(n=Math.max(0,d-1)),i.key==="Home"&&(n=0),i.key==="End"&&(n=a.length-1),a[n].focus(),u(Number(a[n].dataset.rating))})}),r.addEventListener("pointerleave",()=>s(m,!0)),r.addEventListener("focusout",t=>{r.contains(t.relatedTarget)||s(m,!0)})}function A(e){w.innerHTML=`
    <section class="submit-shell">
      <img src="${b}" alt="Alpha Zone Labs" class="submit-logo">
      <div class="submit-card">
        <p class="eyebrow">Alpha Zone Labs</p>
        <h1>Tell us about your experience.</h1>
        <p>Your feedback may be displayed publicly after it is reviewed and approved.</p>
        <form id="review-form">
          <label for="reviewer-name">Name displayed with review</label>
          <input id="reviewer-name" name="name" type="text" maxlength="120" value="${g(e.name||"")}" required>
          <label for="reviewer-image">Logo or headshot (optional)</label>
          <input id="reviewer-image" name="image" type="file" accept="image/jpeg,image/png,image/webp">
          <p class="field-help">Use a JPG, PNG, or WebP image under 2 MB.</p>
          <fieldset>
            <legend>Overall rating</legend>
            <div id="rating-selector" class="rating-selector" role="radiogroup" aria-label="Overall rating">
              ${S()}
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
  `;const r=document.querySelector("#review-form");k(r),r.addEventListener("submit",async c=>{c.preventDefault();const l=r.querySelector('button[type="submit"]'),a=document.querySelector("#submit-status");if(!r.querySelector("#rating-value").value){a.className="form-status error",a.textContent="Select a star rating before submitting.",r.querySelector(".rating-star").focus();return}const s=new FormData(r);s.set("rating",String(Number(s.get("rating")))),l.disabled=!0,a.className="form-status",a.textContent="Submitting your review…";try{const u=await h(`/api/reviews/invitation/${encodeURIComponent(p)}`,{method:"POST",body:s});r.innerHTML=`<div class="success-panel"><p class="eyebrow">Submitted</p><h2>Thank you for your feedback.</h2><p>${g(u.message)}</p></div>`}catch(u){a.className="form-status error",a.textContent=u.message,l.disabled=!1}})}p?h(`/api/reviews/invitation/${encodeURIComponent(p)}`).then(({invitation:e})=>A(e)).catch(e=>f(e.message)):f("The review token is missing. Please use the complete link from your email.");
