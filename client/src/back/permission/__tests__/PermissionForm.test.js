import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import PermissionForm from '../forms/PermissionForm';

Enzyme.configure({adapter: new Adapter()});

describe('PermissionForm', () => {
    const formName = 'permission';

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
        const wrapper = shallow(<PermissionForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="name"]').exists()).toEqual(true);
        expect(wrapper.find('[name="codename"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.name-field label').text()).toEqual("Name");
        expect(wrapper.find('.codename-field label').text()).toEqual("Code name");

        // Error messages
        expect(wrapper.find('.name-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.codename-field .invalid-feedback').text()).toEqual("");
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn(),
        };
        const wrapper = shallow(<PermissionForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="codename"]').props().defaultValue).toEqual("");
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<PermissionForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual(formValues.name);
        expect(wrapper.find('[name="codename"]').props().defaultValue).toEqual(formValues.codename);
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

        const wrapper = shallow(<PermissionForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual(formValues.name);
        expect(wrapper.find('[name="codename"]').props().defaultValue).toEqual(formValues.codename);
        expect(wrapper.find('.main-action .label').text()).toEqual("Add new");
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                name: 'error 1',
                codename: 'error 2',
            },
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<PermissionForm {...props} />);
        // Error messages
        expect(wrapper.find('.name-field .invalid-feedback').text()).toEqual(props.formErrors.name);
        expect(wrapper.find('.codename-field .invalid-feedback').text()).toEqual(props.formErrors.codename);
    });
});
