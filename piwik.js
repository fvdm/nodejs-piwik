/*
Name:         piwik
Description:  Access a Piwik API from node.js.
Source:       https://github.com/fvdm/nodejs-piwik
Feedback:     https://github.com/fvdm/nodejs-piwik/issues
License:      Unlicense / Public Domain (see UNLICENSE file)
*/

var urltool = require('url')
var querystring = require('querystring')
var http = null

var app = {settings: {}}

// SETUP basics
app.setup = function( baseURL, token ) {
  var url = urltool.parse( baseURL, true )

  switch( url.protocol ) {
    case 'http:':
      http = require('http')
      app.settings.apiport = url.port || 80
      break

    case 'https:':
      http = require('https')
      app.settings.apiport = url.port || 443
      break
  }

  // token in baseURL?
  if( url.query && url.query.token_auth ) {
    app.settings.token = url.query.token_auth
  }

  // override with custom token, if any
  if( token ) {
    app.settings.token = token
  }

  app.settings.apihost = url.hostname
  app.settings.apipath = url.pathname

  return app
}

// API call
app.api = function( vars, cb ) {
  var vars = typeof vars == 'object' ? vars : {}
  vars.module = 'API'
  vars.format = 'JSON'
  vars.token_auth = app.settings.token
  talk( {method: 'GET', query: vars}, cb )
  return app
}

// Track
app.track = function( vars, cb ) {
  var bulk = { requests: [] }
  if( app.settings.token ) { bulk.token_auth = app.settings.token }

  if( vars instanceof Array && vars[0] instanceof Object ) {
    // array with objects
    for( var i = 0; i < vars.length; i++ ) {
      var keys = Object.keys( vars[i] )
      for( var k = 0; k < keys.length; k++ ) {
        var val = vars[i][ keys[k] ]
        vars[i][ keys[k] ] = typeof val === 'object' ? JSON.stringify( val ) : val
      }
      vars[i].rec = 1
      vars[i].apiv = 1
      vars[i] = '?'+ querystring.stringify( vars[i] )
      bulk.requests.push( vars[i] )
      delete vars[i]
    }
  } else if( vars instanceof Object ) {
    // object
    var keys = Object.keys( vars )
    for( var k = 0; k < keys.length; k++ ) {
      var val = vars[ keys[k] ]
      vars[ keys[k] ] = typeof val === 'object' ? JSON.stringify( val ) : val
    }
    vars.rec = 1
    vars.apiv = 1
    bulk.requests.push( '?'+ querystring.stringify( vars ) )
  }

  talk(
    {
      method: 'POST',
      path: 'piwik.php',
      body: JSON.stringify( bulk )
    },
    function( err, data ) {
      if( err ) { return callback( err ) }
      if( data.status === 'success' ) {
        cb( null, data )
      } else {
        var error = new Error('track failed')
        error.data = data
        cb( error )
      }
    }
  )

  return app
}

// HTTP GET
function talk( props, cb ) {
  // prevent multiple callbacks
  var complete = false
  function callback( err, res ) {
    if( !complete ) {
      complete = true
      cb( err, res || null )
    }
  }

  // build request
  var query = ''
  if( props.query instanceof Object ) {
    var keys = Object.keys( props.query )
    for( var i = 0; i < keys.length; i++ ) {
      var key = keys[i]
      if( typeof props.query[ key ] === 'object' ) {
        props.query[ key ] = JSON.stringify( props.query[ key ] )
      }
    }
    query = '?'+ querystring.stringify( props.query )
  }

  var options = {
    host: app.settings.apihost,
    port: app.settings.apiport,
    path: app.settings.apipath + (props.path || '') + query,
    method: props.method || 'GET',
    headers: {}
  }

  if( props.method === 'POST' && typeof props.body === 'string' ) {
    options.headers['Content-Type'] = 'application/json'
    options.headers['Content-Length'] = props.body.length
  }

  var request = http.request( options )

  // response
  request.on( 'response', function( response ) {
    var data = []
    var size = 0

    response.on( 'close', function() {
      callback( new Error('request dropped') )
    })

    response.on( 'data', function( chunk ) {
      data.push( chunk )
      size += chunk.length
    })

    response.on( 'end', function() {
      data = new Buffer.concat( data, size ).toString().trim()
      try {
        data = JSON.parse( data )
        callback( null, data )
      }
      catch(e) {
        var error = new Error('response invalid')
        error.code = response.statusCode
        error.body = data
        callback( error )
      }
    })
  })

  // client error
  request.on( 'error', function( error ) {
    var err = new Error('request failed')
    err.error = error
    callback( err )
  })

  // run it
  request.end( props.body || null )
}

// module
module.exports = app
