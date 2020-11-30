// Match the first N elements matched by the supplied selector.
exports.removeFirst = ($, coll, selector, count) =>
{
	let elems = $(selector);
	
	for(let i = 0; i < count; i++)
		coll.push($(elems[i]));
};

// Match the last N elements matched by the supplied selector.
exports.removeLast = ($, coll, selector, count) =>
{
	let elems = $(selector);
	
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
	let elems = $(selector);
	
	for(let i = 0; i < elems.length; i++)
		coll.push($(elems[i]));
};

// Matches elements containing text matched by the supplied regexp.
exports.removeMatching = ($, coll, selector, rexp) =>
{
	$(selector).each(function(i, e)
	{
		let el = $(e);
		let t = el.text();
		
		if(t.search(rexp) === 0)
			coll.push(el);
	});
};

// Matches the selected element(s) and any following sibling elements.
exports.removeFrom = ($, coll, selector) =>
{
	let elems = $(selector);
	
	if(elems.length > 0)
	{
		$(elems[0]).prev().nextAll().each((i, e) =>
		{
			coll.push($(e));
		});
	}
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
	let $ = chap.dom;
	
	if(chap.title in params)
	{
		let pr = params[chap.title];
		let ps = $('p');
		
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
