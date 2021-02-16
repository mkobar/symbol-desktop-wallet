const marketplaceServer = 'http://localhost:1823/api/v1/';
const ipfsNode = 'https://ipfs.infura.io:5001';
const serviceAccountAddress = 'TBQRYGBRTOIIOVQQQENMCTL2RLW2DV3UPQ3RG3I';
const hoursList: number[] = [6, 12, 24, 48];
const MarketplaceConfig = { marketplaceServer, hoursList: hoursList, ipfsNode, serviceAccountAddress };
console.log('Marketplace Config resolved!', MarketplaceConfig);
export { MarketplaceConfig };
