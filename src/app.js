const express = require('express');
const path = require('node:path');
const fs = require('node:fs');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const caminhoBancoUsuarios = path.resolve(__dirname, './data/usuarios.json');

app.get('/', async (req, res) => {
    
    const usuariosBanco = JSON.parse(fs.readFileSync(caminhoBancoUsuarios, 'utf-8'));
    const usuarioLogado = usuariosBanco.find(usuario => usuario.logado)
    res.render('index', { usuarioLogado });
    
})

app.post('/', (req, res) => {
    
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    })
    
    req.on('end', () => {

        const usuariosBanco = JSON.parse(fs.readFileSync(caminhoBancoUsuarios, 'utf-8'));
        const usuarioLogado = usuariosBanco.find(usuario => usuario.logado);   
        
        if (!usuarioLogado) {
            res.send('Nenhuma conta logada.');
            return;
        }
        
        try {
            const marcaocaoObj = JSON.parse(body);
            const taskAlvo = usuarioLogado.tasks.find(task => task.taskName === marcaocaoObj.taskName);
            console.log(taskAlvo);
            taskAlvo.markup = marcaocaoObj.markup;
            salvarUsuarioBanco(usuariosBanco);
            return
        } catch (err) {}


        if (body.length > 40) {
            res.send('A task não pode conter mais de 40 caracteres.');
            return;
        }

        if (usuarioLogado.tasks.find(task => task === body)) {
            res.send('Essa task já existe.');
            return;
        }

        usuarioLogado.tasks.push({ taskName: body, markup: false });
        salvarUsuarioBanco(usuariosBanco);

        res.sendStatus(200);
    })
    
})

app.get('/cadastro', (req, res) => {
    
    res.render('cadastro');
    
})

app.post('/cadastro', (req, res) => {
    
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    })
    
    req.on('end', () => {
        
        try {
            const novoUsuario = JSON.parse(body);

            const { nome, email, senha } = novoUsuario;

            const erros = new Array();
            erros.push(validarSenha(senha));
            erros.push(validarEmail(email));
            erros.push(validarNome(nome));

            const erroEncontrado = erros.find(erro => typeof erro === 'string')
            if (erroEncontrado) {
                res.send(erroEncontrado);
                return
            }

            const usuariosBanco = JSON.parse(fs.readFileSync(caminhoBancoUsuarios, 'utf-8'));

            if (usuariosBanco.find(usuario => usuario.email === novoUsuario.email)) {
                res.send('O email já está cadastrado.');
                return;
            }
            

            usuariosBanco.forEach(usuario => {
                usuario.logado = false;
            })

            usuariosBanco.push({logado: true, ...novoUsuario, tasks: []});
            salvarUsuarioBanco(usuariosBanco);  

            res.redirect(301, '/');
        } catch (err) {
            res.sendStatus(400);
        }


    })

})

app.get('/login', (req, res) => {

    res.render('login');

})

app.post('/login', (req, res) => {

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    })

    req.on('end', () => {


        try {
            const usuarioBusca = JSON.parse(body);
            const usuariosBanco = JSON.parse(fs.readFileSync(caminhoBancoUsuarios, 'utf-8'));
            const usuarioEncontrado = usuariosBanco.find(usuario => usuario.email === usuarioBusca.email);

            if (!usuarioEncontrado) {
                res.send('O usuario não foi encontrado.');
                return;
            }

            usuarioEncontrado.logado = true;

            salvarUsuarioBanco(usuariosBanco);

            res.redirect(301, '/');
        } catch (err) {
            res.sendStatus(400);
        }


    })

})





const PORT = 8080;

app.listen(PORT, () => {
    console.log('Iniciando servidor...');
})







function validarNome (nome) {
    if (nome.length < 3) {
        return 'O nome precisa de pelo menos 3 caracteres';
    }
    if (nome.length > 30) {
        return 'O nome não pode ter mais de 30 caracteres';
    }
    if (!/^[a-z ]+$/i.test(nome)) {
        return 'O nome só pode conter caracteres alfabéticos';
    }
    return true;
}

function validarEmail (email) {
    const regexEmail = /^[a-zA-Z]+@[a-z]+\.[a-z]+$/;

    if (!regexEmail.test(email)) {
        return 'O email é inválido!';
    }
    if (email.length > 40) {
        return 'O email é maior que o possível';
    }

    return true;
}

function validarSenha (senha) {
    const regexSenha = /^[a-z\d*\.]+$/i;

    if (senha.length < 6) {
        return 'A senha precisa de 6 caracteres no mínimo';
    }
    if (!regexSenha.test(senha)) {
        return 'A senha não pode ter caracteres inválidos';
    }
    if (senha.length > 30) {
        return 'A senha é maior que o possível';
    }
    if (!/[a-z]/g.test(senha)) {
        return 'A senha precisa de 1 caractere minúsculo no mínimo';
    }
    if (!/[A-Z]/g.test(senha)) {
        return 'A senha precisa de 1 caractere maiúsculo no mínimo';
    }

    return true;
}

function salvarUsuarioBanco (usuariosBanco) {
    fs.writeFileSync(caminhoBancoUsuarios, JSON.stringify(usuariosBanco), 'utf-8');
}