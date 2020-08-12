function apply(params, next)
{
    const $ = params.chap.dom;
    const cont = $($('#storycontent')[0].children);
    
    $._root.children = [];
    $.root().append(cont);
    
    next();
}

module.exports =
{
    apply: apply
};
