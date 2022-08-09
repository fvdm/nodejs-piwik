# piwik (Matomo)

Track hits and access a Matomo API with Node.js

_The package is named after the previous name of Matomo.
I don't feel like changing the package name, because people are using it in their apps._

[![npm](https://img.shields.io/npm/v/piwik.svg?maxAge=3600)](https://github.com/fvdm/nodejs-piwik/blob/master/CHANGELOG.md)
[![Build Status](https://travis-ci.org/fvdm/nodejs-piwik.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-piwik)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-piwik/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-piwik?branch=master)

* [Node.js](https://nodejs.org)
* [Matomo](https://matomo.org)
* [API documentation](https://developer.matomo.org/api-reference/reporting-api-introduction)


## Example

```js
const matomo = require ('piwik').setup ('https://example.tld/matomo/', 'abc123');

// track a pageview
matomo.track (
  {
    idsite:      1,
    url:         'https://mysite.tld/some/page',
    action_name: 'Page Title',
    _cvar:       { '1': ['group', 'customer'] },
  },
  console.log
);
```


## Installation

`npm install piwik`


## .setup
**( baseURL, [token], [timeout] )**

In order to use this module you need to start with `setup()`.

argument  | type    | description
:---------|:--------|:-----------
baseURL   | string  | The URL to your Matomo installation. Both HTTP and HTTPS are supported.
[token]   | string  | Your API access token. Either set `token` or include `token_auth` in the `baseURL`.
[timeout] | integer | Wait time in ms, default `5000` (5 seconds).

```js
const matomo = require ('piwik').setup ('https://example.tld/matomo/', 'abc123');
```


## .api
**( vars, callback )**

Call an API method.


argument | type     | description
:--------|:---------|:----------------------
vars     | object   | see [documentation](https://developer.matomo.org/api-reference/reporting-api-introduction)
callback | function | `(err, data)`


[Reporting API docs](https://developer.matomo.org/api-reference/reporting-api-introduction)


```js
// page urls for today
matomo.api (
  {
    method:   'Actions.getPageUrls',
    idSite:   1,
    period:   'day',
    date:     'today'
  },
  console.log
);
```


## .track
**( vars, callback )**

Track a hit.


argument   | type            | description
:----------|:----------------|:-----------
vars       | object or array | see [documentation](https://developer.matomo.org/api-reference/tracking-api)
[callback] | function        | `(err, data)`


[Tracking API docs](https://developer.matomo.org/api-reference/tracking-api)


```js
// track a pageview
matomo.track (
  {
    idsite:      1,
    url:         'https://mysite.tld/some/page',
    action_name: 'Page Title',
    _cvar:       { '1': ['group', 'customer'] },
  },
  console.log
);

// track many at once (log import)
matomo.track (
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
    },
  ],
  console.log
);
```


## .loadSpammers
**( callback )**

Retrieve referrer spammers blocklist maintained by Piwik as an _array_.

[Open source list](https://github.com/matomo-org/referrer-spam-blacklist)

**Disclaimer:** the example below is intended only for educational purposes. ;)

```js
const Kira = require ('Kira');
const revenge = new Kira();

piwik.loadSpammers ((err, list) => {
  if (err) { return console.log (err); }

  // Destroy them all
  list.forEach (target => {
    revenge.kill (`http://${target}`, 200, 10000);
  });
});
```


## Callback and Errors

The callback function receives two parameters: `err` and `data`.
When an error occurs `err` is an instance of `Error`.
When all is good `err` is `null` and `data` is set.


message          | description            | additional
:----------------|:-----------------------|:----------
request failed   | Request cannot be made | see `err.error`
http error       | HTTP error             | `err.code` and `err.body`
api error        | API error              | `err.text`
track failed     | Track method failed    | `err.data`


```js
matomo.api (props, (err, data) => {
  if (err) {
    console.log (err);
    return;
  }

  console.log (data);
});
```


## Unlicense

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

For more information, please refer to <https://unlicense.org>


## Author

[Franklin](https://fvdm.com)
| [Buy me a coffee](https://fvdm.com/donating)
