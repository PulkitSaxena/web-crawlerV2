
// imports
var EVENTS                      = require('events'),
    NODE_UTIL                   = require('util'),
    REQUESTIFY                  = require('requestify'),
    CHEERIO                     = require('cheerio'),
    URL_PARSER                  = require('url-parse');

/**
 * This defines the constructor for the crawler class
 * param@{Object} config
 */

function Crawler(config){

  // calling event emitter
  EVENTS.EventEmitter.call(this);

  this._config              = config,
  this._concurrencyRate     = this._config['MAX_CONCURRENT_REQUESTS'],
  this._url                 = this._config['URL'],
  this._anchorElement       = this._config['ELEMENTS']['ANCHOR'],
  this._origin              = new URL_PARSER(this._url).origin,
  this._linksToVisit        = [],
  this._visitedLinks        = [],
  this._currentConcurrency  = 0,
  this._requestify          = REQUESTIFY

}

// now Crawler object inherits the event emitter
NODE_UTIL.inherits(Crawler, EVENTS.EventEmitter);

/**
 * Starts the overall crawling process and emits the start event to notify the
 * main process
 */

Crawler.prototype.startCrawling               = function(){

  // emitting start event
  this.emit('start');

  // initialize the system
  this._start();
},

/**
 * This defines the
 * a link
 * param@{Object} task
 * param@{function} callback
 */

Crawler.prototype._crawl                   =  function(){
  var self  = this,
      url;

  if(self._linksToVisit.length > 0){
    url = self._linksToVisit.pop();

    this._requestify.get(url)
        .then(function (response) {

           // parsing the body of the requsted url page
           self._parseBody(response.getBody());

           console.log("Visiting:" + url + " Tasks left:" + self._linksToVisit.length);

           // maintain the concurrency level
           self._maintainConcurrency();

        })
        .catch(function (error) {
            if(error)
              console.log(self._config['ERROR_VISITING'] + url);

            // as current request completed , So decrease concurrency level by one
            self._decreaseConcurrencyCount();

            // even if a link is not accessable due to any reason, we still need to continue
            self._maintainConcurrency();
        });

  }

},

/**
* parses the body of the link visited
* @param {Object} body
*/

Crawler.prototype._parseBody                  = function(body){
  var $               = CHEERIO.load(body),
      self            = this,
      links           = [],
      externalLinks;

  // extract all the internal links
  links               = $(this._anchorElement);
  // now add urls to the task queue
  links.each(function(){
    if($(this) && $(this).attr('href'))
      self._pushNewUrlInQueue($(this).attr('href'));
  });

  // as current request completed , So decrease concurrency level by one
  self._decreaseConcurrencyCount();

},

/**
* parses the body of the link visited
* @param {Object} body
*/

Crawler.prototype._maintainConcurrency        = function(){

  // checking for the condition when we need to stop the whole crawling process
  if(this._currentConcurrency == 0 && this._linksToVisit.length == 0){
    this._stopCrawling();
  }

  // increase the concurrency upto the desired level
  while(this._currentConcurrency < this._concurrencyRate && this._linksToVisit.length > 0){

    this._increaseConcurrencyCount();
    this._crawl();

  }

},

/**
* Initializes the whole system with the first task of link to start with
*/

Crawler.prototype._start            = function(){
  var self  = this;

  // initializing the async queue and with the given concurrency rate
  if(self._linksToVisit.length < 1){

    // initialize the array with the header for CSV conversion
    this._visitedLinks.push(this._config['CSV_HEADING']);

    // pushing the first task
    this._pushNewUrlInQueue(this._url);

    // increase the concurrency count
    this._increaseConcurrencyCount();

    // crawl the link
    this._crawl();

  }

},

/**
* adds a new url into the queue of tasks to be executed
* @param {String} link
*/

Crawler.prototype._pushNewUrlInQueue           = function(link){
  var urlObject   = new URL_PARSER(link);

  // checking if the coming link is not already visited and belongs to the same origin
  if(link && this._visitedLinks.indexOf(link) == -1 && this._origin == urlObject.origin){

    // adding new task for given url
    this._linksToVisit.push(link);

    // adding the link to visitedLinks array to prevent further addition
    this._visitedLinks.push(link);
  }

},

/**
* Increases the request concurrency count by one
*/

Crawler.prototype._increaseConcurrencyCount   = function(){
  this._currentConcurrency ++;
},

/**
* Decreases the request concurrency count by one
*/

Crawler.prototype._decreaseConcurrencyCount   = function(){
  this._currentConcurrency --;
},

/**
* emits the end event of the crawling
* @param {String} link
*/

Crawler.prototype._stopCrawling               = function(){
  // data to be passed on
  var crawlerData   = {
      linksVisited      : this._visitedLinks,
      linksCount        : this._visitedLinks.length,
      fileName          : new URL_PARSER(this._url).hostname
  }
  // emitting end event
  this.emit('end', crawlerData);

};


// exporting module
module.exports = Crawler;
