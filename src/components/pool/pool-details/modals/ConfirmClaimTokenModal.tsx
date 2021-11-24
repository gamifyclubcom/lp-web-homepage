import Decimal from 'decimal.js';
import { getClaimableField, renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  onClose: () => void;
  onConfirm: (...args: any) => void | Promise<void>;
  mintTo: string;
  mintFrom: string;
  ratio: number;
  loading?: boolean;
  allocation: number;
  tokenDecimals: number;
  claimable_percentage: number;
}

const ConfirmClaimTokenModal: React.FC<Props> = ({
  onClose,
  onConfirm,
  mintFrom,
  mintTo,
  ratio,
  loading = false,
  allocation,
  tokenDecimals,
  claimable_percentage,
}) => {
  const tokenBalanceMarkup = renderTokenBalance(
    new Decimal(allocation).times(claimable_percentage).dividedBy(100),
    tokenDecimals,
  );

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      loading={loading}
      variant="confirm"
      modalName="Confirmation"
      title="Please confirm"
      headContent={
        <BalanceBadge
          variant="basic"
          price={tokenBalanceMarkup}
          mint={mintTo}
          className="text-2xl"
        />
      }
      bodyContents={[
        {
          left: <span>Ratio</span>,
          right: (
            <BalanceBadge variant="with-ratio" mintFrom={mintFrom} mintTo={mintTo} price={ratio} />
          ),
        },
        ...getClaimableField(claimable_percentage),
        {
          left: <span>Your will receive</span>,
          right: <BalanceBadge variant="basic" mint={mintTo} price={tokenBalanceMarkup} />,
        },
      ]}
      onClose={onClose}
      handleConfirm={handleConfirm}
    />
  );
};

export default ConfirmClaimTokenModal;
