import { Client } from '@elastic/elasticsearch';

const node = `${process.env.ELASTICSEARCH_ENDPOINT}` ; // node url

const client = new Client({
    node,
});

export default client;
