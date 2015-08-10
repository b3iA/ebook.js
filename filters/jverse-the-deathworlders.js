function apply($, chap)
{
    // Remove 'continued in' paragraphs
    $('p span').each(function(i, e)
    {
        var p = $(e).parent();
        var t = p.text();

        if(t.indexOf('Continued ') === 0 || t.indexOf('Concluded ') === 0)
            p.remove();
    });
}

module.exports =
{
    apply: apply
};
