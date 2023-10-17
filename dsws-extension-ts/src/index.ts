import * as zip from "@zip.js/zip.js";
import { Base64 } from "js-base64";


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

var RoutesTree: RouteNode = {children: new Map()};
var AssetsInfo: Map<string, AssetInfo> = new Map();
var Entries: Map<string, zip.Entry> = new Map();
var DswsFilename: String = "";

zip.configure({
    useWebWorkers: true,
    workerScripts: {
        deflate: ["z-worker.js"],
        inflate: ["z-worker.js"]
    }
});

console.log("Hello1");

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


async function process_zip(zip_file: File) {
    const blob_reader = new zip.BlobReader(zip_file);
    console.log(blob_reader);
    const zip_reader = new zip.ZipReader(blob_reader);
    console.log(zip_reader);
    const entries = await zip_reader.getEntries();
    console.log(entries);

    for (const entry of entries) {
        Entries.set(entry.filename, entry);
        if (entry.filename == "routes_tree.json") {
            RoutesTree = await read_json_from_zip_entry(entry);
        }
        if (entry.filename == "assets.json") {
            AssetsInfo = await read_json_from_zip_entry(entry);
        }
    }

    console.log(RoutesTree);
    console.log(AssetsInfo);
    console.log(Entries);

    const asset_id = RoutesTree.response?.asset_id;
    const entry = Entries.get("assets/"+asset_id+".gz")!;
    const tmp = await read_gzip_blob_from_zip_entry(entry);
    console.log(tmp);

    const el = document.getElementById("main-iframe") as HTMLIFrameElement;

    // this will use our extension URL as the host which means we can use webRequests without specifying a host in the manifest
    el.src = chrome.extension.getURL(DswsFilename+"/");
    console.log(el.src);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Hello2");
    const el = document.getElementById("dsws-file-input") as HTMLInputElement;
    el.disabled = false;
    el.addEventListener('change', async (e) => {
        console.log("Hello3a");
        console.log(e);
        let file = el.files!.item(0);
        DswsFilename = file!.name;
        console.log(file)
        // process_zip(file!);
        chrome.runtime.sendMessage({'action': 'openDswsFile', 'file': file}, async (reply) => {
            const el = document.getElementById("main-iframe") as HTMLIFrameElement;

            console.log("got reply", reply);
            el.src = "http://dsws.localhost/"+reply.filename;
            console.log(el.src);
        });
    })
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message, sender, sendResponse);
    if (message.event == 'dswsInitialized') {
        chrome.runtime.sendMessage({'action': 'getBlobForUrl', 'url': '/', dsws_filename: DswsFilename}, async (reply) => {
            const el = document.getElementById("main-iframe") as HTMLIFrameElement;
            console.log("got reply", reply);
            const url = URL.createObjectURL(reply);
            console.log(url);
            el.src = url;
        });
    }
});