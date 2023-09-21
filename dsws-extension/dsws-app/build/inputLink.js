"use strict";
// Referências aos elementos HTML
const botaoArquivo = document.getElementById('fileButton');
const inputArquivo = document.getElementById('fileInput');

// Adicionar um ouvinte de evento de clique ao botão/link
botaoArquivo.addEventListener('click', () => {
    // Acionar o clique no input de arquivo
    inputArquivo.click();
});

// Adicionar um ouvinte de evento de alteração ao input de arquivo
inputArquivo.addEventListener('change', () => {
    // Exibir o nome do arquivo selecionado no botão/link
    botaoArquivo.textContent = inputArquivo.files[0] ? inputArquivo.files[0].name : 'Selecione um arquivo';
});