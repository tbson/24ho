/* @flow */
import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';
import type {FormValues as AttachType} from 'src/back/attach/_data';

const rawApiUrls = [
    {
        controller: 'article',
        endpoints: {
            crud: '',
            landing: 'landing'
        }
    },
    {
        controller: 'category',
        endpoints: {
            crud: ''
        }
    },
    {
        controller: 'tag',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export function seeding(numberOfItems: number, single: boolean = false): any {
    let result = [];
    for (let i = 1; i <= numberOfItems; i++) {
        result.push({
            id: i,
            category_title: `category_title ${i}`,
            uuid: `uuid${i}`,
            lug: `title${i}`,
            title: `title ${i}`,
            description: `description ${i}`,
            content: `content ${i}`,
            image: null,
            use_slide: true,
            pin: false,
            thumbnail_in_content: true,
            order: i,
            tags: '',
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export type FormValues = {
    id: number,
    category_title?: ?string,
    uuid: ?string,
    slug: ?string,
    title: string,
    description: string,
    content: string,
    image: ?Blob,
    use_slide: boolean,
    pin: boolean,
    thumbnail_in_content: boolean,
    order: ?number,
    tags?: ?string,
    created_at?: ?Date,
    attaches?: Array<AttachType>,
    same_tag_articles?: Array<Object>,
    related_articles?: Array<Object>
};

export const defaultFormValues: FormValues = {
    id: 0,
    uuid: '',
    slug: '',
    title: '',
    description: '',
    content: '',
    image: null,
    use_slide: false,
    pin: false,
    thumbnail_in_content: false,
    order: 0
};

export type FormValuesWithCheck = FormValues & {
    checked: boolean
};

export type ParentType = {
    type: string,
    id: number
};

export type ParamsType = {
    parentType: string,
    parentId: number,
    id: number
};
