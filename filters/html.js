var cheerio = require('cheerio');
var fs = require('fs');

function apply(params, next)
{
    var spec = params.spec;
    var oname = 'output/' + spec.title + '.html';
    var vspace = '    <p><br/</p><p><br/</p><p><br/</p>\n';
    var html = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '  <head>',
        '    <title>' + spec.title + '</title>',
        '    <meta content="application/xhtml+xml; charset=utf-8" http-equiv="Content-Type"/>',
        '    <style type="text/css">',
        fs.readFileSync('templates/style.css', 'utf-8').replace(/^/g, '\t\t'),
		'		.title { font-size: 2.5em; line-height: 1em; font-weight: bold; margin: 0; }',
		'		.author { font-size: 1.2em; line-height: 1em; font-weight: bold; margin: 0; }',
		'		.patreon { font-size: 1.2em; line-height: 1em; margin: 0; }',
		'		.toc-item { line-height: 2em; margin: 0; margin-left: 40pt; }',
        '    </style>',
        '  </head>',
        '  <body>\n',
		'    <p class="center"><center><div class="title">' + spec.title + '</div></center></p>',
		'    <p class="center"><center><div class="author">By ' + spec.creator + '</div></center></p>',
    ].join('\n');

    console.log('Building ' + oname);

    if(spec.patreon)
		html += '    <p class="center"><center><div class="patreon">Donate securely to the author at <a href="' + spec.patreon + '">patreon.com</a></div></center></p>\n';
    
	html += vspace;
	html += '    <h1>Table of contents</h1><br />\n';

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];
		
		html += '    <a class="toc-item" href="#' + chap.id + '">' + chap.title + '</a><br/>\n';
	}
	    
	html += vspace;

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        html += [
            '    <h1 id="' + chap.id + '">' + chap.title + '</h1>',
            '    ' + (chap.byline ? '<p class="author">By ' + chap.byline + '</p>' : ''),
            '    <div class="chapter">',
            params.unescape_html(chap.dom.xml()),
            '    </div>\n'
        ].join('\n');
    }

    html += [
        '  </body>',
        '</html>'
    ].join('\n');

    fs.writeFileSync(oname, html, 'utf-8');
    next();
}

module.exports =
{
    apply: apply
};
