// @flow
import * as React from 'react';
import Tools from '../helpers/Tools';

const rawApiUrls: Array<Object> = [
    {
        controller: 'attach',
        endpoints: {
            crud: '',
        },
    },
];
export const apiUrls = Tools.getApiUrls(rawApiUrls);

type Props = {
    parent_uuid: string
};
type States = {
    dataLoaded: boolean,
    mainList: Array<Object>
};

class Attach extends React.Component<Props, States> {
    setInitData: Function;
    list: Function;
    toggleModal: Function;
    handleRemove: Function;

    state = {
        dataLoaded: false,
        mainList: []
    };

    constructor(props: Props) {
        super(props);
        this.setInitData = this.setInitData.bind(this);
        this.list = this.list.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    componentDidMount() {
        this.list();
    }

    setInitData(initData: Object) {
        this.setState({
            dataLoaded: true,
            mainList: [...initData.items],
        });
    }

    async list(outerParams: Object = {}, url: ?string = null) {
        let params = {
            parent_uuid: this.props.parent_uuid
        };
        let result = {};

        if (!Tools.isEmpty(outerParams)) {
            params = {...params, ...outerParams};
        }

        result = await Tools.apiCall(url ? url : apiUrls.crud, 'GET', params);
        if (result.success) {
            this.setInitData(result.data);
            return result;
        }
        return result;
    }

    toggleModal(modalName: string, id: ?number = null): Object {
        return {};
    }

    handleRemove(id: string) {}

    render() {
        if (!this.state.dataLoaded) return null;
        const list = this.state.mainList;
        return (
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">Attach Title</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <button
                                className="btn btn-primary btn-sm btn-block add-button"
                                onClick={() => this.toggleModal('mainModal')}>
                                <span className="fas fa-plus" />&nbsp; Add
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
                            _key={key}
                            toggleModal={this.toggleModal}
                            handleRemove={this.handleRemove}
                        />
                    ))}
                </tbody>
            </table>
        );
    }
}

export default Attach;

type DataType = {
    id: number,
    parent_uuid: string,
    title: string,
};
type RowPropTypes = {
    data: DataType,
    _key: number,
    toggleModal: Function,
    handleRemove: Function,
};
export class Row extends React.Component<RowPropTypes> {
    render() {}
}
