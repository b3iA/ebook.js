var cheerio = require('cheerio');
var fs = require('fs');

if(process.argv.length < 3)
{
    console.log('Usage: ebook.js <spec.json>');
    return;
}

function unescape_html(html)
{
    return html.replace(/&amp;/g, '&')
    	       .replace(/&quot;/g, '"')
    	       .replace(/&apos;/g, '\'')
    	       .replace(/&#39;/g, '\'')
    	       .replace(/&amp;#39;/g, '\'')
    	       .replace(/&amp;/g, '&');
}

function FilterManager()
{
    this.filters = {};

    var files = fs.readdirSync(__dirname + '/filters');

    for(var i = 0; i < files.length; i++)
    {
        var fname = files[i];
        var fid = fname.substr(0, fname.length - 3);

        this.filters[fid] = require('./filters/' + fid);
    }
}

FilterManager.prototype.get = function(fid)
{
    var filter = this.filters[fid];

    if(!filter)
    {
        console.log('No such filter: ' + fid);
        process.exit();
    }

    return filter.apply;
};

var filter_mgr = new FilterManager();

function Finalize(params)
{
    var spec = params.spec;

    if(++spec.loaded === spec.contents.length)
    {
        params.chap = null;

        if(spec.output.constructor === String)
            filter_mgr.get(spec.output)(params, function(){});
        else if(spec.output instanceof Array)
        {
            var ops = [];

            for(var i = 0; i < spec.output.length; i++)
                ops.push(filter_mgr.get(spec.output[i]));

            Sequence(ops, params);
        }
        else
            console.log('[\033[91mError\033[0m]: Unable to interpret the output filter reference. It must be either a string or array of strings.');
    }
}

function Sequence(ops, params)
{
    if(ops.length < 2)
        throw new Exception('Cannot create a sequence of less than two operations.');

    var last = function(params) { return function() { Finalize(params); }; }(params);

    for(var i = ops.length - 1; i >= 0; i--)
        last = function(cur, nxt) { return function() { cur(params, nxt); }; }(ops[i], last);

    last();
}

// Ensure the cache directory exists. Create it if it does not.
if(!fs.lstatSync(__dirname + '/cache').isDirectory)
    fs.mkdirSync(__dirname + '/cache');

// Load the spec. Start processing.
var spec = JSON.parse(fs.readFileSync(__dirname + '/' + process.argv[2]));

spec.loaded = 0;

for(var i = 0; i < spec.contents.length; i++)
{
    var params = {
        spec: spec,
        chap: spec.contents[i],
    	unescape_html: unescape_html
    };

    params.chap.id = '' + i;
    params.chap.dom = cheerio.load('');

    var ops = [];

    for(var fi = 0; fi < spec.filters.length; fi++)
        ops.push(filter_mgr.get(spec.filters[fi]));

    Sequence(ops, params);
}
