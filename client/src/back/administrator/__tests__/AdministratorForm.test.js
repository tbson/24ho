import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import AdministratorForm from '../forms/AdministratorForm';

Enzyme.configure({adapter: new Adapter()});

describe('AdministratorForm', () => {
    const formName = 'administrator';

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
        const wrapper = shallow(<AdministratorForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="email"]').exists()).toEqual(true);
        expect(wrapper.find('[name="username"]').exists()).toEqual(true);
        expect(wrapper.find('[name="first_name"]').exists()).toEqual(true);
        expect(wrapper.find('[name="last_name"]').exists()).toEqual(true);
        expect(wrapper.find('[name="password"]').exists()).toEqual(true);
        expect(wrapper.find('[name="groups"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.email-field label').text()).toEqual("Email");
        expect(wrapper.find('.username-field label').text()).toEqual("Username");
        expect(wrapper.find('.first_name-field label').text()).toEqual("First name");
        expect(wrapper.find('.last_name-field label').text()).toEqual("Last name");
        expect(wrapper.find('.password-field label').text()).toEqual("Password");
        expect(wrapper.find('.groups-field label').text()).toEqual("Groups");

        // Error messages
        expect(wrapper.find('.email-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.username-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.first_name-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.last_name-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.password-field .invalid-feedback').text()).toEqual("");
        expect(wrapper.find('.groups-field .invalid-feedback').text()).toEqual("");
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn(),
        };
        const wrapper = shallow(<AdministratorForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="email"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="username"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="first_name"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="last_name"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="password"]').props().defaultValue).toEqual("");
        expect(wrapper.find('[name="groups"]').props().defaultValue).toEqual(null);
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<AdministratorForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="email"]').props().defaultValue).toEqual(formValues.email);
        expect(wrapper.find('[name="username"]').props().defaultValue).toEqual(formValues.username);
        expect(wrapper.find('[name="first_name"]').props().defaultValue).toEqual(formValues.first_name);
        expect(wrapper.find('[name="last_name"]').props().defaultValue).toEqual(formValues.last_name);
        expect(wrapper.find('[name="groups"]').props().defaultValue).toEqual(formValues.groups);
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

        const wrapper = shallow(<AdministratorForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="email"]').props().defaultValue).toEqual(formValues.email);
        expect(wrapper.find('[name="username"]').props().defaultValue).toEqual(formValues.username);
        expect(wrapper.find('[name="first_name"]').props().defaultValue).toEqual(formValues.first_name);
        expect(wrapper.find('[name="last_name"]').props().defaultValue).toEqual(formValues.last_name);
        expect(wrapper.find('[name="password"]').props().defaultValue).toEqual(formValues.password);
        expect(wrapper.find('[name="groups"]').props().defaultValue).toEqual(formValues.groups);
        expect(wrapper.find('.main-action .label').text()).toEqual("Add new");
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                email: 'error 1',
                username: 'error 2',
                first_name: 'error 3',
                last_name: 'error 4',
                password: 'error 5',
                groups: 'error 6',
            },
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<AdministratorForm {...props} />);
        // Error messages
        expect(wrapper.find('.email-field .invalid-feedback').text()).toEqual(props.formErrors.email);
        expect(wrapper.find('.username-field .invalid-feedback').text()).toEqual(props.formErrors.username);
        expect(wrapper.find('.first_name-field .invalid-feedback').text()).toEqual(props.formErrors.first_name);
        expect(wrapper.find('.last_name-field .invalid-feedback').text()).toEqual(props.formErrors.last_name);
        expect(wrapper.find('.password-field .invalid-feedback').text()).toEqual(props.formErrors.password);
        expect(wrapper.find('.groups-field .invalid-feedback').text()).toEqual(props.formErrors.groups);
    });
});
