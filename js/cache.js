var CACHE = {
  _prefix: 'dashcat_',

  set: function(key, data, ttlMs) {
    try {
      localStorage.setItem(this._prefix + key, JSON.stringify({
        data: data,
        expires: Date.now() + ttlMs
      }));
    } catch(e) { /* storage full — skip cache */ }
  },

  get: function(key) {
    try {
      var raw = localStorage.getItem(this._prefix + key);
      if (!raw) return null;
      var item = JSON.parse(raw);
      if (Date.now() > item.expires) {
        localStorage.removeItem(this._prefix + key);
        return null;
      }
      return item.data;
    } catch(e) {
      return null;
    }
  },

  clear: function(key) {
    if (key) {
      localStorage.removeItem(this._prefix + key);
    } else {
      Object.keys(localStorage)
        .filter(function(k) { return k.startsWith('dashcat_'); })
        .forEach(function(k) { localStorage.removeItem(k); });
    }
  }
};
