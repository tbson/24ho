// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about formik
import {Modal} from 'antd';
import Tools from 'src/utils/helpers/Tools';

export class Service {
    static toggleEvent = 'TOGGLE_ORDER_IMAGE_PREVIEW_DIALOG';
    static toggleForm(open: boolean, src: string = '') {
        Tools.event.dispatch(Service.toggleEvent, {open, src});
    }
}

type Props = {
};
export default ({}: Props) => {
    const formName = 'Ảnh sản phẩm';
    const [open, setOpen] = useState(false);
    const [src, setSrc] = useState('');

    const handleToggle = ({detail: {open, src}}) => {
        setOpen(open);
        setSrc(src);
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    return (
        <Modal
            destroyOnClose={true}
            visible={open}
            onOk={() => setOpen(false)}
            onCancel={() => Service.toggleForm(false)}
            cancelText="Thoát"
            title={formName}>
            <img src={src} style={{width: '100%'}} />
        </Modal>
    );
};
