const cheerio = require('cheerio');
const fs = require('fs');

const ERROR_TAG = '[\033[91mError\033[0m]: ';
const ERASE_TAG = '[\033[91mDeleting\033[0m]: ';
const DEBUG = false;
const CLEAN = false;

if(process.argv.length < 3)
{
	console.log('Usage: ebook.js <spec.json>');
	return;
}
else if(process.argv.length > 3)
{
	CLEAN = process.argv[3] == 'clean';
}

function ensure_dir(dir)
{
	dir = __dirname + '/' + dir;
	
	if(!fs.existsSync(dir))
		fs.mkdirSync(dir);
}

// Ensure the 'cache' and 'output' directories exists. Create them if they do not.
ensure_dir('cache');
ensure_dir('output');

function decode_cr(cr)
{
	const ishex = cr[2] === 'x';
	
	return String.fromCodePoint(parseInt(cr.substr(ishex ? 3 : 2, cr.length - 2), ishex ? 16 : 10));
}

// Decode all HTML character references to unicode.
function decode_crs(s)
{
	let i = -1;
	let ls = s;
	
	while((i = ls.search(/&#.*;/)) > -1)
	{
		const ni = ls.indexOf(';', i);
		
		ls = ls.substr(0, i) + decode_cr(ls.substr(i, ni - i + 1)) + ls.substr(ni + 1);
	}
	
	return ls;
}

function unescape_html(html)
{
	return decode_crs(html.replace(/&amp;/g, '&'))
						  .replace(/&quot;/g, '"')
						  .replace(/&apos;/g, '\'')
						  .replace(/&nbsp;/g, ' ')
						  .replace(/&#39;/g, '\'')
						  .replace(/&amp;#39;/g, '\'')
						  .replace(/&amp;/g, '&');
}

function purge(set)
{
	for(let i = 0; i < set.length; i++)
	{
		const e = set[i];
		
		if(DEBUG)
			console.log('[\033[91mDELETE\033[0m]: [' + e.text() + ']');
			
		e.remove();
	}
}

function clean(cache_id)
{
	const fname = __dirname + '/cache/' + cache_id;
	
	console.log(ERASE_TAG + cache_id);
	fs.unlinkSync(fname);
}

function UriCache()
{
	this.cache = fs.readdirSync(__dirname + '/cache');
}

function FilterManager()
{
	this.filters = {};
	
	const files = fs.readdirSync(__dirname + '/filters');
	
	for(let i = 0; i < files.length; i++)
	{
		const fname = files[i];
		const fid = fname.substr(0, fname.length - 3);
		
		this.filters[fid] = require('./filters/' + fid);
	}
}

FilterManager.prototype.get = function(fid)
{
	const filter = this.filters[fid];
	
	if(!filter)
	{
		console.log(ERROR_TAG + 'No such filter: ' + fid);
		process.exit();
	}
	
	return filter.apply;
};

const filter_mgr = new FilterManager();

function Finalize(params)
{
	const spec = params.spec;
	
	if(++spec.loaded === spec.contents.length)
	{
		params.chap = null;
		
		if(spec.output.constructor === String)
		    filter_mgr.get(spec.output)(params, function(){});
		else if(spec.output instanceof Array)
		{
			const ops = [];
			
			for(let i = 0; i < spec.output.length; i++)
				ops.push(filter_mgr.get(spec.output[i]));
			
			Sequence(ops, params);
		}
		else
			console.log(ERROR_TAG + 'Unable to interpret the output filter reference. It must be either a string or array of strings.');
	}
}

function Sequence(ops, params, cb)
{
	if(ops.length < 2)
	{
		ops[0](params, () => {});
		return;
	}
	
	let last = function(params, cb)
	{
		return function()
		{
			Finalize(params);
			
			if(cb)
				cb();
		};
	}(params, cb);
	
	for(let i = ops.length - 1; i >= 0; i--)
	{
		last = function(cur, nxt)
		{
			return function()
			{
				cur(params, nxt);
			};
		}(ops[i], last);
	}
	
	last();
}

// Load the spec. Start processing.
const spec = JSON.parse(fs.readFileSync(__dirname + '/' + process.argv[2]));
const sched = {};
const uri_cache = new UriCache();

spec.loaded = 0;

for(let i = 0; i < spec.contents.length; i++)
{
	const chap = spec.contents[i];
	const params =
	{
		spec: spec,
		chap: chap,
		unescape_html: unescape_html,
		decode_crs: decode_crs,
		purge: purge,
		clean: clean,
		uri_cache: uri_cache,
		cheerio_flags: { decodeEntities: false }
	};
	
	if(typeof(chap.title) !== 'string')
	{
		console.log(ERROR_TAG + 'Each chapter must contain a "title" property (string).');
		return;
	}
	
	if(typeof(chap.src) !== 'string')
	{
		console.log(ERROR_TAG + 'Each chapter must contain a "src" property (string).');
		return;
	}
	
	params.chap.id = '' + i;
	params.chap.dom = cheerio.load('');
	
	const ops = [];
	const filter_type = Object.prototype.toString.call(spec.filters);
	
	if(filter_type === '[object Array]')
	{
		for(let fi = 0; fi < spec.filters.length; fi++)
			ops.push(filter_mgr.get(spec.filters[fi]));
	}
	else if(filter_type === '[object Object]')
	{
		
		if(typeof(chap.filters) !== 'string')
		{
			console.log(ERROR_TAG + 'In "' + chap.title + '": When a collection of filters is specified, each chapter must also specify witch filter chain to use.');
			return;
		}
		
		if(!(chap.filters in spec.filters))
		{
			console.log(ERROR_TAG + 'In "' + chap.title + '"; Cannot resolve the filter chain "' + chap.filters + '".');
			return;
		}
		
		const filters = spec.filters[chap.filters];
		
		for(let fi = 0; fi < filters.length; fi++)
			ops.push(filter_mgr.get(filters[fi]));
	}
	else
	{
		console.log(ERROR_TAG + 'Unsupported filter chain type "' + filter_type + '".');
		return;
	}
		
	if(chap.src in sched)
		sched[chap.src].push([ops, params]);
	else
		sched[chap.src] = [[ops, params]];
}

for(let src in sched)
{
	if(!sched.hasOwnProperty(src))
		continue;
	
	const chapters = sched[src];
	
	if(CLEAN)
	{
		const loader = chapters[0][0][0];
		const params = chapters[0][1];
		
		params.is_cleaning = true;
		
		loader(params, function(){});
	}
	else
	{
		if(chapters.length === 1)
			Sequence(chapters[0][0], chapters[0][1]);
		else
		{
			Sequence(chapters[0][0], chapters[0][1], function(chaps)
			{
				return function()
				{
					for(let ci = 1; ci < chaps.length; ci++)
						Sequence(chaps[ci][0], chaps[ci][1]);
				}
			}(chapters));
		}
	}
}
