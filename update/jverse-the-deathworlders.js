const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs');
const spec = require('./spec.js');

function addPageChaptersToTOC(s, page_idx, done)
{
	if(page_idx > 0)
	{
		let url = 'https://deathworlders.com/books/deathworlders';
		
		if(page_idx > 1)
			url += '/page/' + page_idx;
		
		console.log('Fetching ' + url);
		
		request({ uri: url }, (error, response, body) =>
		{
			const $ = cheerio.load(body);
			const chap_links = $('a[href^="https://deathworlders.com/books/deathworlders"]');
			
			for(let i = chap_links.length - 1; i >= 0; i--)
			{
				const link = $(chap_links[i]);
				
				s.toc.push([
					link.text().replace('The Deathworlders', ''),
					link.attr('href')
				]);
			}
			
			addPageChaptersToTOC(s, page_idx - 1, done);
		});
	}
	else
		done(s);
}

request({ uri: 'https://deathworlders.com/books/deathworlders' }, (error, response, body) =>
{
	const s = new spec.Spec();
	
	s.title = 'The Deathworlders';
	s.filename = 'The Deathworlders';
	s.creator = 'Hambone3110';
	s.patreon = 'https://www.patreon.com/HamboneHFY';
	s.filters = [
		"from-url",
		"jverse-the-deathworlders",
		"typography",
		"finalize"
	];
	
	const $ = cheerio.load(body);
	const last_page_link = $('a[aria-label="Last"]');
	const page_tokens = last_page_link.attr('href').split('/');
	const last_page_idx = parseInt(page_tokens[4], 10);
	
	addPageChaptersToTOC(s, last_page_idx, function(s)
	{
		//console.log(s);
		s.writeTo('jverse-the-deathworlders');
	});
});
