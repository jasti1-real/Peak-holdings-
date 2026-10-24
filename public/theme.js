
(function(){
 var saved="dark";
 try{saved=localStorage.getItem("peak-theme")||"dark"}catch(e){}
 applyTheme(saved);
})();
function applyTheme(theme){
 var light=theme==="light";
 document.documentElement.setAttribute("data-theme",light?"light":"dark");
 var b=document.getElementById("themeToggle");
 if(b){b.innerHTML=light?"🌙 <span>Dark mode</span>":"☀️ <span>Light mode</span>";b.setAttribute("aria-label",light?"Switch to dark mode":"Switch to light mode");b.title=light?"Switch to dark mode":"Switch to light mode"}
 var m=document.getElementById("themeColor");if(m)m.content=light?"#f4f7fa":"#0b1220";
}
function toggleTheme(){
 var next=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";
 try{localStorage.setItem("peak-theme",next)}catch(e){}
 applyTheme(next);
}


var promoIndex=0,promoTimer=null;
function openWelcomePromo(){var m=document.getElementById("welcomePromo");if(!m||!user)return;m.classList.remove("hide");showPromoSlide(0);if(promoTimer)clearInterval(promoTimer);promoTimer=setInterval(function(){if(m.classList.contains("hide"))return;showPromoSlide((promoIndex+1)%3)},3200)}
function showPromoSlide(i){promoIndex=(i+3)%3;var slides=document.querySelectorAll(".promo-slide"),dots=document.querySelectorAll(".promo-dots button");slides.forEach(function(s,n){s.classList.toggle("active",n===promoIndex)});dots.forEach(function(d,n){d.classList.toggle("on",n===promoIndex);d.setAttribute("aria-selected",n===promoIndex?"true":"false")})}
function closeWelcomePromo(){var m=document.getElementById("welcomePromo");if(m)m.classList.add("hide");if(promoTimer){clearInterval(promoTimer);promoTimer=null}}
document.addEventListener("keydown",function(e){if(e.key==="Escape"){var m=document.getElementById("welcomePromo");if(m&&!m.classList.contains("hide"))closeWelcomePromo()}});
