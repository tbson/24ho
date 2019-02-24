import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import 'src/__mocks__/FormData';
import {ArticleEdit} from '../ArticleEdit';
import {seeding, defaultFormValues} from '../_data';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import Tools from 'src/utils/helpers/Tools';

Enzyme.configure({adapter: new Adapter()});

const parentId = 3;

const propsCategory = {
    parent: {
        id: parentId,
        type: 'category'
    },
    history: {},
    id: 0
};

const propsArticle = {
    parent: {
        id: parentId,
        type: 'article'
    },
    history: {},
    id: 0
};

const tagSource = [{value: 1, label: 'one'}, {value: 2, label: 'two'}];

describe('ArticleEdit component', () => {
    beforeAll(() => {
        const response = {
            status: 200,
            success: true,
            data: {}
        };
        Tools.apiCall = async (url, method, params = {}) => response;
        Tools.uuid4 = () => '999cee7b-dcb3-4118-a014-a00034850b08';
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('componentDidMount will fire setInitData', () => {
        const setInitData = jest.spyOn(ArticleEdit.prototype, 'setInitData');

        const wrapper = shallow(<ArticleEdit {...propsCategory} />);
        const instance = wrapper.instance();

        const prepareFormValues = jest
            .spyOn(instance, 'prepareFormValues')
            .mockImplementation(() => ({dataLoaded: true}));
        const getTagSource = jest.spyOn(instance, 'getTagSource').mockImplementation(() => tagSource);
        const getCategoryId = jest.spyOn(instance, 'getCategoryId').mockImplementation(async () => 1);

        expect(wrapper.contains(<LoadingLabel />)).toEqual(true);
        expect(setInitData).toHaveBeenCalled();
    });
});

describe('ArticleEdit methods', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.spyOn(ArticleEdit.prototype, 'componentDidMount').mockImplementation(() => {});
    });

    describe('setInitData', () => {
        it('category parent', async () => {
            const setInitData = jest.spyOn(ArticleEdit.prototype, 'setInitData');
            const wrapper = shallow(<ArticleEdit {...propsCategory} />);
            const instance = wrapper.instance();

            const prepareFormValues = jest
                .spyOn(instance, 'prepareFormValues')
                .mockImplementation(() => ({dataLoaded: true}));
            const getTagSource = jest.spyOn(instance, 'getTagSource').mockImplementation(() => tagSource);
            const getCategoryId = jest.spyOn(instance, 'getCategoryId').mockImplementation(async () => 1);

            await instance.setInitData();

            expect(prepareFormValues).toHaveBeenCalled();
            expect(getTagSource).toHaveBeenCalled();
            expect(getCategoryId).not.toHaveBeenCalled();
        });

        it('article parent', async () => {
            const setInitData = jest.spyOn(ArticleEdit.prototype, 'setInitData');
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();

            const prepareFormValues = jest
                .spyOn(instance, 'prepareFormValues')
                .mockImplementation(() => ({dataLoaded: true}));
            const getTagSource = jest.spyOn(instance, 'getTagSource').mockImplementation(() => tagSource);
            const getCategoryId = jest.spyOn(instance, 'getCategoryId').mockImplementation(async () => 1);

            await instance.setInitData();

            expect(prepareFormValues).toHaveBeenCalled();
            expect(getTagSource).toHaveBeenCalled();
            expect(getCategoryId).toHaveBeenCalled();
        });
    });

    describe('getCategoryId', () => {
        it('fail', async () => {
            Tools.getItem = async () => null;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getCategoryId(1);
            expect(result).toEqual(null);
        });

        it('success', async () => {
            Tools.getItem = async () => ({category: {id: 2}});
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getCategoryId(1);
            expect(result).toEqual(2);
        });
    });

    describe('getItem', () => {
        it('null ID', async () => {
            Tools.getItem = async () => null;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getItem(null);
            expect(result).toEqual(null);
        });

        it('fail', async () => {
            Tools.getItem = async () => null;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getItem(1);
            expect(result).toEqual(null);
        });

        it('success', async () => {
            const response = {category: {id: 2}};
            Tools.getItem = async () => response;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getItem(1);
            expect(result).toEqual(response);
        });
    });

    describe('prepareFormValues', () => {
        it('for adding', async () => {
            const response = {
                id: 1,
                title: 'title',
                uuid: 'uuid'
            };
            const formValues = {
                id: 0,
                title: '',
                uuid: '999cee7b-dcb3-4118-a014-a00034850b08'
            };
            Tools.getItem = async () => response;

            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();

            const result = await instance.prepareFormValues(0, formValues);
            expect(result).toEqual({
                formValues,
                uuid: formValues.uuid,
                dataLoaded: true
            });
        });

        it('for editing', async () => {
            const response = {
                id: 1,
                title: 'title',
                uuid: 'uuid'
            };
            const formValues = {
                id: 0,
                title: '',
                uuid: '999cee7b-dcb3-4118-a014-a00034850b08'
            };
            Tools.getItem = async () => response;

            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();

            const result = await instance.prepareFormValues(1);
            expect(result).toEqual({
                formValues: response,
                uuid: response.uuid,
                dataLoaded: true
            });
        });
    });

    describe('getTagSource', () => {
        it('fail', async () => {
            Tools.getList = async () => null;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getTagSource();
            expect(result).toEqual([]);
        });

        it('success', async () => {
            const response = {
                links: {},
                items: [
                    {
                        id: 1,
                        title: 'title 1'
                    },
                    {
                        id: 2,
                        title: 'title 2'
                    }
                ]
            };
            const dropdownOutput = [
                {
                    value: 1,
                    label: 'title 1'
                },
                {
                    value: 2,
                    label: 'title 2'
                }
            ];
            Tools.getList = async () => response;
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const result = await instance.getTagSource();
            expect(result).toEqual(dropdownOutput);
        });
    });

    describe('onSubmitSuccess', () => {
        it('category type', () => {
            const wrapper = shallow(<ArticleEdit {...propsCategory} />);
            const instance = wrapper.instance();
            const navigateTo = jest.spyOn(instance, 'navigateTo').mockImplementation(() => {});

            instance.onSubmitSuccess();

            expect(navigateTo.mock.calls[0][0]).toEqual('/articles');
            expect(navigateTo.mock.calls[0][1]).toEqual([parentId]);
        });

        it('article type', () => {
            const wrapper = shallow(<ArticleEdit {...propsArticle} />);
            const instance = wrapper.instance();
            const navigateTo = jest.spyOn(instance, 'navigateTo').mockImplementation(() => {});
            
            instance.onSubmitSuccess();

            expect(navigateTo.mock.calls[0][0]).toEqual('/article/category')
            expect(navigateTo.mock.calls[0][1]).toEqual([null, parentId]);
        });
    });
});
