// Essential UI stuff
chrome.browserAction.onClicked.addListener(function (e: any) {
    chrome.tabs.create({ url: "/index.html" });
})

// Actual service worker
chrome.webRequest.onBeforeRequest.addListener(
    onBeforeRequest,
    {urls: ["http://_dsws/*", "https://dsws._/*", "http://dsws.localhost/*", "http://example.com/*"]},
    ["blocking"]
);

function onBeforeRequest(details: chrome.webRequest.WebRequestBodyDetails): chrome.webRequest.BlockingResponse {
    console.log('onBeforeRequest', details);
    return {redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='};
}

self.addEventListener("fetch", (event) => {
    console.log("Handling fetch event for", event);
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('web worker message', message, sender, sendResponse);
    if (message.action == 'openDswsFile') {
        const dsws = new Dsws(message.file);
        LoadedDsws.set(dsws.filename, dsws);
        console.log("made dsws", dsws);
        const reply = {"filename": dsws.filename};
        console.log(reply);
        sendResponse(reply);
        dsws.initialize().then(() => {
            chrome.runtime.sendMessage({'event': 'dswsInitialized', 'filename': dsws.filename})
        })
    }
    if (message.action == 'getBlobForUrl') {
        const dsws = LoadedDsws.get(message.dsws_filename);
        const blob = dsws?.get_blob_for_url(message.url);
        console.log("response: ", blob);
        sendResponse(blob);
    }
})

import * as zip from "@zip.js/zip.js";
import { Base64 } from "js-base64";

zip.configure({
    useWebWorkers: true,
    workerScripts: {
        deflate: ["z-worker.js"],
        inflate: ["z-worker.js"]
    }
});

interface ResponseSpec {
    asset_id: string
}

interface RouteNode {
    children: Map<string, RouteNode>,
    response?: ResponseSpec
}

interface AssetInfo {
    mime: string;
    size: number;
}

var LoadedDsws: Map<string, Dsws> = new Map();

class Dsws {
    raw_file: File;
    filename: string;
    entries: Map<string, zip.Entry> = new Map();
    routes_tree: RouteNode = {children: new Map()};
    assets_info: Map<string, AssetInfo> = new Map();
    blob_reader?: zip.BlobReader;
    zip_reader?: zip.ZipReader<any>;

    constructor(raw_file: File) {
        this.filename = raw_file.name;
        this.raw_file = raw_file;
    }

    async initialize() {
        this.blob_reader = new zip.BlobReader(this.raw_file);
        this.zip_reader = new zip.ZipReader(this.blob_reader);
        const entries = await this.zip_reader.getEntries();

        // Load entries
        for (const entry of entries) {
            this.entries.set(entry.filename, entry);
            if (entry.filename == "routes_tree.json") {
                this.routes_tree = await read_json_from_zip_entry(entry);
            }
            if (entry.filename == "assets.json") {
                this.assets_info = await read_json_from_zip_entry(entry);
            }
        }
    }

    close() {
        chrome.webRequest.onBeforeRequest.removeListener(this.onBeforeRequest)
        this.entries = new Map();
    }

    get_entry_for_asset_id(asset_id: string): zip.Entry | null {
        const path = "assets/"+asset_id+".gz";
        if (this.entries.has(path)) {
            return this.entries.get(path)!;
        } else {
            return null;
        }
    }

    get_blob_for_url(url: string): Promise<Blob> | null {
        // todo: url navigation

        const asset_id = this.routes_tree.response!.asset_id;
        const entry = this.get_entry_for_asset_id(asset_id)!;
        return read_gzip_blob_from_zip_entry(entry);
    }

    onBeforeRequest(details: chrome.webRequest.WebRequestBodyDetails) {
        console.log(details)
    }
}

async function read_gzip_blob_from_zip_entry(entry: zip.Entry): Promise<Blob> {
    const bw = new zip.BlobWriter();
    const res = await entry.getData!(bw);
    const decompressor = new DecompressionStream("gzip");
    const decompressedStream = res.stream().pipeThrough(decompressor);
    return (new Response(decompressedStream)).blob();
}

async function read_gzip_text_from_zip_entry(entry: zip.Entry): Promise<String> {
    const bw = new zip.BlobWriter();
    const res = await entry.getData!(bw);
    const decompressor = new DecompressionStream("gzip");
    const decompressedStream = res.stream().pipeThrough(decompressor);
    return (new Response(decompressedStream)).text();
}

async function read_json_from_zip_entry(entry: zip.Entry) {
    const tw = new zip.TextWriter();
    const res = await entry.getData!(tw);
    const dat = JSON.parse(res);
    return dat;
}