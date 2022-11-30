import Long from "long";
import { Akash } from "../akash/akash";
import { MsgCreateLease } from "../codec/akash/market/v1beta2/lease";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { TxParams } from "../akash/types";

export interface TxMarketLeaseCreateParams extends TxParams {
  dseq: Long,
  gseq: number,
  oseq: number,
  provider: string
}

export const denom = "uakt";

export class TxMarketLeaseCreate {
  private readonly akash: Akash;

  constructor(akash: Akash) {
    this.akash = akash;
  }

  public async params(params: TxMarketLeaseCreateParams): Promise<DeliverTxResponse> {
    const owner = this.akash.address;

    const defaultFee = {
      amount: [
        {
          denom: denom,
          amount: "20000",
        }
      ],
      gas: "800000"
    }

    const {
      memo = "",
      fee = defaultFee,
      dseq,
      gseq,
      oseq,
      provider
    } = params;

    const request: MsgCreateLease = {
      bidId: {
        owner: owner,
        dseq: dseq,
        gseq: gseq,
        oseq: oseq,
        provider: provider
      }
    };

    return this.akash.signingClient.marketLeaseCreate(owner, request, fee, memo);
  }
}