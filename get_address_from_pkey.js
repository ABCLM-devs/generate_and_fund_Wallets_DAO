// get_address_from_pkey.js
const { ethers } = require("ethers");

// Hardcodea aquí tu private key (con 0x)
const PRIVATE_KEY = "f6da5c27819dd68d4e5a87f3480e14be6d4d843eb7906094468cc18159a974ba";

const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log("Address:", wallet.address);
