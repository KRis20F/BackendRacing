const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, transfer } = require('@solana/spl-token');
const tokenService = require('../services/tokenService');
require('dotenv').config();

async function distributeTokens(userPublicKey, amount) {
    try {
        console.log(`Iniciando distribución de tokens a ${userPublicKey}...`);
        
        // Crear cuenta de token para el usuario si no existe
        const tokenAccount = await tokenService.createUserTokenAccount(userPublicKey);
        console.log('Cuenta de token creada:', tokenAccount);

        // Transferir tokens desde la wallet principal (treasury)
        const signature = await tokenService.transferTokens(
            tokenService.wallet.publicKey.toString(), // Wallet principal (treasury)
            userPublicKey,                           // Wallet del usuario
            amount                                   // Cantidad de tokens
        );
        
        console.log(`Transferencia exitosa! Signature: ${signature}`);
        console.log(`Se enviaron ${amount} tokens RCF a ${userPublicKey}`);
        
        return {
            success: true,
            signature,
            tokenAccount: tokenAccount.tokenAccount,
            amount
        };
    } catch (error) {
        console.error('Error distribuyendo tokens:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para probar la distribución
async function main() {
    if (process.argv.length < 4) {
        console.log('Uso: node distributeTokens.js <publicKey> <amount>');
        process.exit(1);
    }

    const userPublicKey = process.argv[2];
    const amount = parseFloat(process.argv[3]);

    console.log('Treasury wallet:', tokenService.wallet.publicKey.toString());
    console.log('Token RCF:', tokenService.mintAddress.toString());
    
    const result = await distributeTokens(userPublicKey, amount);
    console.log('Resultado:', result);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = distributeTokens; 