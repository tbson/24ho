import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Tools from '../Tools';
import 'src/__mocks__/localStorage';
import {LOCAL_STORAGE_PREFIX, API_URL} from 'src/constants';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

test('cap', () => {
    let input = 'test';
    let eput = 'Test';
    let output = Tools.cap(input);
    expect(output).toBe(eput);

    input = 't';
    eput = 'T';
    output = Tools.cap(input);
    expect(output).toBe(eput);
});

test('formDataToObj', () => {
    let input = new FormData();
    input.set('key1', 'value1');
    input.set('key2', 'value2');
    input.set('key3', 123);

    let eput = {
        key1: 'value1',
        key2: 'value2',
        key3: '123'
    };
    let output = Tools.formDataToObj(input);
    expect(output).toEqual(eput);

    input = new FormData();
    input.set('key1', 'value1');
    input.set('key2', 'value2');
    input.set('key3', null);

    eput = {
        key1: 'value1',
        key2: 'value2',
        key3: null
    };
    output = Tools.formDataToObj(input);
    expect(output).toEqual(eput);
});

test('isEmpty', () => {
    let input = {};
    let eput = true;
    let output = Tools.isEmpty(input);
    expect(output).toBe(eput);

    input = {key: 'value'};
    eput = false;
    output = Tools.isEmpty(input);
    expect(output).toBe(eput);

    input = {key: null};
    eput = false;
    output = Tools.isEmpty(input);
    expect(output).toBe(eput);
});

test('setStorage', () => {
    let input = 'abc';
    Tools.setStorage('key', input);
    let output = localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + 'key');
    output = Tools.parseJson(output);
    expect(output).toBe(input);

    input = null;
    Tools.setStorage('key', input);
    output = localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + 'key');
    output = Tools.parseJson(output);
    expect(output).toBe(input);

    input = 123;
    Tools.setStorage('key', input);
    output = localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + 'key');
    output = Tools.parseJson(output);
    expect(output).toBe(input);

    input = {key: 'value'};
    Tools.setStorage('key', input);
    output = localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + 'key');
    output = Tools.parseJson(output);
    expect(output).toEqual(input);

    input = {key: null};
    Tools.setStorage('key', input);
    output = localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + 'key');
    output = Tools.parseJson(output);
    expect(output).toEqual(input);
});

test('getStorageObj', () => {
    let input = {key: 'value'};
    Tools.setStorage('key', input);
    let output = Tools.getStorageObj('key');
    expect(output).toEqual(input);

    input = 'abc';
    Tools.setStorage('key', input);
    output = Tools.getStorageObj('key');
    expect(output).toEqual({});

    input = 123;
    Tools.setStorage('key', input);
    output = Tools.getStorageObj('key');
    expect(output).toEqual({});

    input = null;
    Tools.setStorage('key', input);
    output = Tools.getStorageObj('key');
    expect(output).toEqual({});
});

test('getStorageStr', () => {
    let input = {key: 'value'};
    Tools.setStorage('key', input);
    let output = Tools.getStorageStr('key');
    expect(output).toEqual('');

    input = 'abc';
    Tools.setStorage('key', input);
    output = Tools.getStorageStr('key');
    expect(output).toEqual(input);

    input = 123;
    Tools.setStorage('key', input);
    output = Tools.getStorageStr('key');
    expect(output).toEqual('123');

    input = null;
    Tools.setStorage('key', input);
    output = Tools.getStorageStr('key');
    expect(output).toEqual('');
});

test('removeStorage', () => {
    Tools.setStorage('key', 'value');
    Tools.setStorage('key1', 'value1');
    Tools.removeStorage('key');
    let output = Tools.getStorageStr('key');
    let output1 = Tools.getStorageStr('key1');
    expect(output).toEqual('');
    expect(output1).toEqual('value1');
});

test('getToken', () => {
    Tools.setStorage('auth', {user: {token: 'token'}});
    let output = Tools.getToken();
    expect(output).toEqual('token');

    Tools.removeStorage('auth');
    output = Tools.getToken();
    expect(output).toEqual('');
});

test('getApiUrls', () => {
    let input = [
        {
            controller: 'controller1',
            endpoints: {
                enpointFirst: 'kebabCase1',
                enpointSecond: 'kebabCase2'
            }
        },
        {
            controller: 'controller2',
            endpoints: {
                enpointFirst: 'kebabCase1',
                enpointSecond: 'kebabCase2'
            }
        }
    ];
    let output = Tools.getApiUrls(input);
    let eput = {
        enpointFirst: API_URL + 'controller-1/kebab-case-1/',
        enpointSecond: API_URL + 'controller-1/kebab-case-2/',
        controller2EnpointFirst: API_URL + 'controller-2/kebab-case-1/',
        controller2EnpointSecond: API_URL + 'controller-2/kebab-case-2/'
    };
    expect(output).toEqual(eput);
});

test('payloadFromObject', () => {
    let input = {
        key1: 'value1',
        key2: 'value2'
    };
    let output = Tools.payloadFromObject(input);
    let eput = JSON.stringify(input);
    expect(output).toEqual({
        data: eput,
        contentType: 'application/json'
    });

    input = {
        key1: 'value1',
        key2: 'value2'
    };
    output = Tools.payloadFromObject({...input, key0: new Blob()}); // Create formFata
    output.data = Tools.formDataToObj(output.data);
    delete output.data.key0;
    eput = input;
    expect(output).toEqual({
        data: eput,
        contentType: 'application/x-www-form-urlencoded'
    });
});

test('urlDataEncode', () => {
    let input = {
        key1: 'value1',
        key2: 'value2',
        key3: null,
        key4: '',
        key5: 0,
        key6: 5
    };
    let output = Tools.urlDataEncode(input);
    let eput = 'key1=value1&key2=value2&key3=&key4=&key5=0&key6=5';
    expect(output).toEqual(eput);
});

test('urlDataDecode', () => {
    let input = 'key1=value1&key2=value2&key3=&key4=&key5=0&key6=5';
    let output = Tools.urlDataDecode(input);
    let eput = {
        key1: 'value1',
        key2: 'value2',
        key3: '',
        key4: '',
        key5: '0',
        key6: '5'
    };
    expect(output).toEqual(eput);
});

test('getCheckedId', () => {
    let input = [{id: 1}, {id: 2}, {id: 3}];
    let output = Tools.getCheckedId(input);
    let eput = '';
    expect(output).toEqual(eput);

    input = [{id: 1}, {id: 2, checked: true}, {id: 3}];
    output = Tools.getCheckedId(input);
    eput = '2';
    expect(output).toEqual(eput);

    input = [{id: 1, checked: true}, {id: 2}, {id: 3, checked: true}];
    output = Tools.getCheckedId(input);
    eput = '1,3';
    expect(output).toEqual(eput);

    input = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}];
    output = Tools.getCheckedId(input);
    eput = '1,2,3';
    expect(output).toEqual(eput);
});

test('errorMessageProcessing', () => {
    let input = '';
    let output = Tools.errorMessageProcessing(input);
    let eput = '';
    expect(output).toEqual(eput);

    input = 'hello';
    output = Tools.errorMessageProcessing(input);
    eput = 'hello';
    expect(output).toEqual(eput);

    input = ['hello', 'world'];
    output = Tools.errorMessageProcessing(input);
    eput = 'hello<br/>world';
    expect(output).toEqual(eput);

    input = {detail: 'hello'};
    output = Tools.errorMessageProcessing(input);
    eput = 'hello';
    expect(output).toEqual(eput);

    input = {detail: ['hello', 'world']};
    output = Tools.errorMessageProcessing(input);
    eput = 'hello<br/>world';
    expect(output).toEqual(eput);

    input = {detail: 2};
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);

    input = {detail: {}};
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);

    input = {detail: []};
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);

    input = 2;
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);

    input = {};
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);

    input = [];
    output = Tools.errorMessageProcessing(input);
    eput = '';
    expect(output).toEqual(eput);
});

test('getCheckedId', () => {
    let input = [
        {id: 1, checked: false},
        {id: 2, checked: true},
        {id: 3, checked: false},
        {id: 4, checked: true},
        {id: 5, checked: true}
    ];
    let output = Tools.getCheckedId(input);
    let eput = '2,4,5';
    expect(output).toEqual(eput);

    input = [];
    output = Tools.getCheckedId(input);
    eput = '';
    expect(output).toEqual(eput);

    input = [
        {id: 1, checked: false},
        {id: 2, checked: false},
        {id: 3, checked: false},
        {id: 4, checked: false},
        {id: 5, checked: false}
    ];
    output = Tools.getCheckedId(input);
    eput = '';
    expect(output).toEqual(eput);
});

test('matchPrefix', () => {
    let prefix = 'hello';
    let url = 'hellotthere';
    let output = Tools.matchPrefix(prefix, url);
    let eput = true;
    expect(output).toEqual(eput);

    output = Tools.matchPrefix();
    eput = false;
    expect(output).toEqual(eput);

    output = Tools.matchPrefix('', 'hello');
    eput = false;
    expect(output).toEqual(eput);

    output = Tools.matchPrefix('', '');
    eput = false;
    expect(output).toEqual(eput);

    output = Tools.matchPrefix('hello', 'ahello');
    eput = false;
    expect(output).toEqual(eput);
});

test('dateFormat', () => {
    let input = new Date('2008-9-13');

    let output = Tools.dateFormat(input);
    let eput = '13/09/2008';
    expect(output).toEqual(eput);

    output = Tools.dateFormat(input, 'dd/mm/yyyy');
    eput = '13/09/2008';
    expect(output).toEqual(eput);

    output = Tools.dateFormat(input, 'mm/dd/yyyy');
    eput = '09/13/2008';
    expect(output).toEqual(eput);

    output = Tools.dateFormat(input, 'yyyy/mm/dd');
    eput = '2008/09/13';
    expect(output).toEqual(eput);

    output = Tools.dateFormat(input, 'yy/mm/dd');
    eput = '08/09/13';
    expect(output).toEqual(eput);
});

test('getText', () => {
    let input = '<div>hello</div>';
    let output = Tools.getText(input);
    let eput = 'hello';
    expect(output).toEqual(eput);

    input = '<div>hello<span>world</span></div>';
    output = Tools.getText(input);
    eput = 'helloworld';
    expect(output).toEqual(eput);

    input = '<div>hello<br/><span>world</span></div>';
    output = Tools.getText(input);
    eput = 'helloworld';
    expect(output).toEqual(eput);
});

test('addAlt', () => {
    let alt = 'hello';

    let input = '<img src=""/>';
    let output = Tools.addAlt(input, alt);
    let eput = '<img alt="hello" title="hello" src=""/>';
    expect(output).toEqual(eput);

    input = `<div><p><img src=""/></p><p><img src=""/></p></div>`;
    output = Tools.addAlt(input, alt);
    eput = `<div><p><img alt="hello" title="hello" src=""/></p><p><img alt="hello" title="hello" src=""/></p></div>`;
    expect(output).toEqual(eput);
});

describe('commonErrorResponse', () => {
    test('Fail', () => {
        const input = {
            test: 'hello'
        };
        const output = Tools.commonErrorResponse(input);
        const eput = {
            ok: false,
            data: {
                detail: 'Undefined error'
            }
        };
        expect(output).toEqual(eput);
    });

    test('Success', () => {
        const input = {
            message: 'hello'
        };
        const output = Tools.commonErrorResponse(input);
        const eput = {
            ok: false,
            data: {
                detail: 'hello'
            }
        };
        expect(output).toEqual(eput);
    });
});

describe('parseDataError', () => {
    test('Fail', () => {
        const input = {
            ok: false,
            data: {
                content: 'hello'
            }
        };
        const output = Tools.parseDataError(input);
        const eput = {
            data: {},
            error: input.data
        };
        expect(output).toEqual(eput);
    });

    test('Success', () => {
        const input = {
            ok: true,
            data: {
                content: 'hello'
            }
        };
        const output = Tools.parseDataError(input);
        const eput = {
            data: input.data,
            error: {}
        };
        expect(output).toEqual(eput);
    });
});

describe('getItem', () => {
    test('Fail', async () => {
        const response = {
            status: 400,
            ok: false,
            data: {
                detail: 'error'
            }
        };
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.getItem('someUrl', 1);
        const eput = null;
        expect(output).toEqual(eput);
    });

    test('Success', async () => {
        const response = {
            status: 200,
            ok: true,
            data: {
                detail: 'success'
            }
        };
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.getItem('someUrl', 1);
        const eput = response.data;
        expect(output).toEqual(eput);
    });
});

describe('getList', () => {
    test('Fail', async () => {
        const response = {
            status: 400,
            ok: false,
            data: {
                detail: 'error'
            }
        };
        jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        let output;
        try {
            output = await Tools.getList('someUrl', 1);
        } catch (err) {
            output = err;
        }
        const eput = response.data;
        expect(output).toEqual(eput);
    });

    test('Success', async () => {
        const response = {
            status: 200,
            ok: true,
            data: {
                items: [],
                links: {},
                meta: {}
            }
        };
        jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.getList('someUrl', 1);
        const eput = {links: response.data.links, items: response.data.items};
        expect(output).toEqual(eput);
    });
});

describe('handleRemove', () => {
    test('Reject', async () => {
        jest.spyOn(window, 'confirm').mockImplementation(() => false);
        const ids = '1,2,3';
        const response = {
            status: 200,
            ok: true,
            data: {
                detail: 'hello'
            }
        };

        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.handleRemove('someUrl', ids);
        const eput = null;
        expect(output).toEqual(eput);
    });

    test('Fail', async () => {
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        const ids = '1,2,3';
        const response = {
            status: 400,
            ok: false,
            data: {
                detail: 'error'
            }
        };

        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.handleRemove('someUrl', ids);
        const eput = null;
        expect(output).toEqual(eput);
    });

    test('Success', async () => {
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        const ids = '1,2,3';
        const response = {
            status: 200,
            ok: true,
            data: {
                detail: 'hello'
            }
        };

        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => response);
        const output = await Tools.handleRemove('someUrl', ids);
        const eput = [1, 2, 3];
        expect(output).toEqual(eput);
    });
});

describe('checkOrUncheckAll', () => {
    test('Full', () => {
        const input = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];

        const eput = [
            {id: 1, checked: false},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];
        const output = Tools.checkOrUncheckAll(input);
        expect(output).toEqual(eput);
    });

    test('Empty', () => {
        const input = [
            {id: 1, checked: false},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];

        const eput = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];
        const output = Tools.checkOrUncheckAll(input);
        expect(output).toEqual(eput);
    });

    test('Half full', () => {
        const input = [
            {id: 1, checked: true},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false}
        ];

        const eput = [{id: 1, checked: true}, {id: 2, checked: true}, {id: 3, checked: true}, {id: 4, checked: true}];
        const output = Tools.checkOrUncheckAll(input);
        expect(output).toEqual(eput);
    });
});

test('updateListOnSuccessAdding', () => {
    const list = [{id: 1, value: 1, checked: true}, {id: 2, value: 2, checked: true}];
    const data = {id: 3, value: 3};
    const eput = [
        {id: 3, value: 3, checked: false},
        {id: 1, value: 1, checked: true},
        {id: 2, value: 2, checked: true}
    ];
    const output = Tools.updateListOnSuccessAdding(list, data);
    expect(output).toEqual(eput);
});

test('updateListOnSuccessEditing', () => {
    const list = [
        {id: 3, value: 3, checked: false},
        {id: 1, value: 1, checked: true},
        {id: 2, value: 2, checked: true}
    ];
    const data = {id: 1, value: 9};
    const eput = [
        {id: 3, value: 3, checked: false},
        {id: 1, value: 9, checked: true},
        {id: 2, value: 2, checked: true}
    ];
    const output = Tools.updateListOnSuccessEditing(list, data);
    expect(output).toEqual(eput);
});

test('toggleModal', () => {
    let state = {
        modalName: true
    };
    let output, eput;

    // Undefined state
    output = Tools.toggleModal();
    eput = null;
    expect(output).toEqual(eput);

    // Null state
    output = Tools.toggleModal(null);
    eput = null;
    expect(output).toEqual(eput);

    // Empty state
    output = Tools.toggleModal({});
    eput = null;
    expect(output).toEqual(eput);

    // Empty modal name
    output = Tools.toggleModal(state);
    eput = null;
    expect(output).toEqual(eput);

    // Not match modal name
    output = Tools.toggleModal(state, 'hello');
    eput = null;
    expect(output).toEqual(eput);

    // Success without form values
    output = Tools.toggleModal(state, 'modalName');
    eput = {
        modalName: false,
        formValues: {},
        formErrors: {}
    };
    expect(output).toEqual(eput);

    // Success with form values
    output = Tools.toggleModal(state, 'modalName', {test: 'aaa'});
    eput = {
        modalName: false,
        formValues: {
            test: 'aaa'
        },
        formErrors: {}
    };
    expect(output).toEqual(eput);
});

test('getFileName', () => {
    let input, output, eput;

    // Empty string
    input = '';
    output = Tools.getFileName(input);
    eput = '';
    expect(output).toEqual(eput);

    // No file name
    input = 'hello';
    output = Tools.getFileName(input);
    eput = 'hello';
    expect(output).toEqual(eput);

    // url without file name
    input = 'http://localhost/filename';
    output = Tools.getFileName(input);
    eput = 'filename';
    expect(output).toEqual(eput);

    // url with file name
    input = 'http://localhost/filename.test';
    output = Tools.getFileName(input);
    eput = 'filename.test';
    expect(output).toEqual(eput);

    // url with file name and port
    input = 'http://localhost:8000/filename.test';
    output = Tools.getFileName(input);
    eput = 'filename.test';
    expect(output).toEqual(eput);
});

test('isBase64', () => {
    let input, output, eput;

    // Empty string
    input = '';
    output = Tools.isBase64(input);
    eput = false;
    expect(output).toEqual(eput);

    // Is not a base64 string
    input = 'hello';
    output = Tools.isBase64(input);
    eput = false;
    expect(output).toEqual(eput);

    // Is a base64 string
    input = 'hello';
    input = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.isBase64(input);
    eput = true;
    expect(output).toEqual(eput);
});

test('ensureImage', () => {
    let input, output, eput;

    // Empty string
    input = '';
    output = Tools.ensureImage(input);
    eput = '';
    expect(output).toEqual(eput);

    // Is not a base64 string
    input = 'hello';
    output = Tools.ensureImage(input);
    eput = '';
    expect(output).toEqual(eput);

    // Is a base64 of jpg image
    input = 'data:image/jpg;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a base64 of jpeg image
    input = 'data:image/jpeg;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a base64 of png image
    input = 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a base64 of gif image
    input = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a base64 of webp image
    input = 'data:image/webp;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a base64 string of not supported image
    input = 'data:image/bmp;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a jpg url
    input = 'http://localhost/test.jpg';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a jpeg url
    input = 'http://localhost/test.jpeg';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a png url
    input = 'http://localhost/test.png';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a gif url
    input = 'http://localhost/test.gif';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a webp url
    input = 'http://localhost/test.webp';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is a image file name
    input = 'test.webp';
    output = Tools.ensureImage(input);
    eput = input;
    expect(output).toEqual(eput);

    // Is not a image file name
    input = 'test.bmp';
    output = Tools.ensureImage(input);
    eput = '';
    expect(output).toEqual(eput);
});

test('getActionName', () => {
    let input, output, eput;

    // Empty input
    output = Tools.getActionName();
    eput = 'Add new';
    expect(output).toEqual(eput);

    // 0 input
    input = 0;
    output = Tools.getActionName(input);
    eput = 'Add new';
    expect(output).toEqual(eput);

    // Non 0 input
    input = 1;
    output = Tools.getActionName(input);
    eput = 'Update';
    expect(output).toEqual(eput);
});

test('getFieldId', () => {
    let formName, fieldName, output, eput;

    // No formName
    formName = '';
    fieldName = 'world';
    output = Tools.getFieldId(formName, fieldName);
    eput = '';

    // No fieldName
    formName = 'hello';
    fieldName = '';
    output = Tools.getFieldId(formName, fieldName);
    eput = '';

    // No formName and fieldName
    formName = '';
    fieldName = '';
    output = Tools.getFieldId(formName, fieldName);
    eput = '';

    // Normal case
    formName = 'hello';
    fieldName = 'world';
    output = Tools.getFieldId(formName, fieldName);
    eput = 'hello-world';
});

test('getListItemToResponseData', () => {
    let input, output, eput;

    // No input
    output = Tools.getListItemToResponseData();
    eput = {
        links: {
            next: null,
            previous: null
        },
        items: []
    };
    expect(output).toEqual(eput);

    // Blank input
    input = [];
    output = Tools.getListItemToResponseData(input);
    eput = {
        links: {
            next: null,
            previous: null
        },
        items: []
    };
    expect(output).toEqual(eput);

    // Normal input
    input = [{id: 1}];
    output = Tools.getListItemToResponseData(input);
    eput = {
        links: {
            next: null,
            previous: null
        },
        items: input
    };
    expect(output).toEqual(eput);
});

describe('parseErrorResponse', () => {
    test('empty errors', () => {
        const input = {};
        const eput = {};
        const output = Tools.parseErrorResponse(input);
        expect(output).toEqual(eput);
    });

    test('only common error', () => {
        const input = {
            common: ['common error 1', 'common error 2']
        };
        const eput = {
            common: ['common error 1', 'common error 2']
        };
        const output = Tools.parseErrorResponse(input);
        expect(output).toEqual(eput);
    });

    test('only detail', () => {
        const input = {
            credential: {
                email: ['has already been taken', 'bad email']
            },
            agree: ['missing agree']
        };
        const eput = {
            email: ['has already been taken', 'bad email'],
            agree: ['missing agree']
        };
        const output = Tools.parseErrorResponse(input);
        expect(output).toEqual(eput);
    });

    test('mix', () => {
        const input = {
            common: ['common error 1', 'common error 2'],
            credential: {
                email: ['has already been taken', 'bad email']
            },
            agree: 'missing agree',
            blank_value: '',
            null_value: null
        };
        const eput = {
            common: ['common error 1', 'common error 2'],
            email: ['has already been taken', 'bad email'],
            agree: ['missing agree']
        };
        const output = Tools.parseErrorResponse(input);
        expect(output).toEqual(eput);
    });
});

describe('toggleState', () => {
    describe('null open', () => {
        test('no key', () => {
            const eput = {modal: true};
            const open = null;
            const key = undefined;
            const state = {modal: false};
            const output = Tools.toggleState(open, key)(state);
            expect(output).toEqual(eput);
        });

        test('with key', () => {
            const eput = {hello: false};
            const open = null;
            const key = 'hello';
            const state = {hello: true};
            const output = Tools.toggleState(open, key)(state);
            expect(output).toEqual(eput);
        });
    });

    describe('not null open', () => {
        test('no key', () => {
            const eput = {modal: true};
            const open = true;
            const key = undefined;
            const state = {modal: true};
            const output = Tools.toggleState(open, key)(state);
            expect(output).toEqual(eput);
        });

        test('with key', () => {
            const eput = {hello: false};
            const open = false;
            const key = 'hello';
            const state = {hello: true};
            const output = Tools.toggleState(open, key)(state);
            expect(output).toEqual(eput);
        });
    });
});

describe('errorFormat', () => {
    test('string', () => {
        const eput = ['error'];
        const input = 'error';
        const output = Tools.errorFormat(input);
        expect(output).toEqual(eput);
    });

    test('array', () => {
        const eput = ['error'];
        const input = ['error'];
        const output = Tools.errorFormat(input);
        expect(output).toEqual(eput);
    });

    test('other', () => {
        const eput = [];
        const input = {error: 'error'};
        const output = Tools.errorFormat(input);
        expect(output).toEqual(eput);
    });
});

describe('setFormErrors', () => {
    test('text error', () => {
        const eput = {
            uid: ['no number'],
            email: ['invalid email'],
            username: ['too short']
        };
        const errors = {
            uid: 'no number',
            email: 'invalid email',
            username: 'too short',
            password: {},
            other: ''
        };
        const output = Tools.setFormErrors(errors);
        expect(output).toEqual(eput);
    });

    test('array error', () => {
        const eput = {
            uid: ['no number'],
            email: ['invalid email'],
            username: ['too short'],
            other1: ['hello']
        };
        const errors = {
            uid: ['no number'],
            email: ['invalid email'],
            username: ['too short'],
            other: [''],
            other1: ['', 'hello']
        };
        const output = Tools.setFormErrors(errors);
        expect(output).toEqual(eput);
    });
});
