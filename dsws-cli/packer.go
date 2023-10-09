package main

import (
	"archive/zip"
	"compress/gzip"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"io"
	"io/fs"
	"log"
	"mime"
	"os"
	"path"
	"path/filepath"
	"strings"
)

type BasicFileInfo struct {
	Path string
	Mime string
	Size int64
	Hash string
}

type AssetInfo struct {
	Hash string `json:"-"`
	Mime string `json:"mime"`
	Size int64  `json:"size"`
}

type UrlRoute struct {
	Path            string            `json:"-"`
	Method          string            `json:"method"`
	ResponseHeaders map[string]string `json:"response_headers"`
	SendAsset       string            `json:"send_asset"`
}

type UrlRouteResponse struct {
	AssetId         string            `json:"asset_id,omitempty"`
	ResponseHeaders map[string]string `json:"response_headers,omitempty"`
}

type UrlRouteNode struct {
	Path     string                   `json:"-"`
	Children map[string]*UrlRouteNode `json:"children,omitempty"`
	Response *UrlRouteResponse        `json:"response,omitempty"`
}

func NewUrlRouteNode() *UrlRouteNode {
	node := new(UrlRouteNode)
	node.Children = make(map[string]*UrlRouteNode, 0)
	return node
}

func (node *UrlRouteNode) Find(url_path string) *UrlRouteNode {
	url_path = path.Clean(url_path)
	url_path = strings.TrimPrefix(url_path, "/")
	url_parts := strings.Split(url_path, "/")
	return node.find(url_parts)
}

func (node *UrlRouteNode) find(url_parts []string) *UrlRouteNode {
	if len(url_parts) == 0 {
		return node
	}

	first_part := url_parts[0]
	child := node.Children[first_part]
	if child != nil {
		return child.find(url_parts[1:])
	} else {
		return nil
	}
}

func (node *UrlRouteNode) AddChild(url_path string, response *UrlRouteResponse) {
	url_path = path.Clean(url_path)
	url_path = strings.TrimPrefix(url_path, "/")
	if url_path == "" {
		node.Response = response
	} else {
		url_path_list := strings.Split(url_path, "/")
		node.addChild(url_path_list, response)
	}
}

func (node *UrlRouteNode) addChild(url_path []string, response *UrlRouteResponse) {
	if len(url_path) == 0 {
		node.Response = response
	} else {
		cur_dir := url_path[0]
		if node.Children[cur_dir] == nil {
			node.Children[cur_dir] = NewUrlRouteNode()
		}
		node.Children[cur_dir].addChild(url_path[1:], response)
	}
}

func HashFile(fpath string) string {
	f, err := os.Open(fpath)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	h := sha1.New()
	if _, err := io.Copy(h, f); err != nil {
		log.Fatal(err)
	}
	return hex.EncodeToString(h.Sum(nil))
}

func writeToJsonFileInZip(zip_writer *zip.Writer, path string, val any) error {
	tmp_writer, err := zip_writer.Create(path)
	if err != nil {
		return err
	}
	encoder := json.NewEncoder(tmp_writer)
	encoder.SetIndent("", "  ")
	err = encoder.Encode(val)
	if err != nil {
		return err
	}

	return zip_writer.Flush()
}

func PackDir(base_dir string, output_path string) {
	base_dir = filepath.Clean(base_dir)

	// Get basic data about the file
	root_node := NewUrlRouteNode()
	routes := make(map[string]UrlRoute, 0)
	path2info := make(map[string]BasicFileInfo, 0)
	hash2info := make(map[string]AssetInfo, 0)
	filepath.Walk(base_dir, func(item_path string, info fs.FileInfo, err error) error {
		if err != nil {
			log.Fatal(err)
		}
		if info.IsDir() {
			// TODO: use lua scripts to generate HTML index of directory
			return nil
		}
		file_hash := HashFile(item_path)
		local_path := strings.Replace(item_path, base_dir, "", 1)
		path2info[local_path] = BasicFileInfo{
			Path: local_path,
			Size: info.Size(),
			Mime: mime.TypeByExtension(filepath.Ext(local_path)),
			Hash: file_hash,
		}
		hash2info[file_hash] = AssetInfo{
			Size: info.Size(),
			Mime: mime.TypeByExtension(filepath.Ext(local_path)),
			Hash: file_hash,
		}
		routes[local_path] = UrlRoute{
			Path:            local_path,
			Method:          "GET",
			ResponseHeaders: make(map[string]string),
			SendAsset:       file_hash,
		}
		root_node.AddChild(local_path, &UrlRouteResponse{
			AssetId: file_hash,
		})

		// make sure path/ goes to path/index.html
		if filepath.Base(local_path) == "index.html" {
			local_path_dir := filepath.Dir(local_path)
			root_node.AddChild(local_path_dir, &UrlRouteResponse{
				AssetId: file_hash,
			})
			routes[local_path_dir] = UrlRoute{
				Path:            local_path_dir,
				Method:          "GET",
				ResponseHeaders: make(map[string]string),
				SendAsset:       file_hash,
			}
		}

		return nil
	})

	// Start zip file
	zip_file, err := os.OpenFile(output_path, os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0755)
	if err != nil {
		log.Fatal(err)
	}
	zip_writer := zip.NewWriter(zip_file)
	defer zip_writer.Close()

	// Write routes
	err = writeToJsonFileInZip(zip_writer, "routes_list.json", routes)
	if err != nil {
		log.Fatal(err)
	}
	// Write routes
	err = writeToJsonFileInZip(zip_writer, "routes_tree.json", root_node)
	if err != nil {
		log.Fatal(err)
	}
	// Write asset info
	err = writeToJsonFileInZip(zip_writer, "assets.json", hash2info)
	if err != nil {
		log.Fatal(err)
	}

	// Write assets
	written_assets := make(map[string]bool, 0)
	for _, file_info := range path2info {
		// Deduplicate data
		if written_assets[file_info.Hash] {
			continue
		}
		in_zip_writer, err := zip_writer.Create("assets/" + file_info.Hash + ".gz")
		if err != nil {
			log.Fatal(err)
		}

		// Set up compression
		gz_writer := gzip.NewWriter(in_zip_writer)
		defer gz_writer.Close()

		f_reader, err := os.Open(filepath.Join(base_dir, file_info.Path))
		if err != nil {
			log.Fatal(err)
		}
		defer f_reader.Close()
		if _, err := io.Copy(gz_writer, f_reader); err != nil {
			log.Fatal(err)
		}

		// If we don't flush the code WONT'T WORK!!!
		if err := gz_writer.Flush(); err != nil {
			log.Fatal(err)
		}

		written_assets[file_info.Hash] = true
	}

}
