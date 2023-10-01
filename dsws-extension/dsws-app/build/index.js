"use strict";
const dropContainer = document.getElementById("dropContainer");
const dropContainerText = document.getElementById("dropContainerText");
const fileInput = document.getElementById("fileInput");
// Se algum arquivo for enviado pelo botão mostrar também no container.
fileInput.addEventListener("input", () => {
    if (dropContainer && fileInput.files) {
        var zip= new JSZip();
        dropContainer.innerHTML = "<strong>Arquivo selecionado:</strong>&nbsp;" + fileInput.files[0].name;
        var file=fileInput.files[0]
        var text="";
        zip.loadAsync(file).then(function(zip) {
        	Object.keys(zip.files).forEach(function(file){
        		zip.files[file].async('string').then(function (fileData) {
        			text= text+"<strong>Arquivo selecionado:</strong>&nbsp;" + file+"<br>";
        			dropContainer.innerHTML=text;
        		})
        	})
        })
        
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
