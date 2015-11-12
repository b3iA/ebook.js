function apply(params, next)
{
	var chap = params.chap;
	var $ = chap.dom;

	$('p').each(function(i, e)
	{
		var el = $(e);
		var t = el.text().toLowerCase();

		if(t.indexOf('continued in comments') === 0 || t.indexOf('continued in the comments') === 0)
			el.remove();
	});

	next();
}

module.exports =
{
    apply: apply
};
