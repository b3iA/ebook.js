const fs = require('fs')

function apply(params, next)
{
    const $ = params.chap.dom;
    const cont = $($('div.chapter-inner.chapter-content')[0].children);
    
    $._root.children = [];
    $.root().append(cont);
    
    // Get rid of nested spans and divs. Also remove tbody tags.
    $('span, div, tbody').each((i, e) =>
    {
        const el = $(e);
        
        el.replaceWith(el.contents());
    });

    let tds = [];
    
    $('td > p,td').each((i, e) =>
    {
        tds.push(e);
    });
    
    for(let i = 0; i < tds.length; i++)
    {
        const e = tds[i];
        const el = $(e);
        
        if(e.attribs['style'] === 'text-align: center')
        {
            delete e.attribs.style;
            
            if(el.text() !== '&nbsp;')
                el.contents().replaceWith('<center>' + el.html() + '</center>');
            else
                el.contents().replaceWith('');
        }
    }
    
    $('table').each((i, e) => { delete e.attribs.style; });

    next();
}

module.exports =
{
    apply: apply
};
