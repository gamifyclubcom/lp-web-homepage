import { generateOnChainUrl, renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  amount: number;
  mintTo: string;
  txId: string;
  tokenDecimals: number;
  onClose: () => void | Promise<void>;
}

const StakeSuccessModal: React.FC<Props> = ({ amount, mintTo, txId, tokenDecimals, onClose }) => {
  const amountMarkup = renderTokenBalance(amount, tokenDecimals);
  const transactionUrl = generateOnChainUrl('tx', txId);

  return (
    <BaseModal
      loading={false}
      variant="success"
      modalName="Staking"
      title="Congratulations"
      subTitle="You've staked"
      backText="Close"
      headContent={
        <BalanceBadge variant="basic" price={amountMarkup} mint={mintTo} className="text-2xl" />
      }
      bodyContents={[
        {
          left: <span>Stake amount</span>,
          right: <BalanceBadge variant="basic" price={amountMarkup} mint={mintTo} />,
        },
        {
          left: <span>Transaction</span>,
          right: (
            <a
              href={transactionUrl}
              target="_blank"
              className="underline text-secondary-500"
              rel="noreferrer"
            >
              Transaction details
            </a>
          ),
        },
      ]}
      onClose={onClose}
    />
  );
};

export default StakeSuccessModal;
