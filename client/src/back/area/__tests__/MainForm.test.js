import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../MainForm/';
import {defaultInputs} from '../_data';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

const okResp = {
    ok: true,
    data: {
        key: 'value'
    }
};
const failResp = {
    ok: false,
    data: {
        key: 'value'
    }
};

describe('Service.changeRequest', () => {
    it('No ID', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            key: 'value'
        };
        await Service.changeRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/area/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });

    it('With ID', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            id: 1,
            key: 'value'
        };
        const {id} = params;
        await Service.changeRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/area/${id}`);
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('PUT');
    });
});

describe('Service.retrieveRequest', () => {
    it('No id', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const id = 0;
        const result = await Service.retrieveRequest(id);
        expect(apiCall).not.toHaveBeenCalled();
        expect(result).toEqual({ok: true, data: Service.initialValues});
    });
    it('With id', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const id = 1;
        await Service.retrieveRequest(id);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/area/${id}`);
    });
});

describe('Service.handleSubmit', () => {
    describe('No ID', () => {
        it('Success', async () => {
            const id = 0;
            const onChange = jest.fn();
            const reOpenDialog = true;
            const values = {key: 'value'};
            const checkedValue = {key: 'value', checked: false};
            const form = {
                setErrors: jest.fn()
            };

            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => okResp);

            await Service.handleSubmit(id, onChange, reOpenDialog)(values, form);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual(values);

            expect(onChange).toHaveBeenCalled();
            expect(onChange.mock.calls[0][0]).toEqual(checkedValue);
            expect(onChange.mock.calls[0][1]).toEqual('add');
            expect(onChange.mock.calls[0][2]).toEqual(reOpenDialog);

            expect(form.setErrors).not.toHaveBeenCalled();
        });

        it('Fail', async () => {
            const id = 0;
            const onChange = jest.fn();
            const reOpenDialog = true;
            const values = {key: 'value'};
            const checkedValue = {key: 'value', checked: false};
            const form = {
                setErrors: jest.fn()
            };

            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => failResp);

            await Service.handleSubmit(id, onChange, reOpenDialog)(values, form);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual(values);

            expect(onChange).not.toHaveBeenCalled();

            expect(form.setErrors).toHaveBeenCalled();
            expect(form.setErrors.mock.calls[0][0]).toEqual({key: ['value']});
        });
    });

    describe('With ID', () => {
        it('Success', async () => {
            const id = 1;
            const onChange = jest.fn();
            const reOpenDialog = true;
            const values = {key: 'value'};
            const checkedValue = {key: 'value', checked: false};
            const form = {
                setErrors: jest.fn()
            };

            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => okResp);

            await Service.handleSubmit(id, onChange, reOpenDialog)(values, form);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual({...values, id});

            expect(onChange).toHaveBeenCalled();
            expect(onChange.mock.calls[0][0]).toEqual(checkedValue);
            expect(onChange.mock.calls[0][1]).toEqual('update');
            expect(onChange.mock.calls[0][2]).toEqual(reOpenDialog);

            expect(form.setErrors).not.toHaveBeenCalled();
        });

        it('Fail', async () => {
            const id = 1;
            const onChange = jest.fn();
            const reOpenDialog = true;
            const values = {key: 'value'};
            const checkedValue = {key: 'value', checked: false};
            const form = {
                setErrors: jest.fn()
            };

            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => failResp);

            await Service.handleSubmit(id, onChange, reOpenDialog)(values, form);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual({...values, id});

            expect(onChange).not.toHaveBeenCalled();

            expect(form.setErrors).toHaveBeenCalled();
            expect(form.setErrors.mock.calls[0][0]).toEqual({key: ['value']});
        });
    });
});

describe('Service.validate', () => {
    test('All empty', async () => {
        const values = {
            uid: '',
            title: '',
            unit_price: 0
        };
        const eput = {
            uid: 'Required',
            title: 'Required',
            unit_price: 'Required'
        };
        const output = Service.validate(values);
        expect(output).toEqual(eput);
    });
});
