const utils = require('./utils');

function apply(params, next)
{
	const chap = params.chap;
	const title = chap.title;
	const $ = chap.dom;
	const rem = [];
	
	let content = $('article').contents();
	
	$.root().children().remove();
	$.root().append(content);
	$('h1').remove();
	$('aside').remove();
	$($.root().contents()[0]).remove(); // Remove doctype tag
	
	utils.pruneParagraphs(chap, rem, {
		'Chapter 0: The Kevin Jenkins Experience': [5, 0]
	});
	
	utils.removeAll($, rem, 'h2');
	
	// Fix use of HTML 'fractions', e.g. "<sup>nom</sup>&frasl;<sub>denom</sub>" -> "nom/denom"
	let frac_parents = [];
	
	$('sub').each(function(i, e)
	{
		let el = $(e);

		if(!(el.parent() in frac_parents))
			frac_parents.push(el.parent())
		
		el.replaceWith(el.text());
	});
	
	for(const parent of frac_parents)
	{
		parent.text(parent.text().replace('&frasl;', '/'));
	}
	
	$('div').each((i, e) =>
	{
		const el = $(e);
		
		e.name = 'p';
		el.removeAttr('style');
		el.attr('align', 'right');
	});
	
	if(title == 'Chapter 65: Leaps of Faith')
	{
		const tag_name = 'dl';

		$('dl').each(function(i, e)
		{
			let html = '';
			
			$('dt', e).each((dli, dle) =>
			{
				html += '<p>' + $(dle).text() + '</p>\n';
			});
			
			$(e).replaceWith($(html));
		});
	}
	
	utils.removeFrom($, rem, $('p:contains("END CHAPTER")'));
	utils.removeFrom($, rem, $('p:contains("End Chapter")'));
	utils.removeFrom($, rem, $('p:contains("++End Ch")'));
	utils.removeSet($, rem, $('p:contains("Thank you for reading!")'));
	utils.removeSet($, rem, $('p:contains("will continue in chapter")'));
	utils.removeSet($, rem, $('p:contains("will continue in Chapter")'));
	
	params.purge(rem);
	next();
}

module.exports =
{
	apply: apply
};
