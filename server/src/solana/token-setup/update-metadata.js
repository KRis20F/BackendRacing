import { createMetadataAccountV3, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { createUmi as createDefaultUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

async function updateMetadata() {
    // Crear instancia de UMI con el bundle por defecto
    const umi = createDefaultUmi('https://api.testnet.solana.com');

    // Cargar la wallet
    const wallet = JSON.parse(fs.readFileSync('/Users/pro/my-solana-wallet.json'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
    const signer = createSignerFromKeypair(umi, {
        publicKey: publicKey(keypair.publicKey.toString()),
        secretKey: keypair.secretKey,
    });
    
    umi.use(keypairIdentity(signer));
    umi.use(mplTokenMetadata());

    // Dirección del token
    const mintAddress = '4MCKxwSEF3M6y9WsLiJtkoKaMtWh7eRhuV1gRUVZMg6w';

    try {
        const metadata = {
            name: "RacingFi",
            symbol: "RCF",
            uri: "ipfs://QmSZTRAaVqDKRooNJ6YBzhhcgkMqZ8NxhuqXm3pKyg36WT",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        };

        const builder = await createMetadataAccountV3(umi, {
            mint: publicKey(mintAddress),
            authority: signer,
            data: metadata,
            isMutable: true,
        });

        const result = await builder.sendAndConfirm(umi);
        console.log('Metadatos actualizados. Firma:', result.signature);
    } catch (error) {
        console.error('Error:', error);
    }
}

updateMetadata().catch(console.error);