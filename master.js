
// local imports
var CRAWLER          = require(__dirname + '/controllers/crawler.js');
var CONF             = require(__dirname + '/conf/serverConf.js');
var CSV              = require(__dirname + '/sinks/csv.js');


// creating new instance of site crawler
var siteCrawler      = new CRAWLER(CONF);

// event handler for start event of crawler
siteCrawler.on('start', function(){
  console.log('started crawling');
});

// event handler for end event of crawler
siteCrawler.on('end', function(info){

  console.log('ending crawling');

  // garbage collection if exposed with --expose-gc flag
  if(global.gc)
    globsl.gc();

  var csvCreator  = new CSV(info);
  // create the csv file
  csvCreator.CreateFile();

});

// initiating the crawling proccess
siteCrawler.startCrawling();

// Catch all exceptions.
process.on('uncaughtException', function(e) {
  console.log(e);
});
