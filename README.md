# Base Wallet Generator & Funder

Script para:

- Generar múltiples wallets en Base
- Asignarles un label personalizado
- Enviar automáticamente una cantidad de ETH
- Refondear wallets ya creadas usando una lista de direcciones
- Guardar address, privateKey y txHash en un JSON

---

## Instalación

Instala las dependencias necesarias:

```bash
npm i
npm install ethers dotenv
```

- `ethers` para generar wallets y enviar transacciones en Base.
- `dotenv` para cargar variables sensibles desde `.env`.

---

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
PRIVATE_KEY=TU_PRIVATE_KEY_AQUI
RPC_URL=https://base-rpc.publicnode.com
AMOUNT_TO_SEND=0.5
NAMES=Juan,Laura,Carlos,Maria,Pedro
# Opcional (modo refondeo): misma cantidad y orden que NAMES
# ADDRESSES=0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222
```

Variables:

- `PRIVATE_KEY`: clave privada de la wallet que enviará los fondos.
- `RPC_URL`: endpoint RPC de Base (mainnet, chainId 8453).
- `AMOUNT_TO_SEND`: cantidad de ETH a enviar por wallet.
- `NAMES`: lista de nombres separados por comas.
- `ADDRESSES` (opcional): lista de wallets existentes para refondear.
- `USE_WALLETS_JSON` (opcional): si es `true`, toma `label` y `address` de `wallets.json`.

### Modos de uso

- Sin `ADDRESSES`: se genera una wallet nueva por cada nombre en `NAMES`.
- Con `ADDRESSES`: se usan esas direcciones para refondeo.
- Validación: si `ADDRESSES` existe, debe tener exactamente la misma cantidad que `NAMES`.
- Con `USE_WALLETS_JSON=true`: se ignoran `NAMES` y `ADDRESSES`, y se usa `wallets.json`.

Ejemplo de modo refondeo desde `wallets.json`:

```env
PRIVATE_KEY=TU_PRIVATE_KEY_AQUI
RPC_URL=https://base-rpc.publicnode.com
AMOUNT_TO_SEND=0.01
USE_WALLETS_JSON=true
```

---

## Ejecutar el script

```bash
node generate_and_fund.js
```

El script realizará automáticamente:

1. Generar wallets nuevas o usar `ADDRESSES` (según configuración).
2. Enviar la cantidad especificada de ETH a cada wallet.
3. Esperar confirmación de cada transacción.
4. Crear `wallets.json` con:

- `label` (nombre)
- `address`
- `privateKey` (si se generó; `null` en refondeo)
- `txHash`

---

## Output

Ejemplo de `wallets.json`:

```json
[
  {
    "label": "Juan",
    "address": "0x...",
    "privateKey": "0x...",
    "txHash": "0x..."
  }
]
```

---

## Fondos necesarios

Debes tener en la wallet emisora:

`AMOUNT_TO_SEND x numero_de_wallets + gas fees`

Ejemplo:

`0.5 ETH x 10 wallets = 5 ETH + gas`

---

## Seguridad

- No subas `.env` al repositorio.
- No compartas `wallets.json`.
- Ejecuta el script en entorno seguro.
- Si pierdes `wallets.json`, pierdes acceso a las wallets generadas.


## Aportaciones

Seguimos GitFlow, asi que branchea Develop y ahi creas un fix/ o feat/ para abrir una PR!
