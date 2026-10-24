/* RY Homes v3 — language, nav, reveal, counters, day calculator, lead form */
(function(){
  var root=document.documentElement;
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id){return document.getElementById(id)}

  /* ---------- bilingual ---------- */
  function setLang(l){
    root.setAttribute("data-lang",l);
    root.lang=l==="zh"?"zh-Hans":"en";
    if($("lang-en"))$("lang-en").setAttribute("aria-pressed",String(l==="en"));
    if($("lang-zh"))$("lang-zh").setAttribute("aria-pressed",String(l==="zh"));
    try{localStorage.setItem("ry-lang",l)}catch(e){}
    document.querySelectorAll("a[data-keep-lang]").forEach(function(a){
      var base=a.getAttribute("href").split("#")[0];
      a.setAttribute("href",l==="zh"?base+"#zh":base);
    });
    document.querySelectorAll("[data-ph-en]").forEach(function(i){
      var v=i.getAttribute("data-ph-"+l);if(v)i.placeholder=v;
    });
  }
  var saved=null;try{saved=localStorage.getItem("ry-lang")}catch(e){}
  if(location.hash==="#zh")saved="zh";
  setLang(saved==="zh"?"zh":"en");
  if($("lang-en"))$("lang-en").onclick=function(){setLang("en")};
  if($("lang-zh"))$("lang-zh").onclick=function(){setLang("zh")};
  function lang(){return root.getAttribute("data-lang")==="zh"?"zh":"en"}

  /* ---------- nav: transparent over hero, solid after ---------- */
  var nav=$("nav");
  if(nav&&"IntersectionObserver" in window){
    var sentinel=document.createElement("div");
    sentinel.style.cssText="position:absolute;top:0;left:0;width:1px;height:70vh;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(function(e){
      nav.classList.toggle("solid",!e[0].isIntersecting);
    },{threshold:0}).observe(sentinel);
  }else if(nav){nav.classList.add("solid")}

  /* ---------- mobile sheet ---------- */
  var burger=$("burger"),sheet=$("sheet");
  if(burger&&sheet){
    var close=function(){burger.setAttribute("aria-expanded","false");sheet.classList.remove("open");document.body.style.overflow=""};
    burger.addEventListener("click",function(){
      if(burger.getAttribute("aria-expanded")==="true"){close()}
      else{burger.setAttribute("aria-expanded","true");sheet.classList.add("open");document.body.style.overflow="hidden"}
    });
    sheet.addEventListener("click",function(e){if(e.target.closest("a"))close()});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
  }

  /* ---------- scroll reveal ---------- */
  var rv=document.querySelectorAll(".rv");
  if(rv.length&&"IntersectionObserver" in window&&!reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var sibs=Array.prototype.slice.call(e.target.parentNode.children)
          .filter(function(n){return n.classList&&n.classList.contains("rv")});
        e.target.style.transitionDelay=(Math.min(sibs.indexOf(e.target),5)*70)+"ms";
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },{rootMargin:"0px 0px -6% 0px",threshold:.06});
    rv.forEach(function(el){io.observe(el)});
  }else{rv.forEach(function(el){el.classList.add("in")})}

  /* ---------- counting figures ---------- */
  var counters=document.querySelectorAll("[data-count]");
  if(counters.length&&"IntersectionObserver" in window&&!reduce){
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var el=e.target,to=parseFloat(el.getAttribute("data-count"))||0,t0=null;
        if(to===0){cio.unobserve(el);return}
        function step(t){
          if(!t0)t0=t;
          var p=Math.min((t-t0)/900,1),eased=1-Math.pow(1-p,3);
          el.textContent=Math.round(to*eased);
          if(p<1)requestAnimationFrame(step);
        }
        el.textContent="0";requestAnimationFrame(step);
        cio.unobserve(el);
      });
    },{threshold:.5});
    counters.forEach(function(el){cio.observe(el)});
  }

  /* ---------- toast + copy ---------- */
  var t=$("toast");
  function toast(m){if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true},3200)}
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click",function(){
      var v=b.getAttribute("data-copy");
      try{navigator.clipboard.writeText(v).then(function(){toast("✓ "+v)},function(){toast(v)})}catch(e){toast(v)}
    });
  });

  function usd(n){return "$"+Math.round(n).toLocaleString("en-US")}
  function numv(v){var n=parseFloat(String(v).replace(/[^0-9.]/g,""));return isFinite(n)?n:0}

  /* ---------- the day counter ---------- */
  var vr=$("vc-rent"),vw=$("vc-weeks"),dg=$("daygrid");
  if(vr&&vw&&dg){
    var MAXD=182,cells=[];
    for(var i=0;i<MAXD;i++){var c=document.createElement("i");dg.appendChild(c);cells.push(c)}
    var paint=function(){
      var rent=numv(vr.value),w=+vw.value,days=w*7,week=rent*12/52,day=rent*12/365;
      $("vc-weeks-out").textContent=w;
      for(var i=0;i<MAXD;i++)cells[i].classList.toggle("on",i<days);
      var dl=$("vc-days");
      dl.textContent="";
      dl.append(String(days)+" ");
      var se=document.createElement("span");se.className="en";se.textContent="days";
      var sz=document.createElement("span");sz.className="zh";sz.textContent="天";
      dl.append(se,sz);
      $("vc-day").textContent=usd(day);
      $("vc-week").textContent=usd(week);
      $("vc-total").textContent=usd(day*days);
      $("vc-year").textContent=usd(rent*12);
    };
    vr.addEventListener("input",paint);
    vw.addEventListener("input",paint);
    vr.addEventListener("blur",function(){var n=numv(vr.value);vr.value=n?n.toLocaleString("en-US"):""});
    paint();
  }

  /* ---------- renters page helpers (shared file) ---------- */
  if($("ic-rent")){
    var ir=$("ic-rent");
    var ic=function(){
      var r=+ir.value;
      $("ic-rent-out").textContent=usd(r);
      $("ic-month").textContent=usd(r*3);
      $("ic-year").textContent=usd(r*36);
      $("ic-dep").textContent=usd(r);
      if($("ic-first"))$("ic-first").textContent=usd(r*2);
    };
    ir.addEventListener("input",ic);ic();
  }
  var boxes=document.querySelectorAll(".check input[type=checkbox]");
  if(boxes.length){
    var state={};try{state=JSON.parse(localStorage.getItem("ry-check")||"{}")}catch(e){state={}}
    var upd=function(){
      var done=0;boxes.forEach(function(b){if(b.checked)done++});
      var p=Math.round(done/boxes.length*100);
      $("ck-pct").textContent=p+"%";$("ck-bar").style.width=p+"%";
      $("ck-count").textContent=done+" / "+boxes.length;
    };
    boxes.forEach(function(b){
      if(state[b.id])b.checked=true;
      b.addEventListener("change",function(){state[b.id]=b.checked;try{localStorage.setItem("ry-check",JSON.stringify(state))}catch(e){}upd()});
    });
    upd();
  }

  /* ---------- hero quick bar ---------- */
  var qf=$("quick-form");
  if(qf){
    var QT={en:{need:"Please fill in all three fields."},zh:{need:"请填写以上三项。"}};
    qf.addEventListener("submit",function(e){
      e.preventDefault();
      var err=$("q-err");err.hidden=true;
      var name=($("q-name").value||"").trim(),phone=($("q-phone").value||"").trim();
      var third=$("q-city")||$("q-area"),tv=third?(third.value||"").trim():"";
      if(!name||!phone||!tv){err.textContent=QT[lang()].need;err.hidden=false;return}
      var parts=name.split(/\s+/);
      if($("firstName"))$("firstName").value=parts[0]||"";
      if($("lastName"))$("lastName").value=parts.slice(1).join(" ");
      if($("phone"))$("phone").value=phone;
      if($("city"))$("city").value=tv;
      else if($("areas"))$("areas").value=tv;
      var target=$("contact");
      if(target)target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
      setTimeout(function(){if($("email"))$("email").focus({preventScroll:true})},reduce?0:700);
    });
  }
})();

/* ---------- Lead form ---------- */
(function(){
  var form=document.getElementById("lead-form");
  if(!form)return;
  var root=document.documentElement;
  function lang(){return root.getAttribute("data-lang")==="zh"?"zh":"en"}
  var T={
    en:{req:"Please fill in this field.",email:"Please enter a valid email, e.g., name@example.com",phone:"Please enter a 10-digit phone number, e.g., 408-555-1234",zip:"Please enter a 5-digit ZIP code.",choose:"Please choose one option.",sending:"Sending…",fail:"Sorry, that didn't send. Please check your connection and try again.",fix:"Please check the highlighted fields above."},
    zh:{req:"请填写此项。",email:"请输入有效邮箱，例如 name@example.com",phone:"请输入 10 位电话号码，例如 408-555-1234",zip:"请输入 5 位邮编。",choose:"请选择一项。",sending:"正在提交…",fail:"抱歉，提交没有成功。请检查网络连接后再试一次。",fix:"请检查上方标红的栏位。"}
  };
  function i18n(){
    var l=lang();
    form.querySelectorAll("option[data-en]").forEach(function(o){o.textContent=o.getAttribute("data-"+l)});
    form.querySelectorAll("[data-ph-en]").forEach(function(i){i.placeholder=i.getAttribute("data-ph-"+l)});
    form.querySelectorAll(".errmsg").forEach(function(m){if(m.dataset.k)m.textContent=T[l][m.dataset.k]});
  }
  new MutationObserver(i18n).observe(root,{attributes:true,attributeFilter:["data-lang"]});
  i18n();

  function mark(field,key){
    var box=field.closest(".f");if(!box)return;
    box.classList.add("bad");
    var m=box.querySelector(".errmsg");
    if(!m){m=document.createElement("small");m.className="errmsg";box.appendChild(m)}
    m.dataset.k=key;m.textContent=T[lang()][key];
    var id=m.id||("err-"+(field.id||field.name));m.id=id;
    field.setAttribute("aria-describedby",id);
    field.setAttribute("aria-invalid","true");
  }
  function clear(box){
    box.classList.remove("bad");
    var m=box.querySelector(".errmsg");if(m)m.remove();
    box.querySelectorAll("[aria-invalid]").forEach(function(el){el.removeAttribute("aria-invalid");el.removeAttribute("aria-describedby")});
  }
  function boxOf(e){return e.target.closest?e.target.closest(".f"):null}
  form.addEventListener("input",function(e){var b=boxOf(e);if(b)clear(b)});
  form.addEventListener("change",function(e){var b=boxOf(e);if(b)clear(b)});
  form.addEventListener("blur",function(e){
    var el=e.target,b=boxOf(e);if(!b||!el.name||el.closest(".hp"))return;
    var v=(el.value||"").trim();
    if(el.required&&!v)return mark(el,"req");
    if(v&&el.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return mark(el,"email");
    if(v&&el.name==="phone"&&el.getAttribute("pattern")&&!new RegExp(el.getAttribute("pattern")).test(v))return mark(el,"phone");
    if(v&&el.name==="zip"&&!/^\d{5}$/.test(v))return mark(el,"zip");
  },true);

  function validate(){
    var first=null;
    form.querySelectorAll(".f").forEach(clear);
    form.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea").forEach(function(el){
      if(el.closest(".hp"))return;
      var v=el.value.trim(),key=null;
      if(el.required&&!v)key="req";
      else if(v&&el.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))key="email";
      else if(v&&el.name==="phone"&&!new RegExp(el.getAttribute("pattern")).test(v))key="phone";
      else if(v&&el.name==="zip"&&!/^\d{5}$/.test(v))key="zip";
      if(key){mark(el,key);first=first||el}
    });
    var radios=form.querySelectorAll("input[type=radio][required]");
    if(radios.length&&!form.querySelector("input[type=radio]:checked")){mark(radios[0],"choose");first=first||radios[0]}
    if(first){first.focus({preventScroll:true});first.closest(".f").scrollIntoView({behavior:"smooth",block:"center"})}
    return !first;
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    var err=document.getElementById("lf-err");err.hidden=true;
    if(!validate()){err.textContent=T[lang()].fix;err.hidden=false;return}
    form.querySelector("[name=lang]").value=lang();
    var data=new URLSearchParams(),multi={};
    new FormData(form).forEach(function(v,k){
      v=String(v).trim();
      if(form.querySelectorAll('input[type=checkbox][name="'+k+'"]').length){(multi[k]=multi[k]||[]).push(v)}
      else data.append(k,v);
    });
    Object.keys(multi).forEach(function(k){data.append(k,multi[k].join(", "))});
    var btn=document.getElementById("lf-btn"),old=btn.innerHTML;
    btn.disabled=true;btn.textContent=T[lang()].sending;
    var url=form.getAttribute("data-endpoint");
    function done(){
      form.hidden=true;
      var ok=document.getElementById("lead-ok");
      ok.hidden=false;ok.focus();ok.scrollIntoView({behavior:"smooth",block:"center"});
    }
    function fail(){btn.disabled=false;btn.innerHTML=old;err.textContent=T[lang()].fail;err.hidden=false;err.focus()}
    fetch(url,{method:"POST",body:data})
      .then(function(r){return r.json()})
      .then(function(j){if(j&&j.ok)done();else fail()})
      .catch(function(){fetch(url,{method:"POST",mode:"no-cors",body:data}).then(done).catch(fail)});
  });
})();
