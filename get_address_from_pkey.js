// get_address_from_pkey.js
const { ethers } = require("ethers");

// Hardcodea aquí tu private key (con 0x)
const PRIVATE_KEY = "xxx";

const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log("Address:", wallet.address);
