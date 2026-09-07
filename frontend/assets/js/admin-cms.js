(function(){

const API =
  window.EDUNEXUS_API_BASE ||
  'https://edunexusbyneerajpal.onrender.com/api';

const token = () => localStorage.getItem('edunexusToken');

const modules = {
  notes:{
    label:'Notes',
    fields:[
      ['title','Title','text',true],
      ['description','Description','textarea',false],
      ['classLevel','Class','text',false],
      ['subject','Subject','text',false],
      ['chapter','Chapter','text',false],
      ['category','Category','text',false],
      ['tags','Tags','text',false],
      ['published','Published','checkbox',false]
    ]
  },

  videos:{
    label:'Videos',
    fields:[
      ['title','Title','text',true],
      ['description','Description','textarea',false],
      ['youtubeUrl','YouTube URL','url',false],
      ['thumbnail','Thumbnail URL','url',false],
      ['classLevel','Class','text',false],
      ['subject','Subject','text',false],
      ['chapter','Chapter','text',false],
      ['category','Category','text',false],
      ['featured','Featured','checkbox',false],
      ['published','Published','checkbox',false]
    ]
  },

  pyqs:{
    label:'PYQs',
    fields:[
      ['title','Title','text',true],
      ['description','Description','textarea',false],
      ['year','Year','number',false],
      ['exam','Exam','text',false],
      ['subject','Subject','text',false],
      ['classLevel','Class','text',false],
      ['chapter','Chapter','text',false],
      ['pdfUrl','PDF URL','url',false],
      ['thumbnail','Thumbnail URL','url',false],
      ['tags','Tags','text',false],
      ['published','Published','checkbox',false]
    ]
  },

  quizzes:{
    label:'Quizzes',
    fields:[
      ['title','Title','text',true],
      ['description','Description','textarea',false],
      ['category','Category','text',false],
      ['subject','Subject','text',false],
      ['classLevel','Class','text',false],
      ['duration','Duration (minutes)','number',false],
      ['passingMarks','Passing Marks','number',false],
      ['published','Published','checkbox',false]
    ]
  },

  'mock-tests':{
    label:'Mock Tests',
    fields:[
      ['title','Title','text',true],
      ['exam','Exam','text',false],
      ['subject','Subject','text',false],
      ['classLevel','Class','text',false],
      ['duration','Duration (minutes)','number',false],
      ['totalMarks','Total Marks','number',false],
      ['passingMarks','Passing Marks','number',false],
      ['instructions','Instructions','textarea',false],
      ['status','Status','select',false],
      ['published','Published','checkbox',false]
    ]
  },

  mindmaps:{
    label:'Mind Maps',
    fields:[
      ['title','Title','text',true],
      ['description','Description','textarea',false],
      ['subject','Subject','text',false],
      ['chapter','Chapter','text',false],
      ['classLevel','Class','text',false],
      ['exam','Exam','text',false],
      ['pdfUrl','PDF URL','url',false],
      ['imageUrl','Image URL','url',false],
      ['thumbnail','Thumbnail URL','url',false],
      ['published','Published','checkbox',false]
    ]
  },

  'live-classes':{
    label:'Live Classes',
    fields:[
      ['title','Title','text',true],
      ['teacher','Teacher','text',false],
      ['subject','Subject','text',false],
      ['date','Date','datetime-local',false],
      ['startTime','Start Time','text',false],
      ['endTime','End Time','text',false],
      ['meetingUrl','Meeting URL','url',false],
      ['youtubeLiveUrl','YouTube Live URL','url',false],
      ['description','Description','textarea',false],
      ['thumbnail','Thumbnail URL','url',false],
      ['status','Status','select',false],
      ['published','Published','checkbox',false]
    ]
  }
};

function escapeHTML(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

async function request(url, options={}){
  const headers={
    Authorization:'Bearer '+token(),
    ...(options.body ? {'Content-Type':'application/json'} : {})
  };

  const res=await fetch(API+url,{...options,headers});
  const data=await res.json().catch(()=>({}));

  if(!res.ok){
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function toast(message,type='success'){
  let el=document.querySelector('.cms-toast');

  if(!el){
    el=document.createElement('div');
    el.className='cms-toast';
    document.body.appendChild(el);
  }

  el.textContent=message;
  el.className='cms-toast show '+type;

  clearTimeout(window.__cmsToastTimer);

  window.__cmsToastTimer=setTimeout(()=>{
    el.className='cms-toast';
  },2500);
}

function ensureModal(){
  if(document.getElementById('cmsModal')) return;

  document.body.insertAdjacentHTML('beforeend',`
    <div class="cms-modal" id="cmsModal">
      <div class="cms-modal-box">
        <div class="cms-modal-header">
          <h2 id="cmsModalTitle">Content</h2>
          <button class="cms-btn cms-btn-secondary" id="cmsModalClose">✕</button>
        </div>

        <form id="cmsForm">
          <div class="cms-modal-body">
            <div class="cms-form-grid" id="cmsFormFields"></div>
          </div>

          <div class="cms-modal-footer">
            <button type="button" class="cms-btn cms-btn-secondary" id="cmsCancel">
              Cancel
            </button>
            <button type="submit" class="cms-btn cms-btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `);

  const close=()=>{
    document.getElementById('cmsModal').classList.remove('active');
  };

  document.getElementById('cmsModalClose').onclick=close;
  document.getElementById('cmsCancel').onclick=close;
}

function openForm(module,item={}){
  ensureModal();

  const config=modules[module];
  if(!config) return;

  document.getElementById('cmsModalTitle').textContent=
    (item._id?'Edit ':'Add ')+config.label;

  const fields=document.getElementById('cmsFormFields');

  fields.innerHTML=config.fields.map(([key,label,type,required])=>{

    const value=item[key] ?? '';

    if(type==='checkbox'){
      return `
        <div class="cms-field full">
          <label class="cms-checkbox">
            <input
              type="checkbox"
              name="${key}"
              ${value===true?'checked':''}
            >
            ${escapeHTML(label)}
          </label>
        </div>
      `;
    }

    if(type==='textarea'){
      return `
        <div class="cms-field full">
          <label>${escapeHTML(label)}</label>
          <textarea
            class="cms-textarea"
            name="${key}"
            ${required?'required':''}
          >${escapeHTML(value)}</textarea>
        </div>
      `;
    }

    if(type==='select'){
      const options =
        key==='status'
          ? ['Draft','Published','Archived']
          : ['Upcoming','Live','Completed','Cancelled'];

      return `
        <div class="cms-field">
          <label>${escapeHTML(label)}</label>
          <select class="cms-select" name="${key}">
            ${options.map(o=>`
              <option value="${escapeHTML(o)}"
                ${value===o?'selected':''}>
                ${escapeHTML(o)}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }

    return `
      <div class="cms-field">
        <label>${escapeHTML(label)}</label>
        <input
          class="cms-input"
          type="${type}"
          name="${key}"
          value="${escapeHTML(value)}"
          ${required?'required':''}
        >
      </div>
    `;
  }).join('');

  const modal=document.getElementById('cmsModal');
  modal.classList.add('active');

  const form=document.getElementById('cmsForm');

  form.onsubmit=async e=>{
    e.preventDefault();

    const body={};

    config.fields.forEach(([key])=>{
      const input=form.elements[key];
      if(!input) return;

      if(input.type==='checkbox'){
        body[key]=input.checked;
      }else{
        body[key]=input.value;
      }
    });

    if(body.tags && typeof body.tags==='string'){
      body.tags=body.tags
        .split(',')
        .map(x=>x.trim())
        .filter(Boolean);
    }

    try{
      const id=item._id;

      await request(
        id
          ? '/'+module+'/'+id
          : '/'+module,
        {
          method:id?'PUT':'POST',
          body:JSON.stringify(body)
        }
      );

      modal.classList.remove('active');
      toast(config.label+' saved successfully');

      if(window.refreshCMSModule){
        window.refreshCMSModule(module);
      }
    }catch(error){
      toast(error.message,'error');
    }
  };
}

window.openAdvancedCMSForm=openForm;

window.deleteAdvancedCMSItem=async function(module,id){
  if(!confirm('Delete this content permanently?')) return;

  try{
    await request('/'+module+'/'+id,{method:'DELETE'});
    toast('Deleted successfully');

    if(window.refreshCMSModule){
      window.refreshCMSModule(module);
    }
  }catch(error){
    toast(error.message,'error');
  }
};

window.toggleAdvancedPublish=async function(module,id,published){
  try{
    await request('/'+module+'/'+id+'/publish',{
      method:'PATCH',
      body:JSON.stringify({published:!published})
    });

    toast(published?'Unpublished':'Published');

    if(window.refreshCMSModule){
      window.refreshCMSModule(module);
    }
  }catch(error){
    toast(error.message,'error');
  }
};

window.initAdvancedCMS=function(){

  ensureModal();

  Object.keys(modules).forEach(module=>{
    const section=document.getElementById(module);
    if(!section) return;

    let manager=section.querySelector('.advanced-cms-manager');

    if(!manager){
      manager=document.createElement('div');
      manager.className='advanced-cms-manager';
      section.appendChild(manager);
    }

    manager.innerHTML=`
      <div class="cms-toolbar">
        <div class="cms-toolbar-left">
          <input
            class="cms-input"
            id="advanced-search-${module}"
            placeholder="Search ${escapeHTML(modules[module].label)}..."
          >
        </div>

        <div class="cms-toolbar-right">
          <button
            type="button"
            class="cms-btn cms-btn-primary"
            id="advanced-add-${module}">
            + Add ${escapeHTML(modules[module].label)}
          </button>
        </div>
      </div>
    `;

    document.getElementById('advanced-add-'+module).onclick=()=>{
      openForm(module);
    };

    const search=document.getElementById('advanced-search-'+module);

    let timer;

    search.oninput=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        if(window.refreshCMSModule){
          window.refreshCMSModule(module);
        }
      },350);
    };
  });
};

document.addEventListener('DOMContentLoaded',window.initAdvancedCMS);

})();

/* =========================================================
   EDUNEXUS ADVANCED CMS — UNIFIED CRUD CONTROLLER
   Keeps existing upload system intact.
========================================================= */

(function () {
    'use strict';

    const API = window.EduNexusAPI;
    if (!API) return;

    const modules = {
        notes: {
            endpoint: '/notes',
            title: 'Notes',
            fields: [
                ['title','Title','text',true],
                ['description','Description','textarea'],
                ['classLevel','Class','text'],
                ['subject','Subject','text'],
                ['chapter','Chapter','text'],
                ['category','Category','text'],
                ['tags','Tags','text'],
                ['pdfUrl','PDF URL','url'],
                ['thumbnail','Thumbnail URL','url'],
                ['published','Published','checkbox']
            ]
        },
        videos: {
            endpoint: '/videos',
            title: 'Videos',
            fields: [
                ['title','Title','text',true],
                ['description','Description','textarea'],
                ['youtubeUrl','YouTube URL','url',true],
                ['thumbnail','Thumbnail URL','url'],
                ['classLevel','Class','text'],
                ['subject','Subject','text'],
                ['chapter','Chapter','text'],
                ['category','Category','text'],
                ['featured','Featured','checkbox'],
                ['published','Published','checkbox']
            ]
        },
        pyqs: {
            endpoint: '/pyqs',
            title: 'PYQs',
            fields: [
                ['title','Title','text',true],
                ['description','Description','textarea'],
                ['year','Year','number'],
                ['exam','Exam','text'],
                ['subject','Subject','text'],
                ['classLevel','Class','text'],
                ['chapter','Chapter','text'],
                ['tags','Tags','text'],
                ['pdfUrl','PDF URL','url'],
                ['thumbnail','Thumbnail URL','url'],
                ['published','Published','checkbox']
            ]
        },
        quizzes: {
            endpoint: '/quizzes',
            title: 'Quizzes',
            fields: [
                ['title','Title','text',true],
                ['description','Description','textarea'],
                ['category','Category','text'],
                ['subject','Subject','text'],
                ['classLevel','Class','text'],
                ['duration','Duration (minutes)','number'],
                ['passingMarks','Passing Marks','number'],
                ['published','Published','checkbox']
            ]
        },
        'mock-tests': {
            endpoint: '/mock-tests',
            title: 'Mock Tests',
            fields: [
                ['title','Title','text',true],
                ['exam','Exam','text'],
                ['subject','Subject','text'],
                ['classLevel','Class','text'],
                ['duration','Duration (minutes)','number'],
                ['totalMarks','Total Marks','number'],
                ['passingMarks','Passing Marks','number'],
                ['instructions','Instructions','textarea'],
                ['status','Status','select',true,['Draft','Published','Archived']],
                ['published','Published','checkbox']
            ]
        },
        mindmaps: {
            endpoint: '/mindmaps',
            title: 'Mind Maps',
            fields: [
                ['title','Title','text',true],
                ['description','Description','textarea'],
                ['subject','Subject','text'],
                ['chapter','Chapter','text'],
                ['classLevel','Class','text'],
                ['exam','Exam','text'],
                ['pdfUrl','PDF URL','url'],
                ['imageUrl','Image URL','url'],
                ['thumbnail','Thumbnail URL','url'],
                ['published','Published','checkbox']
            ]
        },
        'live-classes': {
            endpoint: '/live-classes',
            title: 'Live Classes',
            fields: [
                ['title','Title','text',true],
                ['teacher','Teacher','text'],
                ['subject','Subject','text'],
                ['date','Date','date'],
                ['startTime','Start Time','time'],
                ['endTime','End Time','time'],
                ['meetingUrl','Meeting URL','url'],
                ['youtubeLiveUrl','YouTube Live URL','url'],
                ['description','Description','textarea'],
                ['thumbnail','Thumbnail URL','url'],
                ['status','Status','select',true,['Upcoming','Live','Completed','Cancelled']],
                ['published','Published','checkbox']
            ]
        }
    };

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#039;');
    }

    function valueOf(obj,key) {
        return obj && obj[key] !== undefined ? obj[key] : '';
    }

    function buildForm(moduleKey, item = {}) {
        const mod = modules[moduleKey];
        if (!mod) return '';

        return `
        <form id="advancedCMSForm" class="cms-advanced-form">
            <input type="hidden" name="_id" value="${esc(item._id || '')}">
            <div class="cms-form-grid">
                ${mod.fields.map(f => {
                    const [key,label,type,required,options] = f;
                    const value = valueOf(item,key);

                    if (type === 'checkbox') {
                        return `
                        <label class="cms-check-field">
                            <input type="checkbox" name="${key}" ${value ? 'checked' : ''}>
                            <span>${label}</span>
                        </label>`;
                    }

                    if (type === 'textarea') {
                        return `
                        <label class="cms-field">
                            <span>${label}</span>
                            <textarea name="${key}" class="cms-textarea" ${required?'required':''}>${esc(value)}</textarea>
                        </label>`;
                    }

                    if (type === 'select') {
                        return `
                        <label class="cms-field">
                            <span>${label}</span>
                            <select name="${key}" class="cms-select" ${required?'required':''}>
                                ${options.map(o =>
                                    `<option value="${esc(o)}" ${String(value)===o?'selected':''}>${esc(o)}</option>`
                                ).join('')}
                            </select>
                        </label>`;
                    }

                    return `
                    <label class="cms-field">
                        <span>${label}</span>
                        <input
                            type="${type}"
                            name="${key}"
                            class="cms-input"
                            value="${esc(value)}"
                            ${required?'required':''}>
                    </label>`;
                }).join('')}
            </div>

            <div class="cms-modal-footer">
                <button type="button" class="cms-btn" data-cms-close>Cancel</button>
                <button type="submit" class="cms-btn cms-btn-primary">
                    ${item._id ? 'Update' : 'Create'}
                </button>
            </div>
        </form>`;
    }

    async function save(moduleKey, form) {
        const mod = modules[moduleKey];
        if (!mod) return;

        const fd = new FormData(form);
        const id = fd.get('_id');
        const body = {};

        mod.fields.forEach(([key,,type]) => {
            if (type === 'checkbox') {
                body[key] = form.querySelector(`[name="${key}"]`).checked;
            } else {
                body[key] = fd.get(key);
            }
        });

        ['year','duration','passingMarks','totalMarks'].forEach(k => {
            if (body[k] !== undefined && body[k] !== '') body[k] = Number(body[k]);
        });

        if (body.tags) {
            body.tags = String(body.tags)
                .split(',')
                .map(x => x.trim())
                .filter(Boolean);
        }

        const method = id ? 'PUT' : 'POST';
        const endpoint = id
            ? `${mod.endpoint}/${encodeURIComponent(id)}`
            : mod.endpoint;

        const response = await API.request(endpoint,{
            method,
            body: JSON.stringify(body)
        });

        if (!response) throw new Error('No response');

        toast(id ? `${mod.title} updated successfully` : `${mod.title} created successfully`);

        closeModal();

        if (typeof window.refreshCMSModule === 'function') {
            window.refreshCMSModule(moduleKey);
        }
    }

    function open(moduleKey,item={}) {
        const mod = modules[moduleKey];
        if (!mod) return;

        let modal = document.getElementById('advancedCMSModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'advancedCMSModal';
            modal.className = 'cms-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="cms-modal-box">
                <div class="cms-modal-header">
                    <div>
                        <small>EduNexus CMS</small>
                        <h2>${item._id ? 'Edit' : 'Add'} ${mod.title}</h2>
                    </div>
                    <button type="button" class="cms-btn" data-cms-close>×</button>
                </div>
                <div class="cms-modal-body">
                    ${buildForm(moduleKey,item)}
                </div>
            </div>`;

        modal.classList.add('active');

        modal.querySelectorAll('[data-cms-close]').forEach(btn => {
            btn.addEventListener('click',closeModal);
        });

        modal.querySelector('#advancedCMSForm').addEventListener('submit',async e=>{
            e.preventDefault();

            const submit=e.submitter;
            if(submit) {
                submit.disabled=true;
                submit.textContent='Saving...';
            }

            try {
                await save(moduleKey,e.currentTarget);
            } catch(error) {
                console.error(error);
                toast(error.message || 'Save failed','error');
            } finally {
                if(submit) {
                    submit.disabled=false;
                    submit.textContent='Save';
                }
            }
        });
    }

    function closeModal() {
        const modal=document.getElementById('advancedCMSModal');
        if(modal) modal.classList.remove('active');
    }

    function toast(message,type='success') {
        if(typeof window.cmsToast === 'function') {
            window.cmsToast(message,type);
            return;
        }

        let el=document.getElementById('cmsToast');

        if(!el){
            el=document.createElement('div');
            el.id='cmsToast';
            el.className='cms-toast';
            document.body.appendChild(el);
        }

        el.textContent=message;
        el.classList.add('show');

        setTimeout(()=>el.classList.remove('show'),3000);
    }

    window.EduNexusAdvancedCMS = {
        modules,
        open,
        close: closeModal,
        save
    };

})();

/* =========================================================
   ADVANCED QUESTION BUILDER
========================================================= */

(function () {
    'use strict';

    const CMS = window.EduNexusAdvancedCMS;
    if (!CMS) return;

    function esc(v) {
        return String(v ?? '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#039;');
    }

    function questionHTML(q = {}, index = 0) {
        const type = q.type || 'mcq';

        return `
        <div class="cms-question-card" data-question="${index}">
            <div class="cms-question-head">
                <strong>Question ${index + 1}</strong>
                <button type="button"
                        class="cms-btn cms-btn-danger"
                        data-remove-question>
                    Remove
                </button>
            </div>

            <label class="cms-field">
                <span>Question</span>
                <textarea class="cms-textarea q-question"
                          placeholder="Enter question..."
                          required>${esc(q.question)}</textarea>
            </label>

            <div class="cms-form-grid">
                <label class="cms-field">
                    <span>Type</span>
                    <select class="cms-select q-type">
                        <option value="mcq" ${type==='mcq'?'selected':''}>MCQ</option>
                        <option value="true-false" ${type==='true-false'?'selected':''}>True / False</option>
                    </select>
                </label>

                <label class="cms-field">
                    <span>Marks</span>
                    <input class="cms-input q-marks"
                           type="number"
                           min="0"
                           value="${esc(q.marks ?? 1)}">
                </label>

                <label class="cms-field">
                    <span>Difficulty</span>
                    <select class="cms-select q-difficulty">
                        <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
                        <option value="medium" ${!q.difficulty || q.difficulty==='medium'?'selected':''}>Medium</option>
                        <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
                    </select>
                </label>
            </div>

            <div class="q-options">
                ${type === 'true-false'
                    ? `
                    <label class="cms-field">
                        <span>Correct Answer</span>
                        <select class="cms-select q-correct">
                            <option value="true" ${q.correctAnswer==='true'?'selected':''}>True</option>
                            <option value="false" ${q.correctAnswer==='false'?'selected':''}>False</option>
                        </select>
                    </label>`
                    : `
                    <div class="cms-options-list">
                        ${[0,1,2,3].map(i => `
                            <div class="cms-option-row">
                                <input class="cms-input q-option"
                                       value="${esc((q.options||[])[i] || '')}"
                                       placeholder="Option ${String.fromCharCode(65+i)}">
                            </div>
                        `).join('')}

                        <label class="cms-field">
                            <span>Correct Answer</span>
                            <select class="cms-select q-correct">
                                ${[0,1,2,3].map(i => {
                                    const val=(q.options||[])[i] || '';
                                    return `<option value="${esc(val)}"
                                        ${q.correctAnswer===val && val ? 'selected':''}>
                                        Option ${String.fromCharCode(65+i)}
                                    </option>`;
                                }).join('')}
                            </select>
                        </label>
                    </div>`
                }
            </div>

            <label class="cms-field">
                <span>Explanation</span>
                <textarea class="cms-textarea q-explanation"
                          placeholder="Explain the correct answer...">${esc(q.explanation)}</textarea>
            </label>
        </div>`;
    }

    function collectQuestions(container) {
        return [...container.querySelectorAll('.cms-question-card')]
            .map(card => {
                const type=card.querySelector('.q-type').value;
                const options=[...card.querySelectorAll('.q-option')]
                    .map(x=>x.value.trim())
                    .filter(Boolean);

                return {
                    question: card.querySelector('.q-question').value.trim(),
                    type,
                    options: type==='mcq' ? options : ['true','false'],
                    correctAnswer: card.querySelector('.q-correct').value,
                    explanation: card.querySelector('.q-explanation').value.trim(),
                    marks: Number(card.querySelector('.q-marks').value || 1),
                    difficulty: card.querySelector('.q-difficulty').value
                };
            })
            .filter(q=>q.question);
    }

    function attachBuilder(container, questions=[]) {
        const list=document.createElement('div');
        list.className='cms-question-builder';

        list.innerHTML=`
            <div class="cms-question-toolbar">
                <div>
                    <strong>Questions</strong>
                    <small class="cms-question-count">0 questions</small>
                </div>
                <button type="button"
                        class="cms-btn cms-btn-primary"
                        data-add-question>
                    + Add Question
                </button>
            </div>

            <div class="cms-question-list"></div>
        `;

        container.appendChild(list);

        const questionList=list.querySelector('.cms-question-list');

        function render() {
            questionList.innerHTML=questions.length
                ? questions.map((q,i)=>questionHTML(q,i)).join('')
                : `<div class="cms-empty">No questions added yet.</div>`;

            list.querySelector('.cms-question-count').textContent =
                `${questions.length} question${questions.length===1?'':'s'}`;

            questionList.querySelectorAll('[data-remove-question]')
                .forEach((btn,i)=>{
                    btn.addEventListener('click',()=>{
                        questions.splice(i,1);
                        render();
                    });
                });

            questionList.querySelectorAll('.q-type')
                .forEach((select,i)=>{
                    select.addEventListener('change',()=>{
                        const card=select.closest('.cms-question-card');

                        if(select.value==='true-false'){
                            card.querySelector('.q-options').innerHTML=`
                                <label class="cms-field">
                                    <span>Correct Answer</span>
                                    <select class="cms-select q-correct">
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </label>`;
                        } else {
                            card.querySelector('.q-options').innerHTML=`
                                <div class="cms-options-list">
                                    ${[0,1,2,3].map(i=>`
                                        <div class="cms-option-row">
                                            <input class="cms-input q-option"
                                                   placeholder="Option ${String.fromCharCode(65+i)}">
                                        </div>`).join('')}
                                    <label class="cms-field">
                                        <span>Correct Answer</span>
                                        <select class="cms-select q-correct">
                                            <option value="">Select correct option</option>
                                        </select>
                                    </label>
                                </div>`;
                        }
                    });
                });
        }

        list.querySelector('[data-add-question]')
            .addEventListener('click',()=>{
                questions.push({
                    question:'',
                    type:'mcq',
                    options:['','','',''],
                    correctAnswer:'',
                    explanation:'',
                    marks:1,
                    difficulty:'medium'
                });
                render();
            });

        render();

        return {
            getQuestions:()=>collectQuestions(questionList)
        };
    }

    window.EduNexusQuestionBuilder = {
        attach: attachBuilder,
        collect: collectQuestions
    };

})();

/* =========================================================
   STEP 4 — UNIFIED CMS LIST ENGINE
   Search • Filter • Sort • Pagination • Publish • Delete
========================================================= */

(function () {
    'use strict';

    const CMS = window.EduNexusAdvancedCMS;
    const API = window.EduNexusAPI;

    if (!CMS || !API) return;

    const state = {};

    function esc(v) {
        return String(v ?? '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#039;');
    }

    function getState(module) {
        if (!state[module]) {
            state[module] = {
                page: 1,
                limit: 10,
                search: '',
                sort: 'displayOrder',
                order: 'asc',
                published: ''
            };
        }
        return state[module];
    }

    async function load(module, target) {
        const config = CMS.modules[module];
        if (!config || !target) return;

        const s = getState(module);

        target.innerHTML = `
            <div class="cms-loading">
                Loading ${esc(config.title)}...
            </div>
        `;

        try {
            const params = new URLSearchParams({
                page: s.page,
                limit: s.limit,
                search: s.search,
                sort: s.sort,
                order: s.order
            });

            if (s.published !== '') {
                params.set('published', s.published);
            }

            const response = await API.get(
                `${config.endpoint}?${params.toString()}`
            );

            const items = response?.items ||
                          response?.data?.items ||
                          response?.data ||
                          [];

            const pagination =
                response?.pagination ||
                response?.data?.pagination ||
                {
                    page: s.page,
                    limit: s.limit,
                    total: items.length,
                    pages: 1
                };

            render(module, target, items, pagination);

        } catch (error) {
            console.error(error);

            target.innerHTML = `
                <div class="cms-empty">
                    <h3>Unable to load ${esc(config.title)}</h3>
                    <p>${esc(error.message || 'API request failed')}</p>
                    <button class="cms-btn cms-btn-primary"
                            data-cms-retry>
                        Retry
                    </button>
                </div>
            `;

            target.querySelector('[data-cms-retry]')
                ?.addEventListener('click', () => load(module,target));
        }
    }

    function render(module,target,items,pagination) {
        const config=CMS.modules[module];
        const s=getState(module);

        target.innerHTML=`
            <div class="cms-toolbar">

                <div class="cms-search-box">
                    <input
                        class="cms-input"
                        data-cms-search
                        value="${esc(s.search)}"
                        placeholder="Search ${esc(config.title)}...">
                </div>

                <select class="cms-select" data-cms-published>
                    <option value="">All Status</option>
                    <option value="true" ${s.published==='true'?'selected':''}>
                        Published
                    </option>
                    <option value="false" ${s.published==='false'?'selected':''}>
                        Draft
                    </option>
                </select>

                <select class="cms-select" data-cms-limit>
                    ${[10,20,50,100].map(n =>
                        `<option value="${n}" ${s.limit===n?'selected':''}>
                            ${n} / page
                        </option>`
                    ).join('')}

                </select>

                <button class="cms-btn cms-btn-primary"
                        data-cms-add>
                    + Add ${esc(config.title)}
                </button>
            </div>

            <div class="cms-table-wrap">
                <table class="cms-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th data-sort="title">Title ↕</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${
                            items.length
                            ? items.map((item,index)=>`
                                <tr>
                                    <td>${((pagination.page-1)*pagination.limit)+index+1}</td>

                                    <td>
                                        <strong>${esc(item.title || 'Untitled')}</strong>
                                    </td>

                                    <td>
                                        <span class="cms-status ${
                                            item.published
                                            ? 'published'
                                            : 'draft'
                                        }">
                                            ${item.published?'Published':'Draft'}
                                        </span>
                                    </td>

                                    <td>
                                        ${item.createdAt
                                            ? new Date(item.createdAt)
                                                .toLocaleDateString()
                                            : '—'}
                                    </td>

                                    <td>
                                        <div class="cms-actions">

                                            <button
                                                class="cms-btn cms-btn-sm"
                                                data-edit="${esc(item._id)}">
                                                Edit
                                            </button>

                                            <button
                                                class="cms-btn cms-btn-sm"
                                                data-publish="${esc(item._id)}">
                                                ${item.published
                                                    ? 'Unpublish'
                                                    : 'Publish'}
                                            </button>

                                            <button
                                                class="cms-btn cms-btn-sm cms-btn-danger"
                                                data-delete="${esc(item._id)}">
                                                Delete
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            `).join('')
                            : `
                                <tr>
                                    <td colspan="5">
                                        <div class="cms-empty">
                                            No ${esc(config.title.toLowerCase())}
                                            found.
                                        </div>
                                    </td>
                                </tr>
                            `
                        }
                    </tbody>
                </table>
            </div>

            <div class="cms-pagination">

                <button
                    class="cms-btn"
                    data-page="${Math.max(1,pagination.page-1)}"
                    ${pagination.page<=1?'disabled':''}>
                    ← Previous
                </button>

                <span>
                    Page ${pagination.page || 1}
                    of ${pagination.pages || 1}
                    · ${pagination.total || 0} total
                </span>

                <button
                    class="cms-btn"
                    data-page="${Math.min(
                        pagination.pages || 1,
                        (pagination.page || 1)+1
                    )}"
                    ${(pagination.page || 1)>=(pagination.pages || 1)
                        ?'disabled':''}>
                    Next →
                </button>

            </div>
        `;

        target.querySelector('[data-cms-search]')
            ?.addEventListener('input', debounce(e=>{
                s.search=e.target.value.trim();
                s.page=1;
                load(module,target);
            },350));

        target.querySelector('[data-cms-published]')
            ?.addEventListener('change',e=>{
                s.published=e.target.value;
                s.page=1;
                load(module,target);
            });

        target.querySelector('[data-cms-limit]')
            ?.addEventListener('change',e=>{
                s.limit=Number(e.target.value);
                s.page=1;
                load(module,target);
            });

        target.querySelector('[data-cms-add]')
            ?.addEventListener('click',()=>{
                CMS.open(module,{});
            });

        target.querySelectorAll('[data-page]')
            .forEach(btn=>{
                btn.addEventListener('click',()=>{
                    s.page=Number(btn.dataset.page);
                    load(module,target);
                });
            });

        target.querySelectorAll('[data-edit]')
            .forEach(btn=>{
                btn.addEventListener('click',async()=>{
                    try {
                        const item=await API.get(
                            `${config.endpoint}/${btn.dataset.edit}`
                        );

                        CMS.open(
                            module,
                            item?.data || item
                        );
                    } catch(error) {
                        console.error(error);
                        alert(error.message || 'Unable to load item');
                    }
                });
            });

        target.querySelectorAll('[data-publish]')
            .forEach(btn=>{
                btn.addEventListener('click',async()=>{
                    const id=btn.dataset.publish;

                    try {
                        await API.request(
                            `${config.endpoint}/${id}/publish`,
                            {
                                method:'PATCH',
                                body:JSON.stringify({})
                            }
                        );

                        load(module,target);
                    } catch(error) {
                        console.error(error);
                        alert(error.message || 'Unable to update status');
                    }
                });
            });

        target.querySelectorAll('[data-delete]')
            .forEach(btn=>{
                btn.addEventListener('click',async()=>{
                    if(!confirm(
                        'Delete this item permanently?'
                    )) return;

                    try {
                        await API.del(
                            `${config.endpoint}/${btn.dataset.delete}`
                        );

                        load(module,target);
                    } catch(error) {
                        console.error(error);
                        alert(error.message || 'Delete failed');
                    }
                });
            });

        target.querySelectorAll('[data-sort]')
            .forEach(th=>{
                th.addEventListener('click',()=>{
                    const field=th.dataset.sort;

                    if(s.sort===field) {
                        s.order=s.order==='asc'
                            ? 'desc'
                            : 'asc';
                    } else {
                        s.sort=field;
                        s.order='asc';
                    }

                    load(module,target);
                });
            });
    }

    function debounce(fn,delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer=setTimeout(()=>fn.apply(this,args),delay);
        };
    }

    window.EduNexusCMSList = {
        load,
        state
    };

})();
