const Index = (value: string): string => {
    const buffer = new Uint32Array([
        0,
        0,
        0,
        value.length + 0xDEADBEEF,
        value.length + 0xDEADBEEF,
        value.length + 0xDEADBEEF
    ]);

    let i = 0;

    for(i = 0; i + 12 < value.length; i += 12) {
        buffer[4] = ((value.charCodeAt(i + 7) << 24) >>> 0 | (value.charCodeAt(i + 6) << 16) >>> 0 | (value.charCodeAt(i + 5) << 8 >>> 0) | value.charCodeAt(i + 4)) + buffer[4];
        buffer[5] = ((value.charCodeAt(i + 11) << 24) >>> 0 | (value.charCodeAt(i + 10) << 16) >>> 0 | (value.charCodeAt(i + 9) << 8) >>> 0 | value.charCodeAt(i + 8)) + buffer[5];
        buffer[2] = ((value.charCodeAt(i + 3) << 24) >>> 0 | (value.charCodeAt(i + 2) << 16) >>> 0 | (value.charCodeAt(i + 1) << 8) >>> 0 | value.charCodeAt(i)) - buffer[5];

        buffer[2] = (buffer[2] + buffer[3]) ^ (buffer[5] >>> 28) ^ (buffer[5] << 4) >>> 0;
        buffer[5] = buffer[5] + buffer[4];
        buffer[4] = (buffer[4] - buffer[2]) >>> 0 ^ buffer[2] >>> 26 ^ (buffer[2] << 6) >>> 0;
        buffer[2] = buffer[2] + buffer[5];
        buffer[5] = (buffer[5] - buffer[4]) >>> 0 ^ buffer[4] >>> 24 ^ (buffer[4] << 8) >>> 0;
        buffer[4] = buffer[4] + buffer[2];
        buffer[3] = (buffer[2] - buffer[5]) >>> 0 ^ buffer[5] >>> 16 ^ (buffer[5] << 16) >>> 0;
        buffer[5] = buffer[5] + buffer[4];
        buffer[4] = (buffer[4] - buffer[3]) >>> 0 ^ buffer[3] >>> 13 ^ (buffer[3] << 19) >>> 0;
        buffer[3] = buffer[3] + buffer[5];
        buffer[5] = (buffer[5] - buffer[4]) >>> 0 ^ (buffer[4] >>> 28) ^ (buffer[4] << 4) >>> 0;
        buffer[4] = buffer[4] + buffer[3];
    }

    if(value.length - i > 0) {
        switch(value.length - i) {
            case 12:
                buffer[5] = buffer[5] + (value.charCodeAt(i + 11) << 24) >>> 0;
            case 11:
                buffer[5] = buffer[5] + (value.charCodeAt(i + 10) << 16) >>> 0;
            case 10:
                buffer[5] = buffer[5] + (value.charCodeAt(i + 9) << 8) >>> 0;
            case 9:
                buffer[5] = buffer[5] + value.charCodeAt(i + 8);
            case 8:
                buffer[4] = buffer[4] + (value.charCodeAt(i + 7) << 24) >>> 0;
            case 7:
                buffer[4] = buffer[4] + (value.charCodeAt(i + 6) << 16) >>> 0;
            case 6:
                buffer[4] = buffer[4] + (value.charCodeAt(i + 5) << 8) >>> 0;
            case 5:
                buffer[4] = buffer[4] + value.charCodeAt(i + 4);
            case 4:
                buffer[3] = buffer[3] + (value.charCodeAt(i + 3) << 24) >>> 0;
            case 3:
                buffer[3] = buffer[3] + (value.charCodeAt(i + 2) << 16) >>> 0;
            case 2:
                buffer[3] = buffer[3] + (value.charCodeAt(i + 1) << 8) >>> 0;
            case 1:
                buffer[3] = buffer[3] + value.charCodeAt(i);
                break;
        }

        buffer[5] = (buffer[5] ^ buffer[4]) - ((buffer[4] >>> 18) ^ (buffer[4] << 14) >>> 0);
        buffer[1] = (buffer[5] ^ buffer[3]) - ((buffer[5] >>> 21) ^ (buffer[5] << 11) >>> 0);
        buffer[4] = (buffer[4] ^ buffer[1]) - ((buffer[1] >>> 7) ^ (buffer[1] << 25) >>> 0);
        buffer[5] = (buffer[5] ^ buffer[4]) - ((buffer[4] >>> 16) ^ (buffer[4] << 16) >>> 0);
        buffer[2] = (buffer[5] ^ buffer[1]) - ((buffer[5] >>> 28) ^ (buffer[5] << 4) >>> 0);
        buffer[4] = (buffer[4] ^ buffer[2]) - ((buffer[2] >>> 18) ^ (buffer[2] << 14) >>> 0);
        buffer[0] = (buffer[5] ^ buffer[4]) - ((buffer[4] >>> 8) ^ (buffer[4] << 24) >>> 0);


        return (BigInt(buffer[4]) << BigInt(32) | BigInt(buffer[0])).toString();
    }

    return (BigInt(buffer[5]) << BigInt(32) | BigInt(buffer[0])).toString();
};

export default Index;
