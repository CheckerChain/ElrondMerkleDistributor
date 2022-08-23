PEM_FILE="../../../wallets/wallet-owner.pem"
AIRDROP_CONTRACT="../output/airdrop.wasm"

PROXY_ARGUMENT="--proxy=https://devnet-api.elrond.com"
CHAIN_ARGUMENT="--chain=D"

build_airdrop() {
    (set -x; erdpy --verbose contract build "$AIRDROP_CONTRACT")
}

deploy_airdrop() {
    local AIRDROP_TOKEN=0x41495244524f50312d363464393034
                          
    local OUTFILE="out.json"
    (set -x; erdpy contract deploy --metadata-payable --bytecode="$AIRDROP_CONTRACT" \
        --pem="$PEM_FILE" \
        $PROXY_ARGUMENT $CHAIN_ARGUMENT \
        --outfile="$OUTFILE" --recall-nonce --gas-limit=60000000 \
        --arguments ${AIRDROP_TOKEN} --send \
        || return)

    local RESULT_ADDRESS=$(erdpy data parse --file="$OUTFILE" --expression="data['emitted_tx']['address']")
    local RESULT_TRANSACTION=$(erdpy data parse --file="$OUTFILE" --expression="data['emitted_tx']['hash']")

    echo ""
    echo "Deployed contract with:"
    echo "  \$RESULT_ADDRESS == ${RESULT_ADDRESS}"
    echo "  \$RESULT_TRANSACTION == ${RESULT_TRANSACTION}"
    echo ""
}

deploy_airdrop
