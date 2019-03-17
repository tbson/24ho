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
export class Pagination extends React.Component<PaginationPropTypes> {
    renderPrev(prev: ?string) {
        if (!prev) return null;
        return (
            <button className="btn btn-primary btn-sm" onClick={() => this.props.onNavigate(prev)}>
                <span className="fas fa-chevron-left pointer" />
                &nbsp; Prev
            </button>
        );
    }

    renderNext(next: ?string) {
        if (!next) return null;
        return [
            <span key="1">&nbsp;&nbsp;&nbsp;</span>,
            <button className="btn btn-primary btn-sm" key="2" onClick={() => this.props.onNavigate(next)}>
                Next &nbsp;
                <span className="fas fa-chevron-right pointer" />
            </button>
        ];
    }

    render() {
        return (
            <div>
                {this.renderPrev(this.props.prev)}
                {this.renderNext(this.props.next)}
            </div>
        );
    }
}

type LangButtonsProps = {
    id: number,
    langs: Array<string>,
    getTranslationToEdit: Function
};
export class LangButtons extends React.Component<LangButtonsProps> {
    render() {
        const {id, langs, getTranslationToEdit} = this.props;
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
    }
}

type FrontPaginationPropTypes = {
    next: ?string,
    prev: ?string,
    onNavigate: Function
};
export class FrontPagination extends React.Component<FrontPaginationPropTypes> {
    renderPrev(prev: ?string) {
        if (!prev) return null;
        return (
            <a className="pointer" onClick={() => this.props.onNavigate(prev)}>
                <span className="fas fa-chevron-up pointer" />
            </a>
        );
    }

    renderNext(next: ?string) {
        if (!next) return null;
        return (
            <a className="pointer" onClick={() => this.props.onNavigate(next)}>
                <span className="fas fa-chevron-down" />
            </a>
        );
    }

    render() {
        if (!this.props.prev && !this.props.next) return null;
        return (
            <div className="container-fluid">
                <div className="row" style={styles.footer}>
                    <div className="col-xl-12">
                        {this.renderPrev(this.props.prev)}
                        {this.renderNext(this.props.next)}
                    </div>
                </div>
            </div>
        );
    }
}

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

const styles = {
    footer: {
        backgroundColor: 'rgb(38, 38, 38)',
        padding: '5px 0',
        color: 'white',
        textAlign: 'center'
    }
};
