/* VOC rekenmodel 1.0. Geen netwerk, opslag of externe bibliotheken. */
(function (root) {
  'use strict';
  function eenheden(value, max, label) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) {
      throw new RangeError(label + ': vul een getal van 0 tot ' + max + ' met maximaal twee decimalen in.');
    }
    return Math.round(value * 100);
  }
  function bereken(bruto, scenario) {
    var g = eenheden(bruto, 10000000, 'Bruto inkomen');
    if (!scenario || !Array.isArray(scenario.tarieven) || !Array.isArray(scenario.grenzen) || scenario.tarieven.length < 1 || scenario.tarieven.length > 4 || scenario.grenzen.length !== scenario.tarieven.length - 1) {
      throw new RangeError('Gebruik één tot vier tarieven, met één grens minder dan het aantal tarieven.');
    }
    var voet = eenheden(scenario.voet, 10000000, 'Belastingvrije voet');
    var rates = scenario.tarieven.map(function (r) { return eenheden(r, 100, 'Tarief'); });
    var grenzen = scenario.grenzen.map(function (r) { return eenheden(r, 10000000, 'Schijfgrens'); });
    grenzen.forEach(function (x, i) { if (x <= (i ? grenzen[i - 1] : 0)) throw new RangeError('Schijfgrenzen moeten positief zijn en strikt oplopen.'); });
    var grondslag = Math.max(0, g - voet), laag = 0, teller = 0;
    rates.forEach(function (r, i) {
      var hoog = i < grenzen.length ? grenzen[i] : grondslag;
      teller += Math.max(0, Math.min(grondslag, hoog) - laag) * r;
      laag = hoog;
    });
    // Gehele centen × honderdsten van procentpunten; één afronding, halve cent omhoog.
    var belasting = Math.floor((teller + 5000) / 10000);
    return { bruto: g / 100, grondslag: grondslag / 100, belasting: belasting / 100, netto: (g - belasting) / 100 };
  }
  if (typeof module === 'object' && module.exports) module.exports = { bereken: bereken };
  if (!root.document) return;
  root.VOCBelasting = { bereken: bereken };
  var d = root.document;
  function start() {
    var form = d.getElementById('belasting-form');
    if (!form) return;
    var uitkomst = d.getElementById('rekenuitkomst'), fout = d.getElementById('rekenfout'), status = d.getElementById('rekenstatus');
    function sync() {
      [1, 2].forEach(function (n) {
        var aantal = Number(d.getElementById('s' + n + '-aantal').value);
        d.querySelectorAll('[data-scenario="' + n + '"] [data-schijf]').forEach(function (row) {
          row.hidden = Number(row.dataset.schijf) >= aantal;
          row.querySelectorAll('input').forEach(function (i) { i.disabled = row.hidden; });
          var grens = row.querySelector('[data-grens]');
          if (grens) {
            grens.hidden = Number(grens.dataset.grens) >= aantal - 1;
            grens.querySelector('input').disabled = row.hidden || grens.hidden;
          }
        });
      });
    }
    function lees(id) {
      var input = d.getElementById(id), v = input.valueAsNumber;
      if (!input.checkValidity() || !input.value.trim() || !Number.isFinite(v)) {
        input.setAttribute('aria-invalid', 'true');
        throw { input: input, message: d.querySelector('label[for="' + id + '"]').textContent + ': vul een geldig getal binnen de aangegeven grenzen in, met maximaal twee decimalen.' };
      }
      return v;
    }
    function leesScenario(n) {
      var pre = 's' + n, count = Number(d.getElementById(pre + '-aantal').value);
      if (![1,2,3,4].includes(count)) throw new Error('Kies één tot vier schijven.');
      var s = { voet: lees(pre + '-voet'), tarieven: [], grenzen: [] };
      for (var i = 0; i < count; i++) {
        s.tarieven.push(lees(pre + '-tarief-' + i));
        if (i < count - 1) {
          var x = lees(pre + '-grens-' + i);
          if (x <= (i ? s.grenzen[i - 1] : 0)) {
            var input = d.getElementById(pre + '-grens-' + i); input.setAttribute('aria-invalid','true');
            throw { input: input, message: 'Scenario ' + n + ': schijfgrenzen moeten positief zijn en strikt oplopen.' };
          }
          s.grenzen.push(x);
        }
      }
      return s;
    }
    var geld = new Intl.NumberFormat('nl-NL', {minimumFractionDigits:2,maximumFractionDigits:2});
    function cell(tag, text) { var e = d.createElement(tag); e.textContent = text; return e; }
    function instellingen(s, n) {
      return 'Scenario ' + n + ': voet € ' + geld.format(s.voet) + '; ' + s.tarieven.map(function (t, i) {
        return (i < s.grenzen.length ? 'tot € ' + geld.format(s.grenzen[i]) : 'daarboven (onbegrensd)') + ': ' + t + '%';
      }).join('; ') + '. ';
    }
    function reken(focusError) {
      fout.hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
      try {
        sync();
        var a = leesScenario(1), b = leesScenario(2);
        var rows = [0,1,2].map(function (i) {
          var g = lees('inkomen-' + i), x = bereken(g, a), y = bereken(g, b);
          return { x:x, y:y, verschil: (Math.round(y.netto*100)-Math.round(x.netto*100))/100 };
        });
        var tbody = d.querySelector('#belasting-tabel tbody'); tbody.replaceChildren();
        var grafiek = d.getElementById('rekengrafiek'); grafiek.replaceChildren();
        grafiek.appendChild(cell('p','Netto in het model: zwart = scenario 1, omlijnd = scenario 2. Exacte bedragen staan in de tabel.'));
        var maximum = Math.max.apply(null, rows.map(function (r) { return Math.max(r.x.bruto,1); }));
        rows.forEach(function (r) {
          var tr = d.createElement('tr');
          [r.x.bruto,r.x.grondslag,r.x.belasting,r.x.netto,r.y.grondslag,r.y.belasting,r.y.netto,r.verschil].forEach(function (v,i) {
            var c = cell(i ? 'td' : 'th', geld.format(v)); if (!i) c.scope = 'row'; tr.appendChild(c);
          }); tbody.appendChild(tr);
          var blok = d.createElement('div'); blok.appendChild(cell('span','Bruto € ' + geld.format(r.x.bruto)));
          [r.x.netto,r.y.netto].forEach(function (v,i) { var bar = d.createElement('span'); bar.className='ai-balk'+(i ? ' tweede' : ''); bar.style.width=(100*v/maximum)+'%'; blok.appendChild(bar); });
          grafiek.appendChild(blok);
        });
        d.getElementById('rekeninstellingen').textContent = instellingen(a,1) + instellingen(b,2) + ' Grenzen zijn bedragen van de grondslag na aftrek van de voet.';
        uitkomst.hidden = false;
        status.textContent = 'Berekend voor drie voorbeeldinkomens. De tabel toont uw huidige instellingen.';
      } catch (e) {
        uitkomst.hidden = true; fout.hidden = false; fout.textContent = e.message;
        status.textContent = 'Geen geldige uitkomst. Corrigeer de invoer en bereken opnieuw.';
        if (focusError && e.input) e.input.focus();
      }
    }
    d.getElementById('rekenbediening').hidden = false;
    sync(); reken(false);
    form.addEventListener('submit',function (e) { e.preventDefault(); reken(true); });
    function gewijzigd() { sync(); uitkomst.hidden=true; fout.hidden=true; status.textContent='Invoer gewijzigd. Kies Bereken en vergelijk om actuele uitkomsten te zien.'; }
    form.addEventListener('input', gewijzigd);
    form.addEventListener('change', gewijzigd);
    form.addEventListener('reset',function () { setTimeout(function () { sync(); reken(false); },0); });
    var routes = d.getElementById('strategie-bediening'), table = d.getElementById('strategie-tabel'), rs = d.getElementById('strategie-status');
    routes.hidden = false;
    function toon(alle) {
      var a = d.getElementById('route-1').value, b = d.getElementById('route-2').value;
      var geldig = ['1','2','3'].includes(a) && ['1','2','3'].includes(b) && a !== b;
      table.querySelectorAll('tr').forEach(function (tr) { Array.from(tr.children).forEach(function (c,i) { c.hidden = !alle && geldig && i !== 0 && String(i) !== a && String(i) !== b; }); });
      rs.textContent = alle ? 'Alle drie routes zijn zichtbaar.' : geldig ? 'Scenario ' + String.fromCharCode(64+Number(a)) + ' en ' + String.fromCharCode(64+Number(b)) + ' worden vergeleken. Geen automatische rangschikking.' : 'Kies twee verschillende routes. Alle drie routes blijven zichtbaar.';
    }
    routes.querySelectorAll('select').forEach(function (s) { s.addEventListener('change',function () { toon(false); }); });
    d.getElementById('routes-alle').addEventListener('click',function () { toon(true); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})(typeof window === 'object' ? window : globalThis);
