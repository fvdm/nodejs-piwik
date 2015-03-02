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
  vars = typeof vars == 'object' ? vars : {}
  vars.module = 'API'
  vars.format = 'JSON'
  vars.token_auth = app.settings.token
  get( {query: vars}, cb )
  return app
}

// Track
app.track = function( vars, cb ) {
  vars = typeof vars === 'object' ? vars : {}
  vars.rec = 1
  vars.apiv = 1
  if( app.settings.token ) {
    vars.token_auth = app.settings.token
  }
  get( {path: 'piwik.php', query: vars}, function( data ) {
    cb( data.substr(0,3) === 'GIF' )
  })
  return app
}

// HTTP GET
function get( props, cb ) {
  var keys = Object.keys( props.query )
  for( var i = 0; i < keys.length; i++ ) {
    var key = keys[i]
    if( typeof props.query[ key ] === 'object' ) {
      props.query[ key ] = JSON.stringify( props.query[ key ] )
    }
  }

  http.get(
    {
      host: app.settings.apihost,
      port: app.settings.apiport,
      path: app.settings.apipath + (props.path || '') +'?'+ querystring.stringify( props.query )
    },
    function( response ) {
      var data = []
      var size = 0

      response.on( 'data', function( chunk ) {
        data.push( chunk )
        size += chunk.length
      })

      response.on( 'end', function() {
        data = new Buffer.concat( data, size ).toString().trim()
        try { data = JSON.parse( data ) } catch(e) {}
        cb( data )
      })
    }
  )
}

// ready
module.exports = app
