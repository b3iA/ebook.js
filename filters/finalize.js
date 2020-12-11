function check_for_invalid_break($, e)
{
	if(e.type === 'tag' && e.name === 'p')
	{
		const el = $(e);
		
		if(el.hasClass('center') && el.text() === '&#x2042;')
		{
			el.remove();
			return true;
		}
	}
	
	return false;
}

function remove_whitespace($)
{
	const newl = /^[\n\s]*$/;
	let   roots = $.root().contents();
	let   rem = true;
	

	for(let i = 0; i < roots.length; i++)
	{
		const r = roots[i];
		
		if(r.type === 'text' && r.data.search(newl) > -1)
		{
			if(rem)
				$(r).remove();
			
			rem = true;
		}
		else
			rem = false;
	}
	
	// That may leave a single trailing newline
	roots = $.root().contents();
	
	const last = roots[roots.length-1];
	
	if(last.type === 'text' && last.data.search(newl) > -1)
		$(last).remove();
}

// The actions of other filters can leave the DOM in an undesirable state,
// this filter attempts to correct these anomalies before final output processing.
// It should always be used as the final stage.
function apply(params, next)
{
	const $ = params.chap.dom;
	
	// Remove any empty paragraphs
	$('p').each(function(i, e)
	{
		const p = $(e);
		
		if(p.text().trim() === '')
			p.remove();
	});
	
	// Removal of DOM elements tends to leave surrounding
	// newline text nodes, resulting in large gaps in the root.
	remove_whitespace($);
	
	// Check for any widowed / orphaned scene breaks, and
	// remove them if found.
	let roots = $.root().contents();
	let dirty = false;
	
	if(roots.length > 0 && check_for_invalid_break($, roots[0]))
		dirty = true;
		
	if(roots.length > 1 && check_for_invalid_break($, roots[roots.length - 1]))
		dirty = true;
			
	// If any were found and removed, we need to reensure that
	// no unnecessary whitespace exists in the root.
	if(dirty)
		remove_whitespace($);

	next();
}

module.exports =
{
	apply: apply
};
