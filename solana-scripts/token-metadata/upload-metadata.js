const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');

async function main() {
    const client = new NFTStorage({ token: '050fb7fe.f4ae5a88c3ac4fa1a015bdd07510a8ae' });
    
    const metadata = JSON.parse(fs.readFileSync('racingfi-metadata.json'));
    const result = await client.store(metadata);
    
    console.log('Metadata URL:', result.url);
    console.log('IPFS CID:', result.ipnft);
}

main().catch(console.error); 