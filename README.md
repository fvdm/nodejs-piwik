nodejs-piwik
============

This a [node.js](http://nodejs.org/) module to access a Piwik API.


Installation
------------

### From [npm](https://npmjs.org/package/piwik)

The release on npm is always the latest stable version.

	npm install piwik


### From git

The version on the git repositories is the most recent code, but may be unstable.
You can use my [Github](https://github.com/fvdm/nodejs-piwik) or [Bitbucket](https://bitbucket.org/fvdm/nodejs-piwik) repo, both are synchronized.

	npm install git+https://github.com/fvdm/nodejs-piwik

	npm install git+https://bitbucket.org/fvdm/nodejs-piwik


Setup
-----

In order to use this module you need to start with `setup()`.

### setup ( baseURL, [token] )

	baseURL   required   The URL to your Piwik installation. Both HTTP and HTTPS are supported.
	token     optional   Your API access token. Either set `token` or include `token_auth` in the *baseURL*.

```js
piwik.setup( 'https://example.tld/path/to/piwik/', 'abcd1234' )
```


Usage
-----

To get or set data use the **api()** function. It returns the parsed JSON object as received from the API.
Check out the [Piwik API Reference](http://piwik.org/docs/analytics-api/reference/) for methods.

	method   This property is required to set the method.

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

![p](https://frankl.in/piwik/piwik.php?idsite=5&rec=1)
