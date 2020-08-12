function apply(params, next)
{
    const $ = params.chap.dom;
    const cont = $($('.entry-content')[0].children);
    let rem = [];

    $._root.children = [];
    $.root().append(cont);
    
    $('i').each(function(i, e)
    {
        e.name = 'em';
    });

    $('b').each(function(i, e)
    {
        e.name = 'strong';
    });

    $('h3').each(function(i, e)
    {
        e.name = 'strong';
    });

    $('div').each(function(i, e)
    {
        rem.push($(e));
    });
    
    $('a').each(function(i, e)
    {
        rem.push($(e));
    });

    params.purge(rem);
    next();
}

module.exports =
{
    apply: apply
};
