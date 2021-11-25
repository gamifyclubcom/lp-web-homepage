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
import BaseModal from './BaseModal';

interface Props {
  onClose: () => void;
  connection: Connection;
  amount: number;
  ratio: number;
  txId: string;
  mintFrom: string;
  mintTo: string;
  tokenDecimals: number;
  claimable_percentage: number;
}

const ClaimSuccessModal: React.FC<Props> = ({
  onClose,
  connection,
  amount,
  ratio,
  txId,
  mintFrom,
  mintTo,
  tokenDecimals,
  claimable_percentage,
}) => {
  const tokenBalanceMarkup = renderTokenBalance(
    new Decimal(amount).times(claimable_percentage).dividedBy(100),
    tokenDecimals,
  );
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>('');
  const transactionUrl = generateOnChainUrl('tx', txId);

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
          left: <span>Total</span>,
          right: (
            <BalanceBadge variant="with-ratio" price={ratio} mintFrom={mintFrom} mintTo={mintTo} />
          ),
        },
        {
          left: <span>Date</span>,
          right: <span>{date}</span>,
        },
        ...getClaimableField(claimable_percentage),
        {
          left: <span>Tx</span>,
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

export default ClaimSuccessModal;
