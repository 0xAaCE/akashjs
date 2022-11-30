import axios from 'axios';
import https from 'https';

import { providerGatewayPost, submitManifestPath } from "../utils/provider";
import { Akash } from "../akash/akash";
import { SDL } from "../utils/deployment";
import { getPemStrings } from "../utils/certificate";

export interface ProviderSendManifestParams {
  sdl: SDL,
  dseq: Long,
  provider: string,
}

export class ProviderSendManifest {
  private readonly akash: Akash;

  constructor(akash: Akash) {
    this.akash = akash;
  }

  public async params(params: ProviderSendManifestParams) {
    const owner = this.akash.address;

    const {
      sdl,
      dseq,
      provider,
    } = params;

    const manifest = sdl.manifest;

    const r = await this.akash.query.provider.get.params({ provider: provider });
    const providerUri = r.provider?.hostUri;
    
    if (!providerUri) {
      throw new Error(`Provider ${provider} not found on chain.`);
    }

    const uri = `${providerUri}${submitManifestPath(dseq.toNumber())}`;

    const pem = await getPemStrings(owner);

    const httpsAgent = new https.Agent({
      cert: pem.cert,
      key: pem.key,
      rejectUnauthorized: false
    });

    const res = await axios.put(uri, manifest, { httpsAgent });

    return res.data;

    // return providerGatewayPost(
    //   uri,
    //   providerUri,
    //   owner,
    //   'SEND_MANIFEST',
    //   { manifest: manifest }
    // ).then(response => response.text());
  }
}