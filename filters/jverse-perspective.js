function apply(params, next)
{
	var chap = params.chap;
	var $ = chap.dom;
	var rem = [];
	
	if(chap.title === 'Chapter 1')
		rem.push($('h2'));

	if(chap.title === 'Chapter 6')
	{
		var cn = $.root().children();

		rem.push($(cn[cn.length - 2]));
		rem.push($(cn[cn.length - 1]));
	}
	else
	{
		// Remove link to the next part.
		var ps = $('p');
		var lp = $(ps[ps.length - 1]);
		var cn = lp.contents();

		if(cn[cn.length - 1].name === 'a')
		{
			if(chap.title === 'Chapter 5')
			{
				rem.push($(cn[cn.length - 4]));
				rem.push($(cn[cn.length - 3]));
			}

			rem.push($(cn[cn.length - 2]));
			rem.push($(cn[cn.length - 1]));
		}
	}
	
	params.purge(rem);
	
	// Now, we have to do something about the non-standard line breaks used
	// by Perspective. They wreak bloody havok on subsequent typesetting.
	var nps = [];
	
	$('p').each(function(idx, e)
	{
		var cont = $(e).contents();
		var p = $('<p></p>');
		
		for(var i = 0; i < cont.length; i++)
		{
			var c = cont[i];
			
			if(c.type === 'text')
			{
		    	p.append(c.data.replace(/ $/, ''));

				if(c.data.match(/ $/) &&
			       i < cont.length - 1 &&
			       cont[i+1].type === 'tag' &&
			       cont[i+1].name === 'br')
			    {
			    	i++;
			    	nps.push(p);
			    	nps.push('\n');
			    	p = $('<p></p>');
			    }
			}
			else if(c.type === 'tag' && c.name !== 'br')
			{
				p.append($(c));
			}
		}
		
    	nps.push(p);
    	nps.push('\n');
	});
	
	$.root().contents().remove();
	$.root().append(nps);
	
	// With that done, we need to fix up the date title spacing.
	$('p strong').each(function(i, e)
	{
		var el = $(e);
		
		if(el.text().indexOf('D BV') > -1)
			el.after($('<p></p><br/>'));
	});
	
	next();
}

module.exports =
{
    apply: apply
};
