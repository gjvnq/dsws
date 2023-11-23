var DswsFilename: String = "";

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

function onDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
        console.log((e.dataTransfer as DataTransfer).files[0].name);
        // Se algum arquivo for arrastado ao container mostrar seu nome no próprio container.
        changeContainerText(e.dataTransfer);
        // Le o arquivo arrastado
        let dT = new DataTransfer();
        dT.items.add((e.dataTransfer as DataTransfer).files[0]);
        // Se algum arquivo for arrastado ao container mostrar também no input.
        if (fileInput) (fileInput as HTMLInputElement).files = dT.files;
        // Unzipa o .dsws
        let file = dT.files[0];
        DswsFilename = file!.name;
        console.log('file', file);
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file})

    }
}
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
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file})
    })
});

(navigator as Navigator).serviceWorker.addEventListener('message', (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
    const message = event.data;
    let fileContent = document.getElementById("FileContainer") as HTMLElement;

    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        console.log(url);
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        fileContent.style.display = 'none';        
        el.src = url;
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('onMessage', message, sender, sendResponse);
    let fileContent = document.getElementById("FileContainer") as HTMLElement;

    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        console.log(url);
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        fileContent.style.display = 'none';
        el.src = url;
    }
});


function changeContainerText(file: any){
    // Restante do seu código...
}

function unzipDSWS(dsws: any) {
    // Restante do seu código...
}

function onFileInput() {
    // Restante do seu código...
}

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