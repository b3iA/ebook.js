var cheerio = require('cheerio');
var fs = require('fs');

function apply(params, next)
{
    var spec = params.spec;
    var oname = spec.title + '.html';
    var html = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '  <head>',
        '    <title>' + spec.title + '</title>',
        '    <meta content="application/xhtml+xml; charset=utf-8" http-equiv="Content-Type"/>',
        '    <style type="text/css">',
        fs.readFileSync('templates/style.css', 'utf-8'),
        '    </style>',
        '  </head>',
        '  <body>\n',
    ].join('\n');

    console.log('Building ' + oname);

    if(spec.cover)
    {
        var c_html = fs.readFileSync('specs/covers/' + spec.cover.html, 'utf-8');
        var c_dom = cheerio.load(c_html, { decodeEntities: false });
    }

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        html += [
            '    <h1>' + chap.title + '</h1>',
            '    <p class="author">By ' + spec.creator + '</p>',
            '    <div class="chapter">',
            unescape(chap.dom.xml()),
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
