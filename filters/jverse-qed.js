function apply($)
{
    var ps = $('p');

    for(var i = 0; i < 3; i++)
        $(ps[i]).remove();
}

module.exports =
{
    apply: apply
};
