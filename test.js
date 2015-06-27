/*
Name:           piwik - test.js
Description:    Access a Piwik API or track hits with node.js
Author:         Franklin van de Meent (https://frankl.in)
Source & docs:  https://github.com/fvdm/nodejs-piwik
Feedback:       https://github.com/fvdm/nodejs-piwik/issues
License:        Unlicense / Public Domain (see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

// Setup
// $ env PIWIK_URL= PIWIK_TOKEN= PIWIK_SITEID= npm test
var url = process.env.PIWIK_URL || null;
var token = process.env.PIWIK_TOKEN || null;
var siteId = process.env.PIWIK_SITEID || null;
var timeout = process.env.PIWIK_TIMEOUT || 5000;

var piwik = require ('./') .setup (url, token, timeout);


// handle exits
var errors = 0;
process.on ('exit', function () {
  if (errors === 0) {
    console.log ('\n\033[1mDONE, no errors.\033[0m\n');
    process.exit (0);
  } else {
    console.log ('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m\n');
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log ();
  console.error (err.stack);
  console.trace ();
  console.log ();
  errors++;
});

// Queue to prevent flooding
var queue = [];
var next = 0;

function doNext () {
  next++;
  if (queue [next]) {
    queue [next] ();
  }
}

// doTest( passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ])
function doTest (err, label, tests) {
  if (err instanceof Error) {
    console.error (label +': \033[1m\033[31mERROR\033[0m\n');
    console.dir (err, { depth: null, colors: true });
    console.log ();
    console.error (err.stack);
    console.log ();
    errors++;
  } else {
    var testErrors = [];
    for (var i = 0; i < tests.length; i++) {
      if (tests [i] [1] !== true) {
        testErrors.push (tests [i] [0]);
        errors++;
      }
    }

    if(testErrors.length === 0) {
      console.log (label +': \033[1m\033[32mok\033[0m');
    } else {
      console.error (label +': \033[1m\033[31mfailed\033[0m ('+ testErrors.join (', ') +')');
    }
  }

  doNext ();
}


// ! API access
queue.push (function () {
  piwik.api (
    {method: 'API.getPiwikVersion'},
    function (err) {
      if (err) {
        console.log ('API access: failed ('+ err.message +')');
        console.log (err.stack);
        errors++;
        process.exit (1);
      } else {
        console.log ('API access: \033[1m\033[32mok\033[0m');
        doNext ();
      }
    }
  );
});


// ! API error
queue.push (function () {
  piwik.api (
    {method: 'invalid method name'},
    function (err, data) {
      doTest (null, 'API error', [
        ['type', err && err instanceof Error],
        ['message', err && err.message === 'api error']
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
      cvar: {'1': ['node test', process.version]}
    },
    function (err, data) {
      doTest (err, 'track one', [
        ['data type', typeof data === 'object'],
        ['data.status', data && data.status === 'success'],
        ['data.tracked', data && data.tracked === 1]
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
        cvar: {'1': ['node test', process.version]}
      },
      {
        idsite: siteId,
        url: 'https://github.com/fvdm/nodejs-piwik',
        cvar: {'1': ['node test', process.version]}
      }
    ],
    function (err, data) {
      doTest (err, 'track multi', [
        ['data type', typeof data === 'object'],
        ['data.status', data && data.status === 'success'],
        ['data.tracked', data && data.tracked === 2]
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
        ['data type', data instanceof Array],
        ['data length', data && data.length >= 1],
        ['item type', data && data [0] instanceof Object],
        ['item label', data && data [0] && typeof data [0] .label === 'string']
      ]);
    }
  );
});


// ! loadSpammers
queue.push (function () {
  piwik.loadSpammers (function (err, data) {
    doTest (err, 'loadSpammers', [
      ['data type', data instanceof Array],
      ['data length', data && data.length >= 1],
      ['item type', data && data [0] && typeof data [0] === 'string']
    ]);
  });
});


// Start the tests
console.log ('Running tests...\n');
queue [0] ();
