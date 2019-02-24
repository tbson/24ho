import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import ArticleTranslationForm from '../forms/ArticleTranslationForm';

Enzyme.configure({adapter: new Adapter()});
const parentUUID = '1a4e87db-fbce-46a5-8a1b-66fca9108499';

describe('ArticleTranslationForm', () => {
    const formName = 'article';

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('Enough fields', () => {
        const props = {
            formName,
            formValues: {},
            parentUUID,
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<ArticleTranslationForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="title"]').exists()).toEqual(true);
        expect(wrapper.find('[name="description"]').exists()).toEqual(true);
        expect(wrapper.find('[name="content"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.title-field label').text()).toEqual('Title');
        expect(wrapper.find('.description-field label').text()).toEqual('Description');
        expect(wrapper.find('.content-field label').text()).toEqual('Content');

        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.content-field .invalid-feedback').text()).toEqual('');
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<ArticleTranslationForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="content"]').props().defaultValue).toEqual('');
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<ArticleTranslationForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('[name="content"]').props().defaultValue).toEqual(formValues.content);
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

        const wrapper = shallow(<ArticleTranslationForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('.main-action .label').text()).toEqual('Add new');
    });

    it('Error form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {
                title: 'error 1',
                description: 'error 2',
                content: 'error 3'
            },
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<ArticleTranslationForm {...props} />);
        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual(props.formErrors.title);
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual(props.formErrors.description);
        expect(wrapper.find('.content-field .invalid-feedback').text()).toEqual(props.formErrors.content);
    });
});
