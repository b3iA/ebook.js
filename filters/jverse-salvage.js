const utils = require('./utils');

function processText($, fn)
{
	$('p').each(function(idx, e)
	{
		const cont = $(e).contents();
		
		for(let i = 0; i < cont.length; i++)
		{
			const c = cont[i];
			
			if(c.type === 'text')
				fn(c); 
		}
	});
}

function apply(params, next)
{
	const chap = params.chap;
	const $ = chap.dom;
	
	if(chap.title === 'Dark Heart')
	{
		processText($, function(c)
		{
			if(c.data.charCodeAt(0) === 0x2003)
				c.data = c.data.substr(2, c.data.length-2);
		});
	}
	else if(['Positions of Power', 'Prisoners', 'Center of attention'].includes(chap.title))
	{
		processText($, function(c)
		{
			if(c.data.indexOf('*') > -1)
				c.data = c.data.replace(/\*/, '');
		});
	}
	
	$('h1').each(function(i, e)
	{
		let el = $(e);
		
		el.replaceWith($('<p><strong>' + el.text() + '</strong></p>'));
	});
	
	const rem = [];
	
	utils.pruneParagraphs(chap, rem, {
		'The Fittest': [2, 0],
		'The Rabbit Hole': [2, 0],
		'Solve for X-plosion': [2, 0],
		'Going Without': [2, 0],
		'Lost Futures': [2, 0],
		'Taking Stock': [44, 0],
		'A Menacing Glow in the Sky': [9, 0],
		'New Centre of the Universe': [9, 0],
		'Cryin\' Sun': [9, 0],
		'Rising Power': [6, 0]
	});
	
	const ps = $('p');
	const fp = $(ps[ps.length - 1]);
	
	if(fp.text() === 'END OF CHAPTER' || fp.text() === 'End of Chapter' || fp.text() === 'Chapter End')
		rem.push(fp);
	
	params.purge(rem);
	next();
}

module.exports =
{
	apply: apply
};
