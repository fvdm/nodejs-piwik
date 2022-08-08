/*
Name:           piwik
Description:    Access a Matomo API or track hits with node.js
Author:         Franklin (https://fvdm.com)
Source & docs:  https://github.com/fvdm/nodejs-piwik
License:        Unlicense (Public Domain, see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

var urltool = require ('url');
var querystring = require ('querystring');
var http = require ('httpreq');
var app = {
  settings: {
    timeout: 5000,
  },
};


/**
 * Callback an error
 *
 * @callback  callback
 * @param     {string}       msg       Error.message
 * @param     {mixed}        err       Error.error
 * @param     {number|null}  code      Error.code, i.e. `res.statusCode`
 * @param     {function}     callback  `function (error) {}`
 * @return    {void}
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
 * @callback  callback
 * @param     {Error|null}  err         Response error
 * @param     {object}      res         Response resource
 * @param     {function}    [callback]  `(err, res)`
 * @returns   {void}
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
  }
  catch (e) {
    callbackError ('response invalid', e, null, callback);
    return;
  }

  if (res && res.statusCode && res.statusCode >= 300) {
    callbackError ('http error', data, res.statusCode, callback);
    return;
  }

  if (callback) {
    callback (null, data);
  }
}


/**
 * API communication
 *
 * @callback  props.callback
 * @param     {object}        props                 Response resource
 * @param     {string}        [props.method=GET]    HTTP method: GET, POST
 * @param     {string}        [props.path=/]        Request path after hostname
 * @param     {number}        [props.timeout=5000]  Request time out in ms
 * @param     {object}        [props.query]         Data fields to send along
 * @param     {string}        [props.body]          POST JSON encoded body
 * @param     {function}      [props.callback]      `(err, res)`
 * @returns   {void}
 */

function talk (props) {
  var key;
  var options = {
    url: app.settings.baseURL + (props.path || ''),
    method: props.method,
    headers: {},
    timeout: props.timeout || app.settings.timeout,
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
  }
  else if (props.body) {
    options.body = props.body;
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = options.body.length;
  }

  // send request
  http.doRequest (options, function (err, res) {
    processResponse (err, res, props.callback);
  });
}


/**
 * Setup basics
 *
 * @param    {string}  baseURL                     Piwik URL
 * @param    {string}  [token=baseURL token_auth]  Piwik API token
 * @param    {number}  [timeout=5000]              Request time out in ms
 * @returns  {object}  app
 */

function methodSetup (baseURL, token, timeout) {
  var url = urltool.parse (baseURL, true);

  app.settings.baseURL = url.protocol + '//' + url.host
    + url.pathname.replace (/\/[^\/]+$/, '/');

  // token in baseURL?
  app.settings.token = url.query && url.query.token_auth || null;

  // override with custom token, and set timeout
  if (typeof token === 'number') {
    timeout = token;
  }
  else if (token) {
    app.settings.token = token;
  }

  app.settings.timeout = timeout || app.settings.timeout;
  return app;
}


/**
 * API call
 *
 * @callback  callback
 * @param     {object}    [vars]      Parameters
 * @param     {function}  [callback]  `(err, res)`
 * @returns   {object}    app
 */

function methodApi (vars, callback) {
  vars = typeof vars === 'object' ? vars : {};
  vars.module = 'API';
  vars.format = 'JSON';
  vars.token_auth = app.settings.token;

  talk ({
    method: 'GET',
    path: 'index.php',
    query: vars,
    callback: callback || null,
  });

  return app;
}

function encodeRequests (vars, requests) {

  var requestsLength = requests.length;

  for (let index = 0; index < requestsLength; index++) {

    vars[`urls[${index}]`] = querystring.stringify (requests[index]);

  }

}

/**
 * Bulk API call
 *
 * @callback  callback
 * @param     {array}    [vars]      Parameters
 * @param     {function}  [callback]  `(err, res)`
 * @returns   {object}    app
 */

function methodBulkApi (requests, callback) {
  var vars = {};

  vars.module = 'API';
  vars.format = 'JSON';
  vars.method = 'API.getBulkRequest';
  vars.token_auth = app.settings.token;

  encodeRequests(vars, requests);

  talk ({
    method: 'GET',
    path: 'index.php',
    query: vars,
    callback: callback || null,
  });

  return app;
}


/**
 * Convert tracking object to full querystring
 *
 * @param   {object}  obj  The tracking object
 * @return  {string}       Full querystring for request
 */

function trackObject2request (obj) {
  var keys = Object.keys (obj);
  var key;
  var val;
  var i;

  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    val = obj[key];

    if (typeof val === 'object') {
      val = JSON.stringify (val);
    }

    obj[key] = val;
  }

  obj.rec = 1;
  obj.apiv = 1;
  return '?' + querystring.stringify (obj);
}


/**
 * Track one or multiple hits
 *
 * @callback  callback
 * @param     {object|array}  vars        Parameters or array with parameters objects
 * @param     {function}      [callback]  `(err, res)`
 * @returns   {object}        app
 */

function methodTrack (vars, callback) {
  var bulk = {
    requests: [],
  };
  var i;

  if (app.settings.token) {
    bulk.token_auth = app.settings.token;
  }

  if (vars instanceof Array && vars[0] instanceof Object) {
    // array with objects
    for (i = 0; i < vars.length; i++) {
      bulk.requests.push (trackObject2request (vars[i]));
    }
  }
  else if (vars instanceof Object) {
    // object
    bulk.requests.push (trackObject2request (vars));
  }

  talk ({
    method: 'POST',
    path: 'piwik.php',
    body: JSON.stringify (bulk),
    callback: function (err, data) {
      if (err && callback) {
        callback (err);
        return;
      }

      if (data.status === 'success' && callback) {
        callback (null, data);
      }
      else if (callback) {
        callbackError ('track failed', data, null, callback);
      }
    },
  });

  return app;
}


/**
 * Get spammers list from Github repo
 *
 * @callback  callback
 * @param     {function}  callback
 * @returns   {object}    app
 */

function methodLoadSpammers (callback) {
  var options = {
    timeout: app.settings.timeout,
  };

  http.get (
    'https://github.com/piwik/referrer-spam-blacklist/raw/master/spammers.txt',
    options,
    function (err, res) {
      var data;

      if (err) {
        callback (err);
      }
      else {
        data = res.body
          .trim()
          .replace (/\s+\n/g, '\n')
          .split ('\n')
          .sort();

        callback (null, data);
      }
    },
  );

  return app;
}


// module
app.setup = methodSetup;
app.api = methodApi;
app.bulkApi = methodBulkApi;
app.track = methodTrack;
app.loadSpammers = methodLoadSpammers;
module.exports = app;
