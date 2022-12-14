## Airdrop Implementations on Elrond Blockchain using Merkle Distribution.

### Step By Step Guides : [Creating Merkle Distributor On Elrond](https://medium.com/@bhantanasmit/creating-merkle-distributor-on-elrond-c60790e5f982) [![N|Solid](https://img.icons8.com/ios-glyphs/30/000000/medium-logo.png)](https://medium.com/@bhantanasmit/creating-merkle-distributor-on-elrond-c60790e5f982)

### Installation:

```sh
npm i
```

##### Create .env with:

- KEY
- CONTRACT

##### Create Wallets with:

```
erdpy --verbose wallet derive ./wallets/wallet-owner.pem --mnemonic
```

- wallet-owner.pem
- user.json

### Run:

```sh
node airdrop.js
```

Change Test Wallets for different Wallets data:

```js
const testWallets = [
  {
    index: '1',
    wallet: 'erd13wsm72uc0c2fwgtpwjn0xlrzfdh7kg59jmrnfcjh9fhqsp7g5yas5sy69l',
    amount: '1000000',
  },
  {
    index: '2',
    wallet: 'erd14pgqys8lzhdfnuseev4yh3hfrq2423u8wxkd3fkxsvvpvyannzrs88l2nt',
    amount: '1000000',
  },
  {
    index: '3',
    wallet: 'erd1xd4amn9w3udwjz9p4myd3rxgtkks807myn5hcsagtd7nw57g3a5q06e743',
    amount: '1000000',
  },
  {
    index: '4',
    wallet: 'erd162tsmpj0rw8zmfw3yrv6e82qk50ny4e4gtsumqfxf7ddn32t92xqpma2tp',
    amount: '1000000',
  },
  {
    index: '5',
    wallet: 'erd12ugyqdjw48ja34x5pmwu69jaaz3pskknm4vwutu6eymah2py2kqqhryazx',
    amount: '1000000',
  },
  {
    index: 'userIndex',
    wallet: 'userWallet',
    amount: 'userAmount',
  },
];
```

Make Corresponding Changes on Claim function:

```js
const claim = async (result, contract) => {
  let transactionClaim = contract.call({
    func: new ContractFunction("claim"),
    gasLimit: 10000000,
    args: [
      formProofs(result.data[<userIndex>].proof),
      new BigUIntValue(new BigNumber(<userIndex>)),
      new BigUIntValue(new BigNumber(<userAmount>)),
      new BigUIntValue(new BigNumber(<claimEpoch>)),
    ],
    chainID: "D",
  });
};
``

```
