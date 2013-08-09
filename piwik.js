/*
Name:         piwik
Description:  Access a Piwik API from node.js.
Source:       https://github.com/fvdm/nodejs-piwik
Feedback:     https://github.com/fvdm/nodejs-piwik/issues
License:      Unlicense / Public Domain (see UNLICENSE file)
*/

var	urltool = require('url')
var querystring = require('querystring')

var app = {settings: {}}

// SETUP basics
app.setup = function( baseURL, token ) {
	var url = urltool.parse( baseURL, true )
	
	// protocol and port
	switch( url.protocol ) {
		case 'http:':
			app.http = require('http')
			app.settings.apiport = url.port || 80
			break
		
		case 'https:':
			app.http = require('https')
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
	
	// the rest
	app.settings.apihost = url.hostname
	app.settings.apipath = url.pathname
}

// API call
app.api = function( vars, cb ) {
	
	// prepare fields
	var vars = typeof vars == 'object' ? vars : {}
	vars.module = 'API'
	vars.format = 'JSON'
	vars.token_auth = app.settings.token
	
	// do request
	app.http.get(
		{
			host:	app.settings.apihost,
			port:	app.settings.apiport,
			path:	app.settings.apipath +'?'+ querystring.stringify( vars )
		},
		function( response ) {
			
			var data = []
			var size = 0
			
			response.on( 'data', function( chunk ) {
				data.push( chunk )
				size += chunk.length
			})
			
			response.on( 'end', function() {
				
				// build data
				var buf = new Buffer( size )
				var pos = 0
				
				for( var d in data ) {
					data[d].copy( buf, pos )
					pos += data[d].length
				}
				
				data = buf.toString('utf8').trim()
				
				// callback
				data = data.trim()
				if( data.substr(0,1) == '[' && data.substr(-1,1) == ']' ) {
					cb( JSON.parse( data ) )
				}
				
			})
			
		}
	)
	
}

// ready
module.exports = app
