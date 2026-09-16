import{l as u}from"./alpha-zone-labs-logo-D7k3N0Cj.js";const p=document.querySelector("#app"),m="https://sas.alphazonelabs.com/reports";async function o(e,s={}){const t=await fetch(e,{credentials:"include",...s}),a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"Request failed.");return a}async function v(){try{return await o("/api/auth/session")}catch{return window.location.replace("/"),null}}function n(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function h(e){const s="★".repeat(Number(e.rating||0))+"☆".repeat(5-Number(e.rating||0)),t=e.status==="pending"?`<div class="review-actions"><button class="approve" data-review-action="approve" data-review-id="${e.id}">Approve & post</button><button class="deny" data-review-action="reject" data-review-id="${e.id}">Reject</button><button class="delete-review" data-review-action="delete" data-review-id="${e.id}">Delete</button></div>`:`<div class="review-actions"><button class="delete-review" data-review-action="delete" data-review-id="${e.id}">Delete</button></div>`;return`
    <article class="review-item" data-review-card="${e.id}">
      <div class="review-item__top">
        ${e.image_url?`<img class="reviewer-image" src="${n(e.image_url)}" alt="" loading="lazy">`:""}
        <div>
          <h3>${n(e.customer_name||"Customer")}</h3>
          <p>${n(e.customer_email)}</p>
        </div>
        <span class="status status--${n(e.status)}">${n(e.status)}</span>
      </div>
      <p class="stars" aria-label="${e.rating} out of 5 stars">${s}</p>
      <blockquote>${n(e.review_text)}</blockquote>
      <p class="review-date">Submitted ${new Date(e.created_at).toLocaleString()}</p>
      ${t}
    </article>
  `}async function l(){const e=document.querySelector("#analytics-content");try{const s=await o("/api/reviews/analytics"),t=s.summary||{},a=s.ratings||[],r=s.invitations||[],c=Object.fromEntries(a.map(i=>[i.rating,i.count]));e.innerHTML=`
      <div class="metric-grid">
        <div class="metric"><span>Total reviews</span><strong>${t.total||0}</strong></div>
        <div class="metric"><span>Pending</span><strong>${t.pending||0}</strong></div>
        <div class="metric"><span>Published</span><strong>${t.approved||0}</strong></div>
        <div class="metric"><span>Average rating</span><strong>${t.average_rating||"—"} / 5</strong></div>
      </div>
      <div class="analytics-columns">
        <div><h3>Published ratings</h3>${[5,4,3,2,1].map(i=>`<div class="bar-row"><span>${i} stars</span><div class="bar"><i style="width:${Math.min(100,Number(c[i]||0)*12)}%"></i></div><b>${c[i]||0}</b></div>`).join("")}</div>
        <div><h3>Invitation status</h3><ul class="status-list">${r.length?r.map(i=>`<li><span>${n(i.status)}</span><b>${i.count}</b></li>`).join(""):"<li><span>No invitations yet</span><b>0</b></li>"}</ul></div>
      </div>`}catch(s){e.innerHTML=`<p class="form-status error">${n(s.message)}</p>`}}async function d(){const e=document.querySelector("#reviews-list"),s=document.querySelector("#review-count");e.innerHTML='<p class="muted">Loading reviews…</p>';try{const a=(await o("/api/reviews")).reviews||[];s.textContent=`${a.length} total`,e.innerHTML=a.length?a.map(h).join(""):'<p class="muted">No reviews have been submitted yet.</p>'}catch(t){e.innerHTML=`<p class="form-status error">${n(t.message)}</p>`}}function b(e){p.innerHTML=`
    <header class="portal-header">
      <a href="/dashboard.html" class="portal-brand">
        <img src="${u}" alt="Alpha Zone Labs" />
        <span>Admin Portal</span>
      </a>
      <nav class="portal-nav" aria-label="Admin sections">
        <a class="nav-button is-active" href="/dashboard.html">Reviews</a>
        <a class="nav-button" href="${m}">Reports</a>
      </nav>
      <div class="portal-user">
        <span>${n(e.email)}</span>
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
  `,document.querySelector("#sign-out").addEventListener("click",async()=>{await fetch("/api/auth/logout",{method:"POST",credentials:"include"}),window.location.replace("/")}),document.querySelector("#review-request-form").addEventListener("submit",async s=>{s.preventDefault();const t=s.currentTarget,a=document.querySelector("#request-status"),r=t.querySelector('button[type="submit"]'),c=Object.fromEntries(new FormData(t));r.disabled=!0,a.className="form-status",a.textContent="Sending review invitation…";try{await o("/api/reviews/invitations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}),a.className="form-status success",a.textContent=`Review request sent to ${c.email}.`,t.reset()}catch(i){a.className="form-status error",a.textContent=i.message}finally{r.disabled=!1}}),document.querySelector("#refresh-reviews").addEventListener("click",d),document.querySelector("#refresh-analytics").addEventListener("click",l),document.querySelector("#reviews-list").addEventListener("click",async s=>{const t=s.target.closest("[data-review-action]");if(!t)return;const a=t.dataset.reviewAction;if(!(a==="delete"&&!window.confirm("Permanently delete this review? This cannot be undone."))){t.disabled=!0;try{a==="delete"?await o(`/api/reviews/${t.dataset.reviewId}`,{method:"DELETE"}):await o(`/api/reviews/${t.dataset.reviewId}/moderate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a})}),await Promise.all([d(),l()])}catch(r){window.alert(r.message),t.disabled=!1}}}),d(),l()}v().then(e=>{e&&b(e)});
