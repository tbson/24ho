// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import 'slick-carousel/slick/slick.css';
// $FlowFixMe: do not complain about importing node_modules
import 'slick-carousel/slick/slick-theme.css';
// $FlowFixMe: do not complain about importing node_modules
import Slider from 'react-slick';


type Props = {
    listItem: Array<Object>,
    imageKey: string,
};
type State = {};
export default class Carousel extends React.Component<Props, State> {
    static defaultProps = {
        listItem: [],
        imageKey: 'image',
    };

    state: State = {};
    constructor(props: Props) {
        super(props);
    }
    render() {
        if (!this.props.listItem.length) return null;

        const settings = {
            dots: true,
            arrows: true,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 5000,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
        };
        return (
            <Slider {...settings}>
                {this.props.listItem.map(item => (
                    <div key={item.id}>
                        <img src={item[this.props.imageKey]} width="100%" title={item.title} alt={item.title}/>
                    </div>
                ))}
            </Slider>
        );
    }
}
