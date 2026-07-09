/* Centralised fetch helpers. All sources confirmed CORS-enabled. */

var TTL = {
  METEO:     24 * 60 * 60 * 1000,   // 24 h (historical data)
  IDESCAT:   7  * 24 * 60 * 60 * 1000,  // 7 days
  SOCRATA:   6  * 60 * 60 * 1000    // 6 h (electoral data)
};

async function apiFetch(url, cacheKey, ttl) {
  var cached = CACHE.get(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  var r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status + ' → ' + url);
  var data = await r.json();
  CACHE.set(cacheKey, data, ttl);
  return { data: data, fromCache: false };
}

var API = {
  /* Open-Meteo — historical weather Barcelona (1980-today) */
  meteo: async function() {
    var today = new Date().toISOString().split('T')[0];
    var url = 'https://archive-api.open-meteo.com/v1/archive'
      + '?latitude=41.3888&longitude=2.159'
      + '&start_date=1980-01-01&end_date=' + today
      + '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean'
      + '&timezone=Europe/Berlin';
    return apiFetch(url, 'meteo_bcn', TTL.METEO);
  },

  /* Idescat — PIB anual Catalunya (2011-present) */
  pib: async function() {
    return apiFetch(
      'https://api.idescat.cat/taules/v2/pibc/21925/26069/cat/data',
      'idescat_pib', TTL.IDESCAT
    );
  },

  /* Idescat — Taxa d'atur mensual Catalunya */
  atur: async function() {
    return apiFetch(
      'https://api.idescat.cat/taules/v2/e03/22274/26671/cat/data',
      'idescat_atur', TTL.IDESCAT
    );
  },

  /* Idescat — Renda familiar disponible bruta per habitant */
  rfdb: async function() {
    return apiFetch(
      'https://api.idescat.cat/taules/v2/rfdbc/21181/25017/cat/data',
      'idescat_rfdb', TTL.IDESCAT
    );
  },

  /* Idescat — Cens: Població per comarca, sexe, lloc de naixement */
  census: async function() {
    return apiFetch(
      'https://api.idescat.cat/taules/v2/censph/16358/19811/com/data',
      'idescat_census', TTL.IDESCAT
    );
  },

  /* Idescat — Piràmide de població per edat i sexe */
  pyramid: async function() {
    return apiFetch(
      'https://api.idescat.cat/taules/v2/ep/9123/21460/cat/data',
      'idescat_pyramid', TTL.IDESCAT
    );
  },

  /* Socrata — Vots Parlament de Catalunya, per candidatura */
  vots: async function(idEleccio) {
    idEleccio = idEleccio || 'A20241';
    var url = 'https://analisi.transparenciacatalunya.cat/resource/ntc4-rnwr.json'
      + '?$select=candidatura_sigles,candidatura_denominacio,sum(vots)%20as%20total_vots'
      + '&$group=candidatura_sigles,candidatura_denominacio'
      + '&$where=id_eleccio%3D%27' + idEleccio + '%27'
      + '&$limit=50';
    return apiFetch(url, 'socrata_vots_' + idEleccio, TTL.SOCRATA);
  },

  /* Socrata — Llistat de processos electorals */
  eleccions: async function() {
    return apiFetch(
      'https://analisi.transparenciacatalunya.cat/resource/tgns-3xuy.json?$limit=200',
      'socrata_eleccions', TTL.SOCRATA
    );
  },

  /* Socrata — Vots autonòmiques agrupats per municipi (nivell DM) */
  votsPerMunicipi: async function(idEleccio) {
    idEleccio = idEleccio || 'A20241';
    var url = 'https://analisi.transparenciacatalunya.cat/resource/ntc4-rnwr.json'
      + '?$select=territori_nom,candidatura_sigles,sum(vots)%20as%20total_vots'
      + '&$group=territori_nom,candidatura_sigles'
      + '&$where=id_eleccio%3D%27' + idEleccio + '%27%20AND%20id_nivell_territorial%3D%27DM%27'
      + '&$limit=15000';
    return apiFetch(url, 'socrata_muni_' + idEleccio, TTL.SOCRATA);
  },

  /* TopoJSON municipis Catalunya (GitHub, caché 30 dies) */
  topoMunicipis: async function() {
    return apiFetch(
      'https://raw.githubusercontent.com/sirisacademic/catalonia-cartography/master/cat-municipis.json',
      'topo_municipis_cat',
      30 * 24 * 60 * 60 * 1000
    );
  }
};
