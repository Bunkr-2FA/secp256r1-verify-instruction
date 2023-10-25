# Secp256r1 Signature Instruction
A simple library to create well-formed Secp256r1 signature instructions for use with the Secp256r1SigVerify program on Solana as a part of SIMD-48.

# Setup
To use the Secp256r1SigVerify program, you will need to create a custom build of the `solana-test-validator`

To do this:

1. Clone the master repo from: [Bunkr-On-Chain-2FA/solana](https://github.com/Bunkr-On-Chain-2FA/solana)
2. run: `./cargo build`
3. go to the `/target` directory and run `./solana-test-validator`

Now you can run the tests in this repo using `yarn test`