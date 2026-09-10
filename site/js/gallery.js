/* ============================================================
   LITTLEFIELD GALLERY — loads photos from Supabase and renders
   them into the .gallery-full grid, then (re)initialises the
   tilt + lightbox. If the fetch fails or returns nothing, the
   static markup already in the page is left untouched as a
   fallback (so the gallery is never blank).
   ============================================================ */
(function () {
  var SUPABASE_URL      = 'https://wajvgngjfwbdnitggakn.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhanZnbmdqZndiZG5pdGdnYWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODM2NzksImV4cCI6MjA5MTY1OTY3OX0.0-wOI9VAy6NFxnrBJEpunqPbmq2mP2D3ZEec_V5m8gk';

  var grid = document.querySelector('.gallery-full');
  if (!grid) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render(rows) {
    // Every 4th tile is "tall" — matches the original curated layout rhythm.
    grid.innerHTML = rows.map(function (row, i) {
      var tall = (i % 4 === 0) ? ' tall' : '';
      var alt  = esc(row.alt || 'Littlefield Manor Riding School, Guildford');
      // Optional per-photo framing (object-position) for photos that crop awkwardly.
      var pos  = row.object_position ? ' style="object-position:' + esc(row.object_position) + '"' : '';
      return '<div class="gallery-item' + tall + '">' +
               '<img src="' + esc(row.image_url) + '" alt="' + alt + '"' + pos + ' loading="lazy">' +
             '</div>';
    }).join('');

    // GSAP's stagger tween referenced the old (now-removed) children, so the
    // freshly-injected ones can be left invisible — force them visible.
    grid.querySelectorAll(':scope > *').forEach(function (child) {
      child.style.opacity = '1';
      child.style.transform = 'none';
    });

    if (typeof window.initLittlefieldGallery === 'function') window.initLittlefieldGallery();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  fetch(SUPABASE_URL + '/rest/v1/littlefield_gallery?select=image_url,alt,object_position&order=created_at.desc', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  })
  .then(function (r) {
    if (!r.ok) {
      console.warn('Gallery fetch failed — status:', r.status,
        '— keeping static fallback. Check RLS public SELECT on littlefield_gallery.');
      return null;
    }
    return r.json();
  })
  .then(function (data) {
    if (data && data.length) render(data);
    // else: leave the static fallback markup in place (already bound by main.js)
  })
  .catch(function (err) {
    console.warn('Gallery fetch error — keeping static fallback:', err);
  });
}());
