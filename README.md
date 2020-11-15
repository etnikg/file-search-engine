# File search engine

This is very basic express API with Elasticsearch from 2 indices (books and names-frequency), where `books` index has the map below:
 
 `{ 
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard",
      },
      "body": {
        "type": "text",
        "analyzer": "english"
      }
    }
 }`

### GET /
Return as json all names frequency from first-names.txt (you can find it at src/books/) in descending order by frequency and in same time write results in output.txt

### GET /name-count/:name
Return as json the frequency of given name as parameter 

### How to
Store environment variables and run `npm run dev` 
