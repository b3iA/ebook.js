function apply(params, next)
{
	var chap = params.chap;
	var $ = chap.dom;

	$('p strong').each(function(i, e)
	{
		var el = $(e);

		if(el.text().toLowerCase().indexOf('translator note:') === 0)
			el.parent().remove();
	});

	$('p').each(function(i, e)
	{
		var el = $(e);

		if(el.text().toLowerCase().indexOf('continued in comments') === 0)
			el.remove();
	});

	var rem_last_p = ['Stranger', 'Hand of War', 'Quest', 'Retribution', 'Fireproof', 'Greetings', 'The Feast', 'Undone', 'Susan', 'Lost Tales'];
	var ps = $('p');
	var lp = $(ps[ps.length - 1]);

	if(rem_last_p.indexOf(chap.title) > -1 || lp.find('a').length)
		lp.remove();

	if(chap.title === 'Retribution')
		$(ps[ps.length - 2]).remove();
	else if(chap.title === 'Greetings')
	{
		$(ps[ps.length - 2]).remove();
		$(ps[ps.length - 3]).remove();
	}

	next();
}

module.exports =
{
    apply: apply
};
