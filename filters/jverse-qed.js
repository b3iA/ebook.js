function apply(params, next)
{
    var $ = params.chap.dom;
    var ps = $('p');

    for(var i = 0; i < 3; i++)
        $(ps[i]).remove();

    $('li p').each(function(i, e)
    {
    	var el = $(e);
    	
    	el.parent().append(el.contents());
    	el.remove();
    });
    
    next();
}

module.exports =
{
    apply: apply
};
