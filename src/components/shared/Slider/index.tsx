import ReactSlider from 'react-slider';

interface Props {}

const Slider: React.FC<Props> = () => {
  return (
    <ReactSlider
      className='horizontal-slider'
      thumbClassName='example-thumb'
      trackClassName='example-track'
    />
  );
};

export default Slider;
