// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Modal from 'react-modal';

type Props = {
    size: string,
    open: boolean,
    close: Function,
    title: string,
    heading: boolean,
    backgroundColor: string,
    children: React.Node,
};
type State = {};

class CustomModal extends React.Component<Props, State> {
    static defaultProps = {
        size: 'full',
        heading: true,
        backgroundColor: 'rgb(255, 255, 255)'
    };

    state: State = {};

    constructor(props: Props) {
        super(props);
    }

    render() {
        let customStyles = {
            overlay: {
                zIndex: 3,
                overflowY: 'scroll',
            },
            content: {
                backgroundColor: this.props.backgroundColor,
                top: '5%',
                left: '30%',
                right: '30%',
                bottom: 'auto',
                overflowX: 'visible',
                overflowY: 'visible',
            },
        };
        switch (this.props.size) {
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
            cursor: 'pointer',
        };
        const headingStyle = {
            margin: 0,
            marginBottom: 10,
        };
        if (this.props.heading) {
            return (
                <Modal
                    style={customStyles}
                    isOpen={this.props.open}
                    contentLabel="Modal"
                    onRequestClose={this.props.close}
                    ariaHideApp={false}>
                    <span style={closeButtonStyle} className="fas fa-times non-printable" onClick={this.props.close} />
                    <h4 className="non-printable" style={headingStyle}>
                        {this.props.title}
                    </h4>
                    {this.props.children}
                </Modal>
            );
        }
        return (
            <Modal
                style={customStyles}
                isOpen={this.props.open}
                contentLabel="Modal"
                onRequestClose={this.props.close}
                ariaHideApp={false}>
                {this.props.children}
            </Modal>
        );
    }
}

export default CustomModal;
