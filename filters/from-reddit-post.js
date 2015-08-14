var request = require('request');
var cheerio = require('cheerio');
var marked = require('marked');
var fs = require('fs');

function getContinuations(set, author)
{
    // Recursively search through comments, looking for plausible continuations
    for(var key in set)
    {
        var c = set[key].data;

        if(c.author === author && c.body_html.length > 1000)
        {
            var html = '\n\n\n------\n\n\n' + c.body;

            if(c.replies.data)
                html += getContinuations(c.replies.data.children, author);

            return html;
        }
    }

    return '';
}

function unescape(html)
{
    return html.replace(/&quot;/g, '"')
               .replace(/&#39;/g, '\'')
               .replace(/&apos;/g, '\'')
               .replace(/&amp;/g, '&');
}

function getPostMarkdown(json)
{
    var post = json[0].data.children[0].data;
    var author = post.author;
    var md = post.selftext + getContinuations(json[1].data.children, author);

    return md;
}

function UriCache()
{
    this.cache = [];

    var files = fs.readdirSync(__dirname + '/../cache');

    for(var i = 0; i < files.length; i++)
        this.cache.push(files[i]);
}

UriCache.prototype.uriToId = function(uri)
{
    var tokens = uri.split('/');

    return tokens.slice(4, tokens.length - 1).join('_');
};

UriCache.prototype.get = function(chap, callback)
{
    var id = this.uriToId(chap.url);

    chap.id = id;

    if(this.cache.indexOf(id) > -1)
    {
        console.log('[\033[92mCached\033[0m] ' + id);
        chap.dom.load(fs.readFileSync(__dirname + '/../cache/' + id, encoding = 'utf-8'), { decodeEntities: false });
        callback();
        return;
    }

    request({ uri: chap.url + '.json' }, function(chap, callback, uri_cache) { return function(error, response, body)
    {
        if(response.statusCode === 503)
        {
            console.log('[\033[91mRetrying\033[0m] ' + chap.id);
            uri_cache.get(chap, callback);
            return;
        }

        console.log('[\033[93mFetched\033[0m] ' + chap.id);
        uri_cache.cache.push(chap.id);

        var md = getPostMarkdown(JSON.parse(body));

        chap.dom.load(marked(md), { decodeEntities: false });
        fs.writeFileSync(__dirname + '/../cache/' + chap.id, unescape(chap.dom.html()), encoding = 'utf-8');
        // fs.writeFileSync(__dirname + '/cache/' + chap.id + '.md', md, encoding = 'utf-8');
        callback();
    }}(chap, callback, this));
};

var uri_cache = new UriCache();

function apply(params, next)
{
    uri_cache.get(params.chap, function()
    {
        next();
    });
}

module.exports =
{
    apply: apply
};
