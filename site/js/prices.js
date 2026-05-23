var SUPABASE_URL      = 'https://wajvgngjfwbdnitggakn.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhanZnbmdqZndiZG5pdGdnYWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODM2NzksImV4cCI6MjA5MTY1OTY3OX0.0-wOI9VAy6NFxnrBJEpunqPbmq2mP2D3ZEec_V5m8gk';

var FALLBACK = { group: 45, semi_private: 50, private: 55, pony_day: 90, party: 60 };

async function loadPrices() {
    var prices = Object.assign({}, FALLBACK);
    try {
        var res = await fetch(SUPABASE_URL + '/rest/v1/littlefield_prices?select=type,price', {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        if (res.ok) {
            var data = await res.json();
            data.forEach(function(row) { prices[row.type] = row.price; });
        }
    } catch (e) { /* use fallback */ }
    applyPrices(prices);
}

function applyPrices(prices) {
    document.querySelectorAll('[data-price-type]').forEach(function(el) {
        var type   = el.dataset.priceType;
        var price  = prices[type];
        if (price == null) return;

        var format = el.dataset.priceFormat;
        if (format) {
            el.textContent = format.replace('{price}', price);
            return;
        }

        // Element may have child spans (e.g. "£60 <span>/head</span>")
        // Update only the leading text node, leave child elements intact
        var firstText = null;
        el.childNodes.forEach(function(n) { if (!firstText && n.nodeType === 3) firstText = n; });
        if (firstText) {
            var trailing = firstText.textContent.replace(/^£\d+/, '');
            firstText.textContent = '£' + price + trailing;
        } else {
            el.textContent = '£' + price;
        }
    });
}

document.addEventListener('DOMContentLoaded', loadPrices);
