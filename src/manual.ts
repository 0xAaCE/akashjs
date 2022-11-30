import fs from 'fs';
import crypto from 'crypto';
import { ICryptoEngine, setEngine } from 'pkijs';
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

import { Akash, SDL, findDeploymentSequence } from './index';

const apiEndpoint = "https://api.akash.forbole.com:443"
const RPC = "https://rpc.akash.forbole.com:443"

const getWallet = async () => {
    const mnemonic = 'mnemonic';
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "akash" });
    // get first account
    const [account] = await wallet.getAccounts();
    return { wallet, account };
}

const queryCertificate = async () => {
    console.log("Querying certificate...");
    const { wallet, account } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);

    // Query certificate
    const response = await akash.query.cert.list.params({
        owner: account.address,
    })
    return response;
}


const makeDeployment = async () => {
    console.log("Making deployment...");
    const deployYMLStr = fs.readFileSync('./hello.yml', 'utf8');
    const { wallet } = await getWallet();
    const offlineSigner = wallet;
    
    const akash = await Akash.connect(RPC, offlineSigner);
    const sdl = new SDL(deployYMLStr);
    const deployment = await akash.tx.deployment.create.params({ sdl: sdl });

    console.log('Deployment created');
    console.log(JSON.stringify(deployment, null, 2));

    console.log('Executing deployment');
    const response = await akash.tx.deployment.create.execute(deployment);
    const { dseq, gseq, oseq } = findDeploymentSequence(response);

    console.log('Deployment sequence');
    console.log(dseq, gseq, oseq);
    return { dseq, gseq, oseq, deployment: deployment };
}


const getBids = async ({ dseq }:{ dseq: number }) => {
    const { wallet, account } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const bids = await akash.query.market.bid.list.params({
        owner: account.address,
        dseq: dseq
    });
    return bids;
};

const listDeployments = async () => {
    const { wallet, account } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const deployments = await akash.query.deployment.list.params({
        owner: account.address,
        state: 'active'
    });
    return deployments;
}

const closeDeployment = async ({ dseq }: { dseq: number }) => {
    const { wallet } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const response = await akash.tx.deployment.close.params({
        dseq
    });
    console.log('Close deployment');
    console.log(response);
};

const clearOpenDeployments = async () => {
    const deployments = await listDeployments();
    console.log('Deployments');
    console.log(JSON.stringify(deployments, null, 2));
    const dseqs = deployments.deployments.map(d => d.deployment?.deploymentId?.dseq.toString());
    console.log('dseqs', dseqs);
    console.log('Deleting open deployments');
    await Promise.all(dseqs.map(async (dseq) => {
        console.log('Deleting deployment with dseq', dseq);
        const deleteResp = await closeDeployment({ dseq: parseInt(dseq!) });
        console.log('deleteResp', deleteResp);
    }));
    console.log('Deleted');
    console.log('Fetching deployments again...');
    const deployments2 = await listDeployments();
    console.log('Deployments');
    console.log(JSON.stringify(deployments2, null, 2));
};

const main = async () => {
    // console.log('crypto', crypto);
    setEngine("newEngine", crypto.webcrypto.subtle as unknown as ICryptoEngine);
    // const { deployment, ...bidParams } = await makeDeployment();
    // const bids = await getBids({ dseq: 8693981});
    // console.log('Bids');
    // console.log(bids);
    // const deployments = await listDeployments();
    // console.log('Deployments');
    // console.log(JSON.stringify(deployments, null, 2));
    await clearOpenDeployments();
};

main();