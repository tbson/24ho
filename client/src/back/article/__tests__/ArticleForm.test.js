import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import ArticleForm from '../forms/ArticleForm';

Enzyme.configure({adapter: new Adapter()});
const parentUUID = '1a4e87db-fbce-46a5-8a1b-66fca9108499';
const tagSource = [
    {value: 1, label: 'one'},
    {value: 2, label: 'two'}
]

describe('ArticleForm', () => {
    const formName = 'article';

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('Enough fields', () => {
        const props = {
            formName,
            formValues: {},
            parentUUID,
            tagSource,
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<ArticleForm {...props} />);

        expect(wrapper.find('[name="id"]').exists()).toEqual(true);
        expect(wrapper.find('[name="title"]').exists()).toEqual(true);
        expect(wrapper.find('[name="slug"]').exists()).toEqual(true);
        expect(wrapper.find('[name="description"]').exists()).toEqual(true);
        expect(wrapper.find('[name="content"]').exists()).toEqual(true);
        expect(wrapper.find('[name="image"]').exists()).toEqual(true);
        expect(wrapper.find('[name="order"]').exists()).toEqual(true);
        expect(wrapper.find('[name="tags"]').exists()).toEqual(true);
        expect(wrapper.find('[name="use_slide"]').exists()).toEqual(true);
        expect(wrapper.find('[name="thumbnail_in_content"]').exists()).toEqual(true);
        expect(wrapper.find('[name="pin"]').exists()).toEqual(true);

        // Labels
        expect(wrapper.find('.title-field label').text()).toEqual('Title');
        expect(wrapper.find('.slug-field label').text()).toEqual('Slug');
        expect(wrapper.find('.description-field label').text()).toEqual('Description');
        expect(wrapper.find('.content-field label').text()).toEqual('Content');
        expect(wrapper.find('.image-field label').text()).toEqual('Image');
        expect(wrapper.find('.order-field label').text()).toEqual('Order');
        expect(wrapper.find('.tags-field label').text()).toEqual('Tags');
        expect(wrapper.find('.use_slide-field label').text()).toEqual('Use slide');
        expect(wrapper.find('.thumbnail_in_content-field label').text()).toEqual('Thumbnail in content');
        expect(wrapper.find('.pin-field label').text()).toEqual('Pin');

        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.slug-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.content-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.image-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.order-field .invalid-feedback').text()).toEqual('');
        expect(wrapper.find('.tags-field .invalid-feedback').text()).toEqual('');
    });

    it('Empty form', () => {
        const props = {
            formName,
            formValues: {},
            formErrors: {},
            handleSubmit: jest.fn()
        };
        const wrapper = shallow(<ArticleForm {...props} />);

        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="slug"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="content"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="tags"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="use_slide"]').props().defaultChecked).toEqual(false);
        expect(wrapper.find('[name="thumbnail_in_content"]').props().defaultChecked).toEqual(false);
        expect(wrapper.find('[name="pin"]').props().defaultChecked).toEqual(false);
    });

    it('Editing form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {},
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<ArticleForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="slug"]').props().defaultValue).toEqual(formValues.slug);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('[name="content"]').props().defaultValue).toEqual(formValues.content);
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(formValues.order);
        expect(wrapper.find('[name="tags"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="use_slide"]').props().defaultChecked).toEqual(formValues.use_slide);
        expect(wrapper.find('[name="thumbnail_in_content"]').props().defaultChecked).toEqual(
            formValues.thumbnail_in_content
        );
        expect(wrapper.find('[name="pin"]').props().defaultChecked).toEqual(formValues.pin);
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

        const wrapper = shallow(<ArticleForm {...props} />);
        formValues = wrapper.state('formValues');
        expect(wrapper.find('[name="id"]').props().defaultValue).toEqual(0);
        expect(wrapper.find('[name="title"]').props().defaultValue).toEqual(formValues.title);
        expect(wrapper.find('[name="slug"]').props().defaultValue).toEqual(formValues.slug);
        expect(wrapper.find('[name="description"]').props().defaultValue).toEqual(formValues.description);
        expect(wrapper.find('[name="content"]').props().defaultValue).toEqual(formValues.content);
        expect(wrapper.find('[name="image"]').props().defaultValue).toEqual(undefined);
        expect(wrapper.find('[name="order"]').props().defaultValue).toEqual(formValues.order);
        expect(wrapper.find('[name="tags"]').props().defaultValue).toEqual('');
        expect(wrapper.find('[name="use_slide"]').props().defaultChecked).toEqual(formValues.use_slide);
        expect(wrapper.find('[name="thumbnail_in_content"]').props().defaultChecked).toEqual(
            formValues.thumbnail_in_content
        );
        expect(wrapper.find('[name="pin"]').props().defaultChecked).toEqual(formValues.pin);
        expect(wrapper.find('.main-action .label').text()).toEqual('Add new');
    });

    it('Error form', () => {
        let formValues = seeding(1, true);
        const props = {
            formName,
            formValues,
            formErrors: {
                title: 'error 1',
                slug: 'error 2',
                description: 'error 3',
                content: 'error 4',
                image: 'error 5',
                order: 'error 6',
                tags: 'error 7',
            },
            handleSubmit: jest.fn()
        };

        const wrapper = shallow(<ArticleForm {...props} />);
        // Error messages
        expect(wrapper.find('.title-field .invalid-feedback').text()).toEqual(props.formErrors.title);
        expect(wrapper.find('.slug-field .invalid-feedback').text()).toEqual(props.formErrors.slug);
        expect(wrapper.find('.description-field .invalid-feedback').text()).toEqual(props.formErrors.description);
        expect(wrapper.find('.content-field .invalid-feedback').text()).toEqual(props.formErrors.content);
        expect(wrapper.find('.image-field .invalid-feedback').text()).toEqual(props.formErrors.image);
        expect(wrapper.find('.order-field .invalid-feedback').text()).toEqual(props.formErrors.order);
        expect(wrapper.find('.tags-field .invalid-feedback').text()).toEqual(props.formErrors.tags);
    });
});
