import Decimal from 'decimal.js';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useResizedWidth from '../../../hooks/useResizedWidth';

interface Props {
  initValue: number;
  min: number;
  max: number;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  onChange: (...args: any[]) => void;
}

const calculateValueFromWidth = (
  value: number,
  minValue: number,
  maxValue: number,
  truckWidth: number
) => {
  return Math.floor(minValue + (value / truckWidth) * maxValue);
};

const calculateWidthFromValue = (
  value: number,
  minValue: number,
  maxValue: number,
  truckWidth: number
) => {
  const val = value < minValue ? minValue : value;
  const result = (Math.floor(val) / maxValue) * truckWidth;
  return result > truckWidth ? truckWidth : result;
};

const InputRange: React.FC<Props> = props => {
  const { initValue = 0, value, min, max, onChange, setValue } = props;
  // const [value, setValue] = useState(initValue);
  const { setNode: truckRef, width: truckWidth } = useResizedWidth();
  const { setNode: thumbRef, width: thumbWidth } = useResizedWidth();

  const containerRef = useRef(null);

  const x = useMotionValue(0);
  const widthX = useTransform(x, value => {
    return value + thumbWidth;
  });

  const percent: string | number = useMemo(() => {
    return new Decimal(value).times(100).dividedBy(max).toNumber();
  }, [value, max]);

  useEffect(() => {
    const width = calculateWidthFromValue(value, min, max, truckWidth);
    x.set(width);
  }, [value, min, max, truckWidth]);

  const handleDrag = (event: any, info: any) => {
    const val = calculateValueFromWidth(x.get(), min, max, truckWidth);
    setValue(val);
    onChange && onChange(val);
  };

  return (
    <motion.div
      ref={containerRef}
      className='relative w-full h-1 px-2 bg-gray-300 rounded-full'
    >
      <motion.div ref={truckRef as any} className='relative w-full'>
        <motion.span
          ref={thumbRef as any}
          tabIndex={0}
          drag='x'
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          className='absolute top-0 z-10 w-4 h-4 -mt-2 -ml-2 bg-white rounded-full shadow cursor-pointer'
          style={{ x }}
        />
      </motion.div>
      <motion.span
        className='absolute top-0 left-0 h-1 bg-gray-500 rounded-full'
        style={{ width: widthX }}
      />
      <div className='absolute left-0 flex items-center justify-center w-full py-4'>
        <span className='text-sm font-semibold text-white opacity-75'>
          {percent}%
        </span>
      </div>
    </motion.div>
  );
};

export default InputRange;
