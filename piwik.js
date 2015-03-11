/*
Name:           piwik
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (http://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

var urltool = require ('url');
var querystring = require ('querystring');
var http = null;

var app = {settings: {}};

// SETUP basics
app.setup = function (baseURL, token, timeout) {
  var url = urltool.parse (baseURL, true);

  if (url.protocol === 'https:') {
    http = require ('https');
    app.settings.apiprotocol = 'https:';
    app.settings.apiport = url.port || 443;
  } else {
    http = require ('http');
    app.settings.apiprotocol = 'http:';
    app.settings.apiport = url.port || 80;
  }

  // token in baseURL?
  if (url.query && url.query.token_auth) {
    app.settings.token = url.query.token_auth;
  }

  // override with custom token, and set timeout
  if (typeof token === 'number') {
    app.settings.timeout = token;
  } else if (token) {
    app.settings.token = token;
    app.settings.timeout = timeout || 5000;
  }

  app.settings.apihost = url.hostname;
  app.settings.apipath = url.pathname;

  return app;
};

// API call
app.api = function (vars, cb) {
  vars = typeof vars === 'object' ? vars : {};
  vars.module = 'API';
  vars.format = 'JSON';
  vars.token_auth = app.settings.token;
  talk ({method: 'GET', query: vars}, cb);
  return app;
};

// Track
app.track = function (vars, cb) {
  var bulk = {requests: []};
  var i, k, val, keys;
  if (app.settings.token) { bulk.token_auth = app.settings.token; }

  if (vars instanceof Array && vars[0] instanceof Object) {
    // array with objects
    for (i = 0; i < vars.length; i++) {
      keys = Object.keys (vars [i]);
      for (k = 0; k < keys.length; k++) {
        val = vars [i] [keys [k]];
        vars [i] [keys [k]] = typeof val === 'object' ? JSON.stringify (val) : val;
      }
      vars [i].rec = 1;
      vars [i].apiv = 1;
      vars [i] = '?'+ querystring.stringify (vars [i]);
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
    bulk.requests.push ('?'+ querystring.stringify (vars) );
  }

  talk(
    {
      method: 'POST',
      path: 'piwik.php',
      body: JSON.stringify (bulk)
    },
    function (err, data) {
      if (err) { return cb (err); }
      if (data.status === 'success') {
        cb (null, data);
      } else {
        var error = new Error ('track failed');
        error.data = data;
        cb (error);
      }
    }
  );

  return app;
};

// HTTP GET
function talk (props, cb) {
  // prevent multiple callbacks
  var complete = false;
  function callback (err, res) {
    if (!complete) {
      complete = true;
      cb (err, res || null);
    }
  }

  // build request
  var query = '';
  if (props.query instanceof Object) {
    var keys = Object.keys (props.query);
    for (var i = 0; i < keys.length; i++) {
      var key = keys [i];
      if (typeof props.query [key] === 'object') {
        props.query [key] = JSON.stringify (props.query [key]);
      }
    }
    query = '?'+ querystring.stringify (props.query);
  }

  var options = {
    protocol: app.settings.apiprotocol,
    host: app.settings.apihost,
    port: app.settings.apiport,
    path: app.settings.apipath + (props.path || '') + query,
    method: props.method || 'GET',
    headers: {}
  };

  if (props.method === 'POST' && typeof props.body === 'string') {
    options.headers ['Content-Type'] = 'application/json';
    options.headers ['Content-Length'] = props.body.length;
  }

  var request = http.request (options);

  // response
  request.on ('response', function (response) {
    var data = [];
    var size = 0;

    response.on ('close', function () {
      callback (new Error ('request dropped'));
    });

    response.on ('data', function (chunk) {
      data.push (chunk);
      size += chunk.length;
    });

    response.on ('end', function () {
      var error = null;
      data = Buffer.concat (data, size) .toString () .trim ();

      if (response.statusCode >= 300) {
        error = new Error ('http error');
        error.code = response.statusCode;
        error.body = data;
      }

      try {
        data = JSON.parse (data);
        if (data.result && data.result === 'error') {
          error = new Error ('api error');
          error.text = data.message;
        }
      }
      catch (e) {
        error = new Error ('response invalid');
        error.code = response.statusCode;
        error.body = data;
      }

      callback (error, !error ? data : null);
    });
  });

  // client timeout
  request.on ('socket', function (socket) {
    if (typeof app.settings.timeout === 'number') {
      socket.setTimeout (parseInt (app.settings.timeout));
      socket.on ('timeout', function () {
        callback (new Error('request timeout'));
        request.abort ();
      });
    }
  });

  // client error
  request.on ('error', function (error) {
    var err = new Error ('request failed');
    if (error.code === 'ECONNRESET') {
      err = new Error ('request timeout');
    }
    err.error = error;
    callback (err);
  });

  // run it
  request.end (props.body);
}

// module
module.exports = app;
