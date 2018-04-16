const model = require('../model');
const post = model.post;
const cache = require('../app').cache;
exports.addRating =  function(req, res) {
    var session = req.session.rating;
    console.log(session);
    var id = req.body.id;
    if (!req.session.rating) {
        req.session.rating = []
    }
    if (req.session.rating.indexOf(id) == -1) {
        post.findOne({
            where: {
                id: id
            }
        }).then(function (item) {
            if (item) {
                const count = item.ratingCount + 1
                const rating= req.body.rating + item.rating
                item.update({
                    rating: rating,
                    ratingCount: count
                }).then(function () {
                    req.session.rating.push(req.body.id)
									  cache.del('post_'+item.alias, function (err) {
                      console.log(err)
										})
                    res.json(id)
            })
            }
            else {
                res.sendStatus(404)
        }
    })
    }
    else {
        res.sendStatus(403)
    }

},
exports.getRating = function (req,res) {
    console.log(123);
    console.log(req.session.rating);
    res.json(req.session.rating || [])
}