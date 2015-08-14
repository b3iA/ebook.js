function apply(params, next)
{
    var $ = params.chap.dom;

    $('p').each(function(i, e)
    {
        var el = $(e);
        var txt = el.text();

        if(txt === '&amp;nbsp;' || txt === '&nbsp;')
            el.remove();
    });

    next();
}

module.exports =
{
    apply: apply
};
