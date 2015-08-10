var request = require('request');
var cheerio = require('cheerio');
var crypto = require('crypto');
var uuid = require('node-uuid');
var marked = require('marked');
var fs = require('fs');

if(process.argv.length < 3)
{
    console.log('Usage: reddit2epub.js <spec.json>');
    return;
}

function rmdirSync(path)
{
    if(fs.existsSync(path))
    {
        fs.readdirSync(path).forEach(function(file,index)
        {
            var curPath = path + "/" + file;

            if(fs.lstatSync(curPath).isDirectory())
                rmdirSync(curPath);
            else
                fs.unlinkSync(curPath);
        });

        fs.rmdirSync(path);
    }
}

function getContinuations(set, author)
{
    // Recursively search through comments, looking for plausible continuations
    for(var key in set)
    {
        var c = set[key].data;

        if(c.author === author && c.body_html.length > 1000)
        {
            var html = '\n\n\n------\n\n\n' + c.body;

            if(c.replies.data)
                html += getContinuations(c.replies.data.children, author);

            return html;
        }
    }

    return '';
}

function unescape(html)
{
    return html.replace(/&quot;/g, '"')
               .replace(/&#39;/g, '\'')
               .replace(/&apos;/g, '\'')
               .replace(/&amp;/g, '&');
}

function getPostMarkdown(json)
{
    var post = json[0].data.children[0].data;
    var author = post.author;
    var md = post.selftext + getContinuations(json[1].data.children, author);

    return md;
}

function UriCache()
{
    this.cache = [];

    var files = fs.readdirSync(__dirname + '/cache');

    for(var i = 0; i < files.length; i++)
        this.cache.push(files[i]);
}

UriCache.prototype.uriToId = function(uri)
{
    var tokens = uri.split('/');

    return tokens.slice(4, tokens.length - 1).join('_');
};

UriCache.prototype.get = function(chap, callback)
{
    var id = this.uriToId(chap.url);

    chap.id = id;

    if(this.cache.indexOf(id) > -1)
    {
        console.log('[\033[92mCached\033[0m] ' + id);
        var $ = cheerio.load(fs.readFileSync(__dirname + '/cache/' + id, encoding = 'utf-8'), { decodeEntities: false });

        chap.dom = $;
        callback($);
        return;
    }

    request({ uri: chap.url + '.json' }, function(chap, callback, uri_cache) { return function(error, response, body)
    {
        if(response.statusCode === 503)
        {
            console.log('[\033[91mRetrying\033[0m] ' + chap.id);
            uri_cache.get(chap, callback);
            return;
        }

        console.log('[\033[93mFetched\033[0m] ' + chap.id);
        uri_cache.cache.push(chap.id);

        var json = JSON.parse(body);
        var md = getPostMarkdown(json);
        var $ = cheerio.load(marked(md), { decodeEntities: false });
        var html = unescape($.html());

        chap.dom = $;
        fs.writeFileSync(__dirname + '/cache/' + chap.id, html, encoding = 'utf-8');
        // fs.writeFileSync(__dirname + '/cache/' + chap.id + '.md', md, encoding = 'utf-8');
        callback($);
    }}(chap, callback, this));
};

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

FilterManager.prototype.apply = function(chap, fid, dom)
{
    var filter = this.filters[fid];

    if(filter)
        filter.apply(dom, chap);
};

function createContents(spec)
{
    var xml = [
        '<?xml version="1.0"?>',
        '<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">',
        '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">',
        '    <dc:title>' + spec.title + '</dc:title>',
        '    <dc:language>en</dc:language>',
        '    <dc:identifier id="BookId" opf:scheme="UUID">' + spec.uuid + '</dc:identifier>',
        '    <dc:creator opf:file-as="' + spec.creator + '" opf:role="aut">' + spec.creator + '</dc:creator>',
        '  </metadata>\n'
    ].join('\n');

    xml += '  <manifest>\n';
    xml += '    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />\n';
    xml += '    <item id="style" href="style.css" media-type="text/css" />\n';

    if(spec.cover)
    {
        xml += '    <item id="cover" href="' + spec.cover.html + '" media-type="application/xhtml+xml" />\n';
        xml += '    <item id="cover-style" href="' + spec.cover.css + '" media-type="text/css" />\n';
    }

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        xml += '    <item id="' + chap.id + '" href="' + chap.id + '.xhtml" media-type="application/xhtml+xml" />\n';
    }

    xml += '  </manifest>\n';
    xml += '  <spine toc="ncx">\n';

    if(spec.cover)
        xml += '    <itemref idref="cover" />\n';

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        xml += '    <itemref idref="' + chap.id + '" />\n';
    }

    return xml + '  </spine>\n</package>';
}

function createTOC(spec)
{
    var xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">',
        '  <head>',
        '    <meta content="' + spec.uuid + '" name="dtb:uid"/>',
        '    <meta content="1" name="dtb:depth"/>',
        '    <meta content="0" name="dtb:totalPageCount"/>',
        '    <meta content="0" name="dtb:maxPageNumber"/>',
        '  </head>',
        '  <docTitle>',
        '    <text>' + spec.title + '</text>',
        '  </docTitle>',
        '  <navMap>\n'].join('\n');

    var po_ofs = 0;
    var add_np = function(id, title, ord)
    {
        xml += [
            '    <navPoint id="' + id + '" playOrder="' + ord + '">',
            '      <navLabel>',
            '        <text>' + title + '</text>',
            '      </navLabel>',
            '      <content src="' + id + '.xhtml"/>',
            '    </navPoint>\n'
        ].join('\n');
    };

    if(spec.cover)
    {
        add_np('cover', 'Cover', 0);
        po_ofs = 1;
    }

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        add_np(chap.id, chap.title, i + po_ofs);
    }

    return xml + '  </navMap>\n</ncx>';
}

function createXHTML(chap)
{
    var xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '  <head>',
        '    <title>' + chap.title + '</title>',
        '    <meta content="application/xhtml+xml; charset=utf-8" http-equiv="Content-Type"/>',
        '    <link href="style.css" rel="stylesheet" type="text/css"/>',
        '  </head>',
        '  <body>',
        '    <h1>' + chap.title + '</h1>',
        '    <p class="author">By ' + spec.creator + '</p>',
        '    <div id="main-body">\n'
    ].join('\n');

    xml += unescape(chap.dom.xml());
    xml += [
        '    </div>',
        '  </body>',
        '</html>'
    ].join('\n');

    return xml;
}

function buildEPUB(spec)
{
    var uid = uuid.v4();
    var zip = require('node-zip')();

    spec.uuid = uid;

    console.log('All files loaded. Building EPUB.');

    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.folder('META-INF');
    zip.folder('OEBPS');
    zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>', { compression: 'DEFLATE' });
    zip.file('OEBPS/toc.ncx', createTOC(spec), { compression: 'DEFLATE' });
    zip.file('OEBPS/content.opf', createContents(spec), { compression: 'DEFLATE' });
    zip.file('OEBPS/style.css', fs.readFileSync('templates/style.css', 'utf-8'), { compression: 'DEFLATE' });

    if(spec.cover)
    {
        zip.file('OEBPS/' + spec.cover.html, fs.readFileSync('specs/covers/' + spec.cover.html, 'utf-8'), { compression: 'DEFLATE' });
        zip.file('OEBPS/' + spec.cover.css, fs.readFileSync('specs/covers/' + spec.cover.css, 'utf-8'), { compression: 'DEFLATE' });
    }

    for(var ci = 0; ci < spec.contents.length; ci++)
    {
        var chap = spec.contents[ci];

        zip.file('OEBPS/' + chap.id + '.xhtml', createXHTML(chap), { compression: 'DEFLATE' });
    }

    fs.writeFileSync(spec.title + '.epub', zip.generate({ base64: false }), 'binary');
}

var filter_mgr = new FilterManager();
var uri_cache = new UriCache();
var spec = JSON.parse(fs.readFileSync(__dirname + '/' + process.argv[2]));
var load_count = 0;

(function checkForReduntantEntries()
{
    var uris = {};

    for(var i = 0; i < spec.contents.length; i++)
    {
        var url = spec.contents[i].url;

        if(url in uris)
        {
            console.log('\033[91mError\033[0m: The URL "' + url + '" has already been referenced.');
            process.exit(1);
        }
        else
            uris[url] = true;
    }
})();

for(var i = 0; i < spec.contents.length; i++)
{
    var chap = spec.contents[i];

    chap.id = '';
    chap.dom = null;

    uri_cache.get(chap, function(dom)
    {
        for(var fi = 0; fi < spec.filters.length; fi++)
            filter_mgr.apply(chap, spec.filters[fi], dom);

        if(chap.filters)
        {
            for(var fi = 0; fi < chap.filters.length; fi++)
                filter_mgr.apply(chap, chap.filters[fi], dom);
        }

        load_count++;

        if(load_count === spec.contents.length)
            buildEPUB(spec);
    }.bind(chap));
}
