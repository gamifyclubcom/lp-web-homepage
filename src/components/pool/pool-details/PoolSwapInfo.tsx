import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { IPoolStatus } from '../../../sdk/pool/interface';
import { transformLamportsToSOL } from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
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
    return transformLamportsToSOL(new Decimal(totalRaise).minus(currentSwap).toNumber());
  }, [currentSwap, totalRaise]);
  const progressExtraMarkup = `(${tokenFromLeft} ${mintTokenFrom} left) ${currentSwap} / ${totalRaise} ${mintTokenTo}`;

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-lg font-semibold text-white uppercase">Swap Info</h1>
        <PoolStatus status={status} loading={loading} />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h6 className="mb-4 text-sm font-light text-white">Total Raise Amount</h6>
          <BalanceBadge
            mint="SOL"
            variant="basic"
            price={1300}
            className="text-2xl font-semibold text-secondary-400"
          />
        </div>

        <div className="flex flex-col">
          <BalanceBadge
            variant="with-ratio"
            mintFrom={mintTokenFrom}
            mintTo={mintTokenTo}
            price={tokenRatio}
            className="mb-4 text-white uppercase opacity-30"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Participants</span>
            <span className="text-lg font-semibold text-secondary-400">{participants}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-8 mb-4">
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
