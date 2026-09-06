/* EduNexus API bridge - shared by all frontend pages */
(function () {
  const API_BASE = window.EDUNEXUS_API_BASE || '/api';
  async function request(path, options={}) {
    const headers = {'Content-Type':'application/json', ...(options.headers||{})};
    const token = localStorage.getItem('edunexusToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(API_BASE + path, {...options, headers});
    let data = null; try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
    return data;
  }
  const api = {
    base: API_BASE,
    get:(p)=>request(p),
    post:(p,b)=>request(p,{method:'POST',body:JSON.stringify(b)}),
    put:(p,b)=>request(p,{method:'PUT',body:JSON.stringify(b)}),
    del:(p)=>request(p,{method:'DELETE'}),
    login: async (email,password)=>{const d=await request('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); localStorage.setItem('edunexusToken',d.token); localStorage.setItem('edunexusUser',JSON.stringify(d.user)); return d;},
    signup: async (name,email,password,classLevel='10')=>{const d=await request('/auth/signup',{method:'POST',body:JSON.stringify({name,email,password,classLevel})}); localStorage.setItem('edunexusToken',d.token); localStorage.setItem('edunexusUser',JSON.stringify(d.user)); return d;},
    logout:()=>{localStorage.removeItem('edunexusToken');localStorage.removeItem('edunexusUser');location.href='login.html';},
    me:()=>request('/auth/me'),
    results:()=>request('/results/mine')
  };
  window.EduNexusAPI = api;
  document.addEventListener('DOMContentLoaded',()=>{
    const user=JSON.parse(localStorage.getItem('edunexusUser')||'null');
    document.querySelectorAll('[data-auth-name]').forEach(e=>e.textContent=user?.name||'Student');
    document.querySelectorAll('[data-logout]').forEach(e=>e.addEventListener('click',e=>{e.preventDefault();api.logout();}));
    document.querySelectorAll('a[href="login.html"],a[href="../login.html"]').forEach(a=>{if(user){a.textContent='Dashboard';}});
  });
})();
