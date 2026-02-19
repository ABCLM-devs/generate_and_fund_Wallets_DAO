require("dotenv").config({ override: true });
const { ethers } = require("ethers");
const fs = require("fs");

// CONFIG
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOUNT_TO_SEND = process.env.AMOUNT_TO_SEND;
const USE_WALLETS_JSON = process.env.USE_WALLETS_JSON === "true";
const NAMES = (process.env.NAMES || "")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);
const ADDRESSES = (process.env.ADDRESSES || "")
  .split(",")
  .map((a) => a.trim())
  .filter(Boolean);

function loadTargetsFromWalletsJson() {
  if (!fs.existsSync("wallets.json")) {
    throw new Error("No existe wallets.json en la raíz del proyecto");
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync("wallets.json", "utf8"));
  } catch {
    throw new Error("wallets.json no es un JSON válido");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("wallets.json debe ser un array con al menos un elemento");
  }

  return parsed.map((item, idx) => {
    const label = (item?.label || "").toString().trim();
    const address = (item?.address || "").toString().trim();
    const privateKeyRaw = (item?.privateKey || "").toString().trim();

    if (!label) {
      throw new Error(`wallets.json[${idx}] no tiene label válido`);
    }
    if (!ethers.isAddress(address)) {
      throw new Error(`wallets.json[${idx}] tiene address inválida: ${address}`);
    }
    if (
      privateKeyRaw &&
      !ethers.isHexString(privateKeyRaw, 32) &&
      !ethers.isHexString(`0x${privateKeyRaw}`, 32)
    ) {
      throw new Error(`wallets.json[${idx}] tiene privateKey inválida`);
    }

    const privateKey = privateKeyRaw
      ? privateKeyRaw.startsWith("0x")
        ? privateKeyRaw
        : `0x${privateKeyRaw}`
      : null;

    return { label, address, privateKey };
  });
}

function assertBaseEnv() {
  if (!RPC_URL) throw new Error("Falta RPC_URL en .env");
  if (!PRIVATE_KEY) throw new Error("Falta PRIVATE_KEY en .env");
  if (!AMOUNT_TO_SEND) throw new Error("Falta AMOUNT_TO_SEND en .env");
}

async function main() {
  assertBaseEnv();

  let targets;
  let mode;

  if (USE_WALLETS_JSON) {
    targets = loadTargetsFromWalletsJson();
    mode = "json";
  } else {
    if (NAMES.length === 0) throw new Error("Falta NAMES en .env");

    if (ADDRESSES.length > 0 && ADDRESSES.length !== NAMES.length) {
      throw new Error(
        `ADDRESSES (${ADDRESSES.length}) debe tener la misma cantidad que NAMES (${NAMES.length})`
      );
    }

    for (const address of ADDRESSES) {
      if (!ethers.isAddress(address)) {
        throw new Error(`Dirección inválida en ADDRESSES: ${address}`);
      }
    }

    if (ADDRESSES.length > 0) {
      targets = NAMES.map((label, i) => ({ label, address: ADDRESSES[i] }));
      mode = "addresses";
    } else {
      targets = NAMES.map((label) => ({ label }));
      mode = "generate";
    }
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 8453) {
    throw new Error(
      `RPC_URL no apunta a Base mainnet. chainId detectado: ${network.chainId}`
    );
  }

  const mainWallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const total = targets.length;

  console.log(
    mode !== "generate"
      ? `Refondeando ${total} wallets existentes...\n`
      : `Generando ${total} wallets...\n`
  );

  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const wallet =
      mode === "generate"
        ? ethers.Wallet.createRandom()
        : { address: target.address, privateKey: target.privateKey ?? null };

    console.log(
      `Enviando ${AMOUNT_TO_SEND} ETH a ${target.label} (${wallet.address})`
    );

    const tx = await mainWallet.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther(AMOUNT_TO_SEND),
    });

    await tx.wait();

    results.push({
      label: target.label,
      address: wallet.address,
      privateKey: wallet.privateKey,
      txHash: tx.hash,
    });
  }

  fs.writeFileSync("wallets.json", JSON.stringify(results, null, 2));

  console.log("\nProceso completado.");
}

main().catch(console.error);
