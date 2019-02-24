import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import 'src/__mocks__/FormData';
import {ArticleTable} from '../tables/ArticleTable';
import {seeding, defaultFormValues} from '../_data';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import Tools from 'src/utils/helpers/Tools';
import Trans from 'src/utils/helpers/Trans';

Enzyme.configure({adapter: new Adapter()});

const parent = {
    id: 1,
    type: 'category'
}

const searchForm = true;

const translations = {
    defaultLang: 'vi',
    translated: [
        {
            vi: 'Xin chào',
            en: 'Hello',
            fr: 'Bonjour'
        }
    ]
};

Trans.initTranslations(translations);

describe('ArticleTable component', () => {
    beforeAll(() => {
        const response = {
            status: 200,
            success: true,
            data: {
                count: 1,
                pages: 1,
                page_size: 10,
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            }
        };
        Tools.apiCall = async (url, method, params = {}) => response;
    });

    it('Init data', done => {
        const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
        const instance = wrapper.instance();
        const setInitData = jest.spyOn(instance, 'setInitData');

        // Data not loaded -> show waiting
        expect(wrapper.contains(<LoadingLabel />)).toEqual(true);

        setTimeout(() => {
            // After loading data done
            wrapper.update();
            expect(wrapper.find('.table-row')).toHaveLength(10);

            expect(setInitData).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('Check all', () => {
        // Spy/mock static methods
        jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});

        const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={seeding(10)} />);
        const instance = wrapper.instance();
        const handleToggleCheckAll = jest.spyOn(instance, 'handleToggleCheckAll');

        wrapper
            .find('.check-all-button')
            .first()
            .simulate('click');

        expect(handleToggleCheckAll).toHaveBeenCalled();
    });

    it('Add', () => {
        // Spy/mock static methods
        jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});

        const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={seeding(10)} />);

        expect(wrapper.find('.add-button').prop('to')).toEqual(`/article/${parent.type}/${parent.id}/`);
    });

    describe('Bulk remove', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it('No check', () => {
            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});

            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={seeding(10)} />);
            const instance = wrapper.instance();
            const handleRemove = jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(handleRemove).toHaveBeenCalled();
            expect(handleRemove.mock.calls[0][0]).toEqual('');
        });

        it('Check all', () => {
            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});

            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={seeding(10)} />);
            const instance = wrapper.instance();
            const handleRemove = jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.check-all-button')
                .first()
                .simulate('click');

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(handleRemove).toHaveBeenCalled();
            expect(handleRemove.mock.calls[0][0]).toEqual('1,2,3,4,5,6,7,8,9,10');
        });
    });
});

describe('ArticleTable methods', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('getList', () => {
        it('fail', async () => {
            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => null);

            // Init component
            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after ArticleTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/article/');
            expect(getList.mock.calls[0][1]).toEqual({category: parent.id});
            expect(setInitData).not.toHaveBeenCalled();
        });

        it('success', async () => {
            const response = {
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            };

            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => response);

            // Init component
            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after ArticleTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/article/');
            expect(getList.mock.calls[0][1]).toEqual({category: parent.id});
            expect(setInitData.mock.calls[0][0]).toEqual(response);
            expect(setInitData).toHaveBeenCalled();
        });
    });

    describe('getSearchList', () => {
        const event = {
            preventDefault: () => {},
            target: {}
        };
        it('Empty string', async () => {
            const data = {search: ''};

            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).toHaveBeenCalled();
            expect(getList.mock.calls[0][0]).toBe(undefined);
        });
        it('2 character', async () => {
            const data = {search: 'ab'};

            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).not.toHaveBeenCalled();
        });
        it('3 characters', async () => {
            const data = {search: 'abc'};

            // Spy/mock static methods
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).toHaveBeenCalled();
            expect(getList.mock.calls[0][0]).toEqual('');
            expect(getList.mock.calls[0][1]).toEqual(data);
        });
    });

    describe('handleRemove', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(5);
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={list} />);
            instance = wrapper.instance();
        });

        it('Fail', async () => {
            jest.spyOn(Tools, 'handleRemove').mockImplementation(() => null);
            const ids = '2,3';
            const list = seeding(5);
            instance.handleRemove(ids);
            expect(wrapper.state('list')).toEqual(list);
        });

        it('Success', async () => {
            const ids = '2,3';
            jest.spyOn(Tools, 'handleRemove').mockImplementation(() => [2, 3]);
            const list = [seeding(1, true), seeding(4, true), seeding(5, true)];
            await instance.handleRemove(ids);
            expect(wrapper.state('list')).toEqual(list);
        });
    });

    describe('handleCheck', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(1);
            jest.spyOn(ArticleTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<ArticleTable parent={parent} searchForm={searchForm} list={list} />);
            instance = wrapper.instance();
        });

        it('False to True and vice versa', () => {
            const list = seeding(1);

            let event = {
                target: {id: 1, checked: true}
            };
            instance.handleCheck(event);
            expect(wrapper.state('list')).toEqual([{...list[0], checked: true}]);

            event = {
                target: {id: 1, checked: false}
            };
            instance.handleCheck(event);
            expect(wrapper.state('list')).toEqual([{...list[0], checked: false}]);
        });
    });
});
