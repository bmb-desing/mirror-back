const model = require('../model');
const post = model.post;
const cache = require('../app').cache;
const limit = 7;
exports.getAll =  function (req, res) {
    const page = req.query.page || 1;
    cache.get('posts_' + page, function (err, results) {
      if (results) {
          res.json(results)
      }
      else {
          getAllPosts(page,function (posts) {

            if (!posts) {
                res.sendStatus(404)
            }
            else {
							cache.set('posts_' + page , posts,  function (err) {
								console.log(err)
							})
							res.json(posts)
						}

					})

      }
		})

},
exports.getIndex = function (req, res) {
    cache.get('posts_index', function (err, results) {
      if (results) {
          res.json(results)
      }
      else {
          getIndexPosts(function (posts) {
              if (!posts) {
                  res.sendStatus(404)
              }
              else {
								cache.set('posts_index', posts, function (err) {
									console.log(err)
								})
								res.json(posts)
							}
					})
      }
		})
},
exports.getPostsForCategory = function (req, res) {
    const page = req.query.page || 1;
    const category = req.params.category;
    cache.get('posts_'+ category+ '_page_' +page, function (err, results) {
			if (results) {
				res.json(results)
			}
			else {
				getCategoryPosts(category, page, function (posts) {
					if (!posts) {
						res.sendStatus(404)
					}
					else {
						cache.set('posts_'+ category+ '_page_' +page, posts, function (err) {
							console.log(err)
						})
						res.json(posts)
					}
				})
			}
		})
}
exports.getForAlias = function (req, res) {
    const alias = req.params.post;
    cache.get('post_'+alias, function (err, results) {
			if (results) {
				res.json(results)
			}
			else {
				getPost(alias, function (post) {
					if (!post) {
						res.sendStatus(404)
					}
					else {
						cache.set('post_'+alias, post, function (err) {
							console.log(err)
						})
						res.json(post)
					}
				})
			}
		})
}
exports.searchPosts = function (req, res) {
    const q = decodeURIComponent(req.query.q);
    const qArray = q.split(' ');
    const queryArray = [];
    qArray.map(function (value) {
       queryArray.push({$or: [
           {
               title: {
                   $like: '%' + value + '%'
               }
           },
           {
               shortText: {
                   $like: '%' + value + '%'
               }
           },
					 {
							 text: {
								 $like: '%' + value + '%'
							 }
					 }
           ]})
    });
    const page = req.query.page || 1;
    cache.get('posts_search_'+ q + '_page_' + page, function (err, results) {
			if (results) {
				res.json(results)
			}
			else {
				getSearchResults(queryArray, page, function (posts) {
					if (!posts) {
						res.sendStatus(404)
					}
					else {
						cache.set('posts_search_'+ q + '_page_' + page, posts, function (err) {
							console.log(err)
						})
						res.json(posts)
					}
				})
			}
		})

}
function getIndexPosts(callback) {
	post.findAll({
		limit: limit,
		order: [['createdAt', 'DESC']],
		attributes: ['id', 'title', 'shortText', 'alias', 'thumbnail', 'rating', 'ratingCount', 'visits', 'categoryId', 'createdAt'],
		include: [
			{
				model: model.category,
				attributes: ['alias', 'title']
			},
			{
				model: model.comment,
				attributes: ['id']
			}]
	}).then(function (value) {
	    callback(value)
	}).catch(function (reason) {
	    callback(false)
	})
}
function getAllPosts(page ,callback) {
	post.findAndCount({
		limit: limit,
		offset: limit * (page - 1),
		order: [['createdAt', 'DESC']],
    attributes: ['id', 'title', 'shortText', 'alias', 'thumbnail', 'rating', 'ratingCount', 'visits', 'categoryId', 'createdAt'],
		include: [
			{
				model: model.category,
        attributes: ['alias', 'title']
			},
			{
				model: model.comment,
				attributes: ['id']
			}]
	}).then(function (posts) {
		const pages = Math.ceil(posts.count / limit);
		if(page <= pages) {
			callback({posts : posts.rows, count: pages})
		}
		else {
		    callback(false)
    }
	})
}
function getCategoryPosts(category, page, callback) {
	model.category.findOne({
		where: {
			alias: category
		},
	}).then(function (cat) {
		if (cat) {
			post.findAndCount({
				where: {
					categoryId : cat.id
				},
				limit: limit,
				offset: limit * (page - 1),
				order: [['createdAt', 'DESC']],
				attributes: ['id', 'title', 'shortText', 'alias', 'thumbnail', 'rating', 'ratingCount', 'visits', 'categoryId', 'createdAt'],
				include: [
					{
						model: model.category,
						attributes: ['alias', 'title']
					},
					{
						model: model.comment,
						attributes: ['id']
					}]
			}).then(function (posts) {
				const pages = Math.ceil(posts.count / limit);
				if(page <= pages) {
					callback({posts: posts.rows, count: pages, category: cat})
				}
				else {
					callback(false)
				}
			})
		}
		else {
			callback(false)
		}
	})
}
function getPost(post, callback) {
	model.post.findOne({
		where: {
			alias: post
		},
		attributes: ['id', 'title', 'text', 'alias', 'thumbnail', 'rating', 'ratingCount', 'visits', 'categoryId', 'createdAt', 'description'],
		include: [
			{
				model: model.category,
				attributes: ['alias', 'title']
			},
			{
				model: model.comment
			}
		]
	}).then(function (post) {
		if (post) {
			callback(post)
		}
		else {
			callback(false)
		}
	})
}
function getSearchResults(search, page, callback) {
	post.findAndCount({
		where: {
			$and: search
		},
		limit: limit,
		offset: limit * (page - 1),
		order: [['createdAt', 'DESC']],
		attributes: ['id', 'title', 'shortText', 'alias', 'thumbnail', 'rating', 'ratingCount', 'visits', 'categoryId', 'createdAt'],
		include: [
			{
				model: model.category,
				attributes: ['alias', 'title']
			},
			{
				model: model.comment,
				attributes: ['id']
			}]
	}).then(function (posts) {
		const pages = Math.ceil(posts.count / limit);
		if(page <= pages) {
			callback({posts: posts.rows, count: pages, all: posts.count})
		}
		else {
			callback(false);
		}
	}).catch(function (reason) {
		callback(false);
	})
}