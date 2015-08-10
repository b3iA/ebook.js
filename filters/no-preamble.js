function apply($)
{
    var hrs = $('hr');

    if(hrs.length)
    {
        var pa = null;

        hrs.each(function(i, e)
        {
            var c = $(e).prevAll();

            if(c.text().length <= 2500)
                pa = c;
        });

        if(pa)
            pa.remove();
    }
}

module.exports =
{
    apply: apply
};
