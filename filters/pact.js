var cheerio = require('cheerio');

function filterText($, e)
{
    if(e.type === 'tag')
    {
        var c = $(e).contents();
        
        for(var i = 0; i < c.length; i++)
            filterText($, c[i]);
    }
    else if(e.type === 'text')
    {
        // This is less odd than it looks: The second space
        // is some weird unicode character. Here, we're replacing
        // the byte sequence 0x20c2 -> 0x20.
        e.data = e.data.replace(/  /g, ' ');
    }
}

function apply(params, next)
{
    var $ = params.chap.dom;
    var cont = $($('.entry-content')[0].children);
    
    $._root.children = [];
    $.root().append(cont);
    
    $('a').remove();
    $('ul').remove();
    $('div').remove();
    $('form').remove();
    $('label').remove();
    $('address').remove();
    $('img').remove();
    
    $('p').each(function(i, e)
    {
        var el = $(e);
        var t = el.text();
        
        if(t.replace(/&nbsp;/g, '').trim() === '')
        {
            el.remove();
            return;
        }
        
        if(t === '■')
        {
            el.replaceWith('<hr/>');
            return;
        }
        
        delete e.attribs['ltr'];
        delete e.attribs['style'];
    
        var c = el.children();
        
        if(c.length < 1)
            return;
        
        c = c[c.length - 1];
        
        if(c.type === 'tag' && c.name === 'br')
            $(c).remove();
    });
    
    $('i').each(function(i, e)
    {
        e.name = 'em';
    });

    $('b').each(function(i, e)
    {
        e.name = 'strong';
    });

    $('em').each(function(i, e)
    {
        var c = $(e).children();
        
        if(c.length < 1)
            return;
            
        c = c[c.length - 1];
        
        if(c.type === 'tag' && c.name === 'br')
            $(c).remove();
    });
    
    var c = $.root().children();
    
    for(var i = 0; i < c.length; i++)
        filterText($, c[i]);
    
    next();
}

module.exports =
{
    apply: apply
};
