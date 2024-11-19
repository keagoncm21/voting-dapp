import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CommitRevealVotingABI from "./CommitRevealVoting.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [vote, setVote] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  //initialize the provider, signer and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(tempProvider);
        const tempSigner = await tempProvider.getSigner();
        setSigner(tempSigner);
        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CommitRevealVotingABI.abi,
          tempSigner
        );
        setContract(tempContract);
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };
    init();
  }, []);

  //connect to metamask
  const connectWallet = async () => {
    if (provider) {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    }
  };

  //fetch current voting phase
  const fetchPhase = async () => {
    if (contract) {
      try {
        const phase = await contract.getCurrentPhase();
        setCurrentPhase(phase);
      } catch (error) {
        console.error("Error fetching phase:", error);
      }
    }
  };

  //fetch current votes
  const fetchVoteCounts = async () => {
    if (contract) {
      try {
        const yesVotesCount = await contract.yesVotes();
        const noVotesCount = await contract.noVotes();
        setYesVotes(Number(yesVotesCount));
        setNoVotes(Number(noVotesCount));
      } catch (error) {
        console.error("Error fetching vote counts:", error);
      }
    }
  };

  //commit vote
  const commitVote = async () => {
    if (contract && vote && keyword) {
      try {
        const hashedVote = ethers.keccak256(
          ethers.solidityPacked(["bool", "string"], [vote === "yes", keyword])
        );
        const tx = await contract.commitVote(hashedVote);
        setStatus("Committing your vote...");
        await tx.wait();
        setStatus("Vote committed successfully!");
      } catch (error) {
        console.error("Error committing vote:", error);
        setStatus("Error committing vote.");
      }
    } else {
      alert("Please enter a vote and a keyword.");
    }
  };

  //reveal vote
  const revealVote = async () => {
    if (contract && vote && keyword) {
      try {
        const tx = await contract.revealVote(vote === "yes", keyword);
        setStatus("Revealing your vote...");
        await tx.wait();
        setStatus("Vote revealed successfully!");
      } catch (error) {
        console.error("Error revealing vote:", error);
        setStatus("Error revealing vote.");
      }
    } else {
      alert("Please enter your vote and keyword to reveal.");
    }
  };

  //occasionally get the phase and vote counts
  useEffect(() => {
    if (contract) {
      fetchPhase();
      fetchVoteCounts();
      const interval = setInterval(() => {
        fetchPhase();
        fetchVoteCounts();
      }, 5000); //every 5 sec
      return () => clearInterval(interval);
    }
  }, [contract]);

  //ui
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Commit-Reveal Voting DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}
      <h2>Current Phase: {currentPhase}</h2>
      <div>
        <h3>Commit Your Vote</h3>
        <input type="text" placeholder="Enter Yes or No" value={vote} onChange={(e) => setVote(e.target.value.toLowerCase())} />
        <input type="text" placeholder="Enter a keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button onClick={commitVote}>Commit Vote</button>
      </div>
      <div>
        <h3>Reveal Your Vote</h3>
        <input type="text" placeholder="Enter Yes or No" value={vote} onChange={(e) => setVote(e.target.value.toLowerCase())} />
        <input type="text" placeholder="Enter your keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button onClick={revealVote}>Reveal Vote</button>
      </div>
      <div>
        <h3>Results</h3>
        <p>Yes Votes: {yesVotes}</p>
        <p>No Votes: {noVotes}</p>
      </div>
      <p>{status}</p>
    </div>
  );
}

export default App;
