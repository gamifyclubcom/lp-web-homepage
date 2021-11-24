import { useConnection } from '@solana/wallet-adapter-react';
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
import EvaCloseOutlineIcon from '../../../shared/icons/EvaCloseOutlineIcon';
import BaseModalV2 from './BaseModalV2';

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
    new Decimal(amountSwap).times(ratio).times(claimable_percentage).dividedBy(100),
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
    <BaseModalV2
      loading={loading}
      variant="success"
      modalName=" "
      title="Congratulation! You have swapped successfully:"
      backText="Cancel"
      // subTitle="Congratulation! You have swapped successfully:"
      titleSize="medium"
      subTitle=""
      headContent={
        <div className="text-center">
          <BalanceBadge
            variant="basic"
            price={tokenBalanceMarkup}
            mint={mintTo}
            className="text-5xl"
          />
          <div className="text-sm">{`on ${date}`}</div>
          <div className="text-sm">
            <a
              href={transactionUrl}
              target="_blank"
              className="underline text-secondary-400"
              rel="noreferrer"
            >
              Transaction details
            </a>
          </div>
        </div>
      }
      modalIcon={
        <div onClick={onClose}>
          <EvaCloseOutlineIcon />
        </div>
      }
      bodyContents={[
        {
          left: (
            <div className="flex flex-col gap-y-2 text-base">
              <span>Price</span>
              <span>Inverse Price</span>
            </div>
          ),
          right: (
            <div className="flex flex-col gap-y-2 text-base">
              <BalanceBadge
                variant="with-ratio"
                mintFrom={mintFrom}
                mintTo={mintTo}
                price={amountSwap}
              />
              <BalanceBadge
                variant="with-ratio"
                mintFrom={mintTo}
                mintTo={mintFrom}
                price={amountSwap}
                reverse={true}
              />
            </div>
          ),
        },
        ...getClaimableField(claimable_percentage),
      ]}
      onClose={onClose}
    />
  );
};

export default JoinPoolSuccessModal;
