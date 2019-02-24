import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {seeding} from '../_data';
import {Row} from '../tables/VariableTable';

Enzyme.variableure({adapter: new Adapter()});

const data = seeding(1, true);
const props = {
    data,
    toggleModal: jest.fn(),
    handleRemove: jest.fn(),
    onCheck: jest.fn()
};

describe('VariableTable', () => {
    let wrapper, instance;
    beforeAll(() => {
        wrapper = shallow(<Row {...props} />);
        instance = wrapper.instance();
    });

    describe('VariableTable Row component', () => {
        it('Check output value', () => {
            expect(wrapper.contains(<td className="uid">{data.uid}</td>)).toEqual(true);
            expect(wrapper.contains(<td className="value">{data.value}</td>)).toEqual(true);
        });

        it('Check', () => {
            wrapper
                .find('.check')
                .first()
                .simulate('change', {target: {checked: true}});
            expect(props.onCheck.mock.calls.length).toEqual(1);
        });

        it('Open modal to edit', () => {
            jest.spyOn(instance, 'getItemToEdit');
            jest.spyOn(Tools, 'getItem').mockImplementation(() => {});
            wrapper
                .find('.editBtn')
                .first()
                .simulate('click');
            expect(instance.getItemToEdit).toHaveBeenCalled();
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

    describe('VariableTable Row method', () => {
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
});
