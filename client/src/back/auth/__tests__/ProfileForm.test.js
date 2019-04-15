import Tools from 'src/utils/helpers/Tools';
import {Service} from '../profile/Form';

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

describe('Service.getProfileRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.getProfileRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/profile/');
    });
});

describe('Service.setProfileRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            key: 'value'
        };
        Service.setProfileRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/profile/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.getProfile', () => {
    test('Error', async () => {
        const callback = jest.fn();
        jest.spyOn(Service, 'getProfileRequest').mockImplementation(async () => ({
            ok: false,
            data: {}
        }));

        await Service.getProfile(callback);
        expect(callback).not.toHaveBeenCalled();
    });

    test('Success', async () => {
        const callback = jest.fn();
        jest.spyOn(Service, 'getProfileRequest').mockImplementation(async () => ({
            ok: true,
            data: {}
        }));

        await Service.getProfile(callback);
        expect(callback).toHaveBeenCalled();
    });
});

describe('Service.handleSubmit', () => {
    test('Error', async () => {
        jest.spyOn(Service, 'setProfileRequest').mockImplementation(async () => failResp);
        const values = {key: 'value'};
        const onChange = jest.fn();
        const form = {
            setErrors: jest.fn()
        };
        await Service.handleSubmit(onChange)(values, form);
        expect(onChange).not.toHaveBeenCalled();

        expect(form.setErrors).toHaveBeenCalled();
        expect(form.setErrors.mock.calls[0][0]).toEqual({key: ['value']});
    });

    test('Success', async () => {
        jest.spyOn(Service, 'setProfileRequest').mockImplementation(async () => okResp);
        const values = {key: 'value'};
        const onChange = jest.fn();
        const form = {
            setErrors: jest.fn()
        }; 
        await Service.handleSubmit(onChange)(values, form);
        expect(onChange).toHaveBeenCalled();
        expect(form.setErrors).not.toHaveBeenCalled();
    });
});
