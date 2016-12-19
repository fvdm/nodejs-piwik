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
  settings: {
    timeout: 5000
  }
};


/**
 * Callback an error
 *
 * @callback callback
 * @param msg {string} - Error.message
 * @param err {mixed} - Error.error
 * @param code {number|null} - Error.code, i.e. `res.statusCode`
 * @param callback {function} - `function (error) {}`
 * @return {void}
 */

function callbackError (msg, err, code, callback) {
  var error = new Error (msg);

  error.error = err;
  error.code = code;
  callback (error);
}


/**
 * Process talk() response
 *
 * @callback callback
 * @param err {Error} - Response error
 * @param res {object} - Response resource
 * @param [callback] {function} - Optional `function (err, res) {}`
 * @returns {void}
 */

function processResponse (err, res, callback) {
  var data = res && res.body || null;

  if (err) {
    callbackError ('request failed', err, null, callback);
    return;
  }

  try {
    data = JSON.parse (data);

    if (data.result && data.result === 'error') {
      callbackError ('api error', data.message, null, callback);
      return;
    }
  } catch (e) {
    callbackError ('response invalid', e, null, callback);
    return;
  }

  if (res && res.statusCode && res.statusCode >= 300) {
    callbackError ('http error', data, res.statusCode, callback);
    return;
  }

  callback && callback (null, data);
}


/**
 * API communication
 *
 * @callback props.callback
 * @param props {object} - Response resource
 * @param [props.method] {string=GET} - HTTP method: GET, POST
 * @param [props.path] {string=/} - Request path after hostname
 * @param [props.timeout] {number-5000} - Request time out in ms
 * @param [props.query] {object} - Data fields to send along
 * @param [props.body] {string} - POST JSON encoded body
 * @param [props.callback] {function} - Optional `function (err, res) {}`
 * @returns {void}
 */

function talk (props) {
  var key;
  var options = {
    url: app.settings.baseURL + (props.path || ''),
    method: props.method || 'GET',
    headers: {},
    timeout: props.timeout || app.settings.timeout
  };

  // build request
  if (props.query instanceof Object) {
    for (key in props.query) {
      if (typeof props.query[key] === 'object') {
        props.query[key] = JSON.stringify (props.query[key]);
      }
    }
  }

  if (props.query) {
    options.parameters = props.query;
  } else if (props.body) {
    options.body = props.body;
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = options.body.length;
  }

  // send request
  function httpResponse (err, res) {
    processResponse (err, res, props.callback);
  }

  http.doRequest (options, httpResponse);
}


/**
 * Setup basics
 *
 * @param baseURL {string} - Piwik URL
 * @param [token] {string=baseURL token_auth} - Piwik API token
 * @param [timeout] {number} - Request time out in ms
 * @returns app {object}
 */

function methodSetup (baseURL, token, timeout) {
  var url = urltool.parse (baseURL, true);

  app.settings.baseURL = url.protocol + '//' + url.host + url.pathname.replace (/\/[^\/]+$/, '/');

  // token in baseURL?
  app.settings.token = url.query && url.query.token_auth || null;

  // override with custom token, and set timeout
  if (typeof token === 'number') {
    timeout = token;
  } else if (token) {
    app.settings.token = token;
  }

  app.settings.timeout = timeout || app.settings.timeout;
  return app;
}


/**
 * API call
 *
 * @callback callback
 * @callback cb
 * @param [vars] {object} - Parameters
 * @param [cb] {function} - `function (err, res) {}`
 * @returns app {object}
 */

function methodApi (vars, cb) {
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
}


/**
 * Track one or multiple hits
 *
 * @callback cb
 * @param vars {object|array} - Parameters or array with parameters objects
 * @param [cb] {function} - Optional `function (err, res) {}`
 * @returns app {object}
 */

function methodTrack (vars, cb) {
  var bulk = {
    requests: []
  };
  var i;
  var k;
  var val;
  var keys;

  if (app.settings.token) {
    bulk.token_auth = app.settings.token;
  }

  if (vars instanceof Array && vars[0] instanceof Object) {
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
      if (err && cb) {
        cb (err);
        return;
      }

      if (data.status === 'success') {
        cb && cb (null, data);
      } else {
        callbackError ('track failed', data, null, cb);
      }
    }
  });

  return app;
}


/**
 * Get spammers list from Github repo
 *
 * @callback cb
 * @param cb {function}
 * @returns app {object}
 */

function methodLoadSpammers (cb) {
  var options = {
    timeout: app.settings.timeout
  };

  http.get (
    'https://github.com/piwik/referrer-spam-blacklist/raw/master/spammers.txt',
    options,
    function (err, res) {
      var data = res.body.trim().split ('\n');
      var i;
      var line;

      if (err && cb) {
        cb (err);
        return;
      }

      for (i = 0; i < data.length; i++) {
        line = data[i].trim();

        if (line === '') {
          delete data[i];
        }
      }

      data = data.sort();
      cb && cb (null, data);
    }
  );

  return app;
}


// module
app.setup = methodSetup;
app.api = methodApi;
app.track = methodTrack;
app.loadSpammers = methodLoadSpammers;
module.exports = app;
