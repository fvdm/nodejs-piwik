nodejs-piwik
============

This a [node.js](http://nodejs.org/) module to access a Piwik API.

## Installation

### From NPM

**npm install piwik**

```js
var piwik = require('piwik');
```

### From source

```js
var piwik = require('./piwik.js');
```

## Setup

You need to run **setup()** first in order to use this module.

**setup( baseURL, [token] )**

* **baseURL** - required - The URL to your Piwik installation. Both HTTP and HTTPS are supported.
* **token** - optional - Your API access token. Either set *token* or include *token_auth* in the *baseURL*.

```js
piwik.setup( 'https://example.tld/path/to/piwik/', 'abcd1234' );
```

## Usage

To get or set data use the **api()** function. It returns the parsed JSON object as received from the API. Check out the [Piwik API Reference](http://piwik.org/docs/analytics-api/reference/) for methods.

**method** - this variable is required to set the method.

```js
// page urls for today
piwik.api({
  method:   'Actions.getPageUrls',
  idSite:   1,
  period:   'day',
  date:     'today'
}, console.log );
```