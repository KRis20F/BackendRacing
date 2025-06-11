import pkg from '@metaplex-foundation/mpl-token-metadata';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import fs from 'fs';
const { createCreateMetadataAccountV3Instruction } = pkg;

// Dirección del programa de metadatos de Metaplex en Solana
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const secretKey = JSON.parse(fs.readFileSync('/Users/pro/my-solana-wallet.json'));
const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

async function main() {
    const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
    const mintAddress = new PublicKey('7viAPBRTFQPQwBxZrefnv9xvY42Sqz64GwY61RvLUvB7');

    const metadataPDA = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    )[0];

    const instruction = createCreateMetadataAccountV3Instruction({
        createMetadataAccountArgsV3: {
            data: {
                name: "RacingFi",
                symbol: "RCF",
                uri: "ipfs://QmSZTRAaVqDKRooNJ6YBzhhcgkMqZ8NxhuqXm3pKyg36WT",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
            },
            isMutable: true,
            updateAuthority: wallet.publicKey,
        },
        metadata: metadataPDA,
        mint: mintAddress,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey
    });

    const tx = new Transaction().add(instruction);
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
    console.log('Metadatos actualizados. Firma:', sig);
}

main().catch(console.error); 