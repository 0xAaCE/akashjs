import { EncodeObject } from "@cosmjs/proto-signing";
import {
  MsgCloseGroup,
  MsgPauseGroup,
  MsgStartGroup
} from "../codec/akash/deployment/v1beta2/groupmsg";
import {
  MsgCreateCertificate,
  MsgRevokeCertificate
} from "../codec/akash/cert/v1beta2/cert";
import {
  MsgCreateDeployment,
  MsgCloseDeployment,
  MsgDepositDeployment,
  MsgUpdateDeployment
} from "../codec/akash/deployment/v1beta2/deploymentmsg";
import { MsgCreateLease } from "../codec/akash/market/v1beta2/lease";

export interface MsgCreateCertificateEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.cert.v1beta2.MsgCreateCertificate";
  readonly value: MsgCreateCertificate;
}

export interface MsgRevokeCertificateEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.cert.v1beta2.MsgRevokeCertificate";
  readonly value: MsgRevokeCertificate;
}

export interface MsgCreateDeploymentEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgCreateDeployment";
  readonly value: MsgCreateDeployment;
}

export interface MsgCloseDeploymentEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgCloseDeployment";
  readonly value: MsgCloseDeployment;
}

export interface MsgDepositDeploymentEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgDepositDeployment",
  readonly value: MsgDepositDeployment;
}

export interface MsgUpdateDeploymentEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgUpdateDeployment",
  readonly value: MsgUpdateDeployment;
}

export interface MsgCloseGroupEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgCloseGroup",
  readonly value: MsgCloseGroup;
}

export interface MsgPauseGroupEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgPauseGroup",
  readonly value: MsgPauseGroup;
}

export interface MsgStartGroupEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.deployment.v1beta2.MsgStartGroup",
  readonly value: MsgStartGroup;
}

export interface MsgCreateLeaseEncodeObject extends EncodeObject {
  readonly typeUrl: "/akash.market.v1beta2.MsgCreateLease",
  readonly value: MsgCreateLease;
}