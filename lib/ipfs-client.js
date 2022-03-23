import { create } from 'ipfs-http-client';

export const ipfsClient = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
});