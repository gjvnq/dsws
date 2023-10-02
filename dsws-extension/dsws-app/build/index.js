"use strict";
const dropContainer = document.getElementById("dropContainer");
const dropContainerText = document.getElementById("dropContainerText");
const fileInput = document.getElementById("fileInput");

var obj;
var asset_ids = [];
const urlInput = document.getElementById("urlInput");

// Se algum arquivo for enviado pelo botão mostrar também no container.
fileInput.addEventListener("input", () => {
    if (dropContainer && fileInput.files) {
        var zip= new JSZip();
        dropContainer.innerHTML = "<strong>Arquivo selecionado:</strong>&nbsp;" + fileInput.files[0].name;
        var file=fileInput.files[0]
        var text="";
        zip.loadAsync(file).then(function(zip) {
        	Object.keys(zip.files).forEach(function(file){
                text = text + "<strong>Arquivo selecionado:</strong>&nbsp;" + file + "<br>";
        		zip.files[file].async('string').then(function (fileData) {
                    // Guarda "routes2.json"
                    if (file === "routes2.json") obj = JSON.parse(fileData);
        		})
        	})
            dropContainer.innerHTML=text;
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