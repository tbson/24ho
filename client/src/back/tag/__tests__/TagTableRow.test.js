import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {seeding} from '../_data';
import {Row} from '../tables/TagTable';

Enzyme.configure({adapter: new Adapter()});

let wrapper;
let instance;
const props = {
    data: seeding(1, true),
    toggleModal: jest.fn(),
    handleRemove: jest.fn(),
    onCheck: jest.fn(),
};

beforeAll(() => {
    wrapper = shallow(<Row {...props} />);
    instance = wrapper.instance();
});

describe('TagTable Row component', () => {
    it('Check output value', () => {
        expect(wrapper.contains(<td className="title">title 1</td>)).toEqual(true);
        expect(wrapper.contains(<td className="slug">title-1</td>)).toEqual(true);
    });

    it('Check', () => {
        wrapper
            .find('.check')
            .first()
            .simulate('change', {target: {checked: true}});
        expect(props.onCheck.mock.calls.length).toEqual(1);
    });

    it('Open modal to edit', async () => {
        const getItemToEdit = jest.spyOn(instance, 'getItemToEdit');
        jest.spyOn(Tools, 'getItem').mockImplementation(() => {});
        wrapper
            .find('.editBtn')
            .first()
            .simulate('click');
        expect(getItemToEdit).toHaveBeenCalled();
    });

    it('Remove', () => {
        wrapper
            .find('.removeBtn')
            .first()
            .simulate('click');
        expect(props.handleRemove.mock.calls.length).toEqual(1);
        expect(props.handleRemove.mock.calls[0][0]).toEqual('1');
    });
});

describe('TagTable Row method', () => {
    describe('getItemToEdit then toggleModal', () => {
        it('Fail', async () => {
            jest.spyOn(Tools, 'getItem').mockImplementation(() => null);
            await instance.getItemToEdit(1);
            expect(props.toggleModal.mock.calls.length).toEqual(0);
        });
        it('Success', async () => {
            jest.spyOn(Tools, 'getItem').mockImplementation(() => ({}));
            await instance.getItemToEdit(1);
            expect(props.toggleModal.mock.calls.length).toEqual(1);
        });
    });
});
