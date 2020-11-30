// Match the first N elements matched by the supplied selector.
exports.removeFirst = ($, coll, selector, count) =>
{
	const elems = $(selector);
	
	for(let i = 0; i < count; i++)
		coll.push($(elems[i]));
};

// Match the last N elements matched by the supplied selector.
exports.removeLast = ($, coll, selector, count) =>
{
	const elems = $(selector);
	
	count = Math.min(count, elems.length);
	
	for(let i = elems.length - 1; i > elems.length - (count + 1); i--)
		coll.push($(elems[i]));
};

// Match the first element matching the supplied selector.
exports.removeSingle = ($, coll, selector) =>
{
	coll.push($($(selector)[0]));
};


// Matches the supplied selector.
exports.removeAll = ($, coll, selector) =>
{
	$(selector).each((i, e) => coll.push($(e)));
};

// Matches elements containing text matched by the supplied regexp.
exports.removeMatching = ($, coll, selector, rexp) =>
{
	$(selector).each((i, e) =>
	{
		const el = $(e);
		
		if(el.text().search(rexp) === 0)
			coll.push(el);
	});
};

// Matches the selected element(s) and any following sibling elements.
exports.removeFrom = ($, coll, selector) =>
{
	$(selector).each((i, e) =>
	{
		$(e).prev().nextAll().each((i2, e2) => coll.push($(e2)));
	});
};

// Replaces the entire DOM with the selected elements.
exports.replaceRootWith = ($, sel) =>
{
	const new_dom = $(sel).children();
	
	$._root.children = [];
	$.root().append(new_dom);
};

// Matches a specified number of leading and trailing paragraphs
// from the specified chapter. Usually for pending removal.
//
// chap:   Chapter object instance
// coll:   Collection to add matched element to
// params: Object of arrays with the format:
//         {
//             "Chapter title": [number of paragraphs to delete from front of chapter, and from the end],
//             ...
//         }
exports.pruneParagraphs = (chap, coll, params) =>
{
	const $ = chap.dom;
	
	if(chap.title in params)
	{
		const pr = params[chap.title];
		const ps = $('p');
		
		for(let i = 0; i < pr[0]; i++)
			coll.push($(ps[i]));
		
		for(let i = ps.length - pr[1]; i < ps.length; i++)
			coll.push($(ps[i]));
		
		if(pr.length > 2)
		{
			const pats = pr[2];
			
			for(let i = 0; i < pats.length; i++)
			{
				const res = $(pats[i]);
				
				for(let i2 = 0; i2 < res.length; i2++)
					coll.push($(res[i2]));
			}
		}
	}
};
