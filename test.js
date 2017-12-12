/*
Name:           piwik - test.js
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

const dotest = require ('dotest');
const app = require ('./');

// Setup
// $ PIWIK_URL= PIWIK_TOKEN= PIWIK_SITEID= npm test
const url = process.env.PIWIK_URL || null;
const token = process.env.PIWIK_TOKEN || null;
const siteId = process.env.PIWIK_SITEID || null;
const timeout = process.env.PIWIK_TIMEOUT || 5000;

const piwik = app.setup (url, token, timeout);


// Interface
dotest.add ('Interface', test => {
  test()
    .isObject ('fail', 'exports', app)
    .isFunction ('fail', '.setup function', app && app.setup)
    .isObject ('fail', '.setup return', piwik)
    .isFunction ('fail', '.api', app && app.api)
    .isFunction ('fail', '.track', app && app.track)
    .isFunction ('fail', '.loadSpammers', app && app.loadSpammers)
    .done();
});


// ! loadSpammers
dotest.add ('.loadSpammers method', test => {
  piwik.loadSpammers ((err, data) => {
    test (err)
      .isArray ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isString ('fail', 'data[0]', data && data [0])
      .done();
  });
});


// ! API error
dotest.add ('API error', test => {
  const params = {
    method: 'invalid method name'
  };

  piwik.api (params, (err) => {
    test()
      .isError ('fail', 'err', err)
      .isExactly ('fail', 'err.message', err && err.message, 'api error')
      .done();
  });
});


// ! API
dotest.add ('.api method', test => {
  const params = {
    method: 'Actions.getPageUrls',
    idSite: siteId,
    period: 'year',
    date: 'today'
  };

  piwik.api (params, (err, data) => {
    test (err)
      .isArray ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isObject ('fail', 'data[0]', data && data [0])
      .isString ('fail', 'data[0].label', data && data [0] && data [0] .label)
      .done();
  });
});


// ! Track one
dotest.add ('.track method - one hit', test => {
  const params = {
    idsite: siteId,
    url: 'https://www.npmjs.com/package/piwik',
    cvar: {
      1: ['node test', process.version]
    }
  };

  piwik.track (params, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isExactly ('fail', 'data.status', data && data.status, 'success')
      .isExactly ('fail', 'data.tracked', data && data.tracked, 1)
      .done();
  });
});


// ! Track multi
dotest.add ('.track method - multiple hits', test => {
  const params = [
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
  ];

  piwik.track (params, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isExactly ('fail', 'data.status', data && data.status, 'success')
      .isExactly ('fail', 'data.tracked', data && data.tracked, 2)
      .done();
  });
});


// ! Track without token
dotest.add ('.track method - without token', test => {
  const tmp = app.setup (url, timeout);
  const params = {
    idsite: siteId,
    url: 'https://www.npmjs.com/package/piwik',
    cvar: {
      1: ['node test', process.version]
    }
  };

  tmp.track (params, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isExactly ('fail', 'data.status', data && data.status, 'success')
      .isExactly ('fail', 'data.tracked', data && data.tracked, 1)
      .done();
  });
});


// Start the tests
dotest.run();
