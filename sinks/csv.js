
// importing modules
var FS     =  require('fs');

/**
 * This defines the constructor for the CSV model class
 * @param {Object} info
 */

var CSV   = function(info){

  this._info            = info,
  this._linksVisited    = this._info['linksVisited'],
  this._linksCount      = this._info['linksCount'],
  this._fileName        = this._info['fileName']

}

/**
* This creates the corresponding csv file
*/

CSV.prototype.CreateFile    = function(){

    var csv     = this._linksVisited.join(',');
    var path    = this._fileName + '.csv';

    FS.writeFile(path, csv, function(error) {
      if (error) {
        console.error("write error:  " + error.message);
      } else {
        console.log("Successful Write to " + path);
      }
   });

};

// exporting the module
module.exports  = CSV;
