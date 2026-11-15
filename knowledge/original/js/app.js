/* Statische inhoud eerst. Alleen grafieken, menu, filters en tijdelijke weging. Geen netwerk of opslag. */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---------- Hulpjes ---------- */

  function el(naam, attrs) {
    var e = doc.createElement(naam);
    vul(e, attrs, Array.prototype.slice.call(arguments, 2));
    return e;
  }
  function sv(naam, attrs) {
    var e = doc.createElementNS(SVGNS, naam);
    vul(e, attrs, Array.prototype.slice.call(arguments, 2));
    return e;
  }
  function vul(e, attrs, kinderen) {
    for (var k in attrs || {}) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      if (k === 'tekst') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    kinderen.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) e.appendChild(knoop(x)); });
      else e.appendChild(knoop(c));
    });
  }
  function knoop(x) { return typeof x === 'string' ? doc.createTextNode(x) : x; }
  function leeg(e) { while (e.firstChild) e.removeChild(e.firstChild); }

  function getal(x, decimalen) {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: decimalen || 0, maximumFractionDigits: decimalen || 0
    }).format(x).replace('-', '−');
  }
  function menu() {
    var knop = doc.querySelector('.menu-knop'), nav = doc.getElementById('hoofdmenu');
    if (!knop || !nav) return;
    knop.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      knop.setAttribute('aria-expanded', String(open));
    });
  }

  function balken(d) {
    var r = d.reeksen[0], max = Math.max.apply(null, r.waarden.filter(function (x) { return typeof x === 'number'; }).concat([0]));
    var ol = el('ol', { 'class': 'balken' });
    d.labels.forEach(function (l, i) {
      var x = r.waarden[i];
      var staaf = el('span', { 'class': 'staaf' + (/totaal min/.test(l) ? ' berekend' : ''), 'aria-hidden': 'true' });
      /* breedte via CSSOM: toegestaan onder een strikte Content-Security-Policy */
      staaf.style.width = (typeof x === 'number' && max > 0 ? Math.max(0, x / max) * 78 : 0) + '%';
      ol.appendChild(el('li', null, el('span', { 'class': 'naam', tekst: l }),
        el('span', { 'class': 'spoor' }, staaf, el('span', { 'class': 'getal', tekst: (x === null || x === undefined) ? 'geen cijfer' : getal(x / (d.deler || 1), d.decimalen) }))));
    });
    return ol;
  }

  function mooieStap(bereik, n) {
    var ruw = bereik / n, m = Math.pow(10, Math.floor(Math.log10(ruw))), f = ruw / m;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * m;
  }

  function tijdgrafiek(d) {
    var deler = d.deler || 1, n = d.labels.length;
    var alle = [];
    d.reeksen.forEach(function (r) { r.waarden.forEach(function (x) { if (typeof x === 'number') alle.push(x / deler); }); });
    var lo = Math.min(0, Math.min.apply(null, alle)), hi = Math.max(0, Math.max.apply(null, alle));
    var stap = mooieStap((hi - lo) || 1, 5);
    lo = Math.floor(lo / stap) * stap; hi = Math.ceil(hi / stap) * stap;
    var stapDec = Math.abs(stap - Math.round(stap)) < 1e-9 ? 0 : (Math.abs(stap * 10 - Math.round(stap * 10)) < 1e-9 ? 1 : 2);

    var vlak = el('div', { 'class': 'grafiek-vlak', tabindex: 0, role: 'group',
      'aria-label': d.titel + ' in ' + d.eenheid + ', ' + d.labels[0] + ' tot en met ' + d.labels[n - 1] + '. Gebruik de pijltjestoetsen links en rechts om per jaar af te lezen.' });
    var aflezing = el('p', { 'class': 'grafiek-aflezing', 'aria-live': 'polite' });
    var wikkel = el('div', null, vlak, aflezing);
    var gekozen = n - 1, B = 0;

    function toonAflezing() {
      leeg(aflezing);
      var jaar = d.labels[gekozen], vl = (d.voorlopig || []).indexOf(jaar) !== -1;
      aflezing.appendChild(el('strong', { tekst: String(jaar) + (vl ? ' (voorlopig)' : '') }));
      d.reeksen.forEach(function (r) {
        aflezing.appendChild(doc.createTextNode(' · ' + r.naam + ': ' + waarde(d, r.waarden[gekozen]) + ' [' + r.status[gekozen] + ']'));
      });
    }

    function teken() {
      B = Math.max(280, Math.round(vlak.clientWidth || 640));
      var smal = B < 520, H = smal ? 250 : 340;
      var ml = 14 + 7.2 * Math.max(getal(hi, stapDec).length, getal(lo, stapDec).length), mr = 14, mt = 12, mb = 30;
      var pw = B - ml - mr, ph = H - mt - mb;
      var staaf = d.type === 'staaf';
      var X = function (i) { return staaf ? ml + (i + 0.5) * pw / n : ml + (n === 1 ? pw / 2 : i * pw / (n - 1)); };
      var Y = function (v) { return mt + (hi - v) / (hi - lo) * ph; };
      var svg = sv('svg', { viewBox: '0 0 ' + B + ' ' + H, width: B, height: H, 'aria-hidden': 'true', focusable: 'false' });
      var i, v;

      for (v = lo; v <= hi + stap / 1000; v += stap) {
        var y = Math.round(Y(v)) + 0.5, nul = Math.abs(v) < stap / 1000;
        svg.appendChild(sv('path', { d: 'M' + ml + ' ' + y + 'H' + (B - mr), stroke: nul ? '#000' : '#bdbdbd', 'stroke-width': nul ? 1 : 0.6, fill: 'none' }));
        svg.appendChild(sv('text', { x: ml - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 13, fill: '#000', tekst: getal(nul ? 0 : v, stapDec) }));
      }
      var jStap = [1, 2, 5, 10, 20, 25, 50].filter(function (s) { return pw / n * s >= 44; })[0] || 50;
      for (i = 0; i < n; i++) {
        if (d.labels[i] % jStap !== 0 && !(n <= 3)) continue;
        svg.appendChild(sv('path', { d: 'M' + X(i) + ' ' + (H - mb) + 'v5', stroke: '#000', 'stroke-width': 0.8 }));
        svg.appendChild(sv('text', { x: X(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 13, fill: '#000', tekst: String(d.labels[i]) }));
      }

      var wijzer = sv('g', { 'class': 'wijzer' });
      if (staaf) {
        var bw = Math.max(2, Math.min(26, pw / n - 2));
        d.reeksen[0].waarden.forEach(function (x, i) {
          if (typeof x !== 'number') return;
          var y0 = Y(0), y1 = Y(x / deler), vl = (d.voorlopig || []).indexOf(d.labels[i]) !== -1;
          svg.appendChild(sv('rect', { x: X(i) - bw / 2, y: Math.min(y0, y1), width: bw, height: Math.max(1, Math.abs(y1 - y0)),
            fill: vl ? '#fff' : '#000', stroke: '#000', 'stroke-width': 1 }));
        });
      } else {
        d.reeksen.forEach(function (r, ri) {
          var pad = '', pen = false;
          r.waarden.forEach(function (x, i) {
            if (typeof x !== 'number') { pen = false; return; }
            pad += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x / deler).toFixed(1); pen = true;
          });
          svg.appendChild(sv('path', { d: pad, fill: 'none', stroke: '#000', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': STREEP[ri % 3] || null }));
          r.waarden.forEach(function (x, i) {
            if (typeof x === 'number' && (d.voorlopig || []).indexOf(d.labels[i]) !== -1) {
              svg.appendChild(sv('circle', { cx: X(i), cy: Y(x / deler), r: 3.5, fill: '#fff', stroke: '#000', 'stroke-width': 1.5 }));
            }
          });
        });
      }
      svg.appendChild(wijzer);

      function zetWijzer() {
        leeg(wijzer);
        var x = Math.round(X(gekozen)) + 0.5;
        wijzer.appendChild(sv('path', { d: 'M' + x + ' ' + mt + 'V' + (H - mb), stroke: '#000', 'stroke-width': 1, 'stroke-dasharray': '2 3', fill: 'none' }));
        d.reeksen.forEach(function (r) {
          var w = r.waarden[gekozen];
          if (typeof w !== 'number') return;
          wijzer.appendChild(sv('circle', { cx: X(gekozen), cy: Y(staaf ? 0 : w / deler), r: staaf ? 0 : 5, fill: '#000', stroke: '#fff', 'stroke-width': 2 }));
        });
        toonAflezing();
      }
      function kies(i) { gekozen = Math.max(0, Math.min(n - 1, i)); zetWijzer(); }
      vlak._kies = kies;
      vlak._bijX = function (px) {
        var f = (px - ml) / pw;
        kies(staaf ? Math.floor(f * n) : Math.round(f * (n - 1)));
      };
      leeg(vlak); vlak.appendChild(svg); zetWijzer();
    }

    function muis(e) {
      var r = vlak.getBoundingClientRect();
      if (r.width && vlak._bijX) vlak._bijX((e.clientX - r.left) * (B / r.width));
    }
    vlak.addEventListener('pointermove', muis);
    vlak.addEventListener('pointerdown', muis);
    vlak.addEventListener('keydown', function (e) {
      var k = e.key, i = gekozen;
      if (k === 'ArrowLeft') i--; else if (k === 'ArrowRight') i++;
      else if (k === 'Home') i = 0; else if (k === 'End') i = n - 1; else return;
      e.preventDefault(); if (vlak._kies) vlak._kies(i);
    });

    /* Tekenen op de werkelijke breedte, zodat tekst ook op een telefoon leesbaar blijft. */
    var vorige = 0;
    function opnieuw() {
      var b = Math.round(vlak.clientWidth || 0);
      if (b && b !== vorige) { vorige = b; teken(); }
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () {
      window.requestAnimationFrame(opnieuw);
    }).observe(vlak);
    else window.addEventListener('resize', opnieuw);
    teken();
    setTimeout(function () { if (!vorige) teken(); }, 0);
    return wikkel;
  }


  var STREEP = ['', '7 4', '2 4'];
  function waarde(d, x) {
    return x === null ? 'geen cijfer' : getal(x / d.deler, d.decimalen) + ' ' + d.eenheid;
  }
  function grafieken() {
    doc.querySelectorAll('[data-set]').forEach(function (blok) {
      var table = blok.querySelector('table');
      if (!table) return;
      var headers = Array.from(table.querySelectorAll('thead th')).slice(1);
      var rows = Array.from(table.querySelectorAll('tbody tr'));
      var d = {
        titel: blok.querySelector('h3').textContent,
        type: blok.dataset.type, eenheid: blok.dataset.eenheid,
        deler: Number(blok.dataset.deler), decimalen: Number(blok.dataset.decimalen),
        labels: rows.map(function (r) { return dummylab(r); }),
        voorlopig: [],
        reeksen: headers.map(function (h, ri) {
          return {naam: h.textContent, waarden: rows.map(function (r) {
            var raw = r.querySelectorAll('td')[ri].dataset.raw;
            return raw === '' ? null : Number(raw);
          }), status: rows.map(function (r) { return r.querySelectorAll('td')[ri].querySelector('small').textContent; })};
        })
      };
      rows.forEach(function (r, i) { if (r.textContent.indexOf('voorlopig') !== -1) d.voorlopig.push(d.labels[i]); });
      var graphic = el('div', {'class': 'grafische-aanvulling'});
      if (d.type === 'balk') graphic.appendChild(balken(d));
      else {
        if (d.reeksen.length > 1) {
          var legenda = el('ul', {'class': 'legenda', 'aria-label': 'Lijnstijlen'});
          d.reeksen.forEach(function (r, i) {
            legenda.appendChild(el('li', null, ['Doorgetrokken: ', 'Gestreept: ', 'Gestippeld: '][i % 3] + r.naam));
          });
          graphic.appendChild(legenda);
        }
        graphic.appendChild(tijdgrafiek(d));
      }
      blok.insertBefore(graphic, blok.querySelector('details'));
    });
  }
  function dummylab(row) {
    var s = row.querySelector('th').textContent;
    return /^\d{4}$/.test(s) ? Number(s) : s;
  }
  function filters() {
    var input = doc.querySelector('[data-filter]');
    if (input) {
      var control = input.closest('.filterbediening'); control.hidden = false;
      var rows = Array.from(doc.getElementById(input.dataset.filter).querySelectorAll('tbody tr'));
      function filter() {
        var term = input.value.trim().toLocaleLowerCase('nl');
        rows.forEach(function (r) { r.hidden = r.textContent.toLocaleLowerCase('nl').indexOf(term) === -1; });
        control.querySelector('.filterstatus').textContent = rows.filter(function (r) { return !r.hidden; }).length + ' onderwerpen zichtbaar.';
      }
      input.addEventListener('input', filter); filter();
    }
    var select = doc.querySelector('[data-documentfilter]');
    if (select) {
      var controls = select.closest('.filterbediening'); controls.hidden = false;
      var items = Array.from(doc.querySelectorAll('.documenten > li'));
      function filterDocs() {
        items.forEach(function (li) { li.hidden = select.value !== 'alles' && li.dataset.status !== select.value; });
        var n = items.filter(function (li) { return !li.hidden; }).length;
        controls.querySelector('.filterstatus').textContent = n ? n + ' documenten zichtbaar.' : 'Geen documenten met deze status.';
      }
      select.addEventListener('change', filterDocs); filterDocs();
    }
  }
  function weging() {
    doc.querySelectorAll('[data-weging]').forEach(function (v) {
      v.querySelectorAll('.wegingbediening').forEach(function (e) { e.hidden = false; });
      var selects = Array.from(v.querySelectorAll('select'));
      function toon() {
        var voor = 0, tegen = 0, n = 0;
        selects.forEach(function (s) {
          if (s.value === '') return;
          n++; if (s.dataset.kant === 'voor') voor += Number(s.value); else tegen += Number(s.value);
        });
        v.querySelector('.wegingresultaat').textContent = n ? n + ' argumenten gewogen. Belang toegekend aan argumenten voor: ' + voor + '; tegen: ' + tegen + '. Deze som is geen beleidsadvies; het aantal en de selectie van argumenten beïnvloeden haar.' : 'Nog geen argumenten gewogen.';
      }
      selects.forEach(function (s) { s.addEventListener('change', toon); });
      v.querySelector('.wegingwis').addEventListener('click', function () { selects.forEach(function (s) { s.value = ''; }); toon(); });
    });
  }
  function start() { menu(); grafieken(); filters(); weging(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();
