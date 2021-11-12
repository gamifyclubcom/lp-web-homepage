import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { useAlert } from '../../../hooks/useAlert';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import useSmartContract from '../../../hooks/useSmartContract';
import { IPoolVoting } from '../../../sdk/pool/interface';
import { PoolVotingStatusType } from '../../../shared/enum';
import { getPoolVotingStatus, roundNumberByDecimal } from '../../../utils/helper';
import Spinner from '../../shared/Spinner';
import NumberVotingLoading from './NumberVoteLoading';
import VotingCountdown from './VotingCountdown';

interface Props {
  setPoolVoting: Dispatch<SetStateAction<IPoolVoting>>;
  setProgress: Dispatch<SetStateAction<number>>;
  poolVoting: IPoolVoting;
  initLoading: boolean;
}

const PoolVotingAction: React.FC<Props> = ({
  poolVoting,
  initLoading,
  setPoolVoting,
  setProgress,
}) => {
  const { now, totalStaked } = useGlobal();
  const { alertSuccess, alertError } = useAlert();
  const { connected } = useWallet();
  const { getUserVoteData, userUpVote, userDownVote } = useSmartContract();
  const { getPoolVotingFullInfo } = usePool();
  const [upVoteLoading, setUpVoteLoading] = useState(false);
  const [downVoteLoading, setDownVoteLoading] = useState(false);
  const [isVoteUp, setIsVoteUp] = useState(false);
  const [isVoteDown, setIsVoteDown] = useState(false);
  const [votingPower, setVotingPower] = useState(0);

  useEffect(() => {
    if (!connected) {
      setIsVoteUp(false);
      setIsVoteDown(false);
    } else {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const poolVotingStatus = useMemo(() => {
    return getPoolVotingStatus(poolVoting, now);
  }, [poolVoting, now]);

  const votingCardTimer = useMemo(() => {
    if (initLoading) {
      return (
        <div className="flex flex-col items-start w-full">
          <div className="w-3/5 h-3 mb-8 bg-gray-700 rounded-md animate-pulse" />
          <div className="w-4/5 h-8 bg-gray-700 rounded-sm animate-pulse" />
        </div>
      );
    }

    switch (poolVotingStatus) {
      case PoolVotingStatusType.IN_VOTING:
        const targetDate = poolVoting.voting_end.toISOString() || new Date().toISOString();
        return (
          <div className="flex flex-col items-center">
            <div className="w-full mb-4 text-center">
              <span className="text-sm text-white">Your checkpoint voting: {votingPower}</span>
            </div>
            <div className="w-full">
              <VotingCountdown date={targetDate} active={true} />
            </div>
          </div>
        );
      case PoolVotingStatusType.DEACTIVATED:
        return (
          <div className="flex justify-center w-full">
            <span className="text-sm text-white">
              Sorry this pool did not get enough votes to be activated!
            </span>
          </div>
        );
      case PoolVotingStatusType.VALIDATED:
        return (
          <div className="flex flex-col items-start">
            <span className="mb-4 text-sm text-white">This pool is now activated</span>
            <span className="text-sm text-white">
              Join pool start on {moment(poolVoting.join_pool_start).utc().format('MMM DD YYYY LT')}{' '}
              (UTC)
            </span>
          </div>
        );
    }
  }, [
    initLoading,
    poolVotingStatus,
    poolVoting.voting_end,
    poolVoting.join_pool_start,
    votingPower,
  ]);

  const votingPowerRate = useMemo(() => {
    return poolVoting?.voting?.token_voting_power_rate || 1;
  }, [poolVoting]);

  useEffect(() => {
    const initVotingPower = () => {
      setVotingPower(() => {
        const result = roundNumberByDecimal(
          new Decimal(totalStaked).dividedBy(votingPowerRate),
          0,
        ).toNumber();
        return result;
      });
    };

    initVotingPower();
  }, [totalStaked, votingPowerRate]);

  const init = async (): Promise<void> => {
    try {
      const userVoteData = await getUserVoteData(poolVoting);
      setIsVoteUp(userVoteData.isVoteUp);
      setIsVoteDown(userVoteData.isVoteDown);
    } catch (err) {
      setIsVoteUp(false);
      setIsVoteDown(false);
    }
  };

  const handleUpVote = async () => {
    if (
      poolVotingStatus === PoolVotingStatusType.DEACTIVATED ||
      poolVotingStatus === PoolVotingStatusType.UPCOMING
    ) {
      return;
    }

    setUpVoteLoading(true);
    try {
      await userUpVote(poolVoting);
      const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
      setPoolVoting(poolVotingFullInfo);
      setProgress(poolVotingFullInfo.voting_progress);
      setUpVoteLoading(false);

      alertSuccess('UpVote success');
    } catch (err) {
      setUpVoteLoading(false);
      alertError((err as any).message);
    }
  };

  const handleDownVote = async () => {
    if (
      poolVotingStatus === PoolVotingStatusType.DEACTIVATED ||
      poolVotingStatus === PoolVotingStatusType.UPCOMING
    ) {
      return;
    }

    setDownVoteLoading(true);
    try {
      await userDownVote(poolVoting);
      const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
      setPoolVoting(poolVotingFullInfo);
      setProgress(poolVotingFullInfo.voting_progress);
      setDownVoteLoading(false);

      alertSuccess('DownVote success');
    } catch (err) {
      setDownVoteLoading(false);
      alertError((err as any).message);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center w-full p-8">
        <div className="flex flex-col items-center w-1/2 px-2">
          <div
            className="relative flex items-center justify-center w-full p-2 cursor-pointer"
            onClick={handleUpVote}
          >
            {upVoteLoading && <Spinner size="small" variant="basic" wrappedClassName="absolute" />}
            <FaThumbsUp
              className={clsx('mb-4 text-5xl', {
                'text-secondary-400': upVoteLoading || isVoteUp,
                'text-white': !upVoteLoading && !isVoteUp,
              })}
            />
          </div>
          {upVoteLoading || initLoading ? (
            <NumberVotingLoading />
          ) : (
            <span className="text-lg text-white">{poolVoting.voting_total_up}</span>
          )}
        </div>
        <div className="flex flex-col items-center w-1/2 px-2">
          <div
            className="relative flex justify-center w-full p-2 cursor-pointer"
            onClick={handleDownVote}
          >
            {downVoteLoading && (
              <Spinner size="small" variant="basic" wrappedClassName="absolute" />
            )}
            <FaThumbsDown
              className={clsx('mb-4 text-5xl', {
                'text-secondary-400': downVoteLoading || isVoteDown,
                'text-white': !downVoteLoading && !isVoteDown,
              })}
            />
          </div>
          {downVoteLoading || initLoading ? (
            <NumberVotingLoading />
          ) : (
            <span className="text-lg text-white">{poolVoting.voting_total_down}</span>
          )}
        </div>
      </div>

      <div className="flex justify-center w-full px-8 my-2">
        <div className="w-full bg-gray-500" style={{ height: 1 }} />
      </div>

      <div className="w-full p-8">{votingCardTimer}</div>
    </div>
  );
};

export default PoolVotingAction;
