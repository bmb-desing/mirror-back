const needle =  require('needle');
const translit = require('transliteration');
const slugify = translit.slugify;
const mkdirp = require('mkdirp');
const cheerio = require('cheerio');
const model = require('../model');
const post = model.post;
const category = model.category;
const request = require('request');
const urls = require('url');
const resolve = urls.resolve;
const fs = require('fs');
const uuid = require('node-uuid');
const url = 'http://tabula-rasa24.ru/';
const parser = function () {
    needle.get(url, function (err, res) {
        if (err) {
            throw err;
        }
        const $ = cheerio.load(res.body);
        var text = $('.sidebar-1 .itemsList .moduleItemIntro').contents();
        text.find('.moduleItemTitle').contents().text(function (i , el) {
            var itemParse = $(this);
            var itemTitle = itemParse.text();
            findPost(itemTitle, function (post) {
                if (post) {
                    var href = itemParse.parent();
                    var link = href.attr('href');
                    const fullLink = resolve(url, link);

                    needle.get(fullLink, {json: true} , function (err, res) {
                        if (err) throw err
                        parsePage(res)
                    })
                }
            })
        });

    })
};

function findPost(title, callback) {
    post.findOne({
        where: {
            title: title
        }
    }).then(function (value) {
        if (value == null) {
            callback(true);
        }
        else {
            callback(false);
        }
    })
}
function parsePage(res) {

    const $ = cheerio.load(res.body, { decodeEntities: false });
    const text = $('.itemFullText').html();
    console.log(text);
    if (text != null) {
        getCategory($('.itemCategory a').text(), function (cat) {
            console.log(cat.alias)
            var content = {};

            var thumbnail = $('.itemHeader img').attr('src');
            var title = $('head title').text();
            content.text = parseText(text, cat.alias, title);
            content.title = title;
            content.categoryId = cat.id;
            content.alias = slugify(title);
            content.thumbnail = parseThumbmail(thumbnail ,cat.alias, title);
            content.description = $('meta[property="og:description"]').attr('content');
            model.post.create(content).then(function (value) {
                console.log('Статья успешно добавленна');
            }).catch(function (reason) {
                console.log(reason);
            })
        });

    }


}

function parseText(text, category, post) {
    console.log(text);
    const $ = cheerio.load(text, { decodeEntities: false, xmlMode: true});
    $('script').remove();
    $('*').removeAttr('style');
    $('img').each(function (index, el) {
        const path = $(this).attr('src');
        const pathArr = path.split('/');
        const nameFile = pathArr.pop();
        const pipe = nameFile.split('.')[1];
        var newPipe =  pipe.indexOf('?') != -1 ? pipe.split('?')[0] : pipe;
        const newPath = 'images/' + category + '/' + slugify(post);
        const image = download(resolve(url, path), newPath, newPipe)
        $(this).attr('src', image);
        $(this).attr('alt', $(this).attr('alt') != '' ? $(this).attr('alt') : post )
    })
    return $.html();
}
function parseThumbmail(thumbnail, category, post) {
    const pathArr = thumbnail.split('/');
    const nameFile = pathArr.pop();
    const pipe = nameFile.split('.')[1];
    var newPipe =  pipe.indexOf('?') != -1 ? pipe.split('?')[0] : pipe;
    const newPath = 'images/' + category + '/' + slugify(post);
    const image = getThumbnail(resolve(url, thumbnail), newPath, newPipe)
    return image
}
function getThumbnail(url, path, pipe) {
    mkdirp('files/' + path, function (err) {
        if (err) {
            throw err;
        }
    })
    const name = uuid.v4();
    const filename = 'files/' + path + '/' + name + '.' + pipe;
    console.log(filename);
    needle.get(url, {multipart: true}).pipe(
        fs.createWriteStream(filename).on('open', function (fd) {
            console.log(fd);
        }).on('error', function (args) {
            console.log(args);
        }).on('finish', function (args) {
            console.log(args);
        })
    ).on('error', function (args) {
        console.log(args);
    })
    return 'https://api.mirror-universe.ru/' + path + '/' + name + '.' + pipe;
}
function getCategory(title, callback) {
    model.category.findOne({
        where: {
            title: title
        },
    }).then(function (value) {
        callback(value);
    })
}
function download(url, path, pipe) {
    mkdirp('files/' + path, function (err) {
        if (err) {
            throw err;
        }
    })
    const name = uuid.v4();
    const filename = 'files/' + path + '/' + name + '.' + pipe;
    needle.get(url, {multipart: true}).pipe(
        fs.createWriteStream(filename).on('open', function (fd) {
            console.log(fd);
        }).on('error', function (args) {
            console.log(args);
        }).on('finish', function (args) {
            console.log(args);
        })
    ).on('error', function (args) {
        console.log(args);
    })
    return 'https://api.mirror-universe.ru/' + path + '/' + name + '.' + pipe;

}
module.exports = parser;
