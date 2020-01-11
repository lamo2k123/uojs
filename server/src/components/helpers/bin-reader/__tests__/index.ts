import BinReader from './../';

describe('Buffer', () => {
    const src = Buffer.from('Test buffer generated from string!');

    test('Read key', () => {
        const br = new BinReader(src);

        br.read('test-key');

        expect(br.position).toEqual({ 'test-key': 0 });

        const read = br.read();

        expect(br.position).toEqual({ 'test-key': 0, [read.key]: 0 });

        expect(Object.keys(br.position).length).toEqual(2);
    });

    test('Position', () => {
        const br = new BinReader(src);
        const reader = br.read('test-key');
        reader.setPosition(18);

        expect(br.position).toEqual({ 'test-key': 18 });

        const reader2 = br.read();
        reader2.setPosition(10);

        expect(br.position).toEqual({ 'test-key': 18, [reader2.key]: 10 });
    });

    describe('Read', () => {
        test('return structure', () => {
            const br = new BinReader(src);
            const reader = br.read();

            expect(reader).toEqual(
                expect.objectContaining({
                    key        : expect.any(String),
                    nextInt    : expect.any(Function),
                    nextUInt   : expect.any(Function),
                    isEnd      : expect.any(Function),
                    skip       : expect.any(Function),
                    setPosition: expect.any(Function),
                    getPosition: expect.any(Function)
                })
            );
        });

        test('return key', () => {
            const br = new BinReader(src);
            const reader = br.read();
            const reader2 = br.read('test-key');

            expect(reader.key).toEqual(expect.any(String));
            expect(reader2.key).toEqual('test-key');
        });

        test('getPosition', () => {
            const br = new BinReader(src);
            const reader = br.read();
            const reader2 = br.read('test-key');

            expect(reader.getPosition()).toEqual(0);
            expect(reader2.getPosition()).toEqual(0);
        });

        test('setPosition', () => {
            const br = new BinReader(src);
            const reader = br.read();
            const reader2 = br.read('test-key');

            reader.setPosition(12);
            reader2.setPosition(8);
            expect(reader.getPosition()).toEqual(12);
            expect(reader2.getPosition()).toEqual(8);
        });

        test('skip', () => {
            const br = new BinReader(src);
            const reader = br.read();
            const reader2 = br.read('test-key');

            reader.skip(8);
            reader2.skip(2);
            expect(reader.getPosition()).toEqual(8);
            expect(reader2.getPosition()).toEqual(2);
        });

        test('isEnd', () => {
            const br = new BinReader(src);
            const reader = br.read();
            const reader2 = br.read('test-key');

            expect(reader.isEnd()).toEqual(false);
            expect(reader2.isEnd()).toEqual(false);

            reader.skip(10);
            reader2.skip(6);

            expect(reader.isEnd()).toEqual(false);
            expect(reader2.isEnd()).toEqual(false);

            reader.skip(src.length);
            reader2.skip(src.length);

            expect(reader.isEnd()).toEqual(true);
            expect(reader2.isEnd()).toEqual(true);
        });

        test('read', () => {
            const br = new BinReader(src);
            const reader = br.read();

            const read1 = [reader.nextInt8(), reader.nextInt8()];
            expect(String.fromCharCode(...read1)).toEqual('Te');

            const read2 = [reader.nextInt8(), reader.nextInt8(), reader.nextInt8(), reader.nextInt8(), reader.nextInt8()];
            expect(String.fromCharCode(...read2)).toEqual('st bu');

            reader.setPosition(0);
            const read3 = [reader.nextInt8(), reader.nextInt8(), reader.nextInt8(), reader.nextInt8()];
            expect(String.fromCharCode(...read3)).toEqual('Test');

            reader.setPosition(1);
            const read4 = [reader.nextInt8(), reader.nextInt8(), reader.nextInt8()];
            expect(String.fromCharCode(...read4)).toEqual('est');

            reader.setPosition(100);
            try {
                reader.nextInt8();
            } catch (e) {
                expect(e.code).toEqual('ERR_OUT_OF_RANGE');
            }
        });
    });
});
