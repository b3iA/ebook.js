function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;

    var ps = $('p');
    var fp = $(ps[ps.length - 1]);

    if(chap.title === 'Dark Heart')
    {
    	ps.each(function(idx, e)
    	{
    		var cont = $(e).contents();
    		
    		for(var i = 0; i < cont.length; i++)
    		{
    			var c = cont[i];
    			
    			if(c.type === 'text' && c.data.charCodeAt(0) === 0x2003)
    				c.data = c.data.substr(2, c.data.length-2);
    		}
    	});
    }
    
    if(fp.text() === 'END OF CHAPTER' || fp.text() === 'Chapter End')
        fp.remove();
    
    next();
}

module.exports =
{
    apply: apply
};
