var cheerio = require('cheerio');
var marked = require('marked');
var fs = require('fs');

function apply(params, next)
{
    var chap = params.chap;
    var html = fs.readFileSync(__dirname + '/../' + chap.src, encoding = 'utf-8');

    console.log('[\033[92mLoading\033[0m] ' + chap.src);
    chap.dom = cheerio.load(html, { decodeEntities: false });
    next();
}

module.exports =
{
    apply: apply
};
