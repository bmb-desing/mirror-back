const model = require('../model');
const map = [];
exports.generateSitemap = function (req, res) {
    model.category.findAll({
        attributes: ['alias', 'updatedAt'],
        include: {model: model.post, attributes: ['alias', 'updatedAt']}
    }).then(function (value) {
        value.map(function (category) {
            map.push({
                url: '/' + category.alias,
                changefreq: 'daily',
                priority: 0.8,
                lastmodISO: category.updatedAt
            })
            category.posts.map(function (post) {
                map.push({
                    url: '/' + category.alias + '/' + post.alias,
                    changefreq: 'daily',
                    priority: 0.5,
                    lastmodISO: post.updatedAt
                })
            })
        })
        res.json(map)
    })
}