import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import CategoryForm from '../forms/CategoryForm';

Enzyme.configure({adapter: new Adapter()});

describe('CategoryForm', () => {
    const formName = 'category';

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('Enough fields', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<CategoryForm {...props} />);

        expect(wrapper.find('[name="title"]').exists()).toEqual(true);
        expect(wrapper.find('[name="image_ratio"]').exists()).toEqual(true);
        expect(wrapper.find('[name="width_ratio"]').exists()).toEqual(true);
        expect(wrapper.find('[name="type"]').exists()).toEqual(true);
        expect(wrapper.find('[name="single"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.title-field label').text()).toEqual('Title');
        expect(wrapper.find('.image_ratio-field label').text()).toEqual('Image ratio');
        expect(wrapper.find('.width_ratio-field label').text()).toEqual('Width ratio');
        expect(wrapper.find('.type-field label').text()).toEqual('Type');
        expect(wrapper.find('.single-field label').text()).toEqual('Single');

        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.image_ratio-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.width_ratio-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.type-field .invalid-feedback').text()).toEqual('');
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<CategoryForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="image_ratio"]').props().defaultValue).toEqual(1.618);
        expect(wrapper.find('[name="width_ratio"]').props().defaultValue).toEqual(100);
        expect(wrapper.find('[name="type"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="single"]').props().defaultChecked).toEqual(false);
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<CategoryForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="image_ratio"]').props().defaultValue).toEqual(formValues.image_ratio);
        expect(wrapper.find('[name="width_ratio"]').props().defaultValue).toEqual(formValues.width_ratio);
        expect(wrapper.find('[name="type"]').props().defaultValue).toEqual(formValues.type);
        expect(wrapper.find('[name="single"]').props().defaultChecked).toEqual(formValues.single);
        expect(wrapper.find('.main-action .label').text()).toEqual('Update');
    });

    it('Adding form', () => {
        let formValues = seeding(1, true);
        formValues.id = 0;
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<CategoryForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="image_ratio"]').props().defaultValue).toEqual(formValues.image_ratio);
        expect(wrapper.find('[name="width_ratio"]').props().defaultValue).toEqual(formValues.width_ratio);
        expect(wrapper.find('[name="type"]').props().defaultValue).toEqual(formValues.type);
        expect(wrapper.find('[name="single"]').props().defaultChecked).toEqual(formValues.single);
        expect(wrapper.find('.main-action .label').text()).toEqual('Add new');
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                title: 'error 1',
                image_ratio: 'error 2',
                width_ratio: 'error 3',
                type: 'error 4'
            },
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<CategoryForm {...props} />);
        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual(props.formErrors.title);
        expect(wrapper.find('.image_ratio-field .invalid-feedback').text()).toEqual(props.formErrors.image_ratio);
        expect(wrapper.find('.width_ratio-field .invalid-feedback').text()).toEqual(props.formErrors.width_ratio);
        expect(wrapper.find('.type-field .invalid-feedback').text()).toEqual(props.formErrors.type);
    });
});
