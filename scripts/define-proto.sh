#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

# In the proto directory:
# git clone https://github.com/ovrclk/akash.git (checkout version, e.g. git checkout v0.14.0)
# git clone https://github.com/cosmos/cosmos-sdk.git (checkout version, e.g. git checkout v0.44.1)
# git use buf into cosmo-sdc library to get third_party proto files
# buf export buf.build/cosmos/cosmos-sdk --output ../third_party/proto

PROTOC_BIN="protoc"
AKASH_PROTO_DIR="./proto/akash/proto"
COSMOS_PROTO_DIR="./proto/cosmos-sdk/proto"
THIRD_PARTY_PROTO_DIR="./proto/cosmos-sdk/third_party/proto"
OUT_DIR="../src/codec/"

mkdir -p "$OUT_DIR"

$PROTOC_BIN \
  --plugin="../node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out="$OUT_DIR" \
  --proto_path="$COSMOS_PROTO_DIR" \
  --proto_path="$AKASH_PROTO_DIR" \
  --proto_path="$THIRD_PARTY_PROTO_DIR" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=true" \
  "$AKASH_PROTO_DIR/akash/base/v1beta2/attribute.proto" \
  "$AKASH_PROTO_DIR/akash/base/v1beta2/endpoint.proto" \
  "$AKASH_PROTO_DIR/akash/base/v1beta2/resource.proto" \
  "$AKASH_PROTO_DIR/akash/base/v1beta2/resourceunits.proto" \
  "$AKASH_PROTO_DIR/akash/base/v1beta2/resourcevalue.proto" \
  "$AKASH_PROTO_DIR/akash/audit/v1beta2/audit.proto" \
  "$AKASH_PROTO_DIR/akash/audit/v1beta2/genesis.proto" \
  "$AKASH_PROTO_DIR/akash/audit/v1beta2/query.proto" \
  "$AKASH_PROTO_DIR/akash/cert/v1beta2/cert.proto" \
  "$AKASH_PROTO_DIR/akash/cert/v1beta2/genesis.proto" \
  "$AKASH_PROTO_DIR/akash/cert/v1beta2/query.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/authz.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/deployment.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/deploymentmsg.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/genesis.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/group.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/groupid.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/groupmsg.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/groupspec.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/params.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/query.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/resource.proto" \
  "$AKASH_PROTO_DIR/akash/deployment/v1beta2/service.proto" \
  "$AKASH_PROTO_DIR/akash/escrow/v1beta2/types.proto" \
  "$AKASH_PROTO_DIR/akash/escrow/v1beta2/query.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/bid.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/lease.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/order.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/params.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/query.proto" \
  "$AKASH_PROTO_DIR/akash/market/v1beta2/service.proto" \
  "$AKASH_PROTO_DIR/akash/provider/v1beta2/provider.proto" \
  "$AKASH_PROTO_DIR/akash/provider/v1beta2/query.proto"

# Remove unnecessary codec files
rm -rf \
  "$OUT_DIR/gogoproto/" \
  "$OUT_DIR/google/"