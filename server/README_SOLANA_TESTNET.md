# Guía paso a paso: Solana Testnet y Creación de Token Coin

Esta guía te explica desde cero cómo:

- Configurar tu entorno para Solana testnet
- Crear una wallet de Solana
- Solicitar SOL de testnet (airdrop)
- Crear tu propio token (coin) en testnet

> **No necesitas experiencia previa. Sigue cada paso y tendrás tu token en Solana testnet.**

---

## 1. Instalar Node.js y Solana CLI

### 1.1. Instala Node.js (si no lo tienes)

- Descarga desde [nodejs.org](https://nodejs.org/) e instálalo.
- Verifica:

  ```bash
  node -v
  npm -v
  ```

### 1.2. Instala Solana CLI

- En Mac/Linux:

  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/v1.18.14/install)"
  export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
  solana --version
  ```

- En Windows: usa WSL o consulta la [guía oficial](https://docs.solana.com/cli/install-solana-cli-tools#use-windows-subsystem-for-linux-wsl).

---

## 2. Configurar Solana para testnet

```bash
solana config set --url https://api.testnet.solana.com
```

Verifica:

```bash
solana config get
```

Debe mostrar `https://api.testnet.solana.com` como URL.

---

## 3. Crear una wallet de Solana (keypair)

```bash
solana-keygen new --outfile ~/my-solana-wallet.json
```

- Guarda la ruta del archivo (ej: `/Users/tuusuario/my-solana-wallet.json`).
- **Nunca compartas este archivo.**

Para usar esta wallet por defecto:

```bash
solana config set --keypair ~/my-solana-wallet.json
```

Verifica la dirección:

```bash
solana address
```

---

## 4. Solicitar SOL de testnet (airdrop)

```bash
solana airdrop 2
```

- Esto te da 2 SOL de testnet (no tienen valor real).
- Puedes repetirlo si necesitas más.

Verifica tu balance:

```bash
solana balance
```

---

## 5. Crear tu propio token (coin) en testnet

### 5.1. Instala SPL Token CLI

```bash
cargo install spl-token-cli
```

- Si no tienes `cargo`, instala Rust: <https://www.rust-lang.org/tools/install>

### 5.2. Crea el token

```bash
spl-token create-token
```

- Guarda el `Token: <address>` que te da el comando (es la dirección de tu token).

### 5.3. Crea una cuenta para tu token

```bash
spl-token create-account <TOKEN_ADDRESS>
```

- Reemplaza `<TOKEN_ADDRESS>` por la dirección de tu token.
- Guarda la dirección de la cuenta.

### 5.4. Minta (crea) monedas de tu token

```bash
spl-token mint <TOKEN_ADDRESS> 1000000
```

- Esto crea 1,000,000 unidades de tu token en tu cuenta.

### 5.5. Verifica tu balance de token

```bash
spl-token accounts
```

- Verás tu cuenta y el balance de tu token.

---

## 6. (Opcional) Transfiere tu token a otra wallet

1. Crea otra wallet:

   ```bash
   solana-keygen new --outfile ~/otra-wallet.json
   solana airdrop 2 --keypair ~/otra-wallet.json
   ```

2. Crea una cuenta de token para la nueva wallet:

   ```bash
   spl-token create-account <TOKEN_ADDRESS> --owner <DIRECCION_NUEVA_WALLET>
   ```

3. Transfiere tokens:

   ```bash
   spl-token transfer <TOKEN_ADDRESS> 1000 <DIRECCION_CUENTA_TOKEN_DESTINO>
   ```

---

## 7. Recursos útiles

- [Solana CLI Docs](https://docs.solana.com/cli)
- [SPL Token CLI](https://spl.solana.com/token)
- [Solana Faucet (airdrop)](https://solfaucet.com/)

---

¡Listo! Ahora tienes tu wallet, SOL de testnet y tu propio token en Solana testnet. Puedes usar estos datos en tu backend/API o para pruebas en el juego.

---

## 8. Configurar metadatos del token

### 8.1. Crear archivo JSON con metadatos

```bash
cat > racingfi-metadata.json << 'EOF'
{
    "name": "RacingFi",
    "symbol": "RCF",
    "description": "Where Racing Meets Financial Freedom",
    "image": "https://github.com/RVDveloper/figmatarea/blob/main/Fondo%20de%20%22RaCingFi%20logo%20with%20the%20slogan%20Where%20Racing%20Meets%20Financial%20Freedom%2C%20BMW%20M3%20in%202D%20design%2C%20elegant%20style%2C%20different%20color%20palette%2C%20avoid%20overload%20outside%20the%20coin%20copia%22%20eliminado.png?raw=true"
}
EOF
```

### 8.2. Instalar herramientas necesarias

```bash
npm install -g @metaplex-foundation/mpl-token-metadata
```

### 8.3. Crear metadatos del token

```bash
spl-token create-metadata 7viAPBRTFQPQwBxZrefnv9xvY42Sqz64GwY61RvLUvB7 \
    --name "RacingFi" \
    --symbol "RCF" \
    --uri "file:///$(pwd)/racingfi-metadata.json"
```

### 8.4. Verificar metadatos

```bash
spl-token display 7viAPBRTFQPQwBxZrefnv9xvY42Sqz64GwY61RvLUvB7
```

---

**Importante:**

- El símbolo RCF aparecerá en wallets y exploradores
- La imagen se mostrará cuando los wallets la soporten
- El slogan "Where Racing Meets Financial Freedom" aparecerá en la descripción

---

¿Quieres que procedamos con la configuración de los metadatos?
