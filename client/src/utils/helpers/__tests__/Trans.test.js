import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Trans from '../Trans';

Enzyme.configure({adapter: new Adapter()});

test('translation', () => {
    const translations = {
        defaultLang: 'vi',
        translated: [
            {
                vi: 'đi ngủ',
                en: 'sleep',
                fr: 'nooooooo'
            },
            {
                vi: 'xin chào',
                en: 'hello',
                fr: 'halo'
            },
            {
                vi: 'làm việc {{}} abc{{}}',
                en: 'working {{}} abc{{}}',
                fr: 'what? {{}} abc{{}}'
            }
        ]
    };
    Trans.initTranslations(translations);
    let __ = Trans.trans;
    // Default lang
    expect(__('đi ngủ')).toEqual('đi ngủ');
    expect(__('xin chào')).toEqual('xin chào');
    expect(__('làm việc {{}} abc{{}}', 1)).toEqual('làm việc 1 abc');

    // En
    Trans.setLang('en');
    __ = Trans.trans;
    expect(__('đi ngủ')).toEqual('sleep');
    expect(__('xin chào')).toEqual('hello');
    expect(__('làm việc {{}} abc{{}}', 1)).toEqual('working 1 abc');

    // Not found
    expect(__('hello')).toEqual('hello');
    expect(__('hello{{}}')).toEqual('hello{{}}');
});
