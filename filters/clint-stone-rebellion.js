function apply($, chap)
{
	$('p strong').each(function(i, e)
	{
		var el = $(e);

		if(el.text().toLowerCase().indexOf('translator note:') === 0)
			el.parent().remove();
	});

	$('p').each(function(i, e)
	{
		var el = $(e);
		var idx = el.text().toLowerCase().indexOf('continued in comments');

		if(idx > -1 && idx < 2)
			el.remove();
	});

	var rem_last_p = ['The Pit', 'Purpose', 'Sister', 'Home Run', 'Crazy Bastard', 'Marooned', 'Brother Mine', 'Dark', 'Puzzles', 'Family Values', 'Rebellion of Skuar', 'Enlisted', 'Acceptable', 'Training Mission', 'Liberated', 'Break', 'Breakfast'];
	var rem_last_p2 = ['Purpose', 'Crazy Bastard'];
	var ps = $('p');

	if(rem_last_p.indexOf(chap.title) > -1)
		$(ps[ps.length - 1]).remove();

	if(rem_last_p2.indexOf(chap.title) > -1)
		$(ps[ps.length - 2]).remove();

	if(chap.title === 'Broken' || chap.title === 'Behold' || chap.title === 'Captive' || chap.title === 'Evaluation')
	{
		for(var i = 0; i < 3; i++)
			$(ps[ps.length - (i + 1)]).remove();
	}

	if(chap.title === 'The Lives We Lived')
	{
		for(var i = 0; i < 4; i++)
			$(ps[ps.length - (i + 1)]).remove();
	}
}

module.exports =
{
    apply: apply
};
