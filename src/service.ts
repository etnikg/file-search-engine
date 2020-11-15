import * as util from "util";
import * as fs from "fs";
import client from "./elasticsearch";
import * as readline from "readline";

let file = "oliver-twist.txt"

export class Service {
    static async indexBook() {
        let book = fs.readFileSync(`${process.env.OLIVER_FILE_PATH}`,'utf-8');
        book=book.replace(/\r|\n/g, ' ')
        let ESbody = {
                title: file,
                body: book
        }
        try {
            let res=await client.index({
                id: file,
                index: `${process.env.FIRST_INDEX}`,
                body: ESbody
            })
            console.log("Indexing result: ", res.body._id);
        } catch (err){
            console.log("ERROR: ", err)
        }
    };

    // Get ordered frequencies in Elasticsearch by query
    static async queryFrequency(index: string){
        try {
            const response = await client.search({
                index: index,
                size: 10000,
                body: {
                    sort: [{"frequency":{"order":"desc"}}],
                    query: {
                        match_all:{}
                    }
                }
            });
            let names=response.body.hits.hits.map( (h:any) => {
                let {_source, ...params } = h;
                return h._source
            })
            // write the results in output.txt file
            names.forEach( (name:any)=>{
                let word=name.name+':'+name.frequency+'\n'
                fs.appendFileSync(`${process.env.OUTPUT_FILE_PATH}`, word)
            })
            return names
        } catch (error) {
            console.trace(error.message)
        }
    }

    // Get name frequency from Elasticsearch in second index stored
    static async nameFrequency(index: string, name: string){
        try {
            const response = await client.search({
                index: index,
                size: 10000,
                body: {
                    query: {
                        match:{
                            name: name
                        }
                    }
                }
            });

            return response.body.hits.hits[0]._source
        } catch (error) {
            console.trace(error.message)
        }
    }

    static async findOcurrence(index: string, id: string, fields: string){
        try {
            // from term vectors api supported by Elasticsearch get names frequency
            const response = await client.termvectors({
                index: index,
                id: id,
                fields: fields,
                term_statistics: true,
                offsets: false,
                payloads: false,
                positions: false
            });

            let names=await this.getNames()

            names.map( name=>{
                const res=response.body.term_vectors.body;
                let frequency;
                if (res.terms[name]){
                    frequency=res.terms[name].term_freq
                } else if(res.terms[name.substring(0,4)]){
                    frequency=res.terms[name.substring(0,4)].term_freq
                } else {
                    frequency=0
                }
                client.index({
                    index: `${process.env.SECOND_INDEX}`,
                    id: name,
                    body: {
                        name: name,
                        frequency: frequency
                    }
                })
            })
            return await this.queryFrequency(`${process.env.SECOND_INDEX}`)

        } catch (error) {
            console.trace(error.message)
        }
    }

    static async getNames(){
        const fileStream = fs.createReadStream(`${process.env.FIRST_NAMES_FILE_PATH}`);
        let names =[]

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.

        for await (const line of rl) {
            // Each line in input.txt will be successively available here as `line`.
            names.push(line.toLowerCase())
        }
        return names;
    }
}
