# Baseball Card Store Dapp

TL;DR:

The Baseball Card Store Dapp sells baseball cards as NFT tokens in
exchange for money.

*This dapp requires the
[Fungible Faucet Dapp](https://github.com/Agoric/dapp-fungible-faucet)to be running, so
please [follow the
instructions](https://github.com/Agoric/dapp-fungible-faucet) to set
up the Fungible Faucet Dapp first and give yourself some tokens. This
dapp runs on port 3001, whereas the Fungible Faucet Dapp runs on port 3000.*

Install the
[prerequisites](https://agoric.com/documentation/getting-started/before-using-agoric.html).


Then in a first terminal in the directory where you want to put your dapp, install the dapp:
```sh
agoric init --dapp-template dapp-card-store my-card-store
cd my-card-store
agoric install
# The Agoric platform should be already started so there is no need to run `agoric start`
```

In a second terminal, deploy this contract and the API server
```sh
agoric deploy contract/deploy.js
agoric deploy api/deploy.js
```

In a third terminal, 
```sh
# Navigate to the `ui` directory and start a local server
cd ui && yarn start
```
Then navigate to http://127.0.0.1:3001.

The Fungible Faucet Dapp is the simplest [Agoric
Dapp](https://agoric.com/documentation/dapps/). It
demonstrates the three important parts of
a dapp and how they should be connected:
1. the browser UI (the frontend)
2. the API server (the backend)
3. the on-chain contract

This dapp starts a local
blockchain on your computer, and deploys a basic contract to that
blockchain. It does not currently deploy or connect to the Agoric testnet.

This particular dapp UI is written in vanilla JS for simplicity (as
opposed to using a framework).

## Using the Dapp

1. Navigate to http://127.0.0.1:3001.
2. Enter `agoric open` in your terminal
3. A window for your wallet should open.
4. Under "Dapps" in the wallet, enable the CardStore Dapp.
5. Now you should be able to click on a card to make an offer to buy
   it.
6. Approve the offer in your wallet
7. View the card in your wallet.

![Card Store](./readme-assets/card-store.png)

To learn more about how to build Agoric Dapps, please see the [Dapp Guide](https://agoric.com/documentation/dapps/).

See the [Dapp Deployment Guide](https://github.com/Agoric/agoric-sdk/wiki/Dapp-Deployment-Guide) for how to deploy this Dapp on a public website, such as https://cardstore.testnet.agoric.com/
