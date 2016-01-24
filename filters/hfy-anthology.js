function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;
	var rem = [];
	var prune = {
		'A predator subdued': [1, 0],
		'Making an omelet': [0, 1],
		'Winging it': [1, 6],
		'We Are the Gods': [2, 0],
		'Adonis': [1, 0]
	};
		
    if(chap.title in prune)
    {
		var pr = prune[chap.title];
		var ps = $('p');
	
		for(var i = 0; i < pr[0]; i++)
			rem.push($(ps[i]));
		
		for(var i = ps.length - pr[1]; i < ps.length; i++)
			rem.push($(ps[i]));
    }
    
    if(rem.length)
	    params.purge(rem);
	
    next();
}

module.exports =
{
    apply: apply
};
