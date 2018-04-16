const model = require('../model');
const cache = require('../app').cache;
exports.addVisit = function(req, res) {
    console.log(req.session);
    if (!req.session.visits) {
        req.session.visits = []
    }
    if (req.session.visits.indexOf(req.body.id) == -1) {
        model.post.findOne({
                where: {
                    id: req.body.id
                }}
            ).then(function(item) {
                if (item) {
                    const count = item.visits + 1;
                    item.update(
                        {
                            visits: count
                        }).then(function(post) {
                            req.session.visits.push(req.body.id);
                            cache.del('post_'+item.alias, function (err) {
                                console.log(err)
                            })
                            res.json(req.body.id);
                        })
                }
                else {
                    res.status(404)
                    res.json('Пост не найден')

                }
            })
    }
    else {
        res.sendStatus(403)
    }
},
exports.getVisit = function (req,res) {
    res.json(req.session.visits || []);
}