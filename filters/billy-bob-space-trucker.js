function apply(params, next)
{
    var chap = params.chap;
	var $ = chap.dom;
	var c_re = /^ *Chapitre [a-z,A-Z,-]*\.*\n*/g;
	
	// Remove spurious chapter headings without removing body text that may
	// share an enclosing paragraph with the heading.
	params.filter_text($, $.root(), function(txt)
	{
		return txt.replace(c_re, '');
	});
	
	// Harmonize catch-phrase formatting.
	if(chap.title === 'Un' || chap.title === 'Deux')
		$('pre').replaceWith($('<p><strong>Billy-Bob Space Trucker</strong></p>\n'));
	else if(chap.title === 'Trois')
		$.root().find('p strong').text('Billy-Bob Space Trucker');
	
	next();
}

module.exports =
{
    apply: apply
};
