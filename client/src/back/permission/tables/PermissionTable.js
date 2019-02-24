// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls, defaultFormValues} from '../_data';
import type {FormValues, FormValuesWithCheck, RowValues} from '../_data';
import type {GetListResponseData} from 'src/utils/helpers/Tools';
import PermissionForm from '../forms/PermissionForm';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import DefaultModal from 'src/utils/components/DefaultModal';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    list?: Array<FormValuesWithCheck>
};
type States = {
    errorMessage: string,
    dataLoaded: boolean,
    modal: boolean,
    list: Array<FormValuesWithCheck>,
    formValues: FormValues,
    formErrors: Object
};

export class PermissionTable extends React.Component<Props, States> {
    nextUrl: ?string;
    prevUrl: ?string;

    state = {
        errorMessage: '',
        dataLoaded: false,
        modal: false,
        list: [],
        formValues: defaultFormValues,
        formErrors: {}
    };

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.getList();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: States) {
        const {list} = nextProps;
        const dataLoaded = true;
        if (prevState.dataLoaded) return null;
        if (list) return {list, dataLoaded};
        return null;
    }

    setInitData = (initData: GetListResponseData) => {
        this.nextUrl = initData.links.next;
        this.prevUrl = initData.links.previous;
        this.setState({
            dataLoaded: true,
            list: [...initData.items]
        });
    };

    toggleModal = (modalName: string, formValues: Object = {}) => {
        this.setState(Tools.toggleModal(this.state, modalName, formValues));
    };

    getList = async (url: string = '', params: Object = {}) => {
        try {
            const result = await Tools.getList(url ? url : apiUrls.crud, params);
            if (result) {
                this.setInitData(result);
            }
        } catch (error) {
            this.setState({errorMessage: error.detail});
        }
    };

    searchList = async (event: Object) => {
        event.preventDefault();
        const {search} = Tools.formDataToObj(new FormData(event.target));
        if (search.length > 2) {
            await this.getList('', {search});
        } else if (!search.length) {
            await this.getList();
        }
    };

    handleSubmit = async (event: Object) => {
        event.preventDefault();

        const params = Tools.formDataToObj(new FormData(event.target));
        const isEdit = params.id ? true : false;
        let url = apiUrls.crud;
        if (isEdit) url += String(params.id);
        const {data, error} = await Tools.handleSubmit(url, params);
        const isSuccess = Tools.isEmpty(error);
        if (isSuccess) {
            this.onSubmitSuccess(isEdit, data);
        } else {
            this.onSubmitFail(error);
        }
    };

    onSubmitSuccess = (isEdit: boolean, data: FormValues) => {
        let {list} = this.state;
        const args = [list, data];
        if (isEdit) {
            list = Tools.updateListOnSuccessEditing(...args);
        } else {
            list = Tools.updateListOnSuccessAdding(...args);
        }
        this.setState({list});
        this.toggleModal('modal');
    };

    onSubmitFail = (formErrors: Object) => {
        this.setState({formErrors});
    };

    render() {
        if (!this.state.dataLoaded) return <LoadingLabel errorMessage={this.state.errorMessage}/>;
        const {list} = this.state;
        const formValues = this.state.formValues ? this.state.formValues : defaultFormValues;
        const formErrors = this.state.formErrors ? this.state.formErrors : {};
        const modalTitle = formValues.id ? 'Update permission' : 'Add new permission';

        return (
            <div>
                <SearchInput onSearch={this.searchList} />
                <table className="table table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">Content type</th>
                            <th scope="col">Code name</th>
                            <th scope="col">Name</th>
                            <th scope="col" style={{padding: 8}} className="row80" />
                        </tr>
                    </thead>

                    <tbody>
                        {list.map((data, key) => (
                            <Row
                                className="table-row"
                                data={data}
                                key={key}
                                toggleModal={this.toggleModal}
                                handleRemove={() => {}}
                            />
                        ))}
                    </tbody>
                </table>
                <DefaultModal open={this.state.modal} title={modalTitle} handleClose={() => this.toggleModal('modal')}>
                    <PermissionForm formValues={formValues} formErrors={formErrors} handleSubmit={this.handleSubmit}>
                        <button type="button" onClick={() => this.toggleModal('modal')} className="btn btn-light">
                            <span className="fas fa-times" />&nbsp; Cancel
                        </button>
                    </PermissionForm>
                </DefaultModal>
            </div>
        );
    }
}
export default withRouter(PermissionTable);

type RowPropTypes = {
    data: RowValues,
    toggleModal: Function,
    handleRemove: Function
};

export class Row extends React.Component<RowPropTypes> {
    getItemToEdit = async (id: number) => {
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            this.props.toggleModal('modal', result);
        }
    };

    render() {
        const data = this.props.data;
        return (
            <tr>
                <td className="content_type">{data.content_type}</td>
                <td className="codename">{data.codename}</td>
                <td className="name">{data.name}</td>
                <td className="right">
                    <a className="editBtn" onClick={() => this.getItemToEdit(parseInt(data.id))}>
                        <span className="editBtn fas fa-edit text-info pointer" />
                    </a>
                </td>
            </tr>
        );
    }
}
