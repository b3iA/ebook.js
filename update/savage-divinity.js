const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs');
const spec = require('./spec.js');

request({ uri: 'https://ruffwriterblog.wordpress.com/' }, (error, response, body) =>
{
    const $ = cheerio.load(body);
    const content = $($('div.entry-content')[0]);
    const tables = content.find('table');
    const s = new spec.Spec();

    s.title = 'Savage Divinity';
    s.filename = 'Savage Divinity';
    s.creator = 'RuffWriter';
    s.filters = [
        'from-url',
        'savage-divinity',
        'typography',
        'finalize'
    ];

    for(let i = 3; i < tables.length; i += 2)
    {
        const table = $(tables[i]);
        const title_tds = table.find('p');
        const vol_title = $(title_tds[title_tds.length < 2 ? 0 : 1]).text().trim();
        const chapters = $(tables[i+1]);
        
        chapters.find('tr').each((i0, tr) =>
        {
            $(tr).find('td > a').each((i1, a) =>
            {
                s.toc.push([
                    vol_title + ': ' + a.children[0].data.trim(),
                    a.attribs.href
                ]);
            });
        });
    }

    s.writeTo('savage-divinity');
});


