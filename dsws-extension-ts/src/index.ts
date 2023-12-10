var DswsFilename :String = "";
let dropContainer :HTMLElement;
let dropContainerText :HTMLElement;
let fileInput :HTMLInputElement;
let fileButton :HTMLElement;

let navBar :HTMLDivElement;
let backButton :HTMLButtonElement;
let forwardButton :HTMLButtonElement;
let pageName :HTMLDivElement;
let mainIframe :HTMLIFrameElement;

let object :Record<string, any> | undefined;
let fileContainer : HTMLElement;

var pageLang: string = "";
var prevPage: string;

// Calls $initializePage while window is loading.
window.onload = function() { initializePage(); }

// $initializePage retrieve the HTML Elements and add the necessary 
// EventsListener's.
function initializePage() :void {
    initializeElements();
    if (correctlyInitialized()) {
        addEventsListeners();
    } else {
        alert("Page is")
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
    navBar = document.getElementById("nav-bar") as HTMLDivElement;
    backButton = document.getElementById("back-button") as HTMLButtonElement;
    forwardButton = document.getElementById("forward-button") as HTMLButtonElement;
    pageName = document.getElementById("page-name") as HTMLDivElement;
    mainIframe = document.getElementById("main-iframe") as HTMLIFrameElement;
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
    fileInput.addEventListener('input', onFileInput);
    fileInput.addEventListener('change', async(e) => {onFileInput()});
    fileButton.addEventListener('click', () => {fileInput.click();});
    dropContainer.addEventListener('dragover', (e) => { e.preventDefault() });
    dropContainer.addEventListener('drop', (e) => { onDrop(e) });
    
    backButton.addEventListener("click", () => {
        prevPage = mainIframe.contentWindow!.location.href;
        mainIframe.contentWindow?.history.back();
    });

    forwardButton.addEventListener("click", () => {
        mainIframe.contentWindow?.history.forward();
    });
}

// $handleMessage function handle the MessageEvent when a dsws file is sent
// If we have a dsws file try to display it in the page.
function handleMessage(event: MessageEvent){
    const message :MessageEvent | any = event.data;
    if (message.event == 'dswsReady') {
        fileContainer.style.display = 'none';
        navBar.style.display = "block";
        let languages = retrieveLanguages();
        tryLanguages(languages);
        
    }
}

// $onFileInput function handle file input event, if a file was uploaded,
// Check if there is a file and if its not a null object and then navigate
// to that file.
function onFileInput() :void {
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
    var language
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
    mainIframe.onload = function(){
        try {
            page = (mainIframe.contentWindow?.document || mainIframe.contentDocument) as Document;
            setUrl();
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

// $setUrl function set the page url in the inner url bar.
function setUrl() :void{
    let cleanUrl :string = mainIframe.contentWindow!.location.href as string;
    let urlArray :string[] = cleanUrl.split("/");
    pageName.innerText = urlArray.slice(3).join("/");
    mainIframe.style.display = "block";
}


