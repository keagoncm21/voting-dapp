const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CommitRevealVoting", function () {
  let votingContract;
  let owner, voter1, voter2;

  before(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    //deploy the contract
    const CommitRevealVoting = await ethers.getContractFactory("CommitRevealVoting");
    votingContract = await CommitRevealVoting.deploy(120, 120); // 2-minute commit and reveal phases
  });

  it("should allow users to commit and reveal votes", async function () {
    //hashing logic using ethers.js to match Solidity's abi.encodePacked
    const hashedVote1 = ethers.keccak256(
      ethers.solidityPacked(["bool", "string"], [true, "abc"])
    );
    const hashedVote2 = ethers.keccak256(
      ethers.solidityPacked(["bool", "string"], [false, "xyz"])
    );

    //voter 1 commits a "yes" vote with secret "abc"
    await votingContract.connect(voter1).commitVote(hashedVote1);

    //voter 2 commits a "no" vote with secret "xyz"
    await votingContract.connect(voter2).commitVote(hashedVote2);

    //debugging: Check stored commitments
    console.log("Voter 1 Commitment:", await votingContract.getCommitment(voter1.address));
    console.log("Voter 2 Commitment:", await votingContract.getCommitment(voter2.address));

    //debugging: Compute the hash in Solidity and compare
    const solidityHash1 = await votingContract.computeHash(true, "abc");
    const solidityHash2 = await votingContract.computeHash(false, "xyz");
    console.log("Solidity-Computed Hash 1:", solidityHash1);
    console.log("Solidity-Computed Hash 2:", solidityHash2);

    //assert the hashes match what was committed
    expect(solidityHash1).to.equal(hashedVote1);
    expect(solidityHash2).to.equal(hashedVote2);

    //fast forward time to the Reveal Phase
    console.log("Current Block Timestamp (before):", await votingContract.getCurrentBlockTimestamp());
    await ethers.provider.send("evm_increaseTime", [121]); // Fast forward 2 minutes
    await ethers.provider.send("evm_mine");
    console.log("Current Block Timestamp (after):", await votingContract.getCurrentBlockTimestamp());
    console.log("Current Phase:", await votingContract.getCurrentPhase());

    //debugging: Check if voter has already revealed
    console.log("Voter 1 Already Revealed:", await votingContract.revealed(voter1.address));

    //voter 1 reveals the vote
    await votingContract.connect(voter1).revealVote(true, "abc");

    //debugging: Check if voter has already revealed
    console.log("Voter 2 Already Revealed:", await votingContract.revealed(voter2.address));

    //voter 2 reveals the vote
    await votingContract.connect(voter2).revealVote(false, "xyz");

    //verify vote counts
    expect(await votingContract.yesVotes()).to.equal(1);
    expect(await votingContract.noVotes()).to.equal(1);
  });
});
