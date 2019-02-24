import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import GroupForm from '../forms/GroupForm';

Enzyme.configure({adapter: new Adapter()});

describe('GroupForm', () => {
    const formName = 'group';

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
        const wrapper = shallow(<GroupForm {...props} />);

        expect(wrapper.find('[name="name"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.name-field label').text()).toEqual("Name");

        // Error messages
        expect(wrapper.find('.name-field .invalid-feedback').text()).toEqual("");
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn(),
        };
        const wrapper = shallow(<GroupForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual("");
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<GroupForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual(formValues.name);
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

        const wrapper = shallow(<GroupForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="name"]').props().defaultValue).toEqual(formValues.name);
        expect(wrapper.find('.main-action .label').text()).toEqual("Add new");
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                name: 'error 2',
            },
            handleSubmit: jest.fn(),
        };

        const wrapper = shallow(<GroupForm {...props} />);
        // Error messages
        expect(wrapper.find('.name-field .invalid-feedback').text()).toEqual(props.formErrors.name);
    });
});
