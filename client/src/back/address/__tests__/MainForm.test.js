import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {Service} from '../MainForm/';

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
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/address/');
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
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/address/${id}`);
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
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/address/${id}`);
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

describe('Service.validationSchema', () => {
    test('Success', () => {
        const values = {
            title: 'title1',
            area: 1,
            phone: '0906696527'
        };
        const output = Service.validationSchema.isValidSync(values);
        expect(output).toEqual(true);
    });

    test('Fail', () => {
        const values = {
            title: 'uid1',
            area: undefined,
            phone: '12345678900'
        };
        const eput = {
            area: [ErrMsgs.REQUIRED],
            phone: [ErrMsgs.PHONE]
        };
        let output = {};
        try {
            Service.validationSchema.validateSync(values, {abortEarly: false});
        } catch (err) {
            output = err.inner.reduce((errors, item) => ({...errors, [item.path]: item.errors}), {});
        }
        expect(output).toEqual(eput);
    });
});
