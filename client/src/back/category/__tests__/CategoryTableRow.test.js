import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {Link} from 'react-router-dom';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {seeding} from '../_data';
import {Row} from '../tables/CategoryTable';

Enzyme.configure({adapter: new Adapter()});

let wrapper;
let instance;
const data = seeding(1, true);
const dataProduct = {...seeding(1, true), type: 'product'};

const props = {
    data,
    toggleModal: jest.fn(),
    handleRemove: jest.fn(),
    onCheck: jest.fn()
};

const productProps = {
    data: dataProduct,
    toggleModal: jest.fn(),
    handleRemove: jest.fn(),
    onCheck: jest.fn()
};

describe('CategoryTable Row component on product', () => {
    beforeAll(() => {
        wrapper = shallow(<Row {...productProps} />);
        instance = wrapper.instance();
    });

    it('Check output value', () => {
        expect(
            wrapper.contains(
                <td className="type">
                    <Link to={`/product-types/${productProps.data.id}`}>
                        <span>{productProps.data.type}</span>
                    </Link>
                </td>
            )
        ).toEqual(true);
    });
});

describe('CategoryTable Row component non product', () => {
    beforeAll(() => {
        props.data = seeding(1, true);
        wrapper = shallow(<Row {...props} />);
        instance = wrapper.instance();
    });

    it('Check output value', () => {
        expect(
            wrapper.contains(
                <td className="title">
                    <Link to={`/type1s/${data.id}`}>
                        <span>{data.title}</span>
                    </Link>
                </td>
            )
        ).toEqual(true);
        expect(wrapper.contains(<td className="uid">{data.uid}</td>)).toEqual(true);
        expect(wrapper.contains(<td className="type">{data.type}</td>)).toEqual(true);
        expect(wrapper.contains(<td className="image_ratio">{data.image_ratio}</td>)).toEqual(true);
        expect(wrapper.contains(<td className="width_ratio">{data.width_ratio}%</td>)).toEqual(true);
        expect(
            wrapper.contains(
                <td className="single">
                    <span className="fas fa-trash-alt red" />
                </td>
            )
        ).toEqual(true);
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

describe('CategoryTable Row method', () => {
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
