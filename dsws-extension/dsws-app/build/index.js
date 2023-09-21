"use strict";
const dropContainer = document.getElementById("dropContainer");
const dropContainerText = document.getElementById("dropContainerText");
const fileInput = document.getElementById("fileInput");
// Se algum arquivo for enviado pelo botão mostrar também no container.
fileInput.addEventListener("input", () => {
    if (dropContainer && fileInput.files) {
        dropContainer.innerHTML = "<strong>Arquivo selecionado:</strong>&nbsp;" + fileInput.files[0].name;
    }
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
            dropContainerText.innerHTML = "<strong>Arquivo selecionado:</strong>&nbsp;" + e.dataTransfer.files[0].name;
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
