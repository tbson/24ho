// @flow
import * as React from 'react';
import CustomModal from 'src/utils/components/modal/CustomModal';

export class Service {
    static handleEsc(open: boolean, callback: Function) {
        return (event: Object) => {
            event = event || window.event;
            event.keyCode == 27 && open && callback();
        };
    }

    static listentEsc(open: boolean, callback: Function) {
        open && window.document.addEventListener('keydown', Service.handleEsc(open, callback), {once: true});
    }
}

type Props = {
    open: boolean,
    close: Function,
    title: string,
    size?: string,
    heading?: boolean,
    children: React.Node
};
export default ({open = false, size = 'md', heading = true, title = '', close, children}: Props) => {
    Service.listentEsc(open, close);
    return (
        <CustomModal open={open} close={close} title={title} size={size} heading={heading}>
            <div className="modal-inner">
                {/* $FlowFixMe: No Type for cloneElement */}
                {React.cloneElement(children)}
            </div>
        </CustomModal>
    );
};
