require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const User = require('./models/user');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// Sicronizando Banco de dados e criando um usuário
sequelize.sync({force: true}).then(() => {
    console.log('Banco de dados sicronizado..');
    User.create({name: 'Flávio', email: 'flavio@gmail.com', password: '123456' });
});

// Rota para buscar todos os usuários
app.get('/users', (req, res) => {
    User.findAll()
        .then(users => {
            res.render('users', {users});
        })
        .catch(error => {
            console.log('Erro ao buscar usuários:', error);
            res.render('index', {msg: 'Erro ao processar a soliciação'})
        })
});


// Rota Raiz (index)
app.get('/', (req, res) => {
    res.render('index', {msg: ''});
});

// Rota de Login
app.post('/login', (req, res) => {
    const {usuario, senha} = req.body;

    User.findOne({where: {email: 'flavio@gmail.com'}})
        .then(user => {
            if(user) {
                res.render('home', {email: 'flavio@gmail.com'});
            } else {
                res.render('index', {msg:'Usuário não existente.'});
            }
        })
        .catch(error => {
            console.log('Erro ao buscar usuário:', error);
            res.render('index', {msg: 'Erro ao processar a solicitação.'});
        })
});


// Rota de Logout
app.get('/logout', (req, res) => {
    res.render('index', {msg: 'Usuário desconectado com sucesso.'});
});


// Servidor na porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});