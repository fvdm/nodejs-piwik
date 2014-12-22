piwik
=====

Access a Piwik API from javascript.

* [node.js](http://nodejs.org/)
* [Piwik](http://piwik.org/)
* [API documentation](http://developer.piwik.org/api-reference/reporting-api-introduction)


Installation
------------

#### From npm

The release on [npm](https://npmjs.org/package/piwik) is always the latest stable version.

`npm install piwik`


#### From source

The version on the git repository is the most recent code, but may be unstable.

`npm install fvdm/nodejs-piwik`


setup ( baseURL, [token] )
-----

In order to use this module you need to start with `setup()`.

argument | type   | required | description
-------- | ------ | -------- | -----------
baseURL  | string | yes      | The URL to your Piwik installation. Both HTTP and HTTPS are supported.
token    | string | no       | Your API access token. Either set `token` or include `token_auth` in the *baseURL*.


```js
var piwik = require('piwik')
piwik.setup( 'https://example.tld/path/to/piwik/', 'abcd1234' )
```


api ( vars, callback )
---

Call an API method.


argument | type     | required | description
-------- | -------- | -------- | -----------------
vars     | object   | yes      | object, see docs
callback | function | yes      | function ( data )


Usage
-----

To get or set data use the **api()** function. It returns the parsed JSON object as received from the API.
Check out the [Piwik API Reference](http://piwik.org/docs/analytics-api/reference/) for methods.

This property is required to set the `method`


```js
var piwik = require('piwik')

piwik.setup( 'https://example.net/piwik/', 'abcd1234' )

// page urls for today
piwik.api({
  method:   'Actions.getPageUrls',
  idSite:   1,
  period:   'day',
  date:     'today'
}, console.log )
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
| [Website](http://frankl.in)
| [Github](https://github.com/fvdm)
