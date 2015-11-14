function apply(params, next)
{
    var chap = params.chap;
    var $ = chap.dom;

    var ps = $('p');
    var fp = $(ps[ps.length - 1]);

    if(fp.text() === 'END OF CHAPTER' || fp.text() === 'Chapter End')
        fp.remove();

    next();
}

module.exports =
{
    apply: apply
};
