var DswsFilename: String = "";
"use strict";

// var port = chrome.runtime.connect({name: "dsws-frontend"});

document.addEventListener('DOMContentLoaded', function() {
    console.log("Hello2");
    const el = document.getElementById("fileInput") as HTMLInputElement;
    el.disabled = false;
    el.addEventListener('change', async (e) => {
        console.log("Hello3a");
        console.log(e);
        let file = el.files!.item(0);
        DswsFilename = file!.name;
        console.log('file', file);
        // process_zip(file!);
        // chrome.runtime.sendMessage({'action': 'openDswsFile', 'file': file, 'buf': buf});
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file})
    })
});

(navigator as Navigator).serviceWorker.addEventListener('message', (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
    const message = event.data;
    let fileContent = document.getElementById("FileContainer") as HTMLElement;

    if (message.event == 'dswsReady') {
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        fileContent.style.display = 'none';
        // Idiomas preferidos do usuário
        let languages = navigator.languages;
        console.log("Idiomas preferidos: " + languages);
        // Idiomas preferidos mais string vazia, levando ao "index" se não achar nenhuma
        let langs: string[] = [];
        languages.forEach(function (l){
            langs.push(l);
        })
        langs.push("");
        // Esconde o iframe enquanto procura os idiomas preferidos.
        el.style.display = "none";
        // Função recursiva para procurar
        testLanguage(el, langs, 0);
    }
});


function testLanguage(iframe :HTMLIFrameElement, languages :string[], index :number){
    var url = chrome.runtime.getURL(DswsFilename+"/"+languages[index]);
    console.log(url);
    iframe.src = url;
    iframe.onload = function(){
        let page;
        try {
            // Se o iframe carregar uma pagina existente, ou seja, achar o idioma
            page = (iframe.contentWindow?.document || iframe.contentDocument) as Document;
            console.log(page.body.childNodes.length);
            if (languages[index] === "") console.log("Conseguiu carregar o iframe padrão (index)!");
            else console.log("Conseguiu carregar o iframe em "+ languages[index] +"!");
            // Mostra o iframe carregado
            iframe.style.display = "block";
            return;
        } catch (error) {
            // Se não achar o idioma procura a próxima linguagem
            console.log("Não encontrou o idioma "+languages[index]+", procurando o próximo!");
            testLanguage(iframe, languages, ++index);
        }
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('onMessage', message, sender, sendResponse);
    let fileContent = document.getElementById("FileContainer") as HTMLElement;

    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        console.log(url);
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        fileContent.style.display = 'none';
        el.src = url;
        // chrome.runtime.sendMessage({'action': 'getBlobForUrl', 'url': '/', dsws_filename: DswsFilename}, async (reply) => {
        //     const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        //     // console.log("got reply", reply);
        //     // const url = URL.createObjectURL(reply);
        //     // console.log(url);
        //     // el.src = url;
        // });
    }
});


let dropContainer = document.getElementById("dropContainer") as HTMLElement;
let urlInput = document.getElementById("urlInput") as HTMLInputElement;

let dropContainerText = document.getElementById("dropContainerText") as HTMLElement;
let fileInput = document.getElementById("fileInput") as HTMLInputElement;
let fileButton = document.getElementById('fileButton') as HTMLElement;

let obj: Record<string, any> | undefined;
let asset_ids: string[] = [];

window.onload = function(){
    dropContainer = document.getElementById("dropContainer") as HTMLElement;
    urlInput = document.getElementById("urlInput") as HTMLInputElement;
    dropContainerText = document.getElementById("dropContainerText") as HTMLElement;
    fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileButton = document.getElementById('fileButton') as HTMLElement;

    if (dropContainer && urlInput && dropContainerText && fileInput && fileButton){
        fileButton.addEventListener('click', () => {
            fileInput.click();
    });
        fileInput.addEventListener("input", onFileInput);
        dropContainer.addEventListener("dragover", (e) => { e.preventDefault() });
        dropContainer.addEventListener("drop", (e) => { onDrop(e) });
    }
    else {
        alert("Página carregada incorretamente, favor recarregá-la!");
    }
}

function changeContainerText(file: any){
    // Restante do seu código...
}

function unzipDSWS(dsws: any) {
    // Restante do seu código...
}

function onFileInput() {
    // Restante do seu código...
}

function onDrop(e: any) {
    let file = e.dataTransfer.files;
    DswsFilename = file!.name;
    console.log('file', file);
    // process_zip(file!);
    // chrome.runtime.sendMessage({'action': 'openDswsFile', 'file': file, 'buf': buf});
    (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file})
};

function findAssetID(obj: Record<string, any> | undefined, file: string) {
    if (!obj) return; // Verifica se 'obj' é indefinido
    // Restante do seu código...
};

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