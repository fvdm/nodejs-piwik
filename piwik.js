/*
Name:           piwik
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

var urltool = require ('url');
var querystring = require ('querystring');
var http = require ('httpreq');
var app = {
  settings: {}
};

var defaults = {
  timeout: 5000
};


// HTTP GET
function talk (props) {
  var key;
  var options = {
    url: app.settings.baseURL + (props.path || ''),
    method: props.method || 'GET',
    headers: {},
    timeout: parseInt (props.timeout || app.settings.timeout || defaults.timeout, 10)
  };

  // build request
  if (props.query instanceof Object) {
    for (key in props.query) {
      if (typeof props.query [key] === 'object') {
        props.query [key] = JSON.stringify (props.query [key]);
      }
    }
  }

  if (props.query) {
    options.parameters = props.query;
  } else if (props.body) {
    options.body = props.body;
    options.headers ['Content-Type'] = 'application/json';
    options.headers ['Content-Length'] = options.body.length;
  }

  // send request
  http.doRequest (options, function (err, res) {
    var data = res && res.body || null;
    var error = null;

    if (err) {
      error = new Error ('request failed');
      error.error = err;
    }

    try {
      data = JSON.parse (data);
      if (data.result && data.result === 'error') {
        error = new Error ('api error');
        error.text = data.message || null;
      }
    } catch (e) {
      error = new Error ('response invalid');
      error.error = e;
    }

    if (res && res.statusCode && res.statusCode >= 300) {
      error = new Error ('http error');
      error.code = res.statusCode;
      error.body = data;
    }

    props.callback && props.callback (error, !error && data);
  });
}

// SETUP basics
app.setup = function (baseURL, token, timeout) {
  var url = urltool.parse (baseURL, true);

  app.settings.baseURL = url.protocol + '//' + url.host + url.pathname.replace (/\/[^\/]+$/, '/');

  // token in baseURL?
  app.settings.token = url.query && url.query.token_auth || null;

  // override with custom token, and set timeout
  if (typeof token === 'number') {
    app.settings.timeout = token;
  } else if (token) {
    app.settings.token = token;
    app.settings.timeout = timeout || defaults.timeout;
  }

  return app;
};

// API call
app.api = function (vars, cb) {
  vars = typeof vars === 'object' ? vars : {};
  vars.module = 'API';
  vars.format = 'JSON';
  vars.token_auth = app.settings.token;

  talk ({
    method: 'GET',
    path: 'index.php',
    query: vars,
    callback: cb || null
  });

  return app;
};

// Track
app.track = function (vars, cb) {
  var bulk = {
    requests: []
  };
  var i;
  var k;
  var val;
  var keys;

  if (app.settings.token) { bulk.token_auth = app.settings.token; }

  if (vars instanceof Array && vars [0] instanceof Object) {
    // array with objects
    for (i = 0; i < vars.length; i++) {
      keys = Object.keys (vars [i]);
      for (k = 0; k < keys.length; k++) {
        val = vars [i] [keys [k]];
        vars [i] [keys [k]] = typeof val === 'object' ? JSON.stringify (val) : val;
      }
      vars [i] .rec = 1;
      vars [i] .apiv = 1;
      vars [i] = '?' + querystring.stringify (vars [i]);
      bulk.requests.push (vars [i]);
      delete vars [i];
    }
  } else if (vars instanceof Object) {
    // object
    keys = Object.keys (vars);
    for (i = 0; i < keys.length; i++) {
      val = vars [keys [i]];
      vars [keys [i]] = typeof val === 'object' ? JSON.stringify (val) : val;
    }
    vars.rec = 1;
    vars.apiv = 1;
    bulk.requests.push ('?' + querystring.stringify (vars));
  }

  talk ({
    method: 'POST',
    path: 'piwik.php',
    body: JSON.stringify (bulk),
    callback: function (err, data) {
      var error = null;

      if (err && cb) { return cb (err); }

      if (data.status === 'success') {
        cb && cb (null, data);
      } else {
        error = new Error ('track failed');
        error.data = data;
        cb && cb (error);
      }
    }
  });

  return app;
};

// Spammers
app.loadSpammers = function (cb) {
  var options = {
    timeout: parseInt (app.settings.timeout || defaults.timeout, 10)
  };

  http.get (
    'https://github.com/piwik/referrer-spam-blacklist/raw/master/spammers.txt',
    options,
    function (err, res) {
      var data = res.body.trim () .split ('\n');
      var i;
      var line;

      if (err && cb) { return cb (err); }

      for (i = 0; i < data.length; i++) {
        line = data [i] .trim ();
        if (line === '') {
          delete data [i];
        }
      }
      data = data.sort ();
      cb && cb (null, data);
    }
  );

  return app;
};

// module
module.exports = app;
