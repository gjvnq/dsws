package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

const VERSION = "0.0.1"

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of DSWS",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("DSWS " + VERSION)
	},
}

var packCmd = &cobra.Command{
	Use:   "pack [flags] [SRC_DIR] [OUT_FILE]",
	Short: "Packs a folder as .dsws file",
	Long:  `Takes a static website folder and packs it in an easy to play format`,
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		src_path := args[0]
		out_path := args[1]
		PackDir(src_path, out_path)
	},
}

var playCmd = &cobra.Command{
	Use:   "play [DSWS FILE] [HOST/PORT]",
	Short: "Plays a .dsws file",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		PlayDswsFile(args[0], args[1])
	},
}

var rootCmd = &cobra.Command{
	Use:   "dsws",
	Short: "DemiStatic WebSite CLI tool",
	Long:  `A tool for packaging and playing mostly static websites.`,
	Run: func(cmd *cobra.Command, args []string) {
		// Do Stuff Here
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(packCmd)
	rootCmd.AddCommand(playCmd)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
