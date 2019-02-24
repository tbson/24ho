import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import {Pagination, SearchInput, LangButtons} from '../TableUtils';
import Tools from 'src/utils/helpers/Tools';
import Trans from 'src/utils/helpers/Trans';

Enzyme.configure({adapter: new Adapter()});

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

const langs = Trans.getLangs();

describe('Pagination component', () => {
    it('No page', () => {
        const props = {
            next: null,
            prev: null,
            onNavigate: jest.fn(),
        };
        const wrapper = shallow(<Pagination {...props} />);
        expect(wrapper.find('button')).toHaveLength(0);
    });

    it('Can next only', () => {
        const props = {
            next: 'http://localhost/?page=2',
            prev: null,
            onNavigate: jest.fn(),
        };
        const wrapper = shallow(<Pagination {...props} />);
        expect(wrapper.find('button')).toHaveLength(1);
        const elem = wrapper.find('button').first();
        expect(elem.text()).toMatch(/Next/);
        elem.simulate('click');
        expect(props.onNavigate.mock.calls.length).toEqual(1);
        expect(props.onNavigate.mock.calls[0][0]).toEqual('http://localhost/?page=2');
    });

    it('Can prev only', () => {
        const props = {
            next: null,
            prev: 'http://localhost/?page=1',
            onNavigate: jest.fn(),
        };
        const wrapper = shallow(<Pagination {...props} />);
        expect(wrapper.find('button')).toHaveLength(1);
        const elem = wrapper.find('button').first();
        expect(elem.text()).toMatch(/Prev/);
        elem.simulate('click');
        expect(props.onNavigate.mock.calls.length).toEqual(1);
        expect(props.onNavigate.mock.calls[0][0]).toEqual('http://localhost/?page=1');
    });

    it('Can navigate both side', () => {
        const props = {
            next: 'http://localhost/?page=3',
            prev: 'http://localhost/?page=1',
            onNavigate: jest.fn(),
        };
        const wrapper = shallow(<Pagination {...props} />);
        expect(wrapper.find('button')).toHaveLength(2);
    });
});

describe('SearchInput component', () => {
    it('On show', () => {
        let props = {
            onSearch: jest.fn(),
        };
        let wrapper = shallow(<SearchInput {...props} />);
        wrapper.find('form').simulate('submit');
        expect(props.onSearch.mock.calls.length).toEqual(1);
    });

    it('On hide', () => {
        let props = {
            show: false,
            onSearch: jest.fn(),
        };
        let wrapper = shallow(<SearchInput {...props} />);
        expect(wrapper.find('form').exists()).toEqual(false);
    });
});

describe('LangButtons component', () => {
    const props = {
        id: 1,
        getTranslationToEdit: jest.fn()
    }

    it('No langs', () => {
        props.langs = [];
        const wrapper = shallow(<LangButtons {...props} />);
        expect(wrapper.text()).toEqual('');
    });

    it('Have langs', () => {
        props.langs = langs;
        const wrapper = shallow(<LangButtons {...props} />);

        // Check UI
        expect(wrapper.find('.pointer').first().text()).toEqual('EN');
        expect(wrapper.find('.pointer').last().text()).toEqual('FR');

        // Check click event
        wrapper
            .find('.pointer')
            .first()
            .simulate('click');
        expect(props.getTranslationToEdit).toHaveBeenCalled();
        expect(props.getTranslationToEdit.mock.calls[0][0]).toEqual(props.id);
        expect(props.getTranslationToEdit.mock.calls[0][1]).toEqual('en');
    });
});
