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
# If the Agoric platform has not been started
agoric start --reset --verbose
```

In a second terminal, enter `agoric open` in a terminal window to open a wallet.

When the UI changes from gray to white (be patient), transfer some
funds from the **Agoric RUN currency** purse to the **Zoe fees**
purse.

```sh
agoric deploy contract/deploy.js api/deploy.js
```

In a third terminal, 
```sh
# Navigate to the `ui` directory and start a local server
cd ui && yarn start
```

## Using the Dapp

1. `yarn start` will open a page at  http://127.0.0.1:3001.
3. A window for your wallet should open.
4. Under "Dapps" in the wallet, enable the CardStore Dapp.
5. Now you should be able to click on a card to make an offer to buy
   it.
6. Approve the offer in your wallet
7. View the card in your wallet.

![Card Store](./readme-assets/card-store.png)

To learn more about how to build Agoric Dapps, please see the [Dapp Guide](https://agoric.com/documentation/dapps/).

See the [Dapp Deployment Guide](https://github.com/Agoric/agoric-sdk/wiki/Dapp-Deployment-Guide) for how to deploy this Dapp on a public website, such as https://cardstore.testnet.agoric.com/
