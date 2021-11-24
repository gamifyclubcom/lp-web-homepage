import { HTMLAttributes, SVGAttributes } from 'react';
import { CgSpinner, CgSpinnerTwoAlt } from 'react-icons/cg';
import CustomLoader from './CustomLoader';

interface Props {
  size: 'small' | 'medium' | 'large';
  variant: 'basic' | 'alt';
  wrappedClassName?: HTMLAttributes<HTMLDivElement>['className'];
  iconClassName?: SVGAttributes<SVGElement>['className'];
}

const Spinner: React.FC<Props> = ({ size, variant = 'basic', wrappedClassName, iconClassName }) => {
  return (
    <div className={wrappedClassName}>
      {variant === 'basic' ? (
        <CustomLoader />
      ) : (
        <CgSpinnerTwoAlt
          className={`${
            size === 'small' ? 'text-2xl' : size === 'medium' ? 'text-4xl' : 'text-6xl'
          } text-white animate-spin ${iconClassName}`}
        />
      )}
    </div>
  );
};

export default Spinner;
