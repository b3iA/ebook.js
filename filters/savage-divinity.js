function apply(params, next)
{
	const $ = params.chap.dom;
	const cont = $($('.entry-content')[0].children);
	let rem = [];
	
	$._root.children = [];
	$.root().append(cont);
	
	$('i').each((i, e) => e.name = 'em');
	$('b').each((i, e) => e.name = 'strong');
	
	$('table, div, h3, h4, figure, figcaption, img, a').each((i, e) =>
	{
		rem.push($(e));
	});
	
	const break_re = /^~*$/;
	
	$('p').each((i, e) =>
	{
		var p = $(e);
		
		if(break_re.test(p.text()))
			p.replaceWith($('<hr/>'));
	});
	
	$('h1').each(function(i, e)
	{
		let el = $(e);
		
		el.replaceWith($('<p><strong>' + el.text() + '</strong></p>'));
	});
	
	params.purge(rem);
	next();
}

module.exports =
{
	apply: apply
};
