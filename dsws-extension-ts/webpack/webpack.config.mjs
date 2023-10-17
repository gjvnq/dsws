import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import WebExtPlugin from 'web-ext-plugin';
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default {
    mode: "production",
    entry: {
        dsws_worker: path.resolve(__dirname, "..", "src", "dsws_worker.ts"),
        background: path.resolve(__dirname, "..", "src", "background.ts"),
        index: path.resolve(__dirname, "..", "src", "index.ts"),
        // index: {
        //     import: path.resolve(__dirname, "..", "src", "index.ts"),
        //     dependOn: "zipjs",
        // },
        zipjs: "@zip.js/zip.js",
    },
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: false
    },
    // optimization: {
    //     runtimeChunk: 'single',
    // },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
    plugins: [
        new NodePolyfillPlugin(),
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
        new WebExtPlugin({
            sourceDir: path.join(__dirname, "../dist"),
            buildPackage: true,
            devtools: true,
            browserConsole: true
        }),
    ],
};