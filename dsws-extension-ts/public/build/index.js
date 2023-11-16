"use strict";

var dropContainer = document.getElementById("dropContainer");
var urlInput = document.getElementById("urlInput");

var dropContainerText = document.getElementById("dropContainerText");
var fileInput = document.getElementById("fileInput");
var fileButton = document.getElementById('fileButton');

var obj;
var asset_ids = [];

// Ao terminar de carregar a página inteira executa a função.
window.onload = function(){
    dropContainer = document.getElementById("dropContainer");
    urlInput = document.getElementById("urlInput");

    dropContainerText = document.getElementById("dropContainerText");
    fileInput = document.getElementById("fileInput");
    fileButton = document.getElementById('fileButton');
    // Checa se os elementos da página foram carregados corretamente.
    if (dropContainer && urlInput && dropContainerText && fileInput && fileButton){
        //Se algum click for dado no link "browse" aciona o fileInput
        fileButton.addEventListener('click', () => {
            // Acionar o clique no input de arquivo
            fileInput.click();
        });
        // Faz o link entre o clique no botão com a função onFileInput
        fileInput.addEventListener("input", onFileInput);
        // Ao arrastar um arquivo ao container não abrir uma nova aba
        dropContainer.addEventListener("dragover", (e) => { e.preventDefault() });
        // Faz o link entre o container com a função onDrop
        dropContainer.addEventListener("drop", (e) => { onDrop(e) });
    }
    else {
        alert("Página carregada incorretamente, favor recarregá-la!");
    }
}


function changeContainerText(file){
    dropContainerText.innerHTML = '<strong>Arquivo selecionado:</strong>&nbsp;' + 
    file.files[0].name +                 
    '<br><a id="fileButton">browse another file</a>' +
    '<input type="file" id="fileInput"></p>';

    // Re-linka os elementos criados.
    fileButton = document.getElementById("fileButton");
    fileInput = document.getElementById("fileInput");
    // Checa se os elementos foram carregados corretamente.
    if (fileButton && fileInput){
        fileButton.addEventListener('click', () => {
            // Acionar o clique no input de arquivo
            fileInput.click();
        });
        // Faz o link entre o clique no botão com a funçao onFileInput
        fileInput.addEventListener("input", onFileInput);
    }
    else {
        alert("Página carregada incorretamente, favor recarregá-la!");
    }
}

// Função para unzipar o .dsws
function unzipDSWS(dsws) {
    // Checa se o arquivo possui extensão .dsws
    if (((dsws.name).split('.').pop()).localeCompare("dsws") === 0){
        let zip = new JSZip();
        let text = "";
        zip.loadAsync(dsws).then(function(zip) {
        	Object.keys(zip.files).forEach(function(file){
                text = text + "<strong>Arquivo selecionado:</strong>&nbsp;" + file + "<br>";
        		zip.files[file].async('string').then(function (fileData) {
                    // Guarda "routes_tree.json"
                    if (file === "routes_tree.json") obj = JSON.parse(fileData);
        		})
        	})
            dropContainerText.innerHTML=text;
        })
    }
    else alert("Arquivo fornecido não possui a extensão .dsws!");
}

// Função que é executada ao clicar no botão
function onFileInput() {
    // Se algum arquivo for enviado pelo botão
    if (fileInput.files) {
        // Unzipa o .dsws
        let file = fileInput.files[0];
        unzipDSWS(file);
        // Mostrar no container.
        if (dropContainer) changeContainerText(fileInput);
    }
}

// Função que é executada ao arrastar um arquivo ao container
function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer) {
        console.log(e.dataTransfer.files[0].name);
        // Se algum arquivo for arrastado ao container mostrar seu nome no próprio container.
        changeContainerText(e.dataTransfer);
        // Le o arquivo arrastado
        let dT = new DataTransfer();
        dT.items.add(e.dataTransfer.files[0]);
        // Se algum arquivo for arrastado ao container mostrar também no input.
        if (fileInput) fileInput.files = dT.files;
        // Unzipa o .dsws
        let file = dT.files[0];
        unzipDSWS(file);
    }
};

// Busca o "asset_id" do arquivo "file" desejado no JSON "obj".
function findAssetID(obj, file) {
  // Itera o JSON "obj" e obtém suas chaves e valores.
  Object.entries(obj).some(([key, value]) => {
    // Se for uma "response" quer dizer que já iterou pelo pai e não é a "file", então para.
    if (key === "response") return false;
    // Se achar o arquivo guarda seu "asset_id" acessando sua "response" filha.
    else if (key === file) {
      console.log(key + " " + value["response"]["asset_id"]);
      asset_ids.push(value["response"]["asset_id"]);
      return true;
    }
    // Se houver objetos filhos faz a recursão da função.
    else if (value) return findAssetID(value, file);
    // Se não achar e não tiver filhos para.
    else return false;
  });
};

// Função que roda ao clicar no botão para teste.
function urlButtonClick(){
    let file = urlInput.value;
    if (!obj) {
        alert("Primeiro de upload do(s) arquivos! \nOu espere um pouco serem processados!");
        return -1;
    }
    
    if (file.length === 0) file = "alignment.html";
    findAssetID(obj, file);

    if (asset_ids.length > 0) alert("asset_id(s) de " + file + ":\n" + asset_ids.join("\n"));
    else alert("Url não encontrado!");

    asset_ids = [];
};