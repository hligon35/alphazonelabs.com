import{l}from"./alpha-zone-labs-logo-D7k3N0Cj.js";const d=document.querySelector("#app");d.innerHTML=`
  <section class="auth-shell" aria-labelledby="portal-title">
    <div class="brand-copy">
      <p class="eyebrow">Review management</p>
      <h1 id="portal-title">Alpha Zone Labs Review Portal</h1>
      <p>Sign in with an approved Google account to send review requests and moderate customer submissions.</p>
    </div>

    <div class="auth-content">
      <div class="logo-panel" aria-hidden="true">
        <img class="brand-logo" src="${l}" alt="" />
      </div>

      <div class="signin-panel">
        <div class="signin-card">
          <p class="eyebrow">Authorized access only</p>
          <h2>Sign in</h2>
          <p class="signin-intro">Use a Google account that has been added to the portal allowlist.</p>
          <div id="google-signin" class="google-signin" aria-live="polite"></div>
          <p id="auth-status" class="auth-status" role="status"></p>
        </div>
      </div>
    </div>
  </section>
`;const r=document.querySelector("#auth-status"),c=document.querySelector("#google-signin");function i(t,e=""){r.textContent=t,r.dataset.type=e}async function u(){var t,e;(e=(t=window.google)==null?void 0:t.accounts)!=null&&e.id||await new Promise((o,s)=>{const a=document.querySelector("script[data-google-identity]");if(a){a.addEventListener("load",o,{once:!0}),a.addEventListener("error",s,{once:!0});return}const n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.dataset.googleIdentity="true",n.addEventListener("load",o,{once:!0}),n.addEventListener("error",s,{once:!0}),document.head.appendChild(n)})}async function g(t){i("Verifying your Google account…");try{const e=await fetch("/api/auth/google",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({credential:t.credential})}),o=await e.json().catch(()=>({}));if(!e.ok)throw new Error(o.error||"Sign-in was not approved.");i("Access approved. Redirecting…","success"),window.location.assign("/dashboard.html")}catch(e){i(e instanceof Error?e.message:"Unable to sign in.","error")}}async function p(){try{const t=await fetch("/api/auth/config",{credentials:"include"}),e=await t.json().catch(()=>({}));if(!t.ok||!e.clientId)throw new Error(e.error||"Google authentication is not configured yet.");await u(),window.google.accounts.id.initialize({client_id:e.clientId,callback:g,auto_select:!1,cancel_on_tap_outside:!0}),window.google.accounts.id.renderButton(c,{type:"standard",theme:"outline",size:"large",text:"signin_with",shape:"pill",width:Math.min(340,c.clientWidth||340),logo_alignment:"left"})}catch(t){i(t instanceof Error?t.message:"Unable to load Google sign-in.","error")}}p();
