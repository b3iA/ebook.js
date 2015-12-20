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

    $('p').each(function(i, e)
	{
        var p = $(e);
        
        if(p.text().trim() === '')
        	p.remove();
	});
	
    var end_m = /^end (chapter|part) \d/i;
    
    $('p, p strong').each(function(i, e)
    {
        var p = $(e);
        var t = p.text();
		var l = t.toLowerCase();
		
    	if(l.indexOf('++end chapter') === 0 || 
    	   l.indexOf('++end of chapter') === 0)
    	{
    		p.nextAll().remove();
    		p.remove();
    	}
		
		if(l.search(end_m) === 0)
    		p.remove();
    	
	    if(params.chap.title === 'Deliverance')
	    {
		    if(t === 'Four years previously.')
		    	p.parent().html('<strong>Four years previously.</strong>');
		    else if(t === '__' || t === 'End chapter 5')
		    	p.remove();
	    }
    });
    
    next();
}

module.exports =
{
    apply: apply
};
