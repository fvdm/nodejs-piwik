piwik
=====

Piwik API access and tracking with node.js

[![Build Status](https://travis-ci.org/fvdm/nodejs-piwik.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-piwik)

* [node.js](http://nodejs.org/)
* [Piwik](http://piwik.org/)
* [API documentation](http://developer.piwik.org/api-reference/reporting-api-introduction)


Installation
------------

Stable: `npm install piwik`

Develop: `npm install fvdm/nodejs-piwik`


setup ( baseURL, [token] )
-----

In order to use this module you need to start with `setup()`.

argument | type   | required | description
-------- | ------ | -------- | -----------
baseURL  | string | yes      | The URL to your Piwik installation. Both HTTP and HTTPS are supported.
token    | string | no       | Your API access token. Either set `token` or include `token_auth` in the *baseURL*.


```js
var piwik = require('piwik').setup( 'https://example.tld/path/to/piwik/', 'abcd1234' )
```


api ( vars, callback )
---

Call an API method.


argument | type     | required | description
-------- | -------- | -------- | ----------------------
vars     | object   | yes      | see docs
callback | function | yes      | function ( err, data )


[Reporting API docs](http://developer.piwik.org/api-reference/reporting-api-introduction)


```js
// page urls for today
piwik.api(
  {
    method:   'Actions.getPageUrls',
    idSite:   1,
    period:   'day',
    date:     'today'
  },
  console.log
)
```


track ( vars, callback )
-----

Track a hit.


argument | type            | required | description
-------- | --------------- | -------- | ----------------------
vars     | object or array | yes      | see docs
callback | function        | yes      | function ( err, data )


[Tracking API docs](http://developer.piwik.org/api-reference/tracking-api)


```js
// track a pageview
piwik.track(
  {
    idsite:      1,
    url:         'http://mysite.tld/some/page',
    action_name: 'Page Title',
    _cvar:       { '1': ['group', 'customer'] }
  },
  console.log
)

// track many at once (log import)
piwik.track(
  [
    {
      idsite:      1,
      url:         'http://mysite.tld/some/page',
      action_name: 'Page Title',
    },
    {
      idsite:      1,
      url:         'http://mysite.tld/blog/123-hello',
      action_name: 'Hello World',
    }
  ],
  console.log
)
```


Callback and Errors
-------------------

The callback function receives two parameters: `err` and `data`.
When an error occurs `err` is an instance of `Error`.
When all is good `err` is `null` and `data` is set.


message          | description
---------------- | -----------------------------------------
request failed   | Request cannot be made
request dropped  | Request closed too early
response invalid | Server returned invalid data
http error       | HTTP error, see `err.code` and `err.body`
api error        | API error, see `err.text`
track failed     | Track method failed, see `err.data`


```js
piwik.api( props, function( err, data ) {
  if( err ) {
    console.log( err )
  } else {
    console.log( data )
  }
})
```


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>


Author
------

Franklin van de Meent
| [Website](https://frankl.in)
| [Github](https://github.com/fvdm)
