// app config variable

var CONF = {

  APP_NAME                  : 'WEB CRAWLER: ',

  // URL to crawl upon
  URL                       : 'https://medium.com/',

  // number of concurrent requests allowed to URL
  MAX_CONCURRENT_REQUESTS   : 5,

  // regex to use while parsing the body of the page
  ELEMENTS                  :{

      // for relative or internal links
      ANCHOR      : 'a',

  },

  // csv file heading
  CSV_HEADING               : 'LINK',

  ERROR_VISITING            : 'Error visiting the link ',

};

// exporting the module
module.exports = CONF;
