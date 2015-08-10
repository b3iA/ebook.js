function apply($, chap)
{
    $('p').each(function(i, e)
    {
        var el = $(e);
        var txt = el.text();

        if(txt === '&amp;nbsp;' || txt === '&nbsp;')
            el.remove();
    });
}

module.exports =
{
    apply: apply
};
