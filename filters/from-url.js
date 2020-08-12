const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

function uriToId(uri)
{
    return decodeURI(uri.replace(/http[s]?:\/\/|www\.|[\?=&#%]/g, '').replace(/[\.\/]/g, '_'));
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

    request({ uri: params.chap.src }, function(params, callback) { return function(error, response, body)
    {
        if(!response || response.statusCode === 503)
        {
            console.log('[\033[91mRetrying\033[0m] ' + params.chap.id);
            get(params, callback);
            return;
        }

        console.log('[\033[93mFetched\033[0m] ' + params.chap.id);
        
        params.uri_cache.cache.push(params.chap.id);
        params.chap.dom = cheerio.load(body, params.cheerio_flags);
        fs.writeFileSync(__dirname + '/../cache/' + params.chap.id, body, encoding = 'utf-8');
        
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
