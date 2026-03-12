document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. DOM refs ---------- */
  const bodyEl        = document.body;
  const themeBtn      = document.getElementById('themeToggle');
  const themeSel      = document.getElementById('themeSelect');
  const toTopBtn      = document.getElementById('toTopBtn');
  const sortBtn       = document.getElementById('sortBtn');
  const searchBox     = document.getElementById('search');
  const tabs          = document.querySelectorAll('.tabs button');
  const listWrap      = document.getElementById('animeList');
  const themeControls = document.querySelector('.theme-controls');
  
  /* ---------- 2. State & Theme (Chạy ngay không cần đợi JSON) ---------- */
  const MODE_KEY = 'themeMode';
  const VAR_KEY  = 'themeVariant';

  function setBodyThemeClasses() {
    const mode    = localStorage.getItem(MODE_KEY) || 'light';
    const variant = localStorage.getItem(VAR_KEY)  || 'default';

    bodyEl.className = `${mode} ${variant}`;

    const icon = document.getElementById('themeIcon');
    if (icon) icon.src = mode === 'light' ? 'icons/moon.svg' : 'icons/sun.svg';

    if (themeSel) themeSel.value = variant;
  }
  setBodyThemeClasses();

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nextMode = bodyEl.classList.contains('light') ? 'dark' : 'light';
      localStorage.setItem(MODE_KEY, nextMode);
      location.reload();
    });
  }

  if (themeSel) {
    themeSel.addEventListener('change', () => {
      localStorage.setItem(VAR_KEY, themeSel.value);
      location.reload();
    });
  }

  /* ---------- 8. Back-to-top ---------- */
  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      toTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
      if (themeControls) {
        if (window.scrollY > 100) themeControls.classList.add('hidden');
        else themeControls.classList.remove('hidden');
      }
    });
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 3. LOAD ANIME JSON VÀ KHỞI TẠO TÍNH NĂNG ---------- */
  fetch("anime-list.json")
    .then(res => res.json())
    .then(data => {

      // 3.1 Tạo HTML cho các thẻ anime
      data.forEach(anime => {
        const card = document.createElement("a");
        card.href = anime.link;
        card.className = "anime-card";
        card.dataset.category = anime.category;
        card.innerHTML = `
          <img src="${anime.image}" alt="${anime.title}" class="anime-cover"/>
          <div class="anime-title">${anime.title}</div>
          <div class="anime-subtitle">${anime.subtitle || ""}</div>
        `;
        listWrap.appendChild(card);
      });

      // 3.2 Lấy danh sách thẻ SAU KHI đã tạo xong trên DOM
      const cards = document.querySelectorAll('.anime-card');
      let isSorted = false;
      let originalOrder = Array.from(listWrap.children);

      /* ---------- 4. Tab + NSFW ---------- */
      function showCat(cat) {
        tabs.forEach(b => b.classList.toggle('active', b.dataset.category === cat));
        cards.forEach(c => {
          c.style.display = (cat === 'All' || c.dataset.category === cat) ? 'block' : 'none';
        });
        localStorage.setItem('selectedTab', cat);

        // reset sort
        isSorted = false;
        if (sortBtn) {
          sortBtn.textContent = 'Sắp xếp A → Z';
          sortBtn.classList.remove('active');
        }
        originalOrder = Array.from(listWrap.children);
      }

      tabs.forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.dataset.category;
          if (cat === 'NSFW' &&
              !localStorage.getItem('agreedToNSFW') &&
              !confirm('⚠️ Nội dung này có chứa yếu tố 18+ – bạn có đồng ý muốn tiếp tục?')) return;

          if (cat === 'NSFW') localStorage.setItem('agreedToNSFW','true');
          showCat(cat);
        });
      });

      showCat(localStorage.getItem('selectedTab') || 'TV Series');

      /* ---------- 5. Search ---------- */
      if (searchBox) {
        searchBox.addEventListener('input', () => {
          const term = searchBox.value.trim().toLowerCase();
          const activeBtn = document.querySelector('.tabs button.active');
          const activeCat = activeBtn ? activeBtn.dataset.category : '';

          cards.forEach(card => {
            const cardCat = card.dataset.category;
            const title = card.querySelector('.anime-title')?.textContent.toLowerCase() || '';
            const sub   = card.querySelector('.anime-subtitle')?.textContent.toLowerCase() || '';
            const inActiveTab = cardCat === activeCat;

            const isSearchable = activeCat === 'NSFW' ? true : cardCat !== 'NSFW';

            const matched = isSearchable && (
              term
                ? title.includes(term) || sub.includes(term)
                : inActiveTab
            );

            card.style.display = matched ? 'block' : 'none';
          });
        });
      }

      /* ---------- 6. Sort ---------- */
      if (sortBtn && listWrap) {
        originalOrder = Array.from(listWrap.children);
        sortBtn.addEventListener('click', () => {
          const sorted = !isSorted;
          localStorage.setItem('sorted', sorted ? 'true' : 'false');
          location.reload();
        });
      }

      const sortedFromStorage = localStorage.getItem('sorted') === 'true';
      if (sortedFromStorage && listWrap) {
        const visible = Array.from(listWrap.children).filter(c => c.style.display !== 'none');
        visible.sort((a,b)=>
          a.querySelector('.anime-title').textContent
           .localeCompare(b.querySelector('.anime-title').textContent,'vi',{numeric:true})
        ).forEach(card => listWrap.appendChild(card));

        isSorted = true;
        sortBtn.textContent = 'Bỏ sắp xếp';
        sortBtn.classList.add('active');
      }

      /* ---------- 7. Count ---------- */
      (function updateCounts(){
        const counts = {};
        cards.forEach(c => counts[c.dataset.category] = (counts[c.dataset.category]||0) + 1);
        const box = document.getElementById('anime-counts');
        if(box) box.textContent = Object.entries(counts).map(([k,v]) => `${k}: ${v}`).join(' | ');
      })();

    })
    .catch(err => {
      console.error("Không load được anime-list.json", err);
    });

  /* ---------- 9. Bắt lỗi toàn cục ---------- */
  window.addEventListener('error', function(e) {
    console.error("Lỗi script:", e.message, " tại ", e.filename, ":", e.lineno);
  });
});
