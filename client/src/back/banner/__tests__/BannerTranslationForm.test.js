import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import BannerTranslationForm from '../forms/BannerTranslationForm';

Enzyme.configure({adapter: new Adapter()});

describe('BannerTranslationForm', () => {
    const formName = 'banner';

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
        const wrapper = shallow(<BannerTranslationForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="title"]').exists()).toEqual(true);
        expect(wrapper.find('[name="description"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.title-field label').text()).toEqual('Title');
        expect(wrapper.find('.description-field label').text()).toEqual('Description');

        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual('');
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<BannerTranslationForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual('');
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<BannerTranslationForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
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

        const wrapper = shallow(<BannerTranslationForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('.main-action .label').text()).toEqual('Add new');
    });

    it('Error form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {
                title: 'error 1',
                description: 'error 2'
            },
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<BannerTranslationForm {...props} />);
        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual(props.formErrors.title);
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual(props.formErrors.description);
    });
});
