/*
	This module is COPYLEFT meaning you can do anything you want,
	except copyrighting it.
	
	It would be nice to include the source URL for future reference:
	https://github.com/fvdm/nodejs-piwik/
*/

// INIT
var urltool = require('url'),
    querystring = require('querystring')

var app = {
	settings: {}
}

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
			
			var data = ''
			response.on( 'data', function( chunk ) { data += chunk })
			response.on( 'end', function() {
				
				// callback
				if( data.substr(0,1) == '[' && data.substr(-1,1) == ']' ) {
					cb( JSON.parse( data ) )
				}
				
			})
			
		}
	)
	
}

// ready
module.exports = app
