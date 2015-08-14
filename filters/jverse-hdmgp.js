function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;

    if(chap.title === 'Humans don\’t make good pets 7')
    {
        var ps = $('p');

        $(ps[0]).remove();
        $(ps[1]).remove();
    }

    $('#-').remove();
    $('#continued-in-part-2-http-redd-it-2ydy99-').remove();

    // Remove next / prev chapter link paragraphs and author post-ambles.
    // Also gets rid of inexplicable empty paragraphs.
    $('p').each(function(i, e)
    {
        var el = $(e);

        if(el.find('a').length || el.contents().length < 1)
            el.remove();
    });

    // Remove 'All chapter' references
    $('p span').each(function(i, e)
    {
        var el = $(e);

        if(el.text() === 'All chapters')
            el.parent().remove();
    });

    $('h2').each(function(i, e)
    {
        e.name = 'p';
        delete e.attribs['id'];
    });

    next();
}

module.exports =
{
    apply: apply
};
