import fs from 'fs';
import crypto from 'crypto';
import { ICryptoEngine, setEngine } from 'pkijs';
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";

import { Akash, SDL, findDeploymentSequence } from './index';

const apiEndpoint = "https://api.akash.forbole.com:443"
const RPC = "https://rpc.akash.forbole.com:443"

const getWallet = async () => {
    const mnemonic = 'bar journey lava raw tumble address twelve caution opera view next ethics';
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "akash" });
  
    // get first account
    const [account] = await wallet.getAccounts();
  
    return { wallet, account };
}

const queryCertificate = async () => {
    console.log("Querying certificate...");
    const CHAIN_ID = 'akashnet-2';
    const { wallet, account} = await getWallet();
    const offlineSigner = wallet;

    const accounts = await offlineSigner.getAccounts();
    const address = accounts[0].address;  
    
    const akash = await Akash.connect(RPC, offlineSigner);

    // Query certificate
    const response = await akash.query.cert.list.params({
        owner: address,
    })

    console.log(response);

}


const makeDeployment = async () => {
    console.log("Seting cryptoEngine...");
    setEngine("newEngine", crypto.webcrypto.subtle as unknown as ICryptoEngine);
 

    console.log("Making deployment...");
    const deployYMLStr = fs.readFileSync('./hello.yml', 'utf8');

    const CHAIN_ID = 'akashnet-2';
    const { wallet, account} = await getWallet();
    const offlineSigner = wallet;

    const accounts = await offlineSigner.getAccounts();
    const address = accounts[0].address;  
    
    const akash = await Akash.connect(RPC, offlineSigner);
    const sdl = new SDL(deployYMLStr);

    console.log("SDL", JSON.stringify(sdl));

    const response = await akash.tx.deployment.create.params({
    sdl: sdl
    });

    console.log('Deployment created');
    console.log(response);

    const {
    dseq, gseq, oseq
    } = findDeploymentSequence(response);

    console.log('Deployment sequence');
    console.log(dseq, gseq, oseq);

    let count = 0;
    while(count < 5){
        const prom = await new Promise((resolve, reject) => {
            setTimeout(async () => {
                resolve(true)
            }, 10000);
        });
    
        console.log('Getting bids');
    
        const responseBid = await akash.query.market.bid.list.params({
            owner: account.address,
            dseq: dseq
        });
    
        console.log('//////// Bids /////////');
        console.log('\n\n');
        console.log(JSON.stringify(responseBid, undefined, 2));
        console.log('\n\n');
        console.log('//////// END Bids /////////');
        console.log('\n\n');

        count += 1;
    }

}

makeDeployment();

