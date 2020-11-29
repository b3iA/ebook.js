const cheerio = require('cheerio');
const marked = require('marked');
const fs = require('fs');

function apply(params, next)
{
	const chap = params.chap;
	
	chap.id = chap.src.replace(/[\/,\.]/, '').replace(/[\/,\.]/g, '-');

	if(params.is_cleaning)
	{
		params.clean(params.chap.id);
		return;
	}
	
	const md = fs.readFileSync(chap.src, encoding = 'utf-8');
	
	console.log('[\033[92mLoading\033[0m] ' + chap.src);
	chap.dom = cheerio.load(marked(md), params.cheerio_flags);
	next();
}

module.exports =
{
	apply: apply
};
