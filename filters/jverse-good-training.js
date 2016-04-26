function apply(params, next)
{
    var chap = params.chap;
	var $ = chap.dom;
	var rem = [];
	
	if(chap.title === 'The Locals')
	{
		var ps = $('p');
		
		$('h2').each(function(i, e)
		{
			rem.push($(e));
		});
	
		rem.push($(ps[0]));
		rem.push($(ps[1]));
	    rem.push($('p:contains("CONTINUED IN COMMENTS BELOW")'));
	    rem.push($('p:contains("I felt like adding more. Have an epilogue!")'));
	}
    
    if(rem.length)
	    params.purge(rem);

	next();
}

module.exports =
{
    apply: apply
};
