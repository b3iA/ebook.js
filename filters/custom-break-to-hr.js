function apply($)
{
    var break_test = /[^\+\n .]/;

    // Deathworlders, Salvage: <p>[^\+.]</p> -> <hr/>
    $('p').each(function(i, e)
    {
        var el = $(e);
        var txt = el.text();

        if(txt !== '' && !break_test.test(txt))
        {
            e.name = 'hr';
            e.children = [];
        }
    });
}

module.exports =
{
    apply: apply
};
