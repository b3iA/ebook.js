var cheerio = require('cheerio');
var fs = require('fs');

if(process.argv.length < 3)
{
    console.log('Usage: reddit2epub.js <spec.json>');
    return;
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
var spec = JSON.parse(fs.readFileSync(__dirname + '/' + process.argv[2]));
var load_count = 0;

function Finalize(params)
{
    var spec = params.spec;

    load_count++;

    if(load_count === spec.contents.length)
    {
        if(typeof(spec.output) === 'string')
            filter_mgr.get(spec.output)(params, function(){});
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

for(var i = 0; i < spec.contents.length; i++)
{
    var params = {
        spec: spec,
        chap: spec.contents[i]
    };

    params.chap.id = '';
    params.chap.dom = cheerio.load('');

    var ops = [];

    for(var fi = 0; fi < spec.filters.length; fi++)
        ops.push(filter_mgr.get(spec.filters[fi]));

    Sequence(ops, params);
}
