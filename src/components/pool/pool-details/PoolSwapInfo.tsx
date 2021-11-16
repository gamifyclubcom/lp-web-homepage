import Decimal from 'decimal.js';
import { useMemo } from 'react';
import { IPoolStatus } from '../../../sdk/pool/interface';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import BalanceBadge from '../../shared/BalanceBadge';
import PoolCardTitle from '../../shared/pool/PoolCardTitle';
import PoolProgressBar from '../../shared/pool/PoolProgressBar';
import PoolStatus from '../../shared/pool/PoolStatus';

interface Props {
  totalRaise: number;
  participants: number;
  swapProgress: number;
  currentSwap: number;
  mintTokenFrom: string;
  mintTokenTo: string;
  tokenRatio: number;
  status: IPoolStatus;
  loading: boolean;
}

const PoolSwapInfo: React.FC<Props> = ({
  totalRaise,
  participants,
  swapProgress,
  currentSwap,
  mintTokenFrom,
  mintTokenTo,
  tokenRatio,
  status,
  loading,
}) => {
  const tokenFromLeft = useMemo(() => {
    const result = parseFloat(
      new Decimal(totalRaise).minus(currentSwap).dividedBy(tokenRatio).toFixed(TOKEN_TO_DECIMALS),
    );

    return result;
  }, [currentSwap, totalRaise, tokenRatio]);
  const progressExtraMarkup = `(${tokenFromLeft} ${mintTokenFrom} left) ${currentSwap} / ${totalRaise} ${mintTokenTo}`;

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-start justify-between mb-8">
        <PoolCardTitle title="Swap Info" />
        <PoolStatus status={status} loading={loading} />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h6 className="mb-4 text-sm font-light text-white">Total Raise Amount</h6>
          <BalanceBadge
            mint="SOL"
            variant="basic"
            price={parseFloat(
              new Decimal(totalRaise).dividedBy(tokenRatio).toFixed(TOKEN_TO_DECIMALS),
            )}
            className="text-2xl text-pool_focus_1"
          />
        </div>

        <div className="flex flex-col">
          <BalanceBadge
            variant="with-ratio"
            mintFrom={mintTokenFrom}
            mintTo={mintTokenTo}
            price={tokenRatio}
            className="mb-4 text-white opacity-30"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Participants</span>
            <span className="text-lg text-pool_focus_1">{participants}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-6 mb-4">
        <span className="mb-4 text-sm text-white">Swap Progress</span>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white">{swapProgress}%</span>
            <span className="text-xs text-white">{progressExtraMarkup}</span>
          </div>
          <PoolProgressBar
            current={currentSwap}
            total={totalRaise}
            loading={loading}
            variant="simple"
          />
        </div>
      </div>
    </div>
  );
};

export default PoolSwapInfo;
