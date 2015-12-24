function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;
	var ps = $('p');
	
    if(chap.title === 'Monkeys Reaches Stars')
    {
    	ps.each(function(i, e)
    	{
    		var p = $(e);
    		
    		if(p.text() === '&nbsp')
    			p.remove();
    	});
    }
    
    var lp = $(ps[ps.length-1]);
    
    if(lp.text().match(/^Part \w+$/))
    	lp.remove();
    
    next();
}

module.exports =
{
    apply: apply
};
