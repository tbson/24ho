// @flow
import Tools from 'src/utils/helpers/Tools';

let translations = {};
let langs = {};
let defaultLang = 'vi';
let usingLang = 'vi';
let langDict = {};
const delimiter = '{}';

export default class Trans {
    static initTranslations(translationSource: Object) {
        translations = translationSource;
        defaultLang = translations.defaultLang;
        this.setLang(Tools.getStorageStr('lang') || defaultLang);
    }

    static getDefaultLang() {
        return defaultLang;
    }

    static getUsingLang() {
        return Tools.getStorageStr('lang') || usingLang;
    }

    static getLangs(): Array<string> {
        const {translated} = translations;
        if (!translated.length) return [];
        return Object.keys(translated[0]).filter(lang => lang != this.getUsingLang());
    }

    static setLang(lang: string) {
        if (!lang) {
            usingLang = defaultLang;
        } else {
            usingLang = lang;
        }
        const {translated} = translations;
        if (lang != defaultLang) {
            for (let translation of translated) {
                langDict[translation[defaultLang]] = translation[lang];
            }
        }
    }

    // $FlowFixMe: do not complain about missing arguments annotation
    static _(key: string, ...values): string {
        let trans = Trans.getUsingLang() == defaultLang ? key : langDict[key];
        if (!trans) return key;
        for (let value of values) {
            trans = trans.replace(delimiter, value);
        }
        const re = new RegExp(delimiter, 'g');
        trans = trans.replace(re, '');
        return trans;
    }
}
