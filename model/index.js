const Sequelize = require('sequelize');
const striptags = require('striptags');
/*const sequelize = new Sequelize('xolmsb8e_mirror', 'xolmsb8e_mirror', 'UJErM58*', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+03:00'
});*/
const sequelize = new Sequelize('mirror', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+03:00'
});
const post = sequelize.define('posts', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    alias: {
        type: Sequelize.STRING, unique: true
    },
    thumbnail: Sequelize.STRING,
    text: {
        type: Sequelize.TEXT, allowNull: false
    },
    shortText: {
        type: Sequelize.TEXT
    },
    rating: {
        type: Sequelize.INTEGER, defaultValue: 0
    },
    ratingCount: {
        type: Sequelize.INTEGER, defaultValue: 0
    },
    visits: {
        type: Sequelize.INTEGER, defaultValue: 0
    },
    telegramSend: {
        type: Sequelize.BOOLEAN, defaultValue: 0
    }
}, {
    hooks: {
        beforeCreate: function(post) {
            const shortText = striptags(post.text)
            return post.shortText = shortText.substr(0 , 250)
        },
        beforeUpdate: function(post) {
            const shortText = striptags(post.text)
            return post.shortText = shortText.substr(0 , 250)
        }
    },
    indexes: [
        {
            type: 'FULLTEXT',
            name: 'text_idx',
            fields: [
                'text',
                'description',
                'title'
            ]
        }
    ]
});
const comment = sequelize.define('comments',
    {
        name: {
            type: Sequelize.STRING, allowNull: false
        },
        text: {
            type: Sequelize.TEXT, allowNull: false
        },
        parent_id: {
            type: Sequelize.INTEGER, defaultValue: 0
        }
    }
);
const category = sequelize.import(__dirname + '/category.js');
category.hasMany(post);
post.belongsTo(category);
post.hasMany(comment);
comment.belongsTo(post);
const model = {
    sequelize : sequelize,
    category : category,
    post: post,
    comment: comment
}
module.exports = model
