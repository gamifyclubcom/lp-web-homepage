interface Props {
  contributionLevel: number;
  guaranteedAllocationExclusiveRound: number;
  maxAllocation: number;
  currentContribution: number;
}

const PoolSwapAction: React.FC<Props> = ({
  contributionLevel,
  guaranteedAllocationExclusiveRound,
  maxAllocation,
  currentContribution,
}) => {
  return <div className="text-white">pool swap action</div>;
};

export default PoolSwapAction;
