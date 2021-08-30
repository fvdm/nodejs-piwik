/*
Name:           piwik
Description:    Access a Matomo API or track hits with node.js
Author:         Franklin (https://fvdm.com)
Source & docs:  https://github.com/fvdm/nodejs-piwik
License:        Unlicense (Public Domain, see UNLICENSE file)
                (https://github.com/fvdm/nodejs-piwik/raw/develop/UNLICENSE)
*/

const { stringify } = require ('querystring');
const { doRequest } = require ('httpreq');

module.exports = class MatomoAPI {

  /**
   * Configuration
   *
   * @param   {object}  conf
   * @param   {string}  endpoint        Base URL to Matomo
   * @param   {string}  [token_auth]    API token, either set here or in the endpoint URL
   * @param   {number}  [timeout=5000]  Request timeout in ms
   */

  constructor ({
    endpoint,
    timeout = 5000,
    token_auth = null,
  }) {
    const url = new URL (endpoint);
    const loc = url.origin + url.pathname.replace (/[^\/]+$/, '');

    this._config = {
      token_auth: url.searchParams.get ('token_auth') || token_auth,
      endpoint: loc,
      timeout,
    };
  }


  /**
   * Process _talk() response
   *
   * @param   {object}  res  Response resource
   *
   * @return  {Promise<object>}
   */

  async function _processResponse (res) {
    try {
      let error;
      const data = JSON.parse (res.body);

      if (data.result && data.result === 'error') {
        throw new Error (data.message);
      }
    }

    if (res.statusCode >= 300) {
      const error = new Error ('http error');

      error.data = data;
      error.statusCode = res.statusCode;
      throw error;
    }

    return data;
  }


  /**
   * API communication
   *
   * @param   {object}  props
   * @param   {string}  [props.method=GET]    HTTP method: GET, POST
   * @param   {string}  [props.path='/']      Request path after hostname
   * @param   {number}  [props.timeout=5000]  Request time out in ms
   * @param   {object}  [props.query]         Data fields to send along
   * @param   {object}  [props.body]          POST JSON encoded body
   *
   * @return  {Promise<object>}
   */

  async function _talk ({
    method = 'GET',
    path = '/',
    query = null,
    body = null,
    timeout = this._config.timeout,
  }) {
    const options = {
      url: this._config.endpoint + path,
      headers: {},
      method,
      timeout,
    };

    // build request
    if (query) {
      for (let key in query) {
        if (typeof query[key] === 'object') {
          query[key] = JSON.stringify (query[key]);
        }
      }

      options.parameters = query;
    }

    if (body) {
      options.body = body;
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = body.length;
    }

    // send request
    return doRequest (options)
      .then (this._processResponse)
    ;
  }


  /**
   * Convert tracking object to full querystring
   *
   * @param   {object}  obj  The tracking object
   *
   * @return  {string}       Full querystring for request
   */

  async function _trackObject2request (obj) {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        obj[key] = JSON.stringify (obj[key]);
      }
    }

    obj.rec = 1;
    obj.apiv = 1;

    return '?' + stringify (obj);
  }


  /**
   * API call
   *
   * @param   {object}  [query]  Parameters
   *
   * @return  {Promise<object>}
   */

  async function api (query = {}) {
    query.module = 'API';
    query.format = 'JSON';
    query.token_auth = this._config.token_auth;

    return this._talk ({
      method: 'GET',
      path: 'index.php',
      query,
    });
  }


  /**
   * Track one or multiple hits
   *
   * @param   {object|array}  vars  Parameters or array with parameters objects
   *
   * @return  {Promise<object>}
   */

  async function methodTrack (vars) {
    const bulk = {
      requests: [],
    };

    if (this._config.token_auth) {
      bulk.token_auth = this._config.token_auth;
    }

    // array with objects
    if (vars instanceof Array && vars[0] instanceof Object) {
      for (let i = 0; i < vars.length; i++) {
        bulk.requests.push (this._trackObject2request (vars[i]));
      }
    }

    // object
    else if (vars instanceof Object) {
      bulk.requests.push (this._trackObject2request (vars));
    }

    // send request
    const data = await this._talk ({
      method: 'POST',
      path: 'matomo.php',
      body: JSON.stringify (bulk),
    });

    // process result
    if (data.status === 'success') {
      return data;
    }

    const error = new Error ('track failed');

    error.data = data;
    throw error;
  }


  /**
   * Get spammers list from Github repo
   *
   * @return  {Promise<object>}
   */

  async function methodLoadSpammers () {
    return doRequest ({
      url: 'https://github.com/piwik/referrer-spam-blacklist/raw/master/spammers.txt',
      timeout,
    })
      .then (res => res.body.trim())
      .then (data => data
        .replace (/\s+\n/g, '\n')
        .split ('\n')
        .sort()
      })
    ;
  }

};
