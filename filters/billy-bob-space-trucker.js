function apply(params, next)
{
    var chap = params.chap;
	var $ = chap.dom;
	var c_re = /^ *Chapitre [a-z,A-Z,-]*\.*\n*/g;
	
	// Remove spurious chapter headings without removing body text that may
	// share an enclosing paragraph with the heading.
	$('p').each(function(i, e)
	{
		var cont = $(e).contents();
		
		for(var i = 0; i < cont.length; i++)
		{
			var c = cont[i];
			
			if(c.type === 'text' && c.data.search(c_re) > -1)
				c.data = c.data.replace(c_re, '');
		}
	});
	
	// Harmonize catch-phrase formatting.
	if(chap.title === 'Un' || chap.title === 'Duex' /* LOL */)
		$('pre').replaceWith($('<p><strong>Billy-Bob Space Trucker</strong></p>'));
	else if(chap.title === 'Trois')
		$.root().find('p strong').text('Billy-Bob Space Trucker');
	
	next();
}

module.exports =
{
    apply: apply
};
