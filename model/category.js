module.exports = function(sequelize, DataTypes) {
    return sequelize.define('categories', {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        alias: {
            type: DataTypes.STRING, unique: true
        },
        thumbnail: DataTypes.STRING
    });
}