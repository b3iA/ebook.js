function apply($, chap)
{
	if(chap.title === 'Chapter 1')
		$('h2').remove();

	if(chap.title === 'Chapter 6')
	{
		var cn = $.root().children();

		$(cn[cn.length - 2]).remove();
		$(cn[cn.length - 1]).remove();
	}
	else
	{
		// Remove link to the next part.
		var ps = $('p');
		var lp = $(ps[ps.length - 1]);
		var cn = lp.contents();

		if(cn[cn.length - 1].name === 'a')
		{
			if(chap.title === 'Chapter 5')
			{
				$(cn[cn.length - 4]).remove();
				$(cn[cn.length - 3]).remove();
			}

			$(cn[cn.length - 2]).remove();
			$(cn[cn.length - 1]).remove();
		}
	}
}

module.exports =
{
    apply: apply
};
