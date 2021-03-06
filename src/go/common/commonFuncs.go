package common

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

var client http.Client

func GetMapFromData(data string) (map[string]interface{}, error) {
	var test map[string]interface{}
	err := json.Unmarshal([]byte(data), &test)
	if err != nil {
		return nil, err
	}
	return test, err
}


func GetMapFromURL(url string) (map[string]interface{}, error) {
	resp, err := http.Get(url)

	if err != nil {
		fmt.Println("There was an error getting the IP Location... ", err)
		return nil, err
	}

	defer resp.Body.Close()

	// This worked because we need to convert our *Reader to []Bytes
	// https://stackoverflow.com/questions/38673673/access-http-response-as-string-in-go
	bytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Couldn't convert RESP to []Byte for your Current Conditions Request: ", err)
	}

	var test map[string]interface{}
	err = json.Unmarshal(bytes, &test)
	if err != nil {
		return nil, err
	}

	return test, err
}

func GetHTMLFromURL(url string) (string, error) {
    req, err := http.NewRequest("GET", url, nil)
	req = SetHeaders(req)
    resp, err := client.Do(req)

    defer resp.Body.Close()

    scanner := bufio.NewScanner(resp.Body)
    scanner.Split(bufio.ScanRunes)
    var buf bytes.Buffer
    for scanner.Scan() {
        buf.WriteString(scanner.Text())
    }

    return buf.String(), err
}

func GetStringFromURL(url string) (string, error) {
	resp, err := http.Get(url)

	if err != nil {
		fmt.Println("There was an error getting HTML: ", err)
		return "", err
	}

	defer resp.Body.Close()

    scanner := bufio.NewScanner(resp.Body)
    scanner.Split(bufio.ScanRunes)
    var buf bytes.Buffer
    for scanner.Scan() {
        buf.WriteString(scanner.Text())
    }

	return buf.String(), err
}

func ReadJsonFile(file string) (map[string]interface{}, error) {
	fileReturn, err := ioutil.ReadFile(file)
	if err != nil {
		fmt.Println("Error reading JSON file: ", err)
		return nil, err
	}

    var fileInfo map[string]interface{}
    err = json.Unmarshal([]byte(fileReturn), &fileInfo)
    if err != nil {
        fmt.Println("Error parsing JSON into map[string]interface{}: ", err)
        return nil, err
    }
	return fileInfo, nil
}

// This will set the headers to a request. Makes it easier than copy and pasting this everywhere.
// These are just common headers used to make it look like the request came from a browser, not a server.
func SetHeaders(req *http.Request) *http.Request {
	req.Header.Add("Accept", `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`)
	req.Header.Add("Accept-Charset", `ISO-8859-1,utf-8;q=0.7,*;q=0.3`)
	req.Header.Add("Accept-Encoding", `none`)
	req.Header.Add("Accept-Language", `en-US,en;q=0.8`)
	req.Header.Add("Connection", `keep-alive`)
	req.Header.Add("User-Agent", `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11`)
	return req
}