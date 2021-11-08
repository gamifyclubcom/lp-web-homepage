import { HTMLAttributes } from 'react';
import NumberFormat from 'react-number-format';

interface Props {
  variant: 'basic' | 'with-ratio';
  price: number;
  mint?: string;
  mintFrom?: string;
  mintTo?: string;
  className?: HTMLAttributes<HTMLSpanElement>['className'];
}

const BalanceBadge: React.FC<Props> = ({
  variant,
  price,
  mintFrom = 'SOL',
  mintTo,
  mint,
  className,
}) => {
  return (
    <NumberFormat
      value={price}
      displayType={'text'}
      thousandSeparator={true}
      renderText={(formattedValue: string) => {
        if (variant === 'with-ratio') {
          return (
            <span
              className={className}
            >{`1 ${mintFrom} = ${formattedValue} ${mintTo}`}</span>
          );
        }

        return <span className={className}>{`${formattedValue} ${mint}`}</span>;
      }}
    />
  );
};

export default BalanceBadge;
