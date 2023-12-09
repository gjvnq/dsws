var DswsFilename: String = "";

let dropContainer = document.getElementById("dropContainer") as HTMLElement;

let dropContainerText = document.getElementById("dropContainerText") as HTMLElement;
let fileInput = document.getElementById("fileInput") as HTMLInputElement;
let fileButton = document.getElementById("fileButton") as HTMLElement;

let navBar = document.getElementById("navBar") as HTMLDivElement;
let backBtn = document.getElementById("backBtn") as HTMLButtonElement;
let forwardBtn = document.getElementById("forwardBtn") as HTMLButtonElement;
let pageName = document.getElementById("pageName") as HTMLDivElement;

let mainIframe = document.getElementById("main-iframe") as HTMLIFrameElement;

let obj: Record<string, any> | undefined;
let asset_ids: string[] = [];

var pageLang: string = "";
var prevPage: string;

window.onload = function(){
    dropContainer = document.getElementById("dropContainer") as HTMLElement;
    dropContainerText = document.getElementById("dropContainerText") as HTMLElement;
    fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileButton = document.getElementById('fileButton') as HTMLElement;
    
    navBar = document.getElementById("navBar") as HTMLDivElement;
    backBtn = document.getElementById("backBtn") as HTMLButtonElement;
    forwardBtn = document.getElementById("forwardBtn") as HTMLButtonElement;
    pageName = document.getElementById("pageName") as HTMLDivElement;

    mainIframe = document.getElementById("main-iframe") as HTMLIFrameElement;

    if (dropContainer && dropContainerText && fileInput && fileButton && navBar && backBtn && forwardBtn && mainIframe){

        fileButton.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener("input", onFileInput);
        dropContainer.addEventListener("dragover", (e) => { e.preventDefault() });
        dropContainer.addEventListener("drop", (e) => { onDrop(e) });

        backBtn.addEventListener("click", () => {
            prevPage = mainIframe.contentWindow!.location.href;

            mainIframe.contentWindow?.history.back();
        });

        forwardBtn.addEventListener("click", () => {
            mainIframe.contentWindow?.history.forward();
        });
    }
    else {
        alert("Extensão carregada incorretamente, favor recarregá-la!");
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
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file});
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
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        fileContent.style.display = 'none';
        // Show iframe's navigation bar
        navBar.style.display = "block";
        // Idiomas preferidos do usuário
        let languages = navigator.languages;
        console.log("Idiomas preferidos: " + languages);
        // Idiomas preferidos mais string vazia, levando ao "index" se não achar nenhuma
        let langs: string[] = [];
        languages.forEach(function (l){
            langs.push(l);
        })
        langs.push("");
        // Função recursiva para procurar
        testLanguage(el, langs, 0);
    }
});

function testLanguage(iframe :HTMLIFrameElement, languages :string[], index :number){
    // Esconde o iframe enquanto procura os idiomas preferidos.
    iframe.style.display = "none";
    pageLang = languages[index];
    var url = chrome.runtime.getURL(DswsFilename+"/"+pageLang);
    console.log(url);
    iframe.src = url;
    iframe.onload = function(){
        let page;
        try {
            // Se o iframe carregar uma pagina existente, ou seja, achar o idioma
            page = (iframe.contentWindow?.document || iframe.contentDocument) as Document;
            console.log(page.body.childNodes.length);
            // Change navigation bar page name
            let cleanUrl = iframe.contentWindow!.location.href as string;
            let urlArray = cleanUrl.split("/");
            pageName.innerText = urlArray.slice(3).join("/");

            if (pageLang === "" || pageLang === undefined) console.log("Conseguiu carregar o iframe padrão (index)!");
            else console.log("Conseguiu carregar o iframe em "+ pageLang +"!");
            // Mostra o iframe carregado
            iframe.style.display = "block";
            return;
        } catch (error) {
            // Se não achar o idioma procura a próxima linguagem
            if (pageLang === undefined) {
                console.log("Tentativar de voltar na primeira página!");
                mainIframe.contentWindow!.location.href = prevPage;
                iframe.style.display = "block";
            }
            else{ 
                console.log("Não encontrou o idioma "+pageLang+", procurando o próximo!");
                testLanguage(iframe, languages, ++index);
            }
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