import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import BannerForm from '../forms/BannerForm';

Enzyme.configure({adapter: new Adapter()});

describe('BannerForm', () => {
    const formName = 'banner';

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('Enough fields', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn(),
        };
        const wrapper = shallow(<BannerForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="title"]').exists()).toEqual(true);
        expect(wrapper.find('[name="description"]').exists()).toEqual(true);
        expect(wrapper.find('[name="image"]').exists()).toEqual(true);
        expect(wrapper.find('[name="order"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.title-field label').text()).toEqual("Title");
        expect(wrapper.find('.description-field label').text()).toEqual("Description");
        expect(wrapper.find('.image-field label').text()).toEqual("Image");
        expect(wrapper.find('.order-field label').text()).toEqual("Order");

        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.image-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.order-field .invalid-feedback').text()).toEqual("");
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn(),
        };
        const wrapper = shallow(<BannerForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(null);
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<BannerForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(formValues.order);
        expect(wrapper.find('.main-action .label').text()).toEqual("Update");
    });

    it('Adding form', () => {
        let formValues = seeding(1, true);
        formValues.id = 0;
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<BannerForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(formValues.order);
        expect(wrapper.find('.main-action .label').text()).toEqual("Add new");
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                title: 'error 1',
                description: 'error 2',
                image: 'error 3',
                order: 'error 4',
            },
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<BannerForm {...props} />);
        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual(props.formErrors.title);
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual(props.formErrors.description);
        expect(wrapper.find('.image-field .invalid-feedback').text()).toEqual(props.formErrors.image);
        expect(wrapper.find('.order-field .invalid-feedback').text()).toEqual(props.formErrors.order);
    });
});
