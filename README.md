# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```





# SYSTEM MANUAL (to run on own system):

Summary:
This DApp uses a commit-reveal voting system (ETH).

Tech Stack:
React -> UI
ethers.js -> blockchain integration
MetaMask -> wallet connection


How to run:

First make sure node.js, metamask, ethers, react, and hardhat are all installed. 

Once everything is properly installed and ready to go, you can open up three windows of powershell.

In each window, type "cd 'file location here' (one of the windows must directed to the react app location).
Once powershell is opened in the right place, you can continue by going to the first window and typing the following:

npx hardhat compile

After compiling, copy over the CommitRevealVOting.json file from artifacts/contracts/commitrevealvoting.sol over to the src folder in frontend.

npx hardhat node

In the next window type:

npx hardhat run scripts/deploy.js --network localhost

Make sure your deployed address matches the one at the top of App.js

In the final window(react window) type:

npm start

From here, now you can go back to the browser window you just opened and connect metamask. Make sure the environment your working in has the following values:

Network Name: Whatever you want
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
and the token is ETH.

After that you can just enter in the values you want and continue. 

Votes can be made using metamask for 60 seconds until the reveal phase starts.


# USER MANUAL:

Access the DApp through your own network, or online.

Connect your MetaMask wallet and ensure you're connected to the correct network.

Commit your vote using a yes or no and a keyword. Then press the Commit Button.

Wait for the commit phase to finish (2 minutes).

Reveal your vote using the same vote and keyword once the reveal phase starts. Then press the Reveal Button.

Wait for the reveal phase to be over (2 minutes).

All votes should be accounted for once the reveal phase is over. 