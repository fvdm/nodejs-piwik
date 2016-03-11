/*
Name:           piwik - test.js
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

var path = require ('path');
var dir = path.dirname (module.filename);

var pkg = require (path.join (dir, 'package.json'));
var app = require (path.join (dir));

var errors = 0;
var warnings = 0;
var queue = [];
var next = 0;


// Setup
// $ env PIWIK_URL= PIWIK_TOKEN= PIWIK_SITEID= npm test
var url = process.env.PIWIK_URL || null;
var token = process.env.PIWIK_TOKEN || null;
var siteId = process.env.PIWIK_SITEID || null;
var timeout = process.env.PIWIK_TIMEOUT || 5000;

var piwik = app.setup (url, token, timeout);


// Color string
function colorStr (color, str) {
  var colors = {
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    gray: '\u001b[37m',
    bold: '\u001b[1m',
    plain: '\u001b[0m'
  };

  return colors [color] + str + colors.plain;
}

function log (type, str) {
  if (!str) {
    str = type;
    type = 'plain';
  }

  switch (type) {
    case 'error': console.log (colorStr ('red', colorStr ('bold', 'ERR     ')) + str + '\n'); break;
    case 'fail': console.log (colorStr ('red', 'FAIL') + '    ' + str); break;
    case 'good': console.log (colorStr ('green', 'good') + '    ' + str); break;
    case 'warn': console.log (colorStr ('yellow', 'warn') + '    ' + str); break;
    case 'info': console.log (colorStr ('cyan', 'info') + '    ' + str); break;
    case 'note': console.log (colorStr ('bold', str)); break;
    case 'plain': default: console.log (str); break;
  }
}

function typeStr (str) {
  if (typeof str === 'string') {
    str = '"' + str + '"';
  } else if (str instanceof Object) {
    str = 'Object';
  } else if (str instanceof Array) {
    str = 'Array';
  } else if (str instanceof Error) {
    str = 'Error';
  }

  return colorStr ('magenta', str);
}

// handle exits
process.on ('exit', function () {
  console.log ();
  log ('info', errors + ' errors');
  log ('info', warnings + ' warnings');
  console.log ();

  if (errors) {
    process.exit (1);
  } else {
    process.exit (0);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log (err);
  console.log ();
  console.log (err.stack);
  console.log ();
  errors++;
});

// Queue to prevent flooding
function doNext () {
  next++;
  if (queue [next]) {
    console.log ();
    queue [next] ();
  }
}


/**
 * doTest checks for error
 * else runs specified tests
 *
 * @param {Error} err
 * @param {String} label
 * @param {Array} tests
 *
 * doTest(err, 'label text', [
 *   ['fail', 'feeds', typeof feeds, 'object'],
 *   ['warn', 'music', music instanceof Array, true],
 *   ['info', 'tracks', music.length]
 * ]);
 */

function doTest (err, label, tests) {
  var level = 'good';
  var test;
  var i;

  if (err instanceof Error) {
    log ('error', label);
    console.dir (err, { depth: null, colors: true });
    console.log ();
    console.log (err.stack);
    console.log ();
    errors++;

    doNext ();
    return;
  }

  log ('note', colorStr ('blue', '(' + (next + 1) + '/' + queue.length + ') ') + label);

  for (i = 0; i < tests.length; i++) {
    test = {
      level: tests [i] [0],
      label: tests [i] [1],
      result: tests [i] [2],
      expect: tests [i] [3]
    };

    if (test.result === test.expect) {
      log ('good', colorStr ('blue', test.label) + ': ' + typeStr (test.result) + ' is exactly ' + typeStr (test.expect));
    }

    if (test.level === 'fail' && test.result !== test.expect) {
      errors++;
      level = 'fail';
      log ('fail', colorStr ('blue', test.label) + ': ' + typeStr (test.result) + ' is not ' + typeStr (test.expect));
    }

    if (test.level === 'warn' && test.result !== test.expect) {
      warnings++;
      level = level !== 'fail' && 'warn';
      log ('warn', colorStr ('blue', test.label) + ': ' + typeStr (test.result) + ' is not ' + typeStr (test.expect));
    }

    if (test.level === 'info') {
      log ('info', colorStr ('blue', test.label) + ': ' + typeStr (test.result));
    }
  }

  doNext ();
}


// Module
queue.push (function () {
  doTest (null, 'Module', [
    ['fail', 'exports', app instanceof Object, true],
    ['fail', '.setup function', app && app.setup instanceof Function, true],
    ['fail', '.setup return', piwik instanceof Object, true],
    ['fail', '.api', app && app.api instanceof Function, true],
    ['fail', '.track', app && app.track instanceof Function, true],
    ['fail', '.loadSpammers', app && app.loadSpammers instanceof Function, true]
  ]);
});


// ! API access
queue.push (function () {
  piwik.api (
    {
      method: 'API.getPiwikVersion'
    },
    function (err) {
      doTest (err, 'API access', [
        ['fail', 'API access', !err, true]
      ]);

      if (err) {
        process.exit (1);
      }
    }
  );
});


// ! API error
queue.push (function () {
  piwik.api (
    {
      method: 'invalid method name'
    },
    function (err) {
      doTest (null, 'API error', [
        ['fail', 'type', err && err instanceof Error, true],
        ['fail', 'message', err && err.message, 'api error']
      ]);
    }
  );
});


// ! Track one
queue.push (function () {
  piwik.track (
    {
      idsite: siteId,
      url: 'https://www.npmjs.com/package/piwik',
      cvar: {
        1: ['node test', process.version]
      }
    },
    function (err, data) {
      doTest (err, 'track one', [
        ['fail', 'data type', typeof data, 'object'],
        ['fail', 'data.status', data && data.status, 'success'],
        ['fail', 'data.tracked', data && data.tracked, 1]
      ]);
    }
  );
});

// ! Track multi
queue.push (function () {
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
      doTest (err, 'track multi', [
        ['fail', 'data type', typeof data, 'object'],
        ['fail', 'data.status', data && data.status, 'success'],
        ['fail', 'data.tracked', data && data.tracked, 2]
      ]);
    }
  );
});


// ! API
queue.push (function () {
  piwik.api (
    {
      method: 'Actions.getPageUrls',
      idSite: siteId,
      period: 'year',
      date: 'today'
    },
    function (err, data) {
      doTest (err, 'api', [
        ['fail', 'data type', data instanceof Array, true],
        ['fail', 'data length', data && data.length >= 1, true],
        ['fail', 'item type', data && data [0] instanceof Object, true],
        ['fail', 'item label', data && data [0] && typeof data [0] .label, 'string']
      ]);
    }
  );
});


// ! loadSpammers
queue.push (function () {
  piwik.loadSpammers (function (err, data) {
    doTest (err, 'loadSpammers', [
      ['fail', 'data type', data instanceof Array, true],
      ['fail', 'data length', data && data.length >= 1, true],
      ['fail', 'item type', data && data [0] && typeof data [0], 'string']
    ]);
  });
});


// Start the tests
log ('note', 'Running tests...\n');
log ('note', 'Node.js:  ' + process.versions.node);
log ('note', 'Module:   ' + pkg.version);
console.log ();

queue [0] ();
