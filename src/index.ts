import {app} from './app'
import {AddressInfo} from 'net'

const server = app.listen(Number(process.env.PORT), `${process.env.HOSTNAME}`, () => {
    const {port, address} = server.address() as AddressInfo;
    console.log('Server listening on:','http://' + address + ':'+port);
});
