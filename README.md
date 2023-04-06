# Baseball Card Store Dapp
The Baseball Card Store Dapp sells baseball cards as NFT tokens in exchange for tokens.

## Setup the Agoric SDK
Install the [prerequisites](https://agoric.com/documentation/getting-started/before-using-agoric.html).

Switch to the `community-dev` branch of the agoric-sdk:
```sh
# Use the root directory of the agoric-sdk checkout
cd agoric-sdk
# Switch the community-dev stable branch
git checkout community-dev
# Build the dependencies
yarn && yarn build
```

## Run the Dapp
To run the dapp, you'll use 3 separate terminal windows

### Initialize the Agoric VM
```sh
# Terminal 1
# Use the root directory of the dapp-card-store checkout
cd dapp-card-store
# Install the project dependencies
agoric install community-dev
# Start the Agoric VM. This will take a few minutes to complete.
agoric start --reset --verbose
```

### Open the Agoric Wallet and REPL UI

```sh
# Terminal 2
# Use the root directory of the dapp-card-store checkout
cd dapp-card-store
# Open the Agoric solo wallet and repl in a new browser window or tab
agoric open --repl
```

### Deploy the Contract and API
```sh
# Terminal 2
# Use the root directory of the dapp-card-store checkout
cd dapp-card-store
# Deploy a new instance of the contract to the VM
agoric deploy ./contract/deploy.js
# Deploy a new instance of the API to the VM
agoric deploy ./api/deploy.js
```

### Start the Dapp UI
```sh
# Terminal 3
# Use the root directory of the dapp-card-store checkout
cd dapp-card-store
# Start the user interface
cd ui && yarn start
```

## Using the Dapp
1. `agoric open` will have opened your wallet at http://127.0.0.1:8000/

1. `yarn start` will open a the Dapp at http://127.0.0.1:3000.

1. In the wallet, `Accept` the `Dapp Connection` between cardStore and the wallet.

   ![Accept Dapp Connection](./readme-assets/accept-dapp-connection.png)

1. In the dapp, you should be able to click on a baseball card to `BID` on it in an action. Enter `Bid ammount` to submit an offer to buy the card.

   ![Bid on Card](./readme-assets/bid-on-card.png)

1. In the wallet, `Approve` the `Proposed` offer to bid on a card.

   ![Proposed Offer](./readme-assets/proposed-offer.png)

1. In the wallet, the offer will be in a `Pending` state while the auction for the card to complete. The auction takes up to 300 seconds.

   ![Pending Offer](./readme-assets/pending-offer.png)

1. In the wallet, your offer will transition to an `Accepted` state when the auction ends. Your `cardStore.Card` purse will now contain a card

   ![Accepted Offer](./readme-assets/accepted-offer.png)

To learn more about how to build Agoric Dapps, please see the [Dapp Guide](https://agoric.com/documentation/dapps/).
