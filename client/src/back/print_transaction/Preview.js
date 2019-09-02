// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import ReactToPrint from 'react-to-print';
// $FlowFixMe: do not complain about importing node_modules
import Barcode from 'react-barcode';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/transaction/_data';

export class Service {
    static toggleEvent = 'TOGGLE_PRINT_TRANSACTION_FORM';

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static retrieve(id: number) {
        return Tools.apiClient(apiUrls.print + id);
    }
}

type Props = {
    close: Function
};

export default ({close}: Props) => {
    const contentRef = useRef();
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);

    const retrieveThenOpen = (id: number) =>
        Service.retrieve(id).then(data => {
            setData({...data});
            setOpen(true);
        });

    const handleToggle = ({detail: {open, id}}) => {
        open ? retrieveThenOpen(id) : setOpen(false);
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    return (
        <div>
            <DefaultModal open={open} close={close} title="In phiếu thu">
                <div>
                    <Content data={data} ref={contentRef} />
                    <hr />
                    <ReactToPrint
                        onAfterPrint={() => Service.toggleForm(false)}
                        trigger={() => (
                            <div className="right">
                                <button className="btn btn-primary">
                                    <span className="fas fa-print" />
                                    &nbsp;&nbsp;<span>In phiếu thu</span>
                                </button>
                            </div>
                        )}
                        content={() => contentRef.current}
                    />
                </div>
            </DefaultModal>
        </div>
    );
};

type ContentProps = {
    data: Object
};
class Content extends React.Component<ContentProps> {
    render() {
        return (
            <div>
                <Barcode value="fbfa2117-472c-4c93-8672-26580aea94a3" />
            </div>
        );
    }
}
