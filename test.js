var util = require('util')

// Setup
// set env BOLCOM_APIKEY (Travis CI)
// or use cli arguments: npm test --bolapikey=abc123
var url = process.env.npm_config_piwikurl || process.env.PIWIK_URL || null
var token = process.env.npm_config_piwiktoken || process.env.PIWIK_TOKEN || null
var siteId = process.env.npm_config_piwiksiteid || process.env.PIWIK_SITEID || null

var piwik = require('./').setup( url, token )


// handle exits
var errors = 0
process.on( 'exit', function() {
  if( errors == 0 ) {
    console.log('\n\033[1mDONE, no errors.\033[0m\n')
    process.exit(0)
  } else {
    console.log('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m\n')
    process.exit(1)
  }
})

// prevent errors from killing the process
process.on( 'uncaughtException', function( err ) {
  console.log()
  console.error( err.stack )
  console.trace()
  console.log()
  errors++
})

// Queue to prevent flooding
var queue = []
var next = 0

function doNext() {
  next++
  if( queue[next] ) {
    queue[next]()
  }
}

// doTest( passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ])
function doTest( err, label, tests ) {
  if( err instanceof Error ) {
    console.error( label +': \033[1m\033[31mERROR\033[0m\n' )
    console.error( util.inspect(err, false, 10, true) )
    console.log()
    console.error( err.stack )
    console.log()
    errors++
  } else {
    var testErrors = []
    tests.forEach( function( test ) {
      if( test[1] !== true ) {
        testErrors.push(test[0])
        errors++
      }
    })

    if( testErrors.length == 0 ) {
      console.log( label +': \033[1m\033[32mok\033[0m' )
    } else {
      console.error( label +': \033[1m\033[31mfailed\033[0m ('+ testErrors.join(', ') +')' )
    }
  }

  doNext()
}


// ! Track
queue.push( function() {
  piwik.track(
    {
      idsite: siteId,
      url: 'https://www.npmjs.com/package/piwik',
      cvar: { '1': ['node test', process.version] }
    },
    function( data ) {
      doTest( null, 'track', [
        ['data type', data]
      ])
    }
  )
})


// ! API
queue.push( function() {
  piwik.api(
    {
      method: 'Actions.getPageUrls',
      idSite: siteId,
      period: 'day',
      date: 'today'
    },
    function( data ) {
      doTest( null, 'api', [
        ['data type', data instanceof Array],
        ['data length', data.length >= 1],
        ['item type', data[0] instanceof Object],
        ['item label', data && data[0] && typeof data[0].label === 'string']
      ])
    })
})


// Start the tests
console.log('Running tests...\n')
queue[0]()

function output( err, data ) {
  console.log( require('util').inspect( err || data, false, 10 ) )
}
