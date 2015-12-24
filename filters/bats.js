function apply(params, next)
{
	var chap = params.chap;
	var $ = chap.dom;
	var ps = $('p');
	
	ps.each(function(i, e)
	{
		var el = $(e);
		var t = el.text().toLowerCase();

		if(t.indexOf('continued in comments') === 0 || t.indexOf('continued in the comments') === 0)
			el.remove();
	});

	if(chap.title === 'Help I Accidentally the Princess' || 
	   chap.title === 'How I Kept Him From Making the Big Orc Cry')
	{
		$(ps[ps.length - 1]).remove();
	}
	
	next();
}

module.exports =
{
    apply: apply
};
