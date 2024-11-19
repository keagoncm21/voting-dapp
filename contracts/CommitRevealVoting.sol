// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommitRevealVoting {
    //events
    event VoteCommitted(address indexed voter);
    event VoteRevealed(address indexed voter, bool vote);
    event VotingEnded(uint yesVotes, uint noVotes);

    //state variables
    enum Phase { Commit, Reveal, Ended }
    Phase public currentPhase;

    uint public commitDeadline;
    uint public revealDeadline;

    mapping(address => bytes32) public commitments; //voter's hashed commitment
    mapping(address => bool) public revealed; //tracks whether voter has revealed
    uint public yesVotes; //count of "Yes" votes
    uint public noVotes; //count of "No" votes

    //constructor to initialize commit and reveal durations
    constructor(uint commitDuration, uint revealDuration) {
        commitDeadline = block.timestamp + commitDuration;
        revealDeadline = commitDeadline + revealDuration;
        currentPhase = Phase.Commit;
    }

    //modifier to ensure actions are done in the correct phase
    modifier inPhase(Phase phase) {
        if (phase == Phase.Commit) {
            require(block.timestamp < commitDeadline, "Action not allowed in this phase");
        } else if (phase == Phase.Reveal) {
            require(block.timestamp >= commitDeadline && block.timestamp < revealDeadline, "Action not allowed in this phase");
        } else if (phase == Phase.Ended) {
            require(block.timestamp >= revealDeadline, "Action not allowed in this phase");
        }
        _;
    }


    //function to commit a vote (hashed)
    function commitVote(bytes32 hashedVote) external inPhase(Phase.Commit) {
        require(commitments[msg.sender] == 0, "Vote already committed");
        commitments[msg.sender] = hashedVote;
        emit VoteCommitted(msg.sender);
    }

    function revealVote(bool vote, string calldata keyword) external inPhase(Phase.Reveal) {
        require(commitments[msg.sender] != 0, "No vote to reveal");
        require(!revealed[msg.sender], "Vote already revealed");

        bytes32 hashedVote = keccak256(abi.encodePacked(vote, keyword));
        require(commitments[msg.sender] == hashedVote, "Invalid vote or keyword");

        revealed[msg.sender] = true;
        if (vote) {
            yesVotes++;
        } else {
            noVotes++;
        }

        emit VoteRevealed(msg.sender, vote);
    }

    //function to end the voting
    function endVoting() external {
        require(block.timestamp >= revealDeadline, "Reveal phase not yet ended");
        require(currentPhase != Phase.Ended, "Voting already ended");

        currentPhase = Phase.Ended;
        emit VotingEnded(yesVotes, noVotes);
    }


    //debugging functions V
    function getCurrentPhase() public view returns (string memory) {
        if (block.timestamp < commitDeadline) {
            return "Commit Phase";
        } else if (block.timestamp < revealDeadline) {
            return "Reveal Phase";
        } else {
            return "Ended";
        }
    }

    function getCommitment(address voter) public view returns (bytes32) {
        return commitments[voter];
    }

    function getCurrentBlockTimestamp() public view returns (uint) {
        return block.timestamp;
    }

    function computeHash(bool vote, string memory keyword) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(vote, keyword));
    }


}
