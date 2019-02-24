// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Loadable from 'react-loadable';
import Tools from '../helpers/Tools';

const Rummernote = Loadable({
    // $FlowFixMe: do not complain about importing node_modules
    loader: () => import('rummernote/build/bs4'),
    loading: () => <div>Loading richtext editor...</div>
});

const rawApiUrls: Array<Object> = [
    {
        controller: 'attach',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

type Props = {
    parentUUID?: string,
    name: string,
    defaultValue: string
};

type States = {
    value: string
};

class RichTextInput extends React.Component<Props, States> {
    state = {
        value: ''
    };

    onChange = (value: string) => {
        this.setState({value});
    };

    uploadImageCallBack = async (file: File, insertImage: Function) => {
        if (file.type.indexOf('image/') === 0) {
            const params = {
                attachment: file,
                parent_uuid: this.props.parentUUID,
                richtext_image: true
            };
            const result = await Tools.apiCall(apiUrls.crud, 'POST', params);
            if (result.success) {
                insertImage(result.data.attachment, image => {
                    if (image.width() <= 400) {
                        image.css('width', image.width());
                    } else {
                        image.css('width', '100%');
                    }
                });
            }
        }
    };

    render() {
        return (
            <div>
                <input type="hidden" name={this.props.name} defaultValue={this.state.value} />
                <Rummernote
                    value={this.props.defaultValue}
                    onImageUpload={this.uploadImageCallBack}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}

const styles = {};
export default RichTextInput;
