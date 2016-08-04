var request = require('request');
var cheerio = require('cheerio');
var child_process = require('child_process');
var fs = require('fs');

function uriToId(uri)
{
    var tokens = uri.split('/');

    return 'HFYA_' + decodeURI(tokens.slice(tokens.length-2, tokens.length).join('_'));
};

function get(params, callback)
{
    if(params.uri_cache.cache.indexOf(params.chap.id) > -1)
    {
        console.log('[\033[92mCached\033[0m] ' + params.chap.id);
        params.chap.dom = cheerio.load(fs.readFileSync(__dirname + '/../cache/' + params.chap.id, encoding = 'utf-8'), params.cheerio_flags);
        callback();
        return;
    }

    request({ uri: params.chap.src }, function(parmas, callback, uri_cache) { return function(error, response, body)
    {
        if(response.statusCode === 503)
        {
            console.log('[\033[91mRetrying\033[0m] ' + params.chap.id);
            get(params, callback);
            return;
        }

        console.log('[\033[93mFetched\033[0m] ' + params.chap.id);
        params.uri_cache.cache.push(params.chap.id);

        var $ = cheerio.load(body, params.cheerio_flags);
        var content = $('div.node-content div[property]').contents();
        
        $.root().children().remove();
        $.root().append(content);
		$($.root().contents()[0]).remove(); // Remove doctype tag
		
        content = $.root().contents();
        
        for(var i = 0; i < content.length; i++)
        {
        	var e = content[i];
        	
        	if(e.type === 'text' && e.data === '\n\n')
        		e.data = '\n';
        }
        
        params.chap.dom = $;
        
        fs.writeFileSync(__dirname + '/../cache/' + params.chap.id, params.chap.dom.xml(), encoding = 'utf-8');
        
        child_process.execSync("sleep 1");
        callback();
    }}(params, callback, this));
};

function apply(params, next)
{
    params.chap.id = uriToId(params.chap.src);

    get(params, function()
    {
        next();
    });
}

module.exports =
{
    apply: apply
};
