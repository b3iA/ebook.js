function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;

    var ps = $('p');
    var fp = $(ps[ps.length - 1]);

    if(fp.text() === 'END OF CHAPTER' || fp.text() === 'Chapter End')
        fp.remove();

    if(chap.title === 'Dark Heart')
    {
    	var emsp_re = /&amp;emsp;&amp;emsp;/g;
    	
    	for(var pi = 0; pi < ps.length; pi++)
    	{
    		var cont = $(ps[pi]).contents();
    		
    		for(var i = 0; i < cont.length; i++)
    		{
    			var c = cont[i];
    			
    			if(c.type === 'text' && c.data.search(emsp_re) > -1)
    				c.data = c.data.replace(emsp_re, '');
    		}
    	}
    }
    
    next();
}

module.exports =
{
    apply: apply
};
