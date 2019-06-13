import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../main_table/';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.listRequest', () => {
    test('No params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.listRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/');
        expect(apiCall.mock.calls[0][1]).toBe(undefined);
    });

    test('With params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};

        Service.listRequest('', params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });

    test('With url', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};
        const url = 'sample_url';

        Service.listRequest(url, params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(url);
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });
});

describe('Service.bulkRemoveRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const ids = [1, 2];
        Service.bulkRemoveRequest(ids);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/');
        expect(apiCall.mock.calls[0][1]).toEqual({ids: '1,2'});
        expect(apiCall.mock.calls[0][2]).toEqual('DELETE');
    });
});

describe('Service.handleGetList', () => {
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
    test('On success', async () => {
        const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const url = 'sample_url';
        const params = {key: 'value'};

        const result = await Service.handleGetList(url, params);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(listRequest).toHaveBeenCalled();
        expect(listRequest.mock.calls[0][0]).toEqual(url);
        expect(listRequest.mock.calls[0][1]).toEqual(params);
        expect(result).toEqual(okResp.data);
    });

    test('On error', async () => {
        try {
            const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => failResp);
            jest.spyOn(Tools, 'popMessageOrRedirect');

            const result = await Service.handleGetList();

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });

    test('On exception', async () => {
        try {
            const listRequest = jest
                .spyOn(Service, 'listRequest')
                .mockImplementation(async () => Promise.reject(failResp));
            jest.spyOn(Tools, 'popMessageOrRedirect');

            const result = await Service.handleGetList();

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });
});

describe('Service.handleBulkRemove', () => {
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

    test('On success', async () => {
        const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const ids = [1, 2];
        const result = await Service.handleBulkRemove(ids);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(bulkRemoveRequest).toHaveBeenCalled();
        expect(bulkRemoveRequest.mock.calls[0][0]).toEqual(ids);
        expect(result).toEqual({ids});
    });

    test('On error', async () => {
        try {
            const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => failResp);
            jest.spyOn(Tools, 'popMessageOrRedirect');
            const ids = [1, 2];
            const result = await Service.handleBulkRemove(ids);

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });

    test('On exception', async () => {
        try {
            const bulkRemoveRequest = jest
                .spyOn(Service, 'bulkRemoveRequest')
                .mockImplementation(async () => Promise.reject(failResp));
            jest.spyOn(Tools, 'popMessageOrRedirect');
            const ids = [1, 2];
            const result = await Service.handleBulkRemove(ids);

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });
});

describe('Service.staffToOptions', () => {
    test('Normal case', () => {
        const input = [
            {
                id: 1,
                fullname: 'item 1'
            },
            {
                id: 2,
                fullname: 'item 2'
            }
        ];
        const eput = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const output = Service.staffToOptions(input);
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToList', () => {
    test('sale case', () => {
        const list = [
            {
                sale: 1
            },
            {
                sale: 2
            },
            {
                sale: 3
            }
        ];
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                sale: 1,
                sale_name: 'item 1'
            },
            {
                sale: 2,
                sale_name: 'item 2'
            },
            {
                sale: 3
            }
        ];
        const output = Service.addNameToList(list, nameSource, 'sale');
        expect(eput).toEqual(output);
    });

    test('cust_care case', () => {
        const list = [
            {
                cust_care: 1
            },
            {
                cust_care: 2
            },
            {
                cust_care: 3
            }
        ];
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                cust_care: 1,
                cust_care_name: 'item 1'
            },
            {
                cust_care: 2,
                cust_care_name: 'item 2'
            },
            {
                cust_care: 3
            }
        ];
        const output = Service.addNameToList(list, nameSource, 'cust_care');
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToItem', () => {
    test('sale case', () => {
        const item = {
            sale: 1
        };
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = {
            sale: 1,
            sale_name: 'item 1'
        };
        const output = Service.addNameToItem(item, nameSource, 'sale');
        expect(eput).toEqual(output);
    });

    test('cust_care case', () => {
        const item = {
            cust_care: 1
        };
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = {
            cust_care: 1,
            cust_care_name: 'item 1'
        };
        const output = Service.addNameToItem(item, nameSource, 'cust_care');
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareList', () => {
    test('Normal case', () => {
        const list = [
            {
                sale: 1,
                cust_care: 1
            },
            {
                sale: 2,
                cust_care: 2
            },
            {
                sale: 3,
                cust_care: 3
            }
        ];
        const listSale = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const listCustCare = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                checked: false,
                sale: 1,
                cust_care: 1,
                sale_name: 'item 1',
                cust_care_name: 'item 1'
            },
            {
                checked: false,
                sale: 2,
                cust_care: 2,
                sale_name: 'item 2',
                cust_care_name: 'item 2'
            },
            {
                checked: false,
                sale: 3,
                cust_care: 3,
                sale_name: undefined,
                cust_care_name: undefined
            }
        ];
        const output = Service.prepareList(list, listSale, listCustCare);
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareItem', () => {
    test('Normal case', () => {
        const item = {
            sale: 1,
            cust_care: 1
        };
        const listSale = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const listCustCare = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = {
            checked: false,
            sale: 1,
            cust_care: 1,
            sale_name: 'item 1',
            cust_care_name: 'item 1'
        };
        const output = Service.prepareItem(item, listSale, listCustCare);
        expect(eput).toEqual(output);
    });
});
