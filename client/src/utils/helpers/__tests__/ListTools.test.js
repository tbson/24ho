import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ListTools from '../ListTools';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('checkOrUncheckAll', () => {
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
        const output = ListTools.getDeleteMessage(input);
        expect(output).toEqual(eput);
    });

    it('Single', () => {
        const input = 1;
        const eput = 'Do you want to remove this item ?';
        const output = ListTools.getDeleteMessage(input);
        expect(output).toEqual(eput);
    });

    it('Multiple', () => {
        const input = 2;
        const eput = 'Do you want to remove these items ?';
        const output = ListTools.getDeleteMessage(input);
        expect(output).toEqual(eput);
    });
});
