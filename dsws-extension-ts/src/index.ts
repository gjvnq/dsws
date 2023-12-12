import { animateElements } from "./animations";

var DswsFilename :String = "";
let dropContainer :HTMLElement;
let dropContainerText :HTMLElement;
let fileInput :HTMLInputElement;
let fileButton :HTMLElement;

let navBar :HTMLDivElement;
let backButton :HTMLButtonElement;
let forwardButton :HTMLButtonElement;
let pageName :HTMLInputElement;
let mainIframe :HTMLIFrameElement;
let footerIframe :HTMLIFrameElement;

let object :Record<string, any> | undefined;
let fileContainer : HTMLElement;

var prevPage: string;

// Calls $initializePage and $animateElements after page load.
window.onload = function() { 
    initializePage(); 
    animateElements();
}

// $initializePage retrieve the HTML Elements and add the necessary 
// EventsListener's.
function initializePage() :void {
    initializeElements();
    if (correctlyInitialized()) {
        addEventsListeners();
    } else {
        alert("Page wasn't loaded correctly, please reload the extension!")
    }
}

// $initializeElements function initialize the HTML Elements from the HTML file
// That will be used in the javascript.
function initializeElements() :void{
    dropContainer = document.getElementById("drop-container") as HTMLElement;
    dropContainerText = document.getElementById("drop-container-text") as HTMLElement;
    fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileButton = document.getElementById("file-button") as HTMLElement;
    fileContainer = document.getElementById("file-container") as HTMLElement;
    navBar = document.getElementById("url-bar") as HTMLDivElement;
    backButton = document.getElementById("back-button") as HTMLButtonElement;
    forwardButton = document.getElementById("forward-button") as HTMLButtonElement;
    pageName = document.getElementById("page-name") as HTMLInputElement;
    mainIframe = document.getElementById("main-iframe") as HTMLIFrameElement;
    footerIframe = document.getElementById("footer") as HTMLIFrameElement;
    (navigator as Navigator).serviceWorker.addEventListener('message', (event) => { handleMessage(event) });
}

// $correctlyInitialized function checks if the HTML Elements were 
// Correctly initialized.
// Returns:
// true if elements correctly initialized and false instead.
function correctlyInitialized() :Boolean {
    if (dropContainer && dropContainerText && fileInput && fileButton &&
        navBar && backButton && forwardButton && mainIframe){
        return true;
    }
    return false;
}

// $addEventListeners function handle adding the @fileInput, @fileButton and
// @dropContainer eventsListeners to check when an event will occur.
function addEventsListeners() :void {
    fileInput.addEventListener('change', async(e) => {onFileInput(e);});
    fileButton.addEventListener('click', (e) => {fileInput.click();fileInput.value="";e.stopImmediatePropagation();});
    dropContainer.addEventListener('dragover', (e) => { e.preventDefault() });
    dropContainer.addEventListener('drop', (e) => { onDrop(e) });
    
    backButton.addEventListener("click", () => {
        if (isCrossOrigin(mainIframe)) history.back();
        else{
            prevPage = mainIframe.contentWindow!.location.href;
            mainIframe.contentWindow?.history.back();
        }
    });

    forwardButton.addEventListener("click", () => {
        if (isCrossOrigin(mainIframe)) history.forward();
        else mainIframe.contentWindow?.history.forward();
    });

    mainIframe.addEventListener("load", () => {
        if (isCrossOrigin(mainIframe)){
            pageName.value = "#external-page";
        }
        else{
            mainIframe.classList.remove('hidden');
            let cleanUrl :string = mainIframe.contentWindow!.location.href as string;
            let urlArray :string[] = cleanUrl.split("/");
            pageName.value = urlArray.slice(3).join("/");
            footerIframe.classList.add('hidden');
        }
    });
}

// $isCrossOrigin function checks if an iframe loaded a page from external
// sources, returning true if so and false if not. 
function isCrossOrigin(iframe :HTMLIFrameElement) {
    let html = null;
    try { 
      var doc = (iframe.contentDocument || iframe.contentWindow!.document);
      html = doc.body.innerHTML;
    } catch(err){
      console.log("Error on cross-origin: "+err);
    }
    return(html === null);
}

// $handleMessage function handle the MessageEvent when a dsws file is sent
// If we have a dsws file try to display it in the page.
function handleMessage(event: MessageEvent){
    const message :MessageEvent | any = event.data;
    if (message.event == 'dswsReady') {
        fileContainer.style.display = 'none';
        navBar.style.display = "flex";
        let languages = retrieveLanguages();
        tryLanguages(languages);
        resetIframe();
        // Clean the history so that previous file paths don't cause errors.
        chrome.history.deleteAll();
    }
}

// $resetIframe function resets the main iframe so that the tested languages
// don't appear on the browser's and the iframe's history.
function resetIframe(){
    let container = mainIframe.parentElement;
    let url = mainIframe.src;
    mainIframe.remove();
    mainIframe.setAttribute("src", url);
    container?.append(mainIframe);
    mainIframe.style.display = "block";
}

// $onFileInput function handle file input event, if a file was uploaded,
// Check if there is a file and if its not a null object and then navigate
// to that file.
function onFileInput(event :Event) :void {
    if (fileInput.files && fileInput.files.length > 0) {
        const transferedFile :File | null = fileInput.files.item(0);
        if (transferedFile) {
            navigateToFile(transferedFile);
        } else {
            alert('File object is null');
        }
    } else {
        alert('No file selected');
    }
    event.stopImmediatePropagation();
}

// $onDrop function handle drag&drop @event, if a data was transfered,
// Check the first object transfered and then navigate to that file.
function onDrop(event :DragEvent) :void {
    event.preventDefault();
    if (event.dataTransfer) {
        let dataTransferred = new DataTransfer();
        dataTransferred.items.add((event.dataTransfer as DataTransfer).files[0]);
        if (fileInput) (fileInput as HTMLInputElement).files = dataTransferred.files;
        let transferedFile :File = dataTransferred.files[0];
        navigateToFile(transferedFile);
    }
    event.stopImmediatePropagation();
}

// $navigateToFile function checks if @transferedFile is a dsws file and then post  
// A message to load his content in the page, if the check fails, display  
// Message in the alert window then reinitializate html elements.
function navigateToFile(transferedFile:File) :void {
    if(isDSWSFile(transferedFile)){
        DswsFilename = transferedFile!.name;
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action' :'openDswsFile', 'file' :transferedFile})
        return;
    }
    alert("Transfered file is not a \'.dsws\' extension");
    initializePage();
}

// $isDWSWSFile function checks if file name ends with '.dsws'
// Returns:
// true if the file is a .dsws and false instead.
function isDSWSFile(transferedFile :File) :Boolean {
    if(!transferedFile.name.endsWith(".dsws")){
        return false;
    }
    return true;
}

// $retrieveLanguages function return a list with the navigator
// languages and an empty string at the last position, so, if
// any language could be displayed the regular language of
// the page would be used instead.
// 
// Returns:
// The string array containing the languages.
function retrieveLanguages() :string[]{
    let languages: string[] = [];
    navigator.languages.forEach((language) =>{
        languages.push(language);
    })
    languages.push("");
    return languages;
}

// $tryLanguages function try to display the page using
// the languages 
function tryLanguages(languages :string[]) :void{
    var language;
    for (language in languages){
        if (displayPage(languages[language])){
            return;
        }
    }
}

// $displayPage function recieve a pageLang and try to display the page
// Using the language.
// Returns:
// true if the page could be displayed and false instead.
function displayPage(pageLang :string) :Boolean{
    let page :Document;
    var url = chrome.runtime.getURL(DswsFilename + "/" + pageLang);
    mainIframe.style.display = "none";
    mainIframe.src = url;
    if (pageLang !== undefined) prevPage = url;
    mainIframe.onload = function(){
        try {
            page = (mainIframe.contentWindow!.document || mainIframe.contentDocument);
            return true;

        } catch (error) {
            if (pageLang === undefined) {
                mainIframe.contentWindow!.location.href = prevPage;
                mainIframe.style.display = "block";
                return true;
            }
            else{ 
                return false;
            }
        }
    }
    return false;
}
