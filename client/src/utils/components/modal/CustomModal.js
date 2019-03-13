// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Modal from 'react-modal';

type Props = {
    backgroundColor?: string,
    size: string,
    open: boolean,
    close: Function,
    title: string,
    heading: boolean,
    children: React.Node
};

export default ({
    size = 'full',
    open,
    close,
    title,
    heading = true,
    backgroundColor = 'rgb(255, 255, 255)',
    children
}: Props) => {
    let customStyles = {
        overlay: {
            zIndex: 3,
            overflowY: 'scroll'
        },
        content: {
            backgroundColor: backgroundColor,
            top: '5%',
            left: '30%',
            right: '30%',
            bottom: 'auto',
            overflowX: 'visible',
            overflowY: 'visible'
        }
    };
    switch (size) {
        case 'sm':
            customStyles.content.left = '30%';
            customStyles.content.right = '30%';
            break;
        case 'md':
            customStyles.content.left = '20%';
            customStyles.content.right = '20%';
            break;
        case 'lg':
            customStyles.content.left = '3%';
            customStyles.content.right = '3%';
            break;
        case 'full':
            customStyles.content.left = '0%';
            customStyles.content.right = '0%';
            customStyles.content.top = '0%';
            customStyles.content.bottom = '0%';
            // $FlowFixMe: do not complain subkey
            customStyles.content.borderWidth = 0;
            break;
        default:
            customStyles.content.left = '20%';
            customStyles.content.right = '20%';
    }

    const closeButtonStyle = {
        position: 'absolute',
        top: 20,
        right: 20,
        cursor: 'pointer'
    };
    const headingStyle = {
        margin: 0,
        marginBottom: 10
    };
    if (heading) {
        return (
            <Modal style={customStyles} isOpen={open} contentLabel="Modal" onRequestClose={close} ariaHideApp={false}>
                <span style={closeButtonStyle} className="fas fa-times non-printable" onClick={close} />
                <h4 className="non-printable" style={headingStyle}>
                    {title}
                </h4>
                {children}
            </Modal>
        );
    }
    return (
        <Modal style={customStyles} isOpen={open} contentLabel="Modal" onRequestClose={close} ariaHideApp={false}>
            {children}
        </Modal>
    );
};
