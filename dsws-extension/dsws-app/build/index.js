"use strict";
const dropContainer = document.getElementById("dropContainer");
const dropContainerText = document.getElementById("dropContainerText");
const fileInput = document.getElementById("fileInput");
var fileButton = document.getElementById('fileButton');

function changeContainerText(file){
    dropContainerText.innerHTML = '<strong>Arquivo selecionado:</strong>&nbsp;' + 
    file.files[0].name + 
    '<p id="dropContainerText">' +                     
    '<a id="fileButton">browse another file</a>' +
    '<input type="file" id="fileInput"></p>';

    fileButton = document.getElementById('fileButton');

    fileButton.addEventListener('click', () => {
        // Acionar o clique no input de arquivo
        fileInput.click();
    });

}
// Se algum arquivo for enviado pelo botão mostrar também no container.
fileInput.addEventListener("input", () => {
    if (dropContainer && fileInput.files) {
        changeContainerText(fileInput);
    }
});

//Se algum click for dado no link "browse" aciona o fileInput
fileButton.addEventListener('click', () => {
    // Acionar o clique no input de arquivo
    fileInput.click();
});

// Ao arrastar um arquivo ao container não abrir uma nova aba.
if (dropContainer) {
    dropContainer.ondragover = function (e) {
        e.preventDefault();
    };
    dropContainer.ondrop = function (e) {
        e.preventDefault();
        // Se algum arquivo for arrastado ao container mostrar seu nome no próprio container.
        if (e.dataTransfer) {
            console.log(e.dataTransfer.files[0].name);
            changeContainerText(e.dataTransfer);
            // Se algum arquivo for arrastado ao container mostrar também no input.
            if (fileInput) {
                const dT = new DataTransfer();
                dT.items.add(e.dataTransfer.files[0]);
                fileInput.files = dT.files;
            }
        }
    };
}
;
