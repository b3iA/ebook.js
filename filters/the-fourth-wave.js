function apply(params, next)
{
	const chap = params.chap;
	const $ = chap.dom;
	const rem = [];
	
	const pats = [
		/^last chapter$/i,
		/^all chapters/i,
		/^next chapter/i,
		/^part (i|v)*$/i,
		/^continued$/i,
		/^table of contents$/i
	];
	
	const ps = $('p');
	
	ps.each(function(i, e)
	{
		const el = $(e);
		const txt = el.text();
		
		for(let c = 0; c < pats.length; c++)
		{
			if(txt.search(pats[c]) > -1)
				rem.push(el);
		}
	});
	
	let lp_rem = 0;
	
	if(chap.title === 'Part 50')
		rem.push($(ps[2]));
	else if(chap.title === 'Part 62')
		lp_rem = 13;
	else if(chap.title === 'Part 66')
		rem.push($(ps[0]));
	else if(chap.title === 'Part 68')
		rem.push($(ps[ps.length-2]));
	else if(chap.title === 'Part 69')
		rem.push($(ps[ps.length-1]));
	else if(chap.title === 'Part 88')
		lp_rem = 6;
	else if(chap.title === 'Part 96')
		lp_rem = 21;
	
	if(lp_rem > 0)
	{
		for(let i = ps.length - lp_rem; i < ps.length; i++)
			rem.push($(ps[i]));
	}
	
	$('a').each(function(i, e)
	{
		const el = $(e);
		
		if(el.text().toLowerCase() === 'contribute to the happy meal fund')
			rem.push(el.parent());
	});
	
	$('h2').each(function(i, e)
	{
		e.name = 'strong';
	});
	
	params.purge(rem);
	next();
}

module.exports =
{
	apply: apply
};
