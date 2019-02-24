import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {seeding} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import ConfigForm from '../forms/ConfigForm';

Enzyme.configure({adapter: new Adapter()});

const formName = 'config';

describe('ConfigForm', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('Empty form', () => {
        const props = {
            formValues: {},
            handleSubmit: jest.fn(),
            handleClose: jest.fn()
        };
        const wrapper = shallow(<ConfigForm {...props} />);

        const inputs = wrapper.findWhere(n => {
            const id = n.prop('id');
            if (id && id.split('-')[0] === formName) return true;
        });
        expect(inputs).toHaveLength(3);

        expect(wrapper.find(`#${formName}-id`).props().defaultValue).toEqual(undefined);
        expect(wrapper.find(`#${formName}-uid`).props().value).toEqual(undefined);
        expect(wrapper.find(`#${formName}-value`).props().value).toEqual(undefined);
    });

    it('Fulfilled form', () => {
        const formValues = seeding(1, true);
        const props = {
            formValues,
            handleSubmit: jest.fn(),
            handleClose: jest.fn()
        };

        const wrapper = shallow(<ConfigForm {...props} />);
        const instance = wrapper.instance();

        // Need to forceUpdate after spy instance methods that used in life circle or DOM
        jest.spyOn(instance, 'handleSubmit').mockImplementation(() => {});
        instance.forceUpdate();

        wrapper.find('form').simulate('submit');

        expect(wrapper.find(`#${formName}-id`).props().defaultValue).toEqual(formValues.id);
        expect(wrapper.find(`#${formName}-uid`).props().value).toEqual(formValues.uid);
        expect(wrapper.find(`#${formName}-value`).props().value).toEqual(formValues.value);
        expect(wrapper.find('SubmitButton').props().label).toEqual('Update');
        expect(instance.handleSubmit).toHaveBeenCalled();
    });

    it('Submit success', async () => {
        const data = {};
        const error = {};
        const formValues = seeding(1, true);
        const props = {
            formValues,
            handleSubmit: jest.fn(),
            handleClose: jest.fn()
        };

        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => formValues);
        jest.spyOn(Tools, 'handleSubmit').mockImplementation(async () => ({data, error}));

        const wrapper = shallow(<ConfigForm {...props} />);
        const instance = wrapper.instance();

        await instance.handleSubmit({preventDefault: () => {}});

        expect(props.handleSubmit).toHaveBeenCalled();
    });

    it('Submit faill', async () => {
        const data = {};
        const error = {
            uid: 'Error 1',
            value: 'Error 2'
        };
        const formValues = seeding(1, true);
        const props = {
            formValues,
            handleSubmit: jest.fn(),
            handleClose: jest.fn()
        };

        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => formValues);
        jest.spyOn(Tools, 'handleSubmit').mockImplementation(async () => ({data, error}));

        const wrapper = shallow(<ConfigForm {...props} />);
        const instance = wrapper.instance();

        jest.spyOn(instance, 'onSubmitFail');

        await instance.handleSubmit({preventDefault: () => {}});

        expect(instance.onSubmitFail).toHaveBeenCalled();
        expect(wrapper.state('formErrors')).toEqual(error);
    });
});
