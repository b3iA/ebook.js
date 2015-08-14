var uuid = require('node-uuid');
var zip = require('node-zip');
var fs = require('fs');

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
            '      <content src="' + id + '"/>',
            '    </navPoint>\n'
        ].join('\n');
    };

    if(spec.cover)
    {
        add_np(spec.cover.html, 'Cover', 0);
        po_ofs = 1;
    }

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        add_np(chap.id + '.xhtml', chap.title, i + po_ofs);
    }

    return xml + '  </navMap>\n</ncx>';
}

function createXHTML(spec, chap)
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

function apply(params, next)
{
    var spec = params.spec;

    debugger;
    var uid = uuid.v4();
    var zip = require('node-zip')();

    spec.uuid = uid;

    console.log('Building EPUB.');

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

        zip.file('OEBPS/' + chap.id + '.xhtml', createXHTML(spec, chap), { compression: 'DEFLATE' });
    }

    fs.writeFileSync(spec.title + '.epub', zip.generate({ base64: false }), 'binary');
    next();
}

module.exports =
{
    apply: apply
};
