function apply(params, next)
{
    var $ = params.chap.dom;

    // Remove 'continued in' paragraphs
    $('p span').each(function(i, e)
    {
        var p = $(e).parent();
        var t = p.text();

        if(t.indexOf('Continued ') === 0 || t.indexOf('Concluded ') === 0)
            p.remove();
    });

    next();
}

module.exports =
{
    apply: apply
};
