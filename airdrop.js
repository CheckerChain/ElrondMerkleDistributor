require("dotenv").config();
const {
  ProxyNetworkProvider,
} = require("@elrondnetwork/erdjs-network-providers");
const {
  Address,
  AbiRegistry,
  Account,
  SmartContract,
  SmartContractAbi,
  ContractFunction,
  BigUIntValue,
  BytesValue,
} = require("@elrondnetwork/erdjs");
const { UserSigner } = require("@elrondnetwork/erdjs-walletcore");
const { BigNumber } = require("bignumber.js");
const { promises, fs, readFileSync } = require("fs");

const { generateTree } = require("@checkerchain/elrond-merkle-tree-generator");
const { formatHexToU8, formProofs } = require("./utils");

const proxyProvider = new ProxyNetworkProvider("https://devnet-api.elrond.com");
const airdropContract = process.env.CONTRACT;

//Owner
const ownerPEMFile = readFileSync("./wallets/wallet-owner.pem", {
  encoding: "utf8",
}).trim();
const owner = UserSigner.fromPem(ownerPEMFile);
const ownerAccount = new Account(owner.getAddress());

//User Signer
const keyFileJson = readFileSync("./wallets/user.json", {
  encoding: "utf8",
}).trim();
const keyFileObject = JSON.parse(keyFileJson);

const signer = UserSigner.fromWallet(keyFileObject, process.env.KEY);
const userAccount = new Account(signer.getAddress());

const generateAirdropData = () => {
  //Test Wallets
  const testWallets = [
    {
      index: "1",
      wallet: "erd13wsm72uc0c2fwgtpwjn0xlrzfdh7kg59jmrnfcjh9fhqsp7g5yas5sy69l",
      amount: "1000000",
    },
    {
      index: "2",
      wallet: "erd14pgqys8lzhdfnuseev4yh3hfrq2423u8wxkd3fkxsvvpvyannzrs88l2nt",
      amount: "1000000",
    },
    {
      index: "3",
      wallet: "erd1xd4amn9w3udwjz9p4myd3rxgtkks807myn5hcsagtd7nw57g3a5q06e743",
      amount: "1000000",
    },
    {
      index: "4",
      wallet: "erd162tsmpj0rw8zmfw3yrv6e82qk50ny4e4gtsumqfxf7ddn32t92xqpma2tp",
      amount: "1000000",
    },
    {
      index: "5",
      wallet: "erd12ugyqdjw48ja34x5pmwu69jaaz3pskknm4vwutu6eymah2py2kqqhryazx",
      amount: "1000000",
    },
  ];

  return generateTree(testWallets);
};

const setUpContract = async () => {
  //Set Up ABI
  let jsonContent = await promises.readFile("airdrop.abi.json", {
    encoding: "utf8",
  });
  let json = JSON.parse(jsonContent);
  let abiRegistry = AbiRegistry.create(json);
  let abi = new SmartContractAbi(abiRegistry, ["Airdrop"]);

  //Fetch And Update Account
  let fetchedUserAccount = await proxyProvider.getAccount(signer.getAddress());
  let fetchedOwnerAccount = await proxyProvider.getAccount(owner.getAddress());
  userAccount.update(fetchedUserAccount);
  ownerAccount.update(fetchedOwnerAccount);

  //Set Airdrop Contract
  const contract = new SmartContract({
    address: new Address(airdropContract),
    abi: abi,
  });

  return contract;
};

const setEpochRoot = async (result, contract) => {
  let transactionSetEpochRoot = contract.call({
    func: new ContractFunction("set_epoch_root"),
    gasLimit: 5000000,
    args: [
      new BigUIntValue(new BigNumber(15)),
      BytesValue.fromHex(result.root.replace("0x", "")),
    ],
    chainID: "D",
  });

  transactionSetEpochRoot.setNonce(ownerAccount.getNonceThenIncrement());
  await owner.sign(transactionSetEpochRoot);
  const txHash = await proxyProvider.sendTransaction(transactionSetEpochRoot);
  console.log("Set Hash is", txHash);
};

const claim = async (result, contract) => {
  let transactionClaim = contract.call({
    func: new ContractFunction("claim"),
    gasLimit: 10000000,
    args: [
      formProofs(result.data[4].proof),
      new BigUIntValue(new BigNumber(5)),
      new BigUIntValue(new BigNumber(1000000)),
      new BigUIntValue(new BigNumber(15)),
    ],
    chainID: "D",
  });

  transactionClaim.setNonce(userAccount.getNonceThenIncrement());
  await signer.sign(transactionClaim);
  const txHash = await proxyProvider.sendTransaction(transactionClaim);
  console.log("Claim Hash is", txHash);
};

const doAirdrop = async () => {
  let result = generateAirdropData();
  let contract = await setUpContract();
  await setEpochRoot(result, contract);
  await claim(result, contract);
};

doAirdrop();
