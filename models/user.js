const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Definição do modelo de usuário

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Criptografar senha antes de salvar no banco de dados

User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;