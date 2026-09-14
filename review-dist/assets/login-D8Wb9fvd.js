import{l as d}from"./alpha-zone-labs-logo-D7k3N0Cj.js";const u=document.querySelector("#app");u.innerHTML=`
  <section class="auth-shell" aria-labelledby="portal-title">
    <div class="brand-copy">
      <p class="eyebrow">Review management</p>
      <h1 id="portal-title">Alpha Zone Labs Review Portal</h1>
      <p>Sign in with an approved Google account to send review requests and moderate customer submissions.</p>
    </div>

    <div class="auth-content">
      <div class="logo-panel" aria-hidden="true">
        <img class="brand-logo" src="${d}" alt="" />
      </div>

      <div class="signin-panel">
        <div class="signin-card">
          <p class="eyebrow">Authorized access only</p>
          <h2>Sign in</h2>
          <p class="signin-intro">Use a Google account that has been added to the portal allowlist.</p>
          <div id="google-signin" class="google-signin" aria-live="polite"></div>
          <button id="local-dev-login" type="button" hidden>Use local development login</button>
          <p id="auth-status" class="auth-status" role="status"></p>
        </div>
      </div>
    </div>
  </section>
`;const r=document.querySelector("#auth-status"),l=document.querySelector("#google-signin"),i=document.querySelector("#local-dev-login");function a(o,e=""){r.textContent=o,r.dataset.type=e}async function g(){var o,e;(e=(o=window.google)==null?void 0:o.accounts)!=null&&e.id||await new Promise((t,c)=>{const s=document.querySelector("script[data-google-identity]");if(s){s.addEventListener("load",t,{once:!0}),s.addEventListener("error",c,{once:!0});return}const n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.dataset.googleIdentity="true",n.addEventListener("load",t,{once:!0}),n.addEventListener("error",c,{once:!0}),document.head.appendChild(n)})}async function h(o){a("Verifying your Google account…");try{const e=await fetch("/api/auth/google",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({credential:o.credential})}),t=await e.json().catch(()=>({}));if(!e.ok)throw new Error(t.error||"Sign-in was not approved.");a("Access approved. Redirecting…","success"),window.location.assign("/dashboard.html")}catch(e){a(e instanceof Error?e.message:"Unable to sign in.","error")}}async function p(){(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")&&(i.hidden=!1,i.addEventListener("click",async()=>{i.disabled=!0;try{const e=await fetch("/api/auth/local-dev",{method:"POST",credentials:"include"}),t=await e.json().catch(()=>({}));if(!e.ok)throw new Error(t.error||"Local authentication is disabled.");window.location.assign("/dashboard.html")}catch(e){i.disabled=!1,a(e instanceof Error?e.message:"Unable to use local authentication.","error")}}));try{const e=await fetch("/api/auth/config",{credentials:"include"}),t=await e.json().catch(()=>({}));if(!e.ok||!t.clientId)throw new Error(t.error||"Google authentication is not configured yet.");await g(),window.google.accounts.id.initialize({client_id:t.clientId,callback:h,auto_select:!1,cancel_on_tap_outside:!0}),window.google.accounts.id.renderButton(l,{type:"standard",theme:"outline",size:"large",text:"signin_with",shape:"pill",width:Math.min(340,l.clientWidth||340),logo_alignment:"left"})}catch(e){a(e instanceof Error?e.message:"Unable to load Google sign-in.","error")}}p();
