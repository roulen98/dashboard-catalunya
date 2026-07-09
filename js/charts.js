var CHART_PALETTE = {
  teal:   '#1E4A52',
  burnt:  '#B4541E',
  olive:  '#5C6E38',
  blue:   '#4C78A8',
  red:    '#E45756',
  purple: '#B279A2',
  orange: '#F58518',
  green:  '#54A24B',
  series: ['#1E4A52','#B4541E','#5C6E38','#4C78A8','#E45756','#B279A2','#F58518','#54A24B']
};

function baseLayout(overrides) {
  var defaults = {
    paper_bgcolor: '#F4F0E6',
    plot_bgcolor:  '#EFEADB',
    font: { family: 'Archivo, system-ui, sans-serif', color: '#1B1A17', size: 12 },
    margin: { t: 20, b: 50, l: 55, r: 20 },
    hovermode: 'x unified',
    legend: { bgcolor: 'rgba(244,240,230,0.85)', bordercolor: '#D6CFBC', borderwidth: 1 },
    xaxis: { gridcolor: '#D6CFBC', linecolor: '#C7BFA8' },
    yaxis: { gridcolor: '#D6CFBC', linecolor: '#C7BFA8' }
  };
  return Object.assign({}, defaults, overrides || {});
}

function plotLine(divId, traces, layoutOverrides, config) {
  var layout = baseLayout(layoutOverrides);
  Plotly.newPlot(divId, traces, layout, Object.assign({ responsive: true, displayModeBar: false }, config || {}));
}

function plotArea(divId, traces, layoutOverrides) {
  plotLine(divId, traces, layoutOverrides);
}

function plotBar(divId, traces, layoutOverrides) {
  var layout = baseLayout(layoutOverrides);
  Plotly.newPlot(divId, traces, layout, { responsive: true, displayModeBar: false });
}

/* Helpers */
function linearRegression(xs, ys) {
  var n = xs.length;
  var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (var i = 0; i < n; i++) {
    sumX  += xs[i];
    sumY  += ys[i];
    sumXY += xs[i] * ys[i];
    sumXX += xs[i] * xs[i];
  }
  var slope     = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  var intercept = (sumY - slope * sumX) / n;
  return { slope: slope, intercept: intercept, predict: function(x) { return slope * x + intercept; } };
}

/* Parse JSON-stat v2 (Idescat, Eurostat) */
function parseJsonStat(data) {
  var dimIds = data.id;
  var sizes  = data.size;
  var dims   = data.dimension;
  var values = data.value;

  function buildLookup(dimKey) {
    var cat      = dims[dimKey].category;
    var indexMap = cat.index || {};
    var labelMap = cat.label || {};
    var lookup   = {};
    if (Array.isArray(indexMap)) {
      indexMap.forEach(function(code, i) { lookup[i] = labelMap[code] || code; });
    } else {
      Object.entries(indexMap).forEach(function(entry) {
        lookup[entry[1]] = labelMap[entry[0]] || entry[0];
      });
    }
    return lookup;
  }

  var lookups = {};
  dimIds.forEach(function(d) { lookups[d] = buildLookup(d); });

  var rows  = [];
  var total = sizes.reduce(function(a, b) { return a * b; }, 1);
  var idx   = new Array(dimIds.length).fill(0);

  for (var flat = 0; flat < total; flat++) {
    var row = {};
    dimIds.forEach(function(d, i) { row[d] = lookups[d][idx[i]] || idx[i]; });
    row._value = values[flat];
    rows.push(row);

    for (var d2 = idx.length - 1; d2 >= 0; d2--) {
      idx[d2]++;
      if (idx[d2] < sizes[d2]) break;
      idx[d2] = 0;
    }
  }

  return rows;
}
