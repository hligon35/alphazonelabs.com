import './style.css';

const APPS_SCRIPT_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8787/api/quotes' : 'https://alphazonelabs.com/api/quotes';

const state = {
  index: 0,
  contact: {},
  businessStage: '',
  businessType: '',
  audience: [],
  projectType: [],
  primaryGoal: [],
  customerActions: [],
  ownerTools: [],
  brandStatus: '',
  contentStatus: '',
  monthlyBudget: '',
  projectBudget: '',
  timeline: '',
  success: ''
};

const wizard = document.querySelector('#wizard');
const form = document.querySelector('#quoteForm');
const footer = document.querySelector('#wizardFooter');
const thankYou = document.querySelector('#thankYou');
const back = document.querySelector('#backButton');
const next = document.querySelector('#nextButton');
const progress = document.querySelector('#progressBar');
const progressLabel = document.querySelector('#progressLabel');
const stepLabel = document.querySelector('#stepLabel');
const error = document.querySelector('#errorMessage');

const steps = [
  { render: contactStep, validate: validateContact, save: saveContact },
  single('Business stage','Where is the business right now?','businessStage',['New idea, not launched yet','New business already operating','Established business without a website or system','New division, service, or product under an existing business']),
  single('Business type','Which option best describes the business?','businessType',['Professional or local service business','Retail or product-based business','Beauty, wellness, or personal care','Restaurant, food, or hospitality','Nonprofit or community organization','Sports, events, or youth programs','Creator, media, or personal brand','Technology, software, or online platform','Other or mixed business model']),
  multi('Audience','Who should the new experience serve?','audience',['Local customers','Online customers','Existing clients or members','Parents and families','Businesses or organizations','Sponsors, donors, or supporters','Employees or internal staff','A broad general audience']),
  multi('Project type','What needs to be created?','projectType',['Business website','Online store','Booking or appointment system','Customer or member portal','Registration or application system','Mobile-friendly web app','Admin dashboard or internal tool','Automation and follow-up system','Brand and content foundation']),
  multi('Primary goals','What should the new system accomplish first?','primaryGoal',['Generate more leads or inquiries','Explain the business clearly','Let customers book or register','Sell products or services online','Collect payments or deposits','Organize clients, members, or records','Reduce manual work','Build trust and credibility','Support future business growth']),
  multi('Customer experience','What should visitors be able to do?','customerActions',['Learn about the business','View services and pricing','Request a quote','Book an appointment','Register or apply','Buy products','Make a payment or donation','Create an account','Upload information or documents','Contact the business easily']),
  multi('Owner tools','What should the owner or team manage?','ownerTools',['Website text and images','Services and pricing','Appointments or availability','Products and inventory','Orders and payments','Customer or member records','Forms and submissions','Email or text follow-up','Reports and performance','Staff or user access']),
  single('Brand readiness','What branding is already available?','brandStatus',['Logo, colors, and brand direction are ready','A logo exists, but the brand needs refinement','Some ideas exist, but branding is incomplete','Branding needs to be created from scratch']),
  single('Content readiness','How prepared is the business content?','contentStatus',['Text and photos are ready','Some content is ready','Content exists but needs rewriting or organization','Most content needs to be created','Unsure what content is needed']),
  budgetStep,
  single('Success','What would make this project feel successful?','success',['A professional online presence','More qualified leads or customers','More bookings, registrations, or sales','A smoother customer experience','Less manual administrative work','A system the business can grow with','A combination of these outcomes']),
  { render: reviewStep, validate: () => true, save: () => {} }
];

function single(eyebrow,title,key,values){return{render:()=>optionStep(eyebrow,title,'Choose the closest answer.',key,values,false),validate:()=>document.querySelector(`input[name="${key}"]:checked`)?true:fail('Please select one option.'),save:()=>state[key]=document.querySelector(`input[name="${key}"]:checked`).value}}
function multi(eyebrow,title,key,values){return{render:()=>optionStep(eyebrow,title,'Select all that apply.',key,values,true),validate:()=>checked(key).length?true:fail('Please select at least one option.'),save:()=>state[key]=checked(key)}}
function optionStep(eyebrow,title,description,key,values,isMulti){return `<p class="eyebrow">${eyebrow}</p><h2>${title}</h2><p class="lead">${description}</p><fieldset class="form-area"><legend>${isMulti?'Select all that apply':'Choose one'}</legend><div class="choices two">${values.map((v,i)=>isMulti?choice(key,`${key}-${i}`,v,(state[key]||[]).includes(v)):radio(key,`${key}-${i}`,v,state[key]===v)).join('')}</div></fieldset>`}
function contactStep(){return `<p class="eyebrow">Start from scratch</p><h1>Tell us about the new business or idea.</h1><p class="lead">Most questions are multiple choice. We will use your email to confirm the submission and follow up.</p><div class="form-area"><div class="field"><label for="businessName">Business or project name</label><input id="businessName" type="text" value="${esc(state.contact.businessName||'')}" autocomplete="organization"></div><div class="field"><label for="contactName">Your name</label><input id="contactName" type="text" value="${esc(state.contact.contactName||'')}" autocomplete="name"></div><div class="field"><label for="contactEmail">Email address</label><input id="contactEmail" type="email" value="${esc(state.contact.contactEmail||'')}" autocomplete="email" inputmode="email"></div></div>`}
function validateContact(){const b=value('businessName'),n=value('contactName'),e=value('contactEmail');if(!b||!n||!e)return fail('Please complete all fields.');if(!/^\S+@\S+\.\S+$/.test(e))return fail('Please enter a valid email address.');return true}
function saveContact(){state.contact={businessName:value('businessName'),contactName:value('contactName'),contactEmail:value('contactEmail')}}
function budgetStep(){return `<p class="eyebrow">Budget and timing</p><h2>What investment range fits the project?</h2><div class="form-area"><div class="field"><label for="monthlyBudget">Preferred monthly operating cost</label><select id="monthlyBudget"><option value="">Select a range</option>${options(['Under $25','$25–$50','$51–$100','$101–$150','More than $150','Unsure'],state.monthlyBudget)}</select></div><div class="field"><label for="projectBudget">Target design and development budget</label><select id="projectBudget"><option value="">Select a range</option>${options(['Under $2,500','$2,500–$5,000','$5,001–$10,000','$10,001–$15,000','More than $15,000','Needs to be discussed'],state.projectBudget)}</select></div><fieldset><legend>Preferred launch timing</legend><div class="choices">${['As soon as possible','Within 30 days','Within 60–90 days','Within 3–6 months','No firm deadline'].map((v,i)=>radio('timeline',`timeline-${i}`,v,state.timeline===v)).join('')}</div></fieldset></div>`}
budgetStep.render=budgetStep;
budgetStep.validate=()=>{if(!value('monthlyBudget')||!value('projectBudget'))return fail('Please select both budget ranges.');if(!document.querySelector('input[name="timeline"]:checked'))return fail('Please select a launch timeframe.');return true};
budgetStep.save=()=>{state.monthlyBudget=value('monthlyBudget');state.projectBudget=value('projectBudget');state.timeline=document.querySelector('input[name="timeline"]:checked').value};

function reviewStep(){return `<p class="eyebrow">Review</p><h2>Ready to submit?</h2><p class="lead">Use Back to change an answer.</p><div class="review-grid">${review('Business',state.contact.businessName)}${review('Contact',state.contact.contactName)}${review('Business stage',state.businessStage)}${review('Business type',state.businessType)}${review('What needs to be built',state.projectType.join(', '))}${review('Primary goals',state.primaryGoal.join(', '))}${review('Project budget',state.projectBudget)}${review('Launch timing',state.timeline)}${review('Success priority',state.success)}</div>`}
function render(){error.textContent='';wizard.innerHTML=steps[state.index].render();const current=state.index+1,total=steps.length,pct=Math.round(current/total*100);stepLabel.textContent=`Step ${current} of ${total}`;progressLabel.textContent=`${pct}%`;progress.style.width=`${pct}%`;back.style.visibility=state.index===0?'hidden':'visible';next.textContent=state.index===total-1?'Submit request':'Continue';window.scrollTo({top:0,behavior:'smooth'})}
function forward(){const step=steps[state.index];const validator=step.validate||(()=>true);if(!validator())return;(step.save||(()=>{}))();if(state.index===steps.length-1){submit();return}state.index++;render()}
function backward(){if(state.index>0){state.index--;render()}}
function submit(){if(APPS_SCRIPT_URL.startsWith('REPLACE_')){fail('Google Apps Script URL has not been configured yet.');return}next.disabled=true;next.textContent='Submitting…';const payloadData={submittedAt:new Date().toISOString(),contact:state.contact,selectedPlatforms:['New build / no existing platform'],platformResponses:{newBuild:{features:[...state.projectType,...state.customerActions,...state.ownerTools],cost:'Not applicable',future:'Build from scratch'}},goals:[...state.primaryGoal,`Business stage: ${state.businessStage}`,`Business type: ${state.businessType}`,`Audience: ${state.audience.join(', ')}`,`Brand readiness: ${state.brandStatus}`,`Content readiness: ${state.contentStatus}`],customerFeatures:state.customerActions,ownerFeatures:state.ownerTools,transition:'Start from scratch',monthlyBudget:state.monthlyBudget,projectBudget:state.projectBudget,timeline:state.timeline,success:state.success,source:'quote.alphazonelabs.com/start.html'};const postForm=document.createElement('form');postForm.method='POST';postForm.action=APPS_SCRIPT_URL;postForm.target='quoteSubmissionFrame';postForm.style.display='none';const payload=document.createElement('input');payload.name='payload';payload.value=JSON.stringify(payloadData);postForm.appendChild(payload);document.body.appendChild(postForm);postForm.submit()}
function showThanks(){footer.hidden=true;thankYou.hidden=false;document.body.classList.add('modal-open');thankYou.querySelector('.thank-you-close')?.focus()}
window.addEventListener('message',e=>{if(e.data?.type==='ALPHA_QUOTE_SUCCESS')showThanks();if(e.data?.type==='ALPHA_QUOTE_ERROR'){next.disabled=false;next.textContent='Submit request';fail('We could not submit the form. Please try again.')}});back.addEventListener('click',backward);next.addEventListener('click',forward);
function choice(name,id,label,isChecked=false){return `<div class="choice"><input id="${id}" name="${name}" type="checkbox" value="${esc(label)}" ${isChecked?'checked':''}><label for="${id}">${label}</label></div>`}
function radio(name,id,label,isChecked=false){return `<div class="choice radio"><input id="${id}" name="${name}" type="radio" value="${esc(label)}" ${isChecked?'checked':''}><label for="${id}">${label}</label></div>`}
function checked(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value)}
function value(id){return document.querySelector(`#${id}`)?.value.trim()||''}
function options(vals,selected){return vals.map(v=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${v}</option>`).join('')}
function review(label,val){return `<article class="review-card"><strong>${label}</strong><span>${esc(val||'Not provided')}</span></article>`}
function fail(msg){error.textContent=msg;return false}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
render();