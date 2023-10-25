"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Secp256r1Instruction = exports.Secp256r1Data = exports.SECP256R1_SIG_VERIFY_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
const PUBKEY_REGEX = /^(0x)?(02|03)[0-9a-fA-F]{64}$/;
const SIGNATURE_REGEX = /^(0x)?[0-9a-fA-F]{128}$/;
const MESSAGE_REGEX = /^0x([0-9a-fA-F]{2})+$/;
function hexToBytes(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.substring(2);
    }
    let bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}
function bytesToHex(bytes) {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function uint8ArrayConcat(a, b) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}
exports.SECP256R1_SIG_VERIFY_ID = new web3_js_1.PublicKey('Secp256r1SigVerify1111111111111111111111111');
class Secp256r1Data {
    constructor(message, pubkey, signature) {
        if (typeof pubkey === "string") {
            if (!PUBKEY_REGEX.test(pubkey)) {
                throw new Error("Invalid Public Key string");
            }
            pubkey = hexToBytes(pubkey);
        }
        if (pubkey.length !== 33) {
            throw new Error("Invalid Public Key length");
        }
        if (typeof signature === "string") {
            if (!SIGNATURE_REGEX.test(signature)) {
                throw new Error("Invalid Signature string");
            }
            signature = hexToBytes(signature);
        }
        if (signature.length !== 64) {
            throw new Error("Invalid Signature length");
        }
        if (typeof message === "string") {
            if (MESSAGE_REGEX.test(message)) {
                message = hexToBytes(message);
            }
            else {
                const encoder = new TextEncoder();
                message = encoder.encode(message);
            }
        }
        this.message = message;
        this.signature = signature;
        this.pubkey = pubkey;
        this.length = message.length + signature.length + pubkey.length;
    }
    toOffset(offset) {
        let pubkey_offset = offset;
        let signature_offset = pubkey_offset + 33;
        let message_offset = signature_offset + 64;
        let message_length = this.message.length;
        return new Uint8Array([
            signature_offset & 0x00ff, signature_offset >> 8,
            0xff, 0xff,
            pubkey_offset & 0x00ff, pubkey_offset >> 8,
            0xff, 0xff,
            message_offset & 0x00ff, message_offset >> 8,
            message_length & 0x00ff, message_length >> 8,
            0xff, 0xff
        ]);
    }
    toBuffer() {
        return [this.pubkey, this.signature, this.message].reduce(uint8ArrayConcat);
    }
}
exports.Secp256r1Data = Secp256r1Data;
class Secp256r1Instruction {
    constructor(signatures) {
        this.signatures = signatures;
    }
    toBuffer() {
        let headers = new Uint8Array(2 + this.signatures.length * 14);
        headers[0] = this.signatures.length;
        let offset;
        let data = new Uint8Array([]);
        this.signatures.forEach((s, i) => {
            offset = headers.length + data.length;
            headers.set(s.toOffset(offset), 2 + i * 14);
            data = [data, s.toBuffer()].reduce(uint8ArrayConcat);
        });
        return [headers, data].reduce(uint8ArrayConcat);
    }
    toHex() {
        return bytesToHex(this.toBuffer());
    }
}
exports.Secp256r1Instruction = Secp256r1Instruction;
