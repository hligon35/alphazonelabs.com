import{l as d}from"./alpha-zone-labs-logo-D7k3N0Cj.js";const u=document.querySelector("#app");async function n(e,s={}){const t=await fetch(e,{credentials:"include",...s}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Request failed.");return a}async function p(){try{return await n("/api/auth/session")}catch{return window.location.replace("/"),null}}function r(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function m(e){const s="★".repeat(Number(e.rating||0))+"☆".repeat(5-Number(e.rating||0)),t=e.status==="pending"?`<div class="review-actions"><button class="approve" data-review-action="approve" data-review-id="${e.id}">Approve & post</button><button class="deny" data-review-action="deny" data-review-id="${e.id}">Deny</button></div>`:"";return`
    <article class="review-item" data-review-card="${e.id}">
      <div class="review-item__top">
        <div>
          <h3>${r(e.customer_name||"Customer")}</h3>
          <p>${r(e.customer_email)}</p>
        </div>
        <span class="status status--${r(e.status)}">${r(e.status)}</span>
      </div>
      <p class="stars" aria-label="${e.rating} out of 5 stars">${s}</p>
      <blockquote>${r(e.review_text)}</blockquote>
      <p class="review-date">Submitted ${new Date(e.created_at).toLocaleString()}</p>
      ${t}
    </article>
  `}async function o(){const e=document.querySelector("#reviews-list"),s=document.querySelector("#review-count");e.innerHTML='<p class="muted">Loading reviews…</p>';try{const a=(await n("/api/reviews")).reviews||[];s.textContent=`${a.length} total`,e.innerHTML=a.length?a.map(m).join(""):'<p class="muted">No reviews have been submitted yet.</p>'}catch(t){e.innerHTML=`<p class="form-status error">${r(t.message)}</p>`}}function v(e){u.innerHTML=`
    <header class="portal-header">
      <a href="/dashboard.html" class="portal-brand">
        <img src="${d}" alt="Alpha Zone Labs" />
        <span>Review Portal</span>
      </a>
      <div class="portal-user">
        <span>${r(e.email)}</span>
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
    </main>
  `,document.querySelector("#sign-out").addEventListener("click",async()=>{await fetch("/api/auth/logout",{method:"POST",credentials:"include"}),window.location.replace("/")}),document.querySelector("#review-request-form").addEventListener("submit",async s=>{s.preventDefault();const t=s.currentTarget,a=document.querySelector("#request-status"),i=t.querySelector('button[type="submit"]'),c=Object.fromEntries(new FormData(t));i.disabled=!0,a.className="form-status",a.textContent="Sending review invitation…";try{await n("/api/reviews/invitations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}),a.className="form-status success",a.textContent=`Review request sent to ${c.email}.`,t.reset()}catch(l){a.className="form-status error",a.textContent=l.message}finally{i.disabled=!1}}),document.querySelector("#refresh-reviews").addEventListener("click",o),document.querySelector("#reviews-list").addEventListener("click",async s=>{const t=s.target.closest("[data-review-action]");if(t){t.disabled=!0;try{await n(`/api/reviews/${t.dataset.reviewId}/moderate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:t.dataset.reviewAction})}),await o()}catch(a){window.alert(a.message),t.disabled=!1}}}),o()}p().then(e=>{e&&v(e)});
