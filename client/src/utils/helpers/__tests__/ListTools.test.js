import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ListTools from '../ListTools';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('checkAll without condition', () => {
    test('Full', () => {
        const input = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];

        const eput = [
            {id: 1, checked: false},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];
        const output = ListTools.checkAll(input);
        expect(output).toEqual(eput);
    });

    test('Empty', () => {
        const input = [
            {id: 1, checked: false},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];

        const eput = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];
        const output = ListTools.checkAll(input);
        expect(output).toEqual(eput);
    });

    test('Half full', () => {
        const input = [
            {id: 1, checked: true},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];

        const eput = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];
        const output = ListTools.checkAll(input);
        expect(output).toEqual(eput);
    });
});

describe('checkAll with condition', () => {
    const condition = {condition: 1};
    test('Full', () => {
        const input = [
            {id: 1, condition: 1, checked: true},
            {id: 2, condition: 1, checked: true},
            {id: 3, condition: 2, checked: true}
        ];

        const eput = [
            {id: 1, condition: 1, checked: false},
            {id: 2, condition: 1, checked: false},
            {id: 3, condition: 2, checked: true}
        ];
        const output = ListTools.checkAll(input, condition);
        expect(output).toEqual(eput);
    });

    test('Empty', () => {
        const input = [
            {id: 1, condition: 1, checked: false},
            {id: 2, condition: 1, checked: false},
            {id: 3, condition: 2, checked: false}
        ];

        const eput = [
            {id: 1, condition: 1, checked: true},
            {id: 2, condition: 1, checked: true},
            {id: 3, condition: 2, checked: false}
        ];
        const output = ListTools.checkAll(input, condition);
        expect(output).toEqual(eput);
    });

    test('Half full', () => {
        const input = [
            {id: 1, condition: 1, checked: true},
            {id: 2, condition: 1, checked: false},
            {id: 3, condition: 2, checked: false}
        ];

        const eput = [
            {id: 1, condition: 1, checked: true},
            {id: 2, condition: 1, checked: true},
            {id: 3, condition: 2, checked: false}
        ];
        const output = ListTools.checkAll(input, condition);
        expect(output).toEqual(eput);
    });
});

describe('subList', () => {
    const {subList} = ListTools;
    it('Match 1', () => {
        const input = [
            {id: 1, key1: 4, key2: 1},
            {id: 2, key1: 3, key2: 2},
            {id: 3, key1: 2, key2: 3},
            {id: 4, key1: 1, key2: 4}
        ];
        const condition = {
            key1: 1,
            key2: 4
        };
        const eput = [{id: 4, key1: 1, key2: 4}];
        const output = input.filter(subList(condition));
        expect(output).toEqual(eput);
    });

    it('Match 2', () => {
        const input = [
            {id: 1, key1: 4, key2: 1},
            {id: 2, key1: 1, key2: 4},
            {id: 3, key1: 2, key2: 3},
            {id: 4, key1: 1, key2: 4}
        ];
        const condition = {
            key1: 1,
            key2: 4
        };
        const eput = [{id: 2, key1: 1, key2: 4}, {id: 4, key1: 1, key2: 4}];
        const output = input.filter(subList(condition));
        expect(output).toEqual(eput);
    });

    it('Match 0', () => {
        const input = [
            {id: 1, key1: 4, key2: 1},
            {id: 2, key1: 1, key2: 4},
            {id: 3, key1: 2, key2: 3},
            {id: 4, key1: 1, key2: 4}
        ];
        const condition = {
            key1: 0,
            key2: 4
        };
        const eput = [];
        const output = input.filter(subList(condition));
        expect(output).toEqual(eput);
    });
});

describe('prepare', () => {
    it('Empty input', () => {
        const input = [];
        const eput = [];
        const output = ListTools.prepare(input);
        expect(output).toEqual(eput);
    });

    it('Normal input', () => {
        const input = [
            {
                id: 1,
                key: 'key1',
                value: 'value1'
            },
            {
                id: 2,
                key: 'key2',
                value: 'value2'
            }
        ];
        const eput = [
            {
                id: 1,
                key: 'key1',
                value: 'value1',
                checked: false
            },
            {
                id: 2,
                key: 'key2',
                value: 'value2',
                checked: false
            }
        ];
        const output = ListTools.prepare(input);
        expect(output).toEqual(eput);
    });
});

describe('ListTools.actions', () => {
    describe('ListTools.actions.remove', () => {
        it('Not exist case', () => {
            const list = [{id: 1}, {id: 2}, {id: 3}];
            const input = {id: 0};
            const eput = [{id: 1}, {id: 2}, {id: 3}];
            const output = ListTools.actions(list)(input).remove();
            expect(output).toEqual(eput);
        });
        it('Normal case', () => {
            const list = [{id: 1}, {id: 2}, {id: 3}];
            const input = {id: 2};
            const eput = [{id: 1}, {id: 3}];
            const output = ListTools.actions(list)(input).remove();
            expect(output).toEqual(eput);
        });
    });

    describe('ListTools.actions.bulkRemove', () => {
        it('Not exist case', () => {
            const list = [{id: 1}, {id: 2}, {id: 3}];
            const input = {ids: '1,4'};
            const eput = [{id: 2}, {id: 3}];
            const output = ListTools.actions(list)(input).bulkRemove();
            expect(output).toEqual(eput);
        });
        it('Normal case', () => {
            const list = [{id: 1}, {id: 2}, {id: 3}];
            const input = {ids: '1,3'};
            const eput = [{id: 2}];
            const output = ListTools.actions(list)(input).bulkRemove();
            expect(output).toEqual(eput);
        });
    });

    describe('ListTools.actions.add', () => {
        it('Normal case', () => {
            const list = [{id: 1}, {id: 2}, {id: 3}];
            const input = {id: 4};
            const eput = [{id: 4}, {id: 1}, {id: 2}, {id: 3}];
            const output = ListTools.actions(list)(input).add();
            expect(output).toEqual(eput);
        });
    });

    describe('ListTools.actions.update', () => {
        it('Not exist case', () => {
            const list = [{id: 1, value: 1}, {id: 2, value: 1}, {id: 3, value: 1}];
            const input = {id: 0, value: 0};
            const eput = [{id: 1, value: 1}, {id: 2, value: 1}, {id: 3, value: 1}];
            const output = ListTools.actions(list)(input).update();
            expect(output).toEqual(eput);
        });
        it('Normal case', () => {
            const list = [{id: 1, value: 1}, {id: 2, value: 1}, {id: 3, value: 1}];
            const input = {id: 1, value: 0};
            const eput = [{id: 1, value: 0}, {id: 2, value: 1}, {id: 3, value: 1}];
            const output = ListTools.actions(list)(input).update();
            expect(output).toEqual(eput);
        });
    });
});

describe('prepare', () => {
    it('Zero', () => {
        const input = 0;
        const eput = '';
        const output = ListTools.getConfirmMessage(input);
        expect(output).toEqual(eput);
    });

    it('Single', () => {
        const input = 1;
        const eput = 'Do you want to remove this item ?';
        const output = ListTools.getConfirmMessage(input);
        expect(output).toEqual(eput);
    });

    it('Multiple', () => {
        const input = 2;
        const eput = 'Do you want to remove these items ?';
        const output = ListTools.getConfirmMessage(input);
        expect(output).toEqual(eput);
    });
});
