/*
Name:           piwik - test.js
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

var dotest = require ('dotest');
var app = require ('./');

// Setup
// $ PIWIK_URL= PIWIK_TOKEN= PIWIK_SITEID= npm test
var url = process.env.PIWIK_URL || null;
var token = process.env.PIWIK_TOKEN || null;
var siteId = process.env.PIWIK_SITEID || null;
var timeout = process.env.PIWIK_TIMEOUT || 5000;

var piwik = app.setup (url, token, timeout);


// Module
dotest.add ('Module', function (test) {
  test ()
    .isObject ('fail', 'exports', app)
    .isFunction ('fail', '.setup function', app && app.setup)
    .isObject ('fail', '.setup return', piwik)
    .isFunction ('fail', '.api', app && app.api)
    .isFunction ('fail', '.track', app && app.track)
    .isFunction ('fail', '.loadSpammers', app && app.loadSpammers)
    .done ();
});

// ! API error
dotest.add ('API error', function (test) {
  piwik.api (
    {
      method: 'invalid method name'
    },
    function (err) {
      test ()
        .isError ('fail', 'err', err)
        .isExactly ('fail', 'err.message', err && err.message, 'api error')
        .done ();
    }
  );
});

// ! Track one
dotest.add ('.track method - one hit', function (test) {
  piwik.track (
    {
      idsite: siteId,
      url: 'https://www.npmjs.com/package/piwik',
      cvar: {
        1: ['node test', process.version]
      }
    },
    function (err, data) {
      test (err)
        .isObject ('fail', 'data', data)
        .isExactly ('fail', 'data.status', data && data.status, 'success')
        .isExactly ('fail', 'data.tracked', data && data.tracked, 1)
        .done ();
    }
  );
});

// ! Track multi
dotest.add ('.track method - multiple hits', function (test) {
  piwik.track (
    [
      {
        idsite: siteId,
        url: 'https://www.npmjs.com/package/piwik',
        cvar: {
          1: ['node test', process.version]
        }
      },
      {
        idsite: siteId,
        url: 'https://github.com/fvdm/nodejs-piwik',
        cvar: {
          1: ['node test', process.version]
        }
      }
    ],
    function (err, data) {
      test (err)
        .isObject ('fail', 'data', data)
        .isExactly ('fail', 'data.status', data && data.status, 'success')
        .isExactly ('fail', 'data.tracked', data && data.tracked, 2)
        .done ();
    }
  );
});


// ! API
dotest.add ('.api method', function (test) {
  piwik.api (
    {
      method: 'Actions.getPageUrls',
      idSite: siteId,
      period: 'year',
      date: 'today'
    },
    function (err, data) {
      test (err)
        .isArray ('fail', 'data', data)
        .isNotEmpty ('fail', 'data', data)
        .isObject ('fail', 'data[0]', data && data [0])
        .isString ('fail', 'data[0].label', data && data [0] && data [0] .label)
        .done ();
    }
  );
});


// ! loadSpammers
dotest.add ('.loadSpammers method', function (test) {
  piwik.loadSpammers (function (err, data) {
    test (err)
      .isArray ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isString ('fail', 'data[0]', data && data [0])
      .done ();
  });
});


// Start the tests
dotest.run ();
