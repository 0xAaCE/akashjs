import fs from 'fs';
import dotenv from 'dotenv';
import { ICryptoEngine, setEngine } from 'pkijs';
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

import { Akash, SDL, findDeploymentSequence } from './index';
import { QueryBidsResponse } from './codec/akash/market/v1beta2/query';
import { Bid, BidID } from './codec/akash/market/v1beta2/bid';
import { MsgCreateDeploymentEncodeObject } from './akash/encodeobjects';
import cryptoEngine from './utils/crypto-engine';
import Long from 'long';

dotenv.config();

const apiEndpoint = "https://api.akash.forbole.com:443"
const RPC = "https://rpc.akash.forbole.com:443"

const MNEMONIC = process.env.MNEMONIC;

const getWallet = async () => {
    const mnemonic = MNEMONIC || "";
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "akash" });
    // get first account
    const [account] = await wallet.getAccounts();
    return { wallet, account };
}

const createCertificate = async () => {
    console.log("Creating certificate...");
    const { wallet, account } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const response = await akash.tx.cert.create.client.params();

    console.log('Create certificate');
    console.log(response);
    return response;
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

const getDeploymentParams = async () => {
    const deployYMLStr = fs.readFileSync('./hello.yml', 'utf8');
    const { wallet } = await getWallet();
    const offlineSigner = wallet;
    
    const akash = await Akash.connect(RPC, offlineSigner);

    const sdl = new SDL(deployYMLStr);
    const deployment = await akash.tx.deployment.create.params({ sdl: sdl });

    return { deployment , sdl };
}


const makeDeployment = async (deployment: MsgCreateDeploymentEncodeObject, sdl: SDL) => {
    console.log("Making deployment...");
    const { wallet } = await getWallet();
    const offlineSigner = wallet;
    
    const akash = await Akash.connect(RPC, offlineSigner);


    console.log('Executing deployment');
    const response = await akash.tx.deployment.create.execute(deployment);

    console.log('Deployment response');
    console.log(response);
    const { dseq, gseq, oseq } = findDeploymentSequence(response);
    return { dseq, gseq, oseq };
};

const getBids = async ({ dseq }:{ dseq: number }) => {
    const { wallet, account } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const bids = await akash.query.market.bid.list.params({
        owner: account.address,
        dseq: dseq
    });
    return bids;
};

const selectBid = async (bids: QueryBidsResponse) => {
    const { wallet } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    const bid = bids.bids[0];
    

    return bid;
}

const createLease = async (bid: Bid) => {
    const { wallet } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    if (!bid.bidId) throw new Error('Bid ID not found');

    console.log('Executing lease');
    const response = await akash.tx.market.lease.create.params({
        ...bid.bidId,
    });

    console.log('Lease response');
    console.log(response);
    return response;
}

const sendManifest = async (sdl: SDL, bidId: BidID | undefined) => {
    const { wallet } = await getWallet();
    const akash = await Akash.connect(RPC, wallet);
    if (!bidId) throw new Error('Bid ID not found'); 
    
    console.log('Sending manifest');
    const response = await akash.provider.sendManifest.params({
        ...bidId,
        sdl,
    });

    console.log('Manifest response');
    console.log(response);
    return response;
}

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
    for (const dseq of dseqs) {
        await closeDeployment({ dseq: parseInt(dseq!) });
    }
    console.log('Deleted');
    console.log('Fetching deployments again...');
    const deployments2 = await listDeployments();
    console.log('Deployments');
    console.log(JSON.stringify(deployments2, null, 2));
};

const main = async () => {
    // console.log('crypto', crypto);

    setEngine("newEngine", cryptoEngine);


    await createCertificate();

    const { deployment, sdl } = await getDeploymentParams();

    const { ...bidParams } = await makeDeployment(deployment, sdl);

    console.log('Bid params', bidParams);
    
    const bids = await new Promise(resolve => {
        setTimeout(async () => {
            const bids = await getBids(bidParams);
            resolve(bids);
        }, 10000);
    }) as QueryBidsResponse;
    
    const bid = await selectBid(bids);
    if (!bid.bid) throw new Error('Bid not found');

    const lease = await createLease(bid.bid);

    const bidId = bid.bid.bidId;

    // const bidId = {
    //     owner: "akash1hhv46uel0a3w63pj2afveaqqhk2sujcelct69t",
    //     dseq: new Long(8708541),
    //     gseq: 1,
    //     oseq: 1,
    //     provider: "akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf",
    // }

    console.log('Sending manifest', JSON.stringify(sdl));

    const manifest = await sendManifest(sdl, bidId);

    
    // const deployments = await listDeployments();
    // console.log('Deployments');
    // console.log(JSON.stringify(deployments, null, 2));
    // await clearOpenDeployments();
};

main();