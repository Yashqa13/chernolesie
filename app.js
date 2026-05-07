document.addEventListener('DOMContentLoaded', () => {

  // ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ (чтобы работали из HTML) =====

  window.addComment = function(button){
    const form = button.parentElement;
    const nameInput = form.querySelector('input');
    const textarea = form.querySelector('textarea');

    const name = nameInput.value.trim() || 'anon';
    const text = textarea.value.trim();
    if(!text) return;

    const initials = name.substring(0,2).toUpperCase();

    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <div class="avatar">${initials}</div>
      <div class="comment-body">
        <div class="username">${name}</div>
        <div class="comment-text">${text}</div>
      </div>
    `;

    const section = button.closest('.comments');
    section.insertBefore(div, form);

    textarea.value = '';
    nameInput.value = '';

    setTimeout(() => spawnHiddenUserResponse(text, section), 1000);
  };


  function spawnHiddenUserResponse(userText, container){
    let msg = '';

    if(userText.toLowerCase().includes('где')) {
      msg = 'Хуй ВАМ';
    } else {
      const arr = ['я вижу тебя','остановись','он наблюдает','не доверяй им'];
      msg = arr[Math.floor(Math.random()*arr.length)];
    }

    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <div class="avatar">??</div>
      <div class="comment-body">
        <div class="username hidden">system_user</div>
        <div class="comment-text">${msg}</div>
      </div>
    `;

    container.insertBefore(div, container.querySelector('.comment-form'));
  }


  // ===== SIDEBAR =====

  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.overlay');

  window.toggleMenu = function(){
    sidebar.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  };

  function openMenu(){
    sidebar.classList.add('open');
    document.body.classList.add('menu-open');
    sidebar.style.transform = '';
    sidebar.style.opacity = '';
  }

  function closeMenu(){
    sidebar.classList.remove('open');
    document.body.classList.remove('menu-open');
    sidebar.style.transform = '';
    sidebar.style.opacity = '';
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }


  // ===== SWIPE =====

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let hasMoved = false; // НОВАЯ ПЕРЕМЕННАЯ: проверяем, был ли сдвиг
  let lastMoveTime = 0;
  let velocity = 0;

  function setTranslate(x){
    sidebar.style.transform = 'translateX(' + x + 'px)';
    sidebar.style.opacity = Math.min(1, (x + 260)/260);
  }

  document.addEventListener('touchstart', function(e){
    if(!sidebar) return;

    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = startX < 30 || sidebar.classList.contains('open');
    hasMoved = false; // Сбрасываем флаг при новом касании
    lastMoveTime = Date.now();
  });

  document.addEventListener('touchmove', function(e){
    if(!isDragging || !sidebar) return;

    let x = e.touches[0].clientX;
    let dx = x - startX;
    
    if (Math.abs(dx) < 10) return; // Мертвая зона

    hasMoved = true; // Палец сдвинулся! Это свайп, а не клик

    let now = Date.now();
    velocity = (x - currentX) / (now - lastMoveTime + 1);
    currentX = x;
    lastMoveTime = now;

    let translate = Math.min(0, -260 + dx);

    if(translate > 0) translate *= 0.3;

    setTranslate(translate);

    if (overlay) {
      overlay.style.opacity = Math.min(1, (translate + 260)/260);
      overlay.style.pointerEvents = 'auto';
    }
  });

  document.addEventListener('touchend', function(){
    if(!isDragging || !sidebar) return;

    isDragging = false;

    // ВАЖНО: Если сдвига не было (это был просто тап по ссылке),
    // прерываем функцию, чтобы браузер мог нормально кликнуть по ссылке
    if (!hasMoved) return; 

    let threshold = -130;
    let current = -260;

    let tr = sidebar.style.transform;
    if(tr){
      let m = tr.match(/-?\d+/);
      if(m) current = parseInt(m[0]);
    }

    if(current > threshold || velocity > 0.5){
      openMenu();
    } else {
      closeMenu();
    }

    if (overlay) {
      overlay.style.opacity = '';
      overlay.style.pointerEvents = '';
    }
  });

 // ===== SPA НАВИГАЦИЯ =====

  const isLocal = location.protocol === 'file:';

  document.addEventListener('click', function(e){
    const link = e.target.closest('.nav-link');
    if(!link) return;

    if(isLocal) return; // отключаем SPA при file://

    e.preventDefault();

    const url = link.getAttribute('href');

    fetch(url)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('.container');

        if(!newContent) return;

        document.querySelector('.container').innerHTML = newContent.innerHTML;

        document.body.style.display = 'none';
        document.body.offsetHeight; // "Встряска" для браузера
        document.body.style.display = '';

        window.scrollTo(0,0);
        history.pushState(null, '', url);
        setTimeout(() => {
      closeMenu();
    }, 100);

        closeMenu(); // важно!
      });
  });

});


function openShare(){
  document.getElementById('shareModal').classList.add('open');
}

function closeShare(){
  document.getElementById('shareModal').classList.remove('open');
}

function shareTo(type){
  const url = window.location.href;

  if(type === 'telegram'){
    window.open(`https://t.me/yakovvv13=${encodeURIComponent(url)}`);
  }

  if(type === 'whatsapp'){
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
  }

  if(type === 'copy'){
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована');
  }
}

/* Зум изображений */ 

function openImage(img){

  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';

  overlay.innerHTML = `
    <img src="${img.src}" class="zoomed-image">
  `;

  overlay.onclick = () => overlay.remove();

  document.body.appendChild(overlay);
}
