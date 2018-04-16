const model = require('../model/index');
const comment = model.comment;
exports.getAll = function getAll(req, res)  {
    console.log(req)
    const page = req.query.page || 1;
    const limitForPage = 20;
    comment.findAndCountAll({
        limit: limitForPage,
        offset: limitForPage * (page - 1),
        include: [
            {
                model: model.post,
                attributes: ['alias'],
                include: {
                    model: model.category,
                    attributes: ['alias', 'title']
                }
            }
        ],
        order: [['createdAt', 'DESC']]
    }).then(function (commentsAll) {
        const pages = parseInt(commentsAll.count / limitForPage);
        if (page <= pages) {
            res.json({comments : commentsAll.rows, pages: pages})
        }
        else {
            res.status(404);
            res.json('Такой страницы не существует');
        }
    })

}
exports.addComment = function (req, res) {
    comment.create({
        name: req.body.name,
        text: req.body.text,
        postId: req.body.postId,
        parent_id: req.body.parent_id
    }).then(function (value) {
        res.json(value)
    }).catch(function (reason) {
        res.status(400);
        res.json('Ошибка добавления коментария');
    })
}
