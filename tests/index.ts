import { 
    Connection, 
    Transaction, 
    TransactionInstruction, 
    Keypair,
    LAMPORTS_PER_SOL, 
    Commitment
} from "@solana/web3.js";
import { assert } from 'chai';
import { SECP256R1_SIG_VERIFY_ID, Secp256r1Data, Secp256r1Instruction } from '../src';

describe('Secp256r1SigVerify Instruction', () => {
    const commitment: Commitment = 'confirmed';
    const connection = new Connection("http://localhost:8899", commitment);
    const senderKeypair = Keypair.generate();

    const confirmTx = async (signature: string) => {
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
        {
            signature,
            ...latestBlockhash,
        },
        commitment
        )
    }

    describe('Secp256r1Instruction and Secp256r1Data unit tests', () => {
        it('Create a matching instruction buffer', () => {
            const data = new Secp256r1Data(
                "hello", 
                "020fd69b356062c6a6d3622aee2bdb176763b08ba3c904c1d94d49462d23d2a9c1", "0a375077b511f95120270033be0cf8cb0f29fc4cc2eb9e6be487f685eb2c01502f3afcae135c563ab5a4740d3c384e6b945b0e88824bc46ff8cb164456a28809"
            );
            const instruction = new Secp256r1Instruction([data]);
            const buf = instruction.toHex();
            assert(buf === "01003100ffff1000ffff71000500ffff020fd69b356062c6a6d3622aee2bdb176763b08ba3c904c1d94d49462d23d2a9c10a375077b511f95120270033be0cf8cb0f29fc4cc2eb9e6be487f685eb2c01502f3afcae135c563ab5a4740d3c384e6b945b0e88824bc46ff8cb164456a2880968656c6c6f");
        });
    });

    describe('Secp256r1 instruction integration test', async () => {

        it('Airdrops funds to our test wallet', async () => {
            const signature = await connection.requestAirdrop(senderKeypair.publicKey, LAMPORTS_PER_SOL);
            await confirmTx(signature);
        }).timeout(30000);

        it('Execute a valid secp256r1 signature instruction', async () => {
            const data = new Secp256r1Data(
                "hello", 
                "020fd69b356062c6a6d3622aee2bdb176763b08ba3c904c1d94d49462d23d2a9c1", "0a375077b511f95120270033be0cf8cb0f29fc4cc2eb9e6be487f685eb2c01502f3afcae135c563ab5a4740d3c384e6b945b0e88824bc46ff8cb164456a28809"
            );
            const instruction = new Secp256r1Instruction([data, data]);

            const ix = new TransactionInstruction({
                keys: [],
                programId: SECP256R1_SIG_VERIFY_ID,
                data: Buffer.from(instruction.toBuffer())
            });

            const transaction = new Transaction().add(ix);

            // Sign and send the transaction
            transaction.feePayer = senderKeypair.publicKey;
            try {
                const signature = await connection.sendTransaction(transaction, [senderKeypair]);
            } catch(e) {
                console.log(e)
            }
        }).timeout(30000);

        it('Executes a valid signature instruction with multiple signatures', async () => {
            const data = new Secp256r1Data(
                "hello", 
                "020fd69b356062c6a6d3622aee2bdb176763b08ba3c904c1d94d49462d23d2a9c1", "0a375077b511f95120270033be0cf8cb0f29fc4cc2eb9e6be487f685eb2c01502f3afcae135c563ab5a4740d3c384e6b945b0e88824bc46ff8cb164456a28809"
            );
            const instruction = new Secp256r1Instruction([data, data]);

            const ix = new TransactionInstruction({
                keys: [],
                programId: SECP256R1_SIG_VERIFY_ID,
                data: Buffer.from(instruction.toBuffer())
            });

            const transaction = new Transaction().add(ix);

            // Sign and send the transaction
            transaction.feePayer = senderKeypair.publicKey;
            try {
                const signature = await connection.sendTransaction(transaction, [senderKeypair]);
            } catch(e) {
                console.log(e)
            }
        }).timeout(30000);

        it('Executes an invalid signature instruction with multiple signatures', async () => {
            const data = new Secp256r1Data(
                "hello", 
                "020fd69b356062c6a6d3622aee2bdb276763b08ba3c904c1d94d49462d23d2a9c1", "0a375077b511f95120270033be0cf8cb0f29fc4cc2eb9e6be487f685eb2c01502f3afcae135c563ab5a4740d3c384e6b945b0e88824bc46ff8cb164456a28809"
            );
            const instruction = new Secp256r1Instruction([data, data]);

            const ix = new TransactionInstruction({
                keys: [],
                programId: SECP256R1_SIG_VERIFY_ID,
                data: Buffer.from(instruction.toBuffer())
            });

            const transaction = new Transaction().add(ix);

            // Sign and send the transaction
            transaction.feePayer = senderKeypair.publicKey;
            let error;
            try {
                const signature = await connection.sendTransaction(transaction, [senderKeypair]);
            } catch(e) {
                error = e;
            }
            assert(error)
        }).timeout(30000);
    });
});