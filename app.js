var fs   = require('fs'),
    path = require('path')

var haraka_path = path.join(__dirname, 'node_modules','Haraka', 'haraka.js'); //TODO: replace with node dependency

var base_dir = __dirname;
var err_msg = "Did you install a Haraka config? (haraka -i " + base_dir +")";
if ( !fs.existsSync(base_dir) )
fail( "No such directory: " + base_dir + "\n" + err_msg );

var smtp_ini = path.join(base_dir,'config','smtp.ini');
if ( !fs.existsSync( smtp_ini ) )
fail( "No smtp.ini at: " + smtp_ini + "\n" + err_msg );

require('Haraka');
