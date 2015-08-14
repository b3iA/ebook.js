function apply(params, next)
{
    var $ = params.chap.dom;
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

    next();
}

module.exports =
{
    apply: apply
};
