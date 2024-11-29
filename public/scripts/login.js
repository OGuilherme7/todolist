const spanErros = document.querySelector('.erros'); 

document.querySelector('form').addEventListener('submit', async function (evt) {
    evt.preventDefault();

    const email = document.querySelector('#email').value;
    const senha = document.querySelector('#senha').value;

    const usuario = { email, senha };

    const resposta = await fetch(location.href, {
        method: 'POST',
        body: JSON.stringify(usuario)
    })


    if (resposta.redirected) {
        location.href = resposta.url;
    } else if (resposta.status === 400) {
        spanErros.innerText = 'Dados Enviados Inválidos';
    } else {
        spanErros.innerText = await resposta.text();
    }
    
})


