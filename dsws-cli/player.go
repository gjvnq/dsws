package main

import (
	"archive/zip"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"time"
)

func readJsonFromZip(zip_reader *zip.Reader, path string, val any) error {
	var err error
	var file fs.File
	if file, err = zip_reader.Open(path); err != nil {
		return err
	}
	defer file.Close()

	dec := json.NewDecoder(file)
	if err = dec.Decode(val); err != nil {
		return err
	}
	return nil
}

func extract_asset(zip_reader *zip.Reader, asset_id string) (io.Reader, error) {
	var err error
	var file fs.File
	var gz_reader *gzip.Reader

	if file, err = zip_reader.Open("assets/" + asset_id + ".gz"); err != nil {
		return nil, err
	}

	if gz_reader, err = gzip.NewReader(file); err != nil {
		return nil, err
	}

	return gz_reader, nil
}

type DswsPlayer struct {
	dsws_path   string
	zip_file    *os.File
	zip_reader  *zip.Reader
	assets_info map[string]AssetInfo
	root_node   *UrlRouteNode
}

func respond_string(w http.ResponseWriter, status int, msg string) {
	w.WriteHeader(status)
	w.Header().Add("Content-Type", "text/plain; charset=UTF-8")
	w.Write([]byte(msg))
}

func (player *DswsPlayer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	node := player.root_node.Find(r.URL.Path)

	// Try to see if it's a folder with an index.html
	if node == nil {
		node = player.root_node.Find(r.URL.Path + "/index.html")
	}
	// TODO: generate directory listings

	if node == nil {
		msg := fmt.Sprintf("Page not found on %s", player.dsws_path)
		respond_string(w, http.StatusNotFound, msg)
		return
	} else {
		asset_id := node.Response.AssetId
		asset_info, ok := player.assets_info[asset_id]
		if !ok {
			msg := fmt.Sprintf("Asset %s not found on assets.json", asset_id)
			respond_string(w, http.StatusInternalServerError, msg)
			return
		}
		asset_reader, err := extract_asset(player.zip_reader, asset_id)
		if err != nil {
			msg := fmt.Sprintf("Failed to extract asset: %s", err.Error())
			respond_string(w, http.StatusInternalServerError, msg)
			return
		}

		// Reply with the asset
		w.Header().Add("Content-Type", asset_info.Mime)
		w.Header().Add("Content-Length", fmt.Sprint(asset_info.Size))
		io.Copy(w, asset_reader)
	}

}

func NewDswsPlayer(dsws_path string) (*DswsPlayer, error) {
	var err error

	player := new(DswsPlayer)

	player.dsws_path = dsws_path
	player.zip_file, err = os.Open(dsws_path)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	zip_info, err := player.zip_file.Stat()
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	player.zip_reader, err = zip.NewReader(player.zip_file, zip_info.Size())
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	player.assets_info = make(map[string]AssetInfo, 0)
	player.root_node = NewUrlRouteNode()

	err = readJsonFromZip(player.zip_reader, "assets.json", &player.assets_info)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	err = readJsonFromZip(player.zip_reader, "routes_tree.json", &player.root_node)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	return player, nil
}

func (player *DswsPlayer) ListenAndServe(listen_on string) {
	srv := &http.Server{
		Addr:           listen_on,
		Handler:        player,
		ReadTimeout:    1 * time.Minute,
		WriteTimeout:   1 * time.Minute,
		MaxHeaderBytes: 1 << 20,
	}
	fmt.Printf("Listening on http://%s\n", listen_on)
	srv.ListenAndServe()
}

func PlayDswsFile(dsws_path, listen_on string) {
	player, err := NewDswsPlayer(dsws_path)
	if err != nil {
		log.Fatal(err)
	}
	player.ListenAndServe(listen_on)
}
