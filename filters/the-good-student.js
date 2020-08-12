function apply(params, next)
{
    const $ = params.chap.dom;
    const cont = $($('#chapterContent')[0].children);
    let rem = [];
    
    $._root.children = [];
    $.root().append(cont);
    
    const ps = $('p');
    
    rem.push($(ps[0]));
    rem.push($(ps[1]));

    $('img, h1, a, br').each(function(i, e)
    {
        rem.push($(e));
    });
    
    /*$('br').each(function(i, e)
    {
        if(e.prev && e.prev.type === 'tag' && e.prev.name === 'br')
            rem.push($(e));
    });

    $('br').each(function(i, e)
    {
        if(e.parent.children.length === 1)
            rem.push($(e));
    });*/

    const rem_postamble = function(i, e)
    {
        rem.push($(e));
        
        while(e.next)
        {
            e = e.next;
            rem.push($(e));
        }
    };
    
    $('p:contains("topwebfiction.com")').each(rem_postamble);
    $('p:contains("If you like the story please vote for it")').each(rem_postamble);
    $('p:contains("So, when I write a reflective chapter like this")').each(rem_postamble);
    
    // Get rid of nested spans
    $('span').each(function(i, e)
    {
        var el = $(e);
        
        el.replaceWith(el.contents());
    });
    
    params.purge(rem);
    next();
}

module.exports =
{
    apply: apply
};
