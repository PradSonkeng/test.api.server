'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Like.belongsTo(models.Message, {
        foreignKey: 'messageId',
        as: 'message'
      });

      models.Like.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Like.init({
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Like',
    indexes: [
      {
        unique: true,
        fields: ['messageId', 'userId']
      }
    ]
  });
  return Like;
};