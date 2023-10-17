// Essential UI stuff
chrome.action.onClicked.addListener(function (e: any) {
    chrome.tabs.create({ url: "/index.html" });
});

// // Actual service worker
// chrome.webRequest.onBeforeRequest.addListener(
//     onBeforeRequest,
//     {urls: ["http://_dsws/*", "https://dsws._/*", "http://dsws.localhost/*", "http://example.com/*"]},
//     ["blocking"]
// );

// self.addEventListener('activate', function(event: any) {
//     console.log('Claiming control');
//     event.waitUntil((self as any).clients.claim());
//   });


// self.addEventListener('activate', (event: any)  => {
//     // Take control of all pages under this SW's scope immediately,
//     // instead of waiting for reload/navigation.
//     console.log(self);
//     event.waitUntil((self as any).clients.claim());
// });


// self.addEventListener("install", (event) => {console.log('install', event)});

(self as unknown as ServiceWorkerGlobalScope).addEventListener('fetch', async (event: FetchEvent) => {
    console.log("FETCH", event);
    console.log(LoadedDsws);
    for (const [filename, dsws] of LoadedDsws) {
        console.log(filename);
        console.log(chrome.runtime.getURL(filename), event.request.url);
        const baseUrl = chrome.runtime.getURL(filename);
        if (event.request.url.startsWith(baseUrl)) {
            const cleanUrl = event.request.url.slice(baseUrl.length);
            console.log(cleanUrl, event);
            event.respondWith((async () => {
                return dsws.response_for_url(cleanUrl);
            })());
        }
    }
});

self.addEventListener("message", async (event: MessageEvent) => {
    console.log('SW message', event);
    const message = event.data;
    if (message.action == 'openDswsFile') {
        const dsws = new Dsws(message.file);
        LoadedDsws.set(dsws.filename, dsws);
        console.log("made dsws", dsws);
        console.log("initializing dsws...");
        await dsws.initialize();
        event.source?.postMessage({'event': 'dswsReady'});
    }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('web worker message', message);
    if (message.action == 'openDswsFile') {
        const dsws = new Dsws(message.file);
        LoadedDsws.set(dsws.filename, dsws);
        console.log("made dsws", dsws);
        const reply = {"filename": dsws.filename};
        console.log(reply);
        sendResponse(reply);
        console.log("initializing dsws...");
        dsws.initialize();
        // .then(() => {
        //     console.log('hi423423');
        //     chrome.runtime.sendMessage({'event': 'dswsInitialized', 'filename': dsws.filename})
        // })
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

interface RouteNodeChildren {
    [key: string]: RouteNode
}

interface RouteNode {
    children: RouteNodeChildren,
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
    routes_tree: RouteNode = {children: {}};
    assets_info: Map<string, AssetInfo> = new Map();
    blob_reader?: zip.BlobReader;
    zip_reader?: zip.ZipReader<any>;

    constructor(raw_file: File) {
        this.filename = raw_file.name;
        this.raw_file = raw_file;
    }

    async initialize() {
        console.log("hi 1");
        this.blob_reader = new zip.BlobReader(this.raw_file);
        console.log("hi 2");
        this.zip_reader = new zip.ZipReader(this.blob_reader);
        console.log("hi 3");
        const entries = await this.zip_reader.getEntries();
        console.log("hi 4");

        // Load entries
        for (const entry of entries) {
            this.entries.set(entry.filename, entry);
            if (entry.filename == "routes_tree.json") {
                this.routes_tree = await read_json_from_zip_entry(entry);
            }
            if (entry.filename == "assets.json") {
                this.assets_info = new Map(Object.entries(await read_json_from_zip_entry(entry)));
            }
        }
        console.log("hi 5");
    }

    close() {
        this.entries = new Map();
        this.zip_reader?.close();
    }

    async response_for_url(url: string): Promise<Response> {
        // url navigation
        var cur = this.routes_tree;
        const url_parts = (url.split('?')[0]).split("/");
        console.log(url, 'url parts', url_parts)
        for (const url_part of url_parts) {
            if (url_part == '') {
                continue;
            }

            console.log(url, 'cur', cur);
            console.log(url, 'url_part', url_part);
            cur = cur.children[url_part];
            if (cur == undefined) {
                break;
            }
        }
        console.log(url, '> cur', cur);

        if (cur == undefined || !('response' in cur)) {
            return new Response(null, {status: 404});
        }

        const asset_id = cur.response!.asset_id;
        console.log(this.assets_info, this.assets_info.get)
        const asset_info = this.assets_info.get(asset_id)!;
        const entry = this.get_entry_for_asset_id(asset_id)!;
        const blob = read_gzip_blob_from_zip_entry(entry);
        const headers = new Headers();
        headers.set("Content-Type", asset_info.mime);
        headers.set("Content-Length", asset_info.size.toString());
        return new Response(await blob, {headers: headers});
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