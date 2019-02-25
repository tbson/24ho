// @flow
import * as React from 'react';
import {apiUrls, defaultFormValues} from '../_data';
import type {FormValues, FormValuesWithCheck} from '../_data';
import type {FormValues as GroupType} from '../../group/_data';
import type {GetListResponseData} from 'src/utils/helpers/Tools';
import AdministratorForm from '../forms/AdministratorForm';
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
    groupList: Array<GroupType>,
    formValues: FormValues
};

export default class AdministratorTable extends React.Component<Props, States> {
    nextUrl: ?string;
    prevUrl: ?string;

    state = {
        errorMessage: '',
        dataLoaded: false,
        modal: false,
        list: [],
        groupList: [],
        formValues: defaultFormValues
    };

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.getList();
        this.getGroupList();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: States) {
        const {list} = nextProps;
        const dataLoaded = true;
        if (prevState.dataLoaded) return null;
        if (list) return {list, dataLoaded};
        return null;
    }

    setInitData = (initData: Object) => {
        this.nextUrl = initData.links.next;
        this.prevUrl = initData.links.previous;
        const list = initData.items.map(item => {
            item.checked = false;
            return item;
        });
        this.setState({
            dataLoaded: true,
            list
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

    getGroupList = async (): Promise<?Array<FormValuesWithCheck>> => {
        const result = await Tools.apiCall(apiUrls.groupCrud);
        if (result.ok) {
            result.data.items = result.data.items.map(item => ({value: item.id, label: item.name}));
            this.setState({
                groupList: result.data.items
            });
            return result.data.items ? result.data.items : [];
        }
        return null;
    };

   handleChange = (isEdit: boolean, data: FormValues) => {
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

    handleRemove = async (ids: string) => {
        let {list} = this.state;
        const url = apiUrls.crud;
        const deletedIds = await Tools.handleRemove(url, ids);
        if (deletedIds && deletedIds.length) {
            list = list.filter(item => !deletedIds.includes(item.id));
            this.setState({list});
        }
    };

    handleCheck = (event: Object) => {
        const {list} = this.state;
        const {id, checked} = event.target;
        const index = list.findIndex(item => item.id === parseInt(id));
        list[index].checked = checked;
        this.setState({list});
    };

    handleToggleCheckAll = () => {
        let {list} = this.state;
        list = Tools.checkOrUncheckAll(list);
        this.setState({list});
    };

    render() {
        if (!this.state.dataLoaded) return <LoadingLabel errorMessage={this.state.errorMessage} />;
        const {list, groupList} = this.state;
        const formValues = this.state.formValues ? this.state.formValues : defaultFormValues;
        const modalTitle = formValues.id ? 'Update admin' : 'Add new admin';
        return (
            <div>
                <SearchInput onSearch={this.searchList} />
                <table className="table table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th className="row25">
                                <span
                                    className="fas fa-check text-info pointer check-all-button"
                                    onClick={() => this.handleToggleCheckAll()}
                                />
                            </th>
                            <th scope="col">Email</th>
                            <th scope="col">Username</th>
                            <th scope="col">Fullname</th>
                            <th scope="col" style={{padding: 8}} className="row80">
                                <button
                                    className="btn btn-primary btn-sm btn-block add-button"
                                    onClick={() => this.toggleModal('modal')}>
                                    <span className="fas fa-plus" />
                                    &nbsp; Add
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.map((data, key) => (
                            <Row
                                className="table-row"
                                data={data}
                                key={key}
                                toggleModal={this.toggleModal}
                                handleRemove={this.handleRemove}
                                onCheck={this.handleCheck}
                            />
                        ))}
                    </tbody>

                    <tfoot className="thead-light">
                        <tr>
                            <th className="row25">
                                <span
                                    className="fas fa-trash-alt text-danger pointer bulk-remove-button"
                                    onClick={() => this.handleRemove(Tools.getCheckedId(this.state.list))}
                                />
                            </th>
                            <th className="row25 right" colSpan="99">
                                <Pagination
                                    next={this.nextUrl}
                                    prev={this.prevUrl}
                                    onNavigate={url => this.getList(url)}
                                />
                            </th>
                        </tr>
                    </tfoot>
                </table>
                <DefaultModal open={this.state.modal} title={modalTitle} handleClose={() => this.toggleModal('modal')}>
                    <AdministratorForm formValues={formValues} groupList={groupList} handleSubmit={this.handleChange} />
                </DefaultModal>
            </div>
        );
    }
}

type RowPropTypes = {
    data: FormValuesWithCheck,
    toggleModal: Function,
    handleRemove: Function,
    onCheck: Function
};
export class Row extends React.Component<RowPropTypes> {
    getItemToEdit = async (id: number) => {
        const {toggleModal} = this.props;
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            toggleModal('modal', result);
        }
    };

    render() {
        const {data, handleRemove, onCheck} = this.props;
        return (
            <tr>
                <th className="row25">
                    <input id={data.id} className="check" type="checkbox" checked={data.checked} onChange={onCheck} />
                </th>
                <td className="email">{data.email}</td>
                <td className="username">{data.username}</td>
                <td className="fullname">{data.fullname}</td>
                <td className="center">
                    <a className="editBtn" onClick={() => this.getItemToEdit(parseInt(data.id))}>
                        <span className="editBtn fas fa-edit text-info pointer" />
                    </a>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <a className="removeBtn" onClick={() => handleRemove(String(data.id))}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                </td>
            </tr>
        );
    }
}
