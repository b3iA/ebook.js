const cheerio = require('cheerio');
const marked = require('marked');
const fs = require('fs');
const utils = require('./utils');

function apply(params, next)
{
	const chap = params.chap;
	
	chap.id = chap.src.replace(/[\/,\.]/, '').replace(/[\/,\.]/g, '-');

	if(params.is_cleaning)
	{
		params.clean(params.chap.id);
		return;
	}
	
	const html = fs.readFileSync(chap.src, encoding = 'utf-8');
	
	console.log('[\033[92mLoading\033[0m] ' + chap.src);
	chap.dom = cheerio.load(html, params.cheerio_flags);
	utils.replaceRootWith(params.chap.dom, 'body');
	next();
}

module.exports =
{
	apply: apply
};
