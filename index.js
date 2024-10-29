require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const session = require('express-session');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');


// Está sendo utilizado para armazenar os dados do usuário que está logado
app.use(session({
    secret: 'senhaforte1111',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(bodyParser.urlencoded({extended: true}));

// Sicronizando Banco de dados e criando um usuário
sequelize.sync({force: true}).then(() => {
    console.log('Banco de dados sicronizado..');
    User.create({name: 'Flávio', email: 'flavio@gmail.com', password: '123456' });
});

// Rota para formulário de cadastro
app.get('/cadastrar', (req, res) => {
    res.render('cadastrar');
});

app.post('/registrar', async (req, res) => {
    const {name, email, password} = req.body;

    try {
    const novoUsuario = await User.create({name, email, password});
    console.log('Usuário cadastrado com sucesso.', novoUsuario);
    res.render('index', {msg: 'Usuário cadastrado com sucesso.'});
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.render('index', {msg: 'Erro ao cadastrar usuário.'});
    }
});



// Rota para buscar todos os usuários
app.get('/users/email/:email', (req, res) => {
    const email = req.params.email;


    User.findOne({where: {email: email}}) // Método para buscar pelo email
        .then(users => {
            if(users) {
            res.render('user', {users});
            } else {
                res.render('index', {msg: 'Usuário não encontrado.'});
            }
        })
        .catch(error => {
            console.log('Erro ao buscar usuários:', error);
            res.render('index', {msg: 'Erro ao processar a solicitação'})
        })
});

// Rota para formulário de atualização usuário

app.get('/users/update/:email', (req, res) => {
    User.findOne({where: {email: req.params.email}}) // Buscar usuário pelo email

    .then(user => {
        if(user) {
            res.render('update', {user});
        } else {
            res.redirect('home');
        }
    })
    .catch(error => {
        console.log('Erro ao buscar usuário para edição:', error);
        res.redirect('home');
    })
});

// Rota de atualizar usuário
app.post('/users/update/:email', (req, res) => {
    console.log(req.body);
    const {name, email, password} = req.body;

    // Criptografa a senha atualizada
    const hashedPassword = bcrypt.hashSync(password, 10);
    User.update({name, email, password: hashedPassword},  { where: {email: req.params.email}})
    .then(() => {
        console.log('Usuário atualizado com sucesso.');
        res.redirect('/', {msg: 'Usuário atualizado com sucesso.'}); // Redireciona após a atualização
    })
    .catch(error => {
        console.log('Erro ao atualizar usuário:', error);
        res.redirect('/');
    })
});

// Rota para excluir usuário

app.get('/users/delete/:email',(req, res)=>{
    const email = req.params.email;
    res.render('delete', {email: email})
});

app.post('/users/delete/:email', async (req, res) => {
   const email = req.params.email;
   
   try {
    const result = await User.destroy({ where: { email: email } });
    
    if (result === 0) {
        console.log('Nenhum usuário encontrado com esse e-mail');
        res.render('index', { msg: 'Usuário não encontrado' });
    } else {
        console.log('Usuário excluído com sucesso');
        res.render('index', { msg: 'Usuário excluído com sucesso' });
    }
} catch (error) {
    console.log('Erro ao excluir usuário:', error);
    res.render('index', { msg: 'Erro ao excluir usuário' });
}

});


// Rota Raiz (index)
app.get('/', (req, res) => {
    res.render('index', {msg: ''});
});

app.get('/login', (req, res) => {
    const email = req.session.userEmail;
    res.render('home', {email: email});
});

// Rota de Login
app.post('/login', (req, res) => {
    const {usuario, senha} = req.body;

    User.findOne({where: {
        [Op.or]: [
            {name: usuario}, // Buscar usuário pelo nome
            {email: usuario} // Buscar usuário pelo email
        ]
    }})
        .then(user => {
            if(user) {
                bcrypt.compare(senha, user.password, (err, match) => {
                    if(err) {
                        console.log('Erro ao comparar senhas', err);
                        return res.render('index', {msg: 'Erro ao processar solicitação.'});
                    }

                    // Se a senha for correta
                    if(match) {
                        req.session.userEmail = user.email;
                        res.render('home', {email: user.email});
                    } else {
                        res.render('index', {msg: 'Senha incorreta.'});
                    }
                });
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
