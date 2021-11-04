import Decimal from 'decimal.js';
import {
  getClaimableField,
  renderTokenBalance,
} from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  onClose: () => void;
  onConfirm: (...args: any) => void | Promise<void>;
  amountSwap: number;
  swapRatio: number;
  mintFrom: string;
  mintTo: string;
  loading?: boolean;
  tokenDecimals: number;
  claimable_percentage: number;
}

const ConfirmJoinModal: React.FC<Props> = ({
  onClose,
  onConfirm,
  amountSwap,
  swapRatio,
  mintFrom,
  mintTo,
  loading = false,
  tokenDecimals,
  claimable_percentage,
}) => {
  const tokenBalanceMarkup = renderTokenBalance(
    new Decimal(amountSwap)
      .times(swapRatio)
      .times(claimable_percentage)
      .dividedBy(100),
    tokenDecimals
  );

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      loading={loading}
      variant='confirm'
      modalName='Confirmation'
      title='Please confirm'
      headContent={
        <BalanceBadge
          variant='basic'
          price={tokenBalanceMarkup}
          mint={mintTo}
          className='text-2xl'
        />
      }
      bodyContents={[
        {
          left: <span>Ratio</span>,
          right: (
            <BalanceBadge
              variant='with-ratio'
              mintFrom={mintFrom}
              mintTo={mintTo}
              price={swapRatio}
            />
          ),
        },
        {
          left: <span>Amount</span>,
          right: (
            <BalanceBadge variant='basic' mint={mintFrom} price={amountSwap} />
          ),
        },
        ...getClaimableField(claimable_percentage),
        {
          left: <span>Total</span>,
          right: (
            <BalanceBadge
              variant='basic'
              price={tokenBalanceMarkup}
              mint={mintTo}
            />
          ),
        },
      ]}
      onClose={onClose}
      handleConfirm={handleConfirm}
    />
  );
};

export default ConfirmJoinModal;
