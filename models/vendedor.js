const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const vendedor = sequelize.define('vendedor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    }
});

User.hasOne(vendedor, { foreignKey: 'userId' });
vendedor.belongsTo(User, { foreignKey: 'userId' });

module.exports = vendedor;
