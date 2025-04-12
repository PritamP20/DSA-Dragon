import Phaser from "phaser";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import abi from "./abi.json"
import { ethers } from "ethers";

// Your contract address
const CONTRACT_ADDRESS = "0x05631634713fb26BEC7ECC1cAe5E8F53dBC9270F";
//@ts-ignore
const web3 = new Web3(window.ethereum);
// const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/OgX2oq12FWRTYy5zEJj9_5BHxL_JktB0');

const NFT_CONTRACT_ABI: AbiItem[] =abi.abi;

export class NFTScene extends Phaser.Scene {
  // Class properties
  isMinting: boolean;
  mintButton: Phaser.GameObjects.Image;
  mintText: Phaser.GameObjects.Text;
  statusText: Phaser.GameObjects.Text;
  debugText: Phaser.GameObjects.Text; // Added for debugging
  nftImage: Phaser.GameObjects.Image;
  loadingSpinner: Phaser.GameObjects.Container | null;
  mintedNFTs: number;
  mintedHashes: string[] = [];
  hashText: Phaser.GameObjects.Text;
  connectWalletButton: Phaser.GameObjects.Rectangle;
  
  // Web3 properties
  web3: Web3 | null = null;
  account: string | null = null;
  nftContract: any = null;
  isWalletConnected: boolean = false;
  
  // Using the provided contract address
  contractAddress: string = CONTRACT_ADDRESS;
  chainConnected: boolean = false;

  constructor() {
    super({ key: "NFTScene" });
    this.isMinting = false;
    this.loadingSpinner = null;
    this.mintedNFTs = 0;
    this.mintedHashes = [];
  }

  preload() {
    // Load game assets
    this.load.image("nftImage", "pokeball.png");
  }

  async initializeWeb3() {
    try {
      this.updateDebug("Initializing Web3...");
      
      //@ts-ignore
      if (window.ethereum) {
        this.updateDebug("MetaMask detected");
        
        //@ts-ignore
        this.web3 = new Web3(window.ethereum);
        try {
          const chainId = await this.web3.eth.getChainId();
          this.updateDebug(`Connected to chain ID: ${chainId}`);
          
          // Check if we're on Sepolia (chainId 11155111)
          if (chainId !== BigInt(11155111)) {
            this.updateDebug("✅ Connected to Sepolia testnet");
            this.chainConnected = true;
          } else {
            this.updateDebug(`❌ Not connected to Sepolia. Current chain: ${chainId}`);
            this.statusText.setText("Please switch to Sepolia testnet");
          }
        } catch (chainError) {
          this.updateDebug("❌ Error getting chain ID: " + JSON.stringify(chainError));
        }
        
        // Initialize contract interface if address is provided
        if (this.contractAddress) {
          try {
            this.nftContract = new this.web3.eth.Contract(
              NFT_CONTRACT_ABI,
              this.contractAddress
            );
            this.updateDebug("✅ Contract interface initialized");
            
            // Verify contract existence
            try {
              const code = await this.web3.eth.getCode(this.contractAddress);
              if (code === '0x') {
                this.updateDebug("❌ No contract found at the provided address");
              } else {
                this.updateDebug("✅ Contract code found at address");
              }
            } catch (contractError) {
              this.updateDebug("❌ Error verifying contract: " + JSON.stringify(contractError));
            }
          } catch (contractInitError) {
            this.updateDebug("❌ Failed to initialize contract interface: " + JSON.stringify(contractInitError));
          }
        } else {
          this.updateDebug("❌ Contract address not provided");
          this.statusText.setText("Contract address not configured");
        }
        
        //@ts-ignore
        window.ethereum.on('chainChanged', (chainId: string) => {
          this.updateDebug(`Chain changed. New chain ID: ${chainId}`);
          window.location.reload(); // Recommended by MetaMask
        });
        
        //@ts-ignore
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          this.updateDebug(`Accounts changed: ${accounts[0] || 'none'}`);
          if (accounts.length === 0) {
            this.isWalletConnected = false;
            this.account = null;
            this.statusText.setText("Wallet disconnected");
            this.mintButton.disableInteractive();
            this.mintButton.setTint(0x888888);
          } else {
            this.account = accounts[0];
            this.updateConnectWalletButton();
          }
        });
      } else {
        this.updateDebug("❌ No Web3 provider found. Please install MetaMask");
        this.statusText.setText("Please install MetaMask");
      }
    } catch (error) {
      this.updateDebug("❌ Error initializing Web3: " + JSON.stringify(error));
    }
  }

  async connectWallet() {
    if (!this.web3) {
      this.initializeWeb3(); // Try to initialize first if it hasn't been done
      this.statusText.setText("Initializing Web3...");
      return;
    }

    try {
      this.updateDebug("Connecting wallet...");
      
      // Request accounts from the Ethereum provider
      //@ts-ignore
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];
      this.isWalletConnected = true;
      this.updateDebug(`✅ Wallet connected: ${this.account}`);
      
      // Check if we're on Sepolia testnet
      const chainId = await this.web3.eth.getChainId();
      

      if (chainId !== BigInt(11155111)){ // Sepolia chainId
        this.updateDebug(`❌ Wrong network. Current chain ID: ${chainId}`);
        this.statusText.setText("Please switch to Sepolia testnet");
        
        // Request network switch
        try {
          this.updateDebug("Requesting network switch to Sepolia...");
          //@ts-ignore
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
          });
          this.updateDebug("✅ Network switch requested");
        } catch (switchError: any) {
          // Check if the error is because the chain hasn't been added to MetaMask
          if (switchError.code === 4902) {
            this.updateDebug("Sepolia not found in wallet, attempting to add it...");
            try {
              //@ts-ignore
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/']
                }]
              });
              this.updateDebug("✅ Sepolia network added to wallet");
            } catch (addError) {
              this.updateDebug("❌ Failed to add Sepolia network: " + JSON.stringify(addError));
            }
          } else {
            this.updateDebug("❌ Failed to switch to Sepolia network: " + JSON.stringify(switchError));
          }
        }
      } else {
        this.chainConnected = true;
        this.updateDebug("✅ Already on Sepolia network");
        
        // Update UI
        this.statusText.setText(`Connected: ${this.account.substring(0, 6)}...${this.account.substring(this.account.length - 4)}`);
        this.updateConnectWalletButton();
        this.mintButton.setInteractive();
        this.mintButton.clearTint();
      }
      
      // Update NFT count if possible
      if (this.nftContract && this.chainConnected) {
        try {
          this.updateDebug("Getting NFT balance...");
          const balance = await this.nftContract.methods.balanceOf(this.account).call();
          this.updateDebug(`✅ Balance retrieved: ${balance}`);
          this.mintedNFTs = parseInt(balance);
          this.updateCollectionText();
        } catch (error) {
          this.updateDebug("❌ Error getting NFT balance: " + JSON.stringify(error));
        }
      }
    } catch (error) {
      this.updateDebug("❌ Error connecting wallet: " + JSON.stringify(error));
      this.statusText.setText("Failed to connect wallet");
    }
  }

  create() {
    // Add background
    this.cameras.main.setBackgroundColor('#000000');
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 - 50;
    
    this.nftImage = this.add.image(centerX, centerY-60, "nftImage").setScale(0.2);
    
    // Add title text
    this.add.text(centerX, 50, "Mint Your Exclusive NFT", {
      fontSize: "32px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Add description
    this.add.text(centerX, centerY + 100, "Mint this exclusive NFT to your collection on Sepolia testnet!", {
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 400 }
    }).setOrigin(0.5);
    
    // Add connect wallet button first
    this.connectWalletButton = this.add.rectangle(centerX, centerY + 150, 200, 40, 0x3366aa)
      .setInteractive()
      .on('pointerdown', () => this.connectWallet())
      .on('pointerover', () => this.connectWalletButton.setFillStyle(0x4477cc))
      .on('pointerout', () => this.connectWalletButton.setFillStyle(0x3366aa));
    
    this.add.text(centerX, centerY + 150, "Connect Wallet", {
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Add debug panel
    this.debugText = this.add.text(10, 10, "Debug Panel:\nWaiting for actions...", {
      fontSize: "12px",
      color: "#aaaaaa",
      backgroundColor: "#222222",
      padding: { x: 10, y: 10 },
      wordWrap: { width: 300 }
    });
    
    this.mintButton = this.add.image(centerX, centerY + 200, "button").setScale(0.1);
    this.mintText = this.add.text(centerX, centerY + 200, " ", {
      fontSize: "18px",
      color: "#000000"
    }).setOrigin(0.5);
    
    // Make mint button initially disabled
    this.mintButton.setTint(0x888888);
    
    // Add status text
    this.statusText = this.add.text(centerX, centerY + 250, "Connect your wallet to mint NFTs", {
      fontSize: "16px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 400 }
    }).setOrigin(0.5);
    
    // Add collection display text
    this.add.text(centerX, centerY + 300, "Your Collection: 0 NFTs", {
      fontSize: "16px",
      color: "#aaaaaa"
    }).setOrigin(0.5);
    
    // Add hash display text
    this.hashText = this.add.text(centerX, centerY + 330, "Latest Tx Hash: None", {
      fontSize: "14px",
      color: "#66aa66",
      align: "center",
      wordWrap: { width: 500 }
    }).setOrigin(0.5);
    
    // Add "View All Transactions" button
    const viewHashesButton = this.add.rectangle(centerX, centerY + 370, 180, 30, 0x444444)
      .setInteractive()
      .on('pointerdown', () => this.showAllHashes())
      .on('pointerover', () => viewHashesButton.setFillStyle(0x666666))
      .on('pointerout', () => viewHashesButton.setFillStyle(0x444444));
    
    this.add.text(centerX, centerY + 370, "View All Transactions", {
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Initialize Web3 connection
    this.initializeWeb3();
  }
  
  updateDebug(message: string) {
    console.log(message); // Also log to console for additional debugging
    
    // Update the debug panel, keeping recent messages (max 10 lines)
    const currentText = this.debugText.text.split('\n');
    currentText.push(message);
    
    // Keep only the title and most recent 10 messages
    if (currentText.length > 11) {
      currentText.splice(1, currentText.length - 11);
    }
    
    this.debugText.setText(currentText.join('\n'));
  }
  
  updateConnectWalletButton() {
    if (this.isWalletConnected && this.account) {
      // Change connect button to show connected state
      this.connectWalletButton.setFillStyle(0x33aa33);
      
      // Find and update the button text
      this.children.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Text && 
            child.text === "Connect Wallet") {
          const shortAccount = `${this.account!.substring(0, 6)}...${this.account!.substring(this.account!.length - 4)}`;
          child.setText(`Connected: ${shortAccount}`);
        }
      });
      
      // Enable mint button only if we're on the right network
      if (this.chainConnected) {
        this.mintButton.setInteractive();
        this.mintButton.on("pointerdown", () => this.mintNFT());
        this.mintButton.on("pointerover", () => this.mintButton.setTint(0xdddddd));
        this.mintButton.on("pointerout", () => this.mintButton.clearTint());
        this.mintButton.clearTint();
      }
    }
  }
  
  createLoadingSpinner() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    const container = this.add.container(centerX, centerY);
    
    // Create a semi-transparent background
    const bg = this.add.rectangle(0, 0, 200, 100, 0x000000, 0.7);
    container.add(bg);
    
    // Add loading text
    const text = this.add.text(0, 0, "Minting...", {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5);
    container.add(text);
    
    // Create dots for animation
    const dots = [];
    for (let i = 0; i < 3; i++) {
      const dot = this.add.circle(20 * (i - 1), 25, 5, 0xffffff);
      container.add(dot);
      dots.push(dot);
    }
    
    // Animate dots
    this.tweens.add({
      targets: dots,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
      delay: (target, key, value, targetIndex) => targetIndex * 200
    });
    
    this.loadingSpinner = container;
    return container;
  }
  
  hideLoadingSpinner() {
    if (this.loadingSpinner) {
      this.loadingSpinner.destroy();
      this.loadingSpinner = null;
    }
  }
  
  async mintNFT() {
    if (this.isMinting || !this.isWalletConnected || !this.account || !this.nftContract) {
      if (!this.isWalletConnected) {
        this.statusText.setText("Please connect your wallet first");
      } else if (!this.nftContract) {
        this.statusText.setText("NFT contract not initialized");
      }
      return;
    }
    
    this.isMinting = true;
    this.statusText.setText("Preparing transaction...");
    this.mintButton.disableInteractive();
    this.mintButton.setTint(0x888888);
    
    // Show loading spinner
    this.createLoadingSpinner();
    
    try {
      this.updateDebug("Initiating mint transaction...");
      
      // Check gas price
      const gasPrice = await this.web3!.eth.getGasPrice();
      this.updateDebug(`Current gas price: ${this.web3!.utils.fromWei(gasPrice, 'gwei')} gwei`);
      
      // Check user balance
      const balance = await this.web3!.eth.getBalance(this.account);
      this.updateDebug(`Wallet balance: ${this.web3!.utils.fromWei(balance, 'ether')} ETH`);
      


      console.log(this.account,
        "https://silver-tricky-trout-945.mypinata.cloud/ipfs/bafybeide72hl3dkhv2e5ibzrigb7ciqri4klzq2jp3gizcaecc3zheyxuy/Charmander.json",
        ethers.parseEther("0.00001"))
      this.updateDebug("Sending transaction to contract...");
        const to = "0x232dab483f22ae915f02c0cd1e5ad8a2a9318c94";

        // The token URI (string)
        const tokenURI = "https://silver-tricky-trout-945.mypinata.cloud/ipfs/bafybeide72hl3dkhv2e5ibzrigb7ciqri4klzq2jp3gizcaecc3zheyxuy/Charmander.json";

        // The amount (number or string, NOT BigInt with 'n' suffix)
        const amountS = "10000000000000"; // As a string, safer for large numbers
        // OR
        const amount = 10000000000000; // As a number, if not too large

        // Assuming you've already set up web3 and the contract instance
        const contract = new web3.eth.Contract(abi.abi, CONTRACT_ADDRESS);

        const result = await contract.methods.mint(to, tokenURI, amount)
        .send({ from: "0x232DAb483f22ae915F02C0cD1E5aD8a2a9318c94", gas: "3000000" });
      
      console.log("Transaction receipt:", result);
      
      
      
      
      // Get transaction hash
      const txHash = result.transactionHash;
      this.updateDebug(`✅ Transaction successful! Hash: ${txHash}`);
      this.mintedHashes.push(txHash);
      
      // Update status, collection text, and hash display
      this.hideLoadingSpinner();
      this.mintedNFTs++;
      
      this.statusText.setText(`Success! NFT #${this.mintedNFTs} minted to your collection!`);
      this.updateCollectionText();
      this.updateHashDisplay(txHash);
      
      // Create celebration effect
      this.createCelebrationEffect();
      
      // Link to Etherscan
      const etherscanLink = `https://sepolia.etherscan.io/tx/${txHash}`;
      this.updateDebug(`View transaction: ${etherscanLink}`);
      
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      this.updateDebug(`❌ Minting failed: ${error.message || JSON.stringify(error)}`);
      
      if (error.code === 4001) {
        this.statusText.setText("Transaction rejected by user");
      } else if (error.message && error.message.includes("insufficient funds")) {
        this.statusText.setText("Insufficient funds for transaction");
      } else {
        this.statusText.setText("Minting failed. See debug panel for details.");
      }
      
      this.hideLoadingSpinner();
    } finally {
      // Re-enable mint button
      this.mintButton.setInteractive();
      this.mintButton.clearTint();
      this.isMinting = false;
    }
  }
  
  updateCollectionText() {
    // Find and update the collection text
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text && 
          child.text.includes("Your Collection:")) {
        child.setText(`Your Collection: ${this.mintedNFTs} NFTs`);
      }
    });
  }
  
  updateHashDisplay(hash: string) {
    // Update the hash text with the latest hash (truncated for display)
    const truncatedHash = hash.substring(0, 10) + "..." + hash.substring(hash.length - 6);
    this.hashText.setText(`Latest Tx Hash: ${truncatedHash}`);
    
    // Add a brief flash animation to draw attention to the new hash
    this.hashText.setColor('#ffffff');
    this.tweens.add({
      targets: this.hashText,
      alpha: 0.3,
      yoyo: true,
      duration: 200,
      repeat: 1,
      onComplete: () => {
        this.hashText.setColor('#66aa66');
      }
    });
  }
  
  showAllHashes() {
    // Create a modal to display all transaction hashes
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Create container for the modal
    const modal = this.add.container(centerX, centerY);
    
    // Add background
    const bg = this.add.rectangle(0, 0, 600, 400, 0x222222, 0.95);
    modal.add(bg);
    
    // Add title
    const title = this.add.text(0, -170, "Your NFT Transactions", {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    modal.add(title);
    
    // Add close button
    const closeButton = this.add.circle(270, -170, 15, 0xaa0000)
      .setInteractive()
      .on('pointerdown', () => modal.destroy());
    modal.add(closeButton);
    
    const closeX = this.add.text(270, -170, "X", {
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5);
    modal.add(closeX);
    
    // Add hash list
    let yPos = -120;
    if (this.mintedHashes.length === 0) {
      const noHashText = this.add.text(0, 0, "No NFTs minted yet!", {
        fontSize: "18px",
        color: "#aaaaaa"
      }).setOrigin(0.5);
      modal.add(noHashText);
    } else {
      for (let i = 0; i < this.mintedHashes.length; i++) {
        const hash = this.mintedHashes[i];
        // Truncate hash for display
        const displayHash = hash.substring(0, 18) + "..." + hash.substring(hash.length - 10);
        
        const hashEntry = this.add.text(-270, yPos, `NFT #${i+1}: ${displayHash}`, {
          fontSize: "16px",
          color: "#66aa66",
          align: "left"
        }).setOrigin(0, 0.5);
        modal.add(hashEntry);
        
        // Add view on Etherscan button
        const viewButton = this.add.rectangle(250, yPos, 120, 24, 0x444444)
          .setInteractive()
          .on('pointerdown', () => {
            // Open Etherscan in a new tab
            window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
          });
        modal.add(viewButton);
        
        const viewText = this.add.text(250, yPos, "View on Etherscan", {
          fontSize: "12px",
          color: "#ffffff"
        }).setOrigin(0.5);
        modal.add(viewText);
        
        yPos += 40;
      }
    }
    
    // Add the modal to scene with a scaling animation
    modal.setScale(0.8);
    this.tweens.add({
      targets: modal,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // Disable mint button while modal is open
    this.mintButton.disableInteractive();
    this.mintButton.setTint(0x888888);
    
    // Re-enable mint button when modal is closed
    modal.on('destroy', () => {
      if (this.isWalletConnected && this.chainConnected) {
        this.mintButton.setInteractive();
        this.mintButton.clearTint();
      }
    });
  }
  
  createCelebrationEffect() {
    // Create particle effect for celebration
    const particles = this.add.particles(0, 0, 'button', {
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      lifespan: 2000,
      gravityY: 300,
      quantity: 50,
      emitting: false
    });
    
    // Position emitter at the NFT image
    particles.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50);
    
    // Emit particles
    particles.emitParticle(50);
    
    // Remove particles after animation completes
    this.time.delayedCall(2000, () => {
      particles.destroy();
    });
    
    // Also animate the NFT image for additional effect
    this.tweens.add({
      targets: this.nftImage,
      scaleX: 0.6,
      scaleY: 0.6,
      duration: 200,
      yoyo: true,
      repeat: 3
    });
  }
  
  update() {
    // Any per-frame updates can go here
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [NFTScene],
  backgroundColor: '#000000'
};