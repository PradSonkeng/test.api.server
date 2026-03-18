'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Message.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author'
      });

      models.Message.hasMany(models.Like, {
        foreignKey: 'messageId',
        as: 'likes'
      });

      models.Message.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'messageId',
        otherKey: 'userId',
        as: 'likedByUsers'
      });
    }
  }
  Message.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    attachment: DataTypes.STRING,
    likes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};