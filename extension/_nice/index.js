var x=()=>{let t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e="",r=t.length;for(let s=0;s<10;s++)e+=t.charAt(Math.floor(Math.random()*r));return e},H=x(),v=t=>{H=t};var R=t=>t.map(e=>JSON.stringify(Object.hasOwn(e,"get")&&e.get())).join(""),M=t=>t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();var k=t=>{let e="",r=!1,s={},a=o=>{},p=()=>{let o=document.querySelector(`[data-nice-id="${e}"]`);!o||r||(r=!0,setTimeout(()=>{let n=a(e);n&&o.replaceWith(n.children[0]),r=!1},0))};return(o,n)=>(e=x(),v(e),s=o??{},a=t(s,n),{id:e,type:"component",properties:o,render:a,markDirty:p,key:n??e})};var N=(t,e)=>{let r=k(t)();if(e&&typeof window<"u"){let s=e?document.querySelector(e):void 0;if(!s)throw new Error(`Failed to attach - Element "${e}" not found in the DOM.`);r.markDirty=()=>{let a=r.render(x());if(a){for(;s.firstChild;)s.removeChild(s.firstChild);window?Array.from(a.hydrate().children).forEach(p=>{s.appendChild(p)}):s.innerHTML=a.html}},r.markDirty()}else return{html:r.render("nice-app-root").html,id:"nice-app-root",hydrate:s=>{let a=document.querySelector(`#${s}`);if(!a)throw new Error(`Failed to attach - Element "${e}" not found in the DOM.`);r.markDirty=()=>{let p=r.render(x());if(p){for(;a.firstChild;)a.removeChild(a.firstChild);window?Array.from(p.hydrate().children).forEach(d=>{a.appendChild(d)}):a.innerHTML=p.html}},r.markDirty()}}};var j=(t,...e)=>a=>{let p=`<!-- ${a} BEGIN -->`,d=`<!-- ${a} END -->`,o="",n={},i={};t.forEach((m,f)=>{let l=e[f];if(o+=m,l===void 0)return;let u=I(m),c=Math.random().toString(36).substring(7);if(typeof l!="object"){u&&!m.endsWith('"')?o+=`"${l}"`:o+=l;return}switch(l.type){case"component":o+=c,n[c]=l.render(l.id);break;case"state":o+=c,i[c]=l;break}}),Object.keys(n).forEach(m=>{o=o.replace(m,n[m].html.replace(/(<.+)( )/,`$1 data-reattach-child="${m}" `))}),Object.keys(i).forEach(m=>{let f=o.split(m)[0],l=I(f),u=i[m].get(),c=u,h=1;if(u)if(typeof u=="object"&&u.type==="component"){let T=u;c=T.render(T.id).html}else Array.isArray(u)&&(h=u.length,c=u.map(T=>{if(typeof T=="object"&&T.type==="component"){let E=T;return E.render(E.id).html}else return T}).join(""));let b=l?`"${c||""}" data-bind-${l}="${m}"`:`<!-- @ -->${c}<span style="display: none;" data-reattach-state="${m}" data-reattach-extras="${!!c&&h}"></span><!-- # -->`;o=o.replace(m,b)});let y=()=>{let m=P(o);return m.children[0].setAttribute("data-nice-id",a),Object.keys(i).forEach(f=>{m.querySelectorAll(`[data-reattach-state="${f}"]`).forEach(l=>{let u=l.getAttribute("data-reattach-extras");if(u&&u!=="false")for(let T=0;T<parseInt(u);T++)l.previousSibling?.remove();let c=i[f].get(),h=l.previousSibling,b=l.nextSibling;for(;h&&h.nodeType!==Node.COMMENT_NODE;)h=h.previousSibling;i[f].markers.push([h,b]),S(c,h,b)})}),Object.keys(n).forEach(f=>{m.querySelectorAll(`[data-reattach-child="${f}"]`).forEach(l=>{let u=n[f].hydrate().children[0];l.replaceWith(u)})}),m.querySelectorAll("*").forEach(f=>{Array.from(f.attributes).forEach(l=>{let u=l.name.match(/data-bind-(.+)$/);if(u){let c=u[1].trim(),h=l.value,b=c.startsWith("on-"),T=c.startsWith("set-"),E=c==="ref",g=i[h];if(!g)return;g.attributes[c]||(g.attributes[c]=[]),b?(f.removeAttribute(c),f.addEventListener(c.slice(3),w=>g.set(w))):T?(f.removeAttribute(c),g.listen(w=>{f[c.slice(4)]=w}),f[c.slice(4)]=g.get()):E?(f.removeAttribute(c),g.set(f)):(g.attributes[c].push(f),f.setAttribute(c,g.get()??"")),f.removeAttribute(l.name)}})}),m};return{html:o.trim(),hydrate:y}},S=(t,e,r)=>{let s=[],a=e.nextSibling;for(;a!==r;)s.push(a),a=a?.nextSibling;if(t&&typeof t=="object"&&t.type==="component"){let p=t,d=p.render(p.id);s.forEach(o=>o.remove()),d&&Array.from(d.hydrate().children).reverse().forEach(o=>e.after(o))}else{let p=Array.isArray(t)?t:[t],d=p.map(n=>{if(typeof n=="object"&&n.type==="component"){let i=n;return i.key??i.id}else return}).filter(n=>n!=null),o=p.map(n=>{let i=n;if(typeof n=="function"&&(i=n()),typeof i=="object"&&i.type==="component"){let y=i,m=y.render(y.id).hydrate();return m.children[0]&&i.key&&m.children[0].setAttribute("data-nice-key",i.key),m}else return i}).filter(n=>n!=null);d.length?(s.forEach(n=>{d.includes(n.getAttribute("data-nice-key"))||n.remove()}),o.reverse().forEach(n=>{if(n instanceof HTMLElement){let i=null;Array.from(n.children).reverse().forEach(y=>{e.parentElement?.querySelector(`[data-nice-key="${y.getAttribute("data-nice-key")}"]`)||(i??r).before(y),i=y})}else{let i=document.createTextNode(n);e.after(i)}})):(s.forEach(n=>n.remove()),o.reverse().forEach(n=>{if(n instanceof HTMLElement)Array.from(n.children).reverse().forEach(i=>e.after(i));else{let i=document.createTextNode(n);e.after(i)}}))}},P=t=>{let e=document.createElement("div");return e.innerHTML=t,e},I=t=>{let e=/.+ (.+)="?$/gm,r,s=[];for(;(r=e.exec(t))!==null;)r.index===e.lastIndex&&e.lastIndex++,r.forEach(a=>{s.push(a)});if(s.length===2)return s[1]};var C=t=>{let e=t,r=x(),s=[],a=[],p=[],d={};return{id:r,type:"state",get:()=>e,set:o=>{let n=e;typeof t=="function"?n=o(e):n=o,n!==e&&(e=n,s.forEach(i=>i(n)),Object.entries(d).forEach(([i,y])=>{y.forEach(m=>{m.setAttribute(i,n??"")})}),p.forEach(([i,y])=>{S(e,i,y)}))},listen:o=>s.push(o),textNodes:a,markers:p,attributes:d}},A=(t,e)=>{let r=C(void 0),s=void 0,a=(e??[]).map(d=>d&&typeof d=="object"&&Object.hasOwn(d,"listen")?d:!1).filter(Boolean),p=d=>{let o=!!d&&!e,n=t(d),i=R(a);n!==r.get()&&i!==s&&!o&&r.set(n)};return e?(a.forEach(d=>d.listen(p)),p()):r.listen(p),r},D=t=>A(t||(()=>{}));var L=t=>{let e=Object.entries(t).reduce((r,[s,a])=>(r[s]=C(a),r),{});return r=>e[r]};var U=(t,e)=>{let r=[];typeof t=="number"?r=Array.from({length:t},(p,d)=>d+1):Array.isArray(t)?r=[...t]:typeof t=="object"&&(r=Array.from(Object.entries(t)));let s=!1,a=r.map((p,d)=>{let o=e(p,d);return typeof o=="function"?(s=$,o()):o});return s?a.reverse():a},O=t=>typeof t=="object"&&Object.hasOwn(t,"get")?t.get():t,F=t=>Object.entries(t).reduce((e,[r,s])=>`${e}${M(r)}: ${s};`,"");var ue=C,ye=A,Te=j,he=k,ge=D,xe=L,be=O,$=typeof window<"u";export{N as app,he as component,ye as computed,$ as hasWindow,U as mapper,ge as ref,Te as render,ue as state,xe as store,F as styler,be as valueOf};