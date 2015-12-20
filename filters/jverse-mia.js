function apply(params, next)
{
    var chap = params.chap;
	var $ = chap.dom;
	var t0 = chap.title[0];

	if(t0 === '1')
	{
		// Remove double spacing
	    $('p').each(function(i, e)
	    {
	        if(e.name !== 'p')
	            return;

	        var el = $(e);
	        var tx = el.text().trim();

	        if(tx === '&amp;nbsp;')
	            el.remove();
	    });
	}
	else if(t0 === '2')
	{
		var ps = $('p');

		for(var i = 0; i < 5; i++)
			$(ps[i]).remove();
	}
	else if(t0 === '5' || t0 === '6' ||	t0 === '7')
	{
		var ps = $('p');

		for(var i = 0; i < 3; i++)
			$(ps[i]).remove();

		$('h2').remove();
	}

	$('p strong').each(function(i, e)
	{
		var el = $(e);

		if(el.text().indexOf('Chapter ') === 0)
			el.parent().remove();
	});

	$('p span').each(function(i, e)
	{
		var el = $(e);

		if(el.text().toLowerCase().indexOf('part ') === 0)
			el.remove();
	});

	next();
}

module.exports =
{
    apply: apply
};
