// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';

export class Service {
    static onSearch(callback: Function) {
        return (e: Object) => {
            e.preventDefault();
            const {keyword} = Tools.formDataToObj(new FormData(e.target));
            if (!keyword || keyword.length > 2) callback(keyword);
        };
    }
}

type SearchInputPropTypes = {
    show?: boolean,
    onSearch: Function
};

export const SearchInput = ({show = true, onSearch}: SearchInputPropTypes) => {
    if (!show) return null;
    const onSubmit = Service.onSearch(onSearch);
    return (
        <form onSubmit={onSubmit}>
            <div className="input-group mb-3">
                <input type="text" name="keyword" className="form-control" placeholder="Search..." />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" style={{borderColor: '#C3CAD1'}}>
                        <span className="fas fa-search" />
                    </button>
                </div>
            </div>
        </form>
    );
};

type PaginationPropTypes = {
    next: ?string,
    prev: ?string,
    onNavigate: Function
};
export const Pagination = ({next, prev, onNavigate}: PaginationPropTypes) => {
    const renderPrev = (prev: ?string) => {
        if (!prev) return null;
        return (
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate(prev)}>
                <span className="fas fa-chevron-left pointer" />
                &nbsp; Trang trước
            </button>
        );
    };

    const renderNext = (next: ?string) => {
        if (!next) return null;
        return [
            <span key="1">&nbsp;&nbsp;&nbsp;</span>,
            <button className="btn btn-primary btn-sm" key="2" onClick={() => onNavigate(next)}>
                Trang tiếp &nbsp;
                <span className="fas fa-chevron-right pointer" />
            </button>
        ];
    };

    return (
        <div>
            {renderPrev(prev)}
            {renderNext(next)}
        </div>
    );
};

type LangButtonsProps = {
    id: number,
    langs: Array<string>,
    getTranslationToEdit: Function
};
export const LangButtons = ({id, langs, getTranslationToEdit}: LangButtonsProps) => {
    if (!langs.length) return null;
    return (
        <span>
            {langs.map(lang => (
                <span key={lang}>
                    &nbsp;&nbsp;&nbsp;
                    <a className="pointer" onClick={() => getTranslationToEdit(id, lang)}>
                        {lang.toUpperCase()}
                    </a>
                </span>
            ))}
        </span>
    );
};

type FrontPaginationPropTypes = {
    next: ?string,
    prev: ?string,
    onNavigate: Function
};
export const FrontPagination = ({next, prev, onNavigate}: FrontPaginationPropTypes) => {
    const renderPrev = (prev: ?string) => {
        if (!prev) return null;
        return (
            <a className="pointer" onClick={() => onNavigate(prev)}>
                <span className="fas fa-chevron-up pointer" />
            </a>
        );
    };

    const renderNext = (next: ?string) => {
        if (!next) return null;
        return (
            <a className="pointer" onClick={() => onNavigate(next)}>
                <span className="fas fa-chevron-down" />
            </a>
        );
    };

    if (!prev && !next) return null;
    return (
        <div className="container-fluid">
            <div className="row" style={styles.footer}>
                <div className="col-xl-12">
                    {renderPrev(prev)}
                    {renderNext(next)}
                </div>
            </div>
        </div>
    );
};

type CancelButtonType = {
    onClick: Function,
    label?: string
};
export const CancelButton = ({onClick, label = 'Cancel'}: CancelButtonType) => {
    return (
        <button type="button" className="btn btn-light" onClick={onClick}>
            <span className="fas fa-times" />
            &nbsp; {label}
        </button>
    );
};

type SubmitButtonType = {
    label?: string
};
export const SubmitButton = ({label = 'Submit'}: SubmitButtonType) => {
    return (
        <button className="btn btn-success">
            <span className="fas fa-check" />
            &nbsp; {label}
        </button>
    );
};

type BoolOutputType = {
    value: boolean
};
export const BoolOutput = ({value}: BoolOutputType) =>
    value ? <span className="green fas fa-check"/> : <span className="red fas fa-times"/>;

const styles = {
    footer: {
        backgroundColor: 'rgb(38, 38, 38)',
        padding: '5px 0',
        color: 'white',
        textAlign: 'center'
    }
};
