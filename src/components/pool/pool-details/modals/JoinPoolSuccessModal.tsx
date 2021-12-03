// import { useConnection } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';
import {
  convertUnixTimestampToDate,
  generateOnChainUrl,
  getClaimableField,
  renderTokenBalance,
} from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
// import EvaCloseOutlineIcon from '../../../shared/icons/EvaCloseOutlineIcon';
import BaseModal from './BaseModal';

interface Props {
  connection: Connection;
  onClose: () => void;
  amountSwap: number;
  ratio: number;
  txId: string;
  mintFrom: string;
  mintTo: string;
  tokenDecimals: number;
  claimable_percentage: number;
}

const JoinPoolSuccessModal: React.FC<Props> = ({
  connection,
  onClose,
  amountSwap,
  ratio,
  txId,
  mintFrom,
  mintTo,
  tokenDecimals,
  claimable_percentage,
}) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>('');
  const transactionUrl = generateOnChainUrl('tx', txId);
  const tokenBalanceMarkup = renderTokenBalance(
    new Decimal(amountSwap).times(ratio),
    tokenDecimals,
  );

  useEffect(() => {
    const init = async () => {
      if (txId) {
        setLoading(true);
        try {
          const data = await connection.getTransaction(txId, { commitment: 'confirmed' });
          setDate(convertUnixTimestampToDate(data?.blockTime!));
          setLoading(false);
        } catch (err) {
          console.log({ err });
          setLoading(false);
        }
      }
    };

    init();
  }, [txId, connection]);

  return (
    <BaseModal
      loading={loading}
      variant="success"
      modalName="Secured Allocation"
      title="Congratulations"
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
            <BalanceBadge variant="with-ratio" price={ratio} mintFrom={mintFrom} mintTo={mintTo} />
          ),
        },
        {
          left: <span>Amount</span>,
          right: <BalanceBadge variant="basic" price={amountSwap} mint={mintFrom} />,
        },
        ...getClaimableField(claimable_percentage),
        {
          left: <span>Total</span>,
          right: <BalanceBadge variant="basic" price={tokenBalanceMarkup} mint={mintTo} />,
        },
        {
          left: <span>Date</span>,
          right: <span>{date}</span>,
        },
        {
          left: <span>Tx</span>,
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
      backText="Close"
      onClose={onClose}
    />
  );
};

export default JoinPoolSuccessModal;
