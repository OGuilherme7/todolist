const spanErros = document.querySelector('.erros');

document.querySelector('#criar-task').addEventListener('click', async () => {
    const contentTaskInput = document.querySelector('#task');
    const contentTask = contentTaskInput.value;

    const corpoResposta = await (await fetch(location.href, {
        method: 'POST',
        body: contentTask
    })).text()

    if (corpoResposta === 'OK') {
        spanErros.innerText = '';
        const li = document.createElement('li');
        const span = document.createElement('span');
        const divSquareTask = document.createElement('div');
        
        divSquareTask.classList.add('square-task');
        span.innerText = contentTask;
        li.append(span, divSquareTask);
        
        const ulSectionTasks = document.querySelector('.tasks ul');
        ulSectionTasks.appendChild(li);
        
        contentTaskInput.value = '';
    } else {
        spanErros.innerText = corpoResposta;
    }
    
})  




document.querySelector('.tasks ul').addEventListener('click', async (evt) => {
    const { target } = evt

    let divSquareTask;
    if (target.classList?.[0] === 'square-task' || target.src) {
        divSquareTask = target.src ? target.parentNode : target;
    } else {
        return;
    }

    const marcacaoObj = { taskName: divSquareTask.parentNode.querySelector('span').innerText };

    if (divSquareTask.children.length > 0) {
        marcacaoObj.markup = false;

        divSquareTask.innerHTML = '';
    } else {
        marcacaoObj.markup = true;

        const img = document.createElement('img');
        img.src = 'images/correto-task.png';
        img.width = 13;
        img.height = 13;
        divSquareTask.appendChild(img);
    }

    console.log(marcacaoObj);

    await fetch(location.href, {
        method: 'POST',
        body: JSON.stringify(marcacaoObj)
    })
})

