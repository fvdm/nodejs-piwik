// load and configure
var piwik = require ('piwik').setup ('https://example.tld/piwik/', 'abc123');

// page urls for today
piwik.api (
  {
    method:   'Actions.getPageUrls',
    idSite:   1,
    period:   'day',
    date:     'today'
  },
  console.log
);
