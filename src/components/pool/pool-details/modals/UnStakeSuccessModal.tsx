import Decimal from 'decimal.js';
import { generateOnChainUrl, renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  totalAmount: number;
  penaltyPercent: number;
  mintTo: string;
  txId: string;
  tokenDecimals: number;
  timeLeft: number;
  totalTime: number;
  onClose: () => void | Promise<void>;
}

const UnStakeSuccessModal: React.FC<Props> = ({
  totalAmount,
  penaltyPercent,
  mintTo,
  txId,
  tokenDecimals,
  timeLeft,
  totalTime,
  onClose,
}) => {
  const penaltyAmount = new Decimal(totalAmount)
    .times(penaltyPercent)
    .times(timeLeft)
    .dividedBy(totalTime)
    .dividedBy(100);
  const receivedAmount = new Decimal(totalAmount).minus(penaltyAmount);
  const penaltyMarkup = renderTokenBalance(penaltyAmount, tokenDecimals);
  const totalAmountMarkup = renderTokenBalance(totalAmount, tokenDecimals);
  const receivedAmountMarkup = renderTokenBalance(receivedAmount, tokenDecimals);
  const transactionUrl = generateOnChainUrl('tx', txId);

  return (
    <BaseModal
      loading={false}
      variant="success"
      modalName="UnStaking Success"
      title="Congratulations"
      subTitle="You received:"
      headContent={<BalanceBadge variant="basic" price={receivedAmountMarkup} mint={mintTo} />}
      bodyContents={[
        {
          left: <span>Total unstake amount</span>,
          right: <BalanceBadge variant="basic" price={totalAmountMarkup} mint={mintTo} />,
        },
        {
          left: <span>Penalty charge ({penaltyPercent}%)</span>,
          right: <BalanceBadge variant="basic" price={penaltyMarkup} mint={mintTo} />,
        },
        {
          left: <span>Received amount after unstaking</span>,
          right: <BalanceBadge variant="basic" price={receivedAmountMarkup} mint={mintTo} />,
        },
        {
          left: <span>Transaction</span>,
          right: (
            <a
              href={transactionUrl}
              target="_blank"
              className="underline text-secondary-400"
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

export default UnStakeSuccessModal;
