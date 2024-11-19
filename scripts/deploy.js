const hre = require("hardhat");

async function main() {
  //get the contract factory
  const CommitRevealVoting = await hre.ethers.getContractFactory("CommitRevealVoting");

  //deploy the contract (constructor arguments: commitDuration and revealDuration)
  const votingContract = await CommitRevealVoting.deploy(120, 120);

  //wait for the deployment transaction to be mined
  await votingContract.waitForDeployment();

  //log the deployed contract address
  console.log("CommitRevealVoting deployed to:", votingContract.target);
}

//execute the main function and handle errors
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
