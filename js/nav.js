var NAV_ITEMS = [
  { id: 'index',      label: 'Inici',      href: 'index.html',      icon: '🏠' },
  { id: 'meteo',      label: 'Meteo',      href: 'meteo.html',      icon: '🌡️' },
  { id: 'economia',   label: 'Economia',   href: 'economia.html',   icon: '💰' },
  { id: 'politica',   label: 'Política',   href: 'politica.html',   icon: '🏛️' },
  { id: 'demografia', label: 'Demografia', href: 'demografia.html', icon: '👥' },
  { id: 'recursos',   label: 'Recursos',   href: 'recursos.html',   icon: '🔗' }
];

function renderNav(activePage) {
  var links = NAV_ITEMS.map(function(item) {
    var cls = 'nav-link' + (item.id === activePage ? ' active' : '');
    return '<li><a href="' + item.href + '" class="' + cls + '">' + item.icon + ' ' + item.label + '</a></li>';
  }).join('');

  var html = '<header class="site-header"><nav class="nav-container">' +
    '<a href="index.html" class="nav-brand">Dashboard Catalunya</a>' +
    '<ul class="nav-links">' + links + '</ul>' +
    '</nav></header>';

  document.body.insertAdjacentHTML('afterbegin', html);
}
