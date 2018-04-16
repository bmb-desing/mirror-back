const model = require('../model');
exports.getMenu = function(req, res) {
    model.category.findAll().then(function (value) {
        res.json(value)
    })
},
exports.getSidebar = function (req, res) {
    getPosts(function (posts) {
        getComments(function (comments) {
            res.json({
                posts: posts,
                comments: comments
            })
        })
    })
}
function getPosts(callback) {
    model.post.findAll({
        limit: 4,
        order: [['rating', 'DESC']],
        include: {
            model: model.category
        }
    }).then(function (posts) {
        callback(posts)
    })
}
function getComments(callback) {
    model.comment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
            {
                model: model.post,
                include: [ {
                    model: model.category
                }]
            },
        ]
    }).then(function (comments) {
        callback(comments)
    })
}