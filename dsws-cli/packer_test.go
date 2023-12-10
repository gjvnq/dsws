package main

import (
	"log"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUrlRoute_1(t *testing.T) {
	root := NewUrlRouteNode()
	child1 := root.Find("/404")
	assert.Nil(t, child1)
	child2 := root.Find("")
	assert.Equal(t, root, child2)
	child3 := root.Find("/")
	assert.Equal(t, root, child3)
}

func TestUrlRoute_2(t *testing.T) {
	root := NewUrlRouteNode()
	child := new(UrlRouteResponse)
	child.AssetId = "n2uibnc4ui4bn"
	root.AddChild("/errors/404.html", child)
	child1 := root.Find("/errors/404")
	assert.Nil(t, child1)
	child2 := root.Find("/errors/404.html")
	assert.Equal(t, child, child2.Response)
}

func TestHashFile_1(t *testing.T) {
	f, err := os.CreateTemp("", "example")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(f.Name()) // clean up
	if _, err := f.Write([]byte("the quick fox jumps over the lazy dog")); err != nil {
		log.Fatal(err)
	}
	if err := f.Close(); err != nil {
		log.Fatal(err)
	}
	assert.Equal(t, "288b3d47c9d4394aec985389a1ab1f7e8be10fe8", HashFile(f.Name()))
}

func TestHashFile_2(t *testing.T) {
	f, err := os.CreateTemp("", "example")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(f.Name()) // clean up
	if _, err := f.Write([]byte("teh quick fox jumps over the lazy dog")); err != nil {
		log.Fatal(err)
	}
	if err := f.Close(); err != nil {
		log.Fatal(err)
	}
	assert.Equal(t, "449148dae1dfcc4f448a68c29c10366d562d20eb", HashFile(f.Name()))
}
