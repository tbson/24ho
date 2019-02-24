// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    name: string,
    label: string,
    value: ?string,
    placeholder?: string,
    errorMessage?: string,
    disabled?: boolean,
    onChange?: Function
};

type States = {
    fileName?: string,
    fileContent?: string
};

export default class Input extends React.Component<Props, States> {
    state = {};

    onChange = (event: Object) => {
        const {name} = this.props;
        const fileName = Tools.getFileName(event.target.value);

        // $FlowFixMe: This one never be null
        const file = document.querySelector(`input[name=${name}]`).files[0];

        const reader = new FileReader();
        reader.addEventListener(
            'load',
            () => {
                const fileContent = reader.result;
                // $FlowFixMe: fileContent is string
                this.setState({fileName, fileContent});
            },
            false
        );
        reader.readAsDataURL(file);
    };

    render() {
        const {name, label, value, errorMessage, placeholder} = this.props;
        const className = `custom-file-input ${errorMessage ? 'is-invalid' : ''}`.trim();
        let fileName = this.state.fileName || Tools.getFileName(value || '');
        let fileContent = this.state.fileContent || value || '';

        return (
            <div className={`form-group ${name}-field`}>
                <label htmlFor={name}>{label}</label>
                <Preview fileContent={fileContent} />
                <div className="custom-file">
                    <input type="file" className={className} name={name} id={name} onChange={this.onChange} />
                    <label className="custom-file-label" htmlFor={name}>
                        {fileName || placeholder}
                    </label>
                    <div className="invalid-feedback">{errorMessage}</div>
                </div>
            </div>
        );
    }
}

type previewProps = {
    fileContent?: string
};
function Preview(props: previewProps) {
    const {fileContent} = props;
    const url = Tools.ensureImage(fileContent || '');
    if (!url) return null;
    return (
        <div className="row">
            <div className="col col-lg-4">
                <img src={fileContent} width="100%" />
            </div>
        </div>
    );
}
