function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;
	var ps = $('p');
	var rem = [];
	
    // Remove chapter links
    $('p a').each(function(i, e)
    {
        var el = $(e);
        
        if(el.text() === 'Previous' || el.text() === 'Next' || el.text().indexOf('Chapter') === 0)
        	rem.push(el);
    
    	if(el.prev().name === 'hr')
    		rem.push($(el.prev()));
    });
    
    // Remove chapter headings
    $('p').each(function(i, e)
    {
    	var el = $(e);
    	
    	if(el.text()[0] === '#')
    		rem.push(el);
    });
    
    params.purge(rem);
    next();
}

module.exports =
{
    apply: apply
};
