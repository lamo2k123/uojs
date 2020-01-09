import hashFileName from './../';

test('is delicious', () => {
    const result = hashFileName('abracadabra');

    expect(result).toEqual('10693561871744532278');
});
