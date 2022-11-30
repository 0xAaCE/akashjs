import Long from "long";
import { Akash, defaultFee, denom } from "../akash/akash";
import { MsgCreateDeployment } from "../codec/akash/deployment/v1beta2/deploymentmsg";
import { BroadcastTxResponse } from "@cosmjs/stargate";
import { TxParams } from "../akash/types";
import { Coin } from "../codec/cosmos/base/v1beta1/coin";
import { SDL, currentBlockHeight } from "../utils/deployment";
import { MsgCreateDeploymentEncodeObject } from "./encodeobjects";

export interface TxDeploymentCreateParams extends TxParams {
  sdl: SDL,
  dseq?: number,
  deposit?: Coin
}

export class TxDeploymentCreate {
  private readonly akash: Akash;

  constructor(akash: Akash) {
    this.akash = akash;
  }

  public async params(params: TxDeploymentCreateParams): Promise<MsgCreateDeploymentEncodeObject> {
    const owner = this.akash.address;

    const {
      deposit = {
        denom: denom,
        amount: "5000000"
      },
      dseq = await currentBlockHeight(this.akash),
      sdl
    } = params;

    const request: MsgCreateDeployment = {
      id: {
        owner: owner,
        dseq: new Long(dseq)
      },
      groups: sdl.groups,
      version: new Uint8Array(await sdl.manifestVersion()),
      deposit: deposit,
      depositor: owner
    };

    const message: MsgCreateDeploymentEncodeObject = {
      typeUrl: "/akash.deployment.v1beta2.MsgCreateDeployment",
      value: request
    };

    return message;
  }

  public async execute(message: MsgCreateDeploymentEncodeObject): Promise<BroadcastTxResponse> {
    return this.akash.signingClient.deploymentCreate(this.akash.address, message.value, defaultFee, '');
  }
}