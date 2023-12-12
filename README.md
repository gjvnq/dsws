# DSWS
Demi Static WebSite tool and browser extension. DSWS is a final project developed by the DSWS Team in the subject MAC0332 - Software Engineering, offered by the University of São Paulo (USP) on the second semester off the 2023 year.

## Lisence
This project is licensed under [MIT Lisence](https://github.com/mac0332-dsws/dsws/blob/main/LICENSE).

## Proposal:
The project's proposal is to offer an easy way to pack, unpack and display static websites for private enterprise software, so that transferring these files is simpler.

## The project:
The Project has two parts, 

* Go for the cli tool, whose purpose is to pack the pages into a '.dsws' file and
* Browser extension in typescript, whose purpose is to unpack and display the '.dsws' file
 
After creating the file, you can share it with the ones that need access.To view the pages, load the DSWS file into the designated area on the extenion's home page. After that, the page can be used normally, as if it were opened directly in the browser.

## Dependencies:
The project uses a lot of resources that need to be installed.

### CLI Dependencies:
 In order to use the CLI tool, you will need to install:

- Golang: https://go.dev/doc/install

### Web Extension Dependencies:
- Google Chrome: [Chrome Install](https://chromeenterprise.google/intl/pt_br/browser/download/) (this extension only works on Google Chrome)
- Webpack: [Webpack install](https://webpack.js.org/guides/installation/)
- Node and Npm: [Node and Npm install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or  Yarn: [Yarn install](https://classic.yarnpkg.com/lang/en/docs/install/)

## Guide:

After clonning this repository, you can follow the steps below to use the DSWS.

### CLI Tool Guide:

To install the CLI tool, go to the `dsws-cli` directory and use:

```go build```

To create the file with the pages, use the CLI tool to compress and build the DSWS file from any static site directory with native URLs, using the following command:

```./dsws pack [Directory_Path] [DSWS File Name]```

For additional information about the cli tool, use:

```./dsws help```

### Web Extension Guide:
To compile the web extension, go to the ```dsws-extension-ts``` file, and type:
#### Using yarn:
```yarn install```
and then:
```yarn build```

#### Using npm:
```npm install```
and then:
```npm run build```

#### Web Extension load guide:
To use the web extension, open the `chrome manage extension` section, activate `developer mode`, click in `LOAD UNPACKED` and then select the `dist` file in the `dsws-extension-ts` directory 

#### Web Extension use guide:
After compiling and loading the web extension, in the main page, browse or drag&drop the '.dsws' file in the specified area and the page will be loaded.


## Useful links during development

  * [WebExtensions on MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
  * [Lua Reference Manual](https://www.lua.org/manual/5.4/)
  * [ReplayWeb.page repository](https://github.com/webrecorder/replayweb.page)
