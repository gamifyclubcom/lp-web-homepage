import { IPoolStatus } from '../../../sdk/pool/interface';

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
  return <div className="text-white">pool swap info</div>;
};

export default PoolSwapInfo;
