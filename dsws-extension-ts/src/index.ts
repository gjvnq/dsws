var DswsFilename :String = "";
let dropContainer :HTMLElement;
let dropContainerText :HTMLElement;
let fileInput :HTMLInputElement;
let fileButton :HTMLElement;
let object :Record<string, any> | undefined;
let asset_ids :string[] = [];
let fileContainer : HTMLElement;

(navigator as Navigator).serviceWorker.addEventListener('message', (event) => {a(event)});
const mainIframe :HTMLIFrameElement = document.getElementById("main-iframe") as HTMLIFrameElement;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        fileContainer.style.display = 'none';
        mainIframe.src = url;
    }
});

// Calls $initializePage while window is loading.
window.onload = function() { initializePage(); }

// $initializePage retrieve the HTML Elements and add the necessary 
// EventsListener's.
function initializePage() :void {
    initializeElements();
    if (correctlyInitialized()) {
        addEventsListeners();
    } else {
        alert("Page initialized incorrectly, please reload it!");
        location.reload();
    }
}

// $initializeElements function initialize the HTML Elements from the HTML file.
function initializeElements() :void{
    dropContainer = document.getElementById("drop-container") as HTMLElement;
    dropContainerText = document.getElementById("drop-container-text") as HTMLElement;
    fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileButton = document.getElementById("file-button") as HTMLElement;
    fileContainer = document.getElementById("file-container") as HTMLElement;
}

// $correctlyInitialized function checks if the HTML Elements were 
// Correctly initialized.
function correctlyInitialized() :Boolean {
    if (dropContainer && dropContainerText && fileInput && fileButton){
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
            console.log('File object is null');
        }
    } else {
        console.log('No file selected');
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
// A message to load His content to the page if the check fails display  
// Message in the allert window then reinitializate html elements.
function navigateToFile(transferedFile:File) :void {
    if(isDSWSFile(transferedFile)){
        DswsFilename = transferedFile!.name;
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action' :'openDswsFile', 'file' :transferedFile})
    }

    alert("Transfered file is not a \'.dsws\' extension");
    initializePage();
}

// Chech if file name ends with '.dsws'
function isDSWSFile(transferedFile :File) :Boolean {
    if(!transferedFile.name.endsWith(".dsws")){
        return false;
    }
    return true;
}

// $displayPage function receive a Message as an @event,
// if the message says that 'dswsReady' select the user
// languages to display the page. If it doesn't work
// displays the page in the regular language.
function displayPage(event : MessageEvent){    
    const message = event.data;
    
    if (message.event == 'dswsReady') {
        let languages = retrieveLanguages();
        mainIframe.style.display = "none";
        fileContainer.style.display = 'none';
        for(let language in languages){
            if (tryLanguage(language)){
                break;
            }
        }
    }
}

// $retrieveLanguages return a list off user languages that can be 
// Used to display user page and add at the last position an empty
// String that can be used to display files current language. 
function retrieveLanguages(){
    let languages :string[] = [];
    navigator.languages.forEach((language)=>
        languages.push(language)
    );
    languages.push("");
    return languages
}

function tryLanguage(language :string) :Boolean {
    var url = chrome.runtime.getURL(DswsFilename+"/"+language);
    mainIframe.src = url;
    mainIframe.onload = function(){
        let page;
        try {
            page = (mainIframe.contentWindow?.document || mainIframe.contentDocument) as Document;
            mainIframe.style.display = "block";
            return true;
        } catch (error) {
            return false;
        }
    }
    return false;
}