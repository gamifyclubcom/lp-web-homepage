import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { useAlert } from '../../../hooks/useAlert';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import useSmartContract from '../../../hooks/useSmartContract';
import { IPoolVoting } from '../../../sdk/pool/interface';
import { PoolVotingStatusType } from '../../../shared/enum';
import { getPoolVotingStatus } from '../../../utils/helper';
import PoolVotingStatus from '../../shared/pool/PoolVotingStatus';
import TableVotingCountdown from './TableVotingCountdown';

interface Props {
  poolVoting: IPoolVoting;
  loading: boolean;
  setVoteLoading: Dispatch<SetStateAction<boolean>>;
  setPaginatedPoolVoting: Dispatch<SetStateAction<PaginateResponse<IPoolVoting>>>;
}

const PoolsVotingRow: React.FC<Props> = ({
  poolVoting,
  loading,
  setVoteLoading,
  setPaginatedPoolVoting,
}) => {
  const { now } = useGlobal();
  const { connected } = useWallet();
  const { getUserVoteData, userUpVote, userDownVote } = useSmartContract();
  const { alertError, alertSuccess } = useAlert();
  const { handleGoToPoolVotingDetails, getPoolVotingFullInfo } = usePool();
  const poolVotingStatus = useMemo(() => {
    return getPoolVotingStatus(poolVoting, now);
  }, [poolVoting, now]);
  const [isVoteUp, setIsVoteUp] = useState(false);
  const [isVoteDown, setIsVoteDown] = useState(false);

  useEffect(() => {
    const initUserVote = async () => {
      if (!connected) {
        setIsVoteUp(false);
        setIsVoteDown(false);
      } else {
        const userVoteData = await getUserVoteData(poolVoting);

        setIsVoteUp(userVoteData.isVoteUp);
        setIsVoteDown(userVoteData.isVoteDown);
      }
    };

    initUserVote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const handleUpVote = async (poolVoting: IPoolVoting) => {
    if (
      poolVotingStatus === PoolVotingStatusType.UPCOMING ||
      poolVotingStatus === PoolVotingStatusType.DEACTIVATED
    ) {
      return;
    }

    setVoteLoading(true);
    try {
      await userUpVote(poolVoting);
      await refresh();
      alertSuccess('UpVote success');
      setVoteLoading(false);
    } catch (err) {
      setVoteLoading(false);
      alertError((err as any).message);
    }
  };

  const handleDownVote = async (poolVoting: IPoolVoting) => {
    if (
      poolVotingStatus === PoolVotingStatusType.UPCOMING ||
      poolVotingStatus === PoolVotingStatusType.DEACTIVATED
    ) {
      return;
    }

    setVoteLoading(true);

    try {
      await userDownVote(poolVoting);
      await refresh();
      alertSuccess('DownVote success');
      setVoteLoading(false);
    } catch (err) {
      setVoteLoading(false);
      alertError((err as any).message);
    }
  };

  const refresh = async (): Promise<void> => {
    try {
      const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
      setPaginatedPoolVoting((prev) => ({
        ...prev,
        docs: prev.docs.map((doc) => {
          if (doc.id.toString() !== poolVotingFullInfo.id.toString()) {
            return doc;
          }

          return poolVotingFullInfo;
        }),
      }));

      const userVoteData = await getUserVoteData(poolVoting);

      setIsVoteUp(userVoteData.isVoteUp);
      setIsVoteDown(userVoteData.isVoteDown);
    } catch (err) {}
  };

  return (
    <tr className="text-xl font-medium text-left text-white border-b opacity-75 cursor-pointer border-fuchsia-500 hover:bg-gray-900">
      <td className="px-4 py-2 truncate" onClick={() => handleGoToPoolVotingDetails(poolVoting)}>
        <div className="flex items-center w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poolVoting.logo || '/images/placeholder_circle.svg'}
            className="hidden w-10 h-10 mr-2 overflow-hidden border-gray-500 rounded-full shadow-sm lg:block"
            alt="Pool voting logo"
          />
          <span className="truncate">{poolVoting.name}</span>
        </div>
      </td>
      <td className="hidden px-4 py-2 md:table-cell" onClick={() => handleUpVote(poolVoting)}>
        <div className="flex items-center w-full cursor-pointer">
          <FaThumbsUp
            className={clsx('mr-2', {
              'text-secondary-400': isVoteUp,
            })}
          />
          <span className="truncate">{poolVoting.voting_total_up}</span>
        </div>
      </td>
      <td className="hidden px-4 py-2 md:table-cell" onClick={() => handleDownVote(poolVoting)}>
        <div className="flex items-center w-full cursor-pointer">
          <FaThumbsDown
            className={clsx('mr-2', {
              'text-secondary-400': isVoteDown,
            })}
          />
          <span className="truncate">{poolVoting.voting_total_down}</span>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-center w-full text-white">
          <TableVotingCountdown
            date={poolVoting.voting_end}
            loading={loading}
            status={poolVotingStatus}
          />
        </div>
      </td>
      <td className="p-2">
        <PoolVotingStatus status={poolVotingStatus} loading={loading} />
      </td>
    </tr>
  );
};

export default PoolsVotingRow;
