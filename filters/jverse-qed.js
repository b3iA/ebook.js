function apply(params, next)
{
    var $ = params.chap.dom;
    var ps = $('p');

    for(var i = 0; i < 3; i++)
        $(ps[i]).remove();

    next();
}

module.exports =
{
    apply: apply
};
