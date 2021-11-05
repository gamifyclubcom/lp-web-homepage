import { useWallet } from '@solana/wallet-adapter-react';
import Decimal from 'decimal.js';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import PoolDetailsMainInfo from '../../components/pool/pool-details/PoolDetailsMainInfo';
import PoolLeadingInfo from '../../components/pool/pool-details/PoolLeadingInfo';
import PoolRounds from '../../components/pool/pool-details/PoolRounds';
import PoolSwapAction from '../../components/pool/pool-details/PoolSwapAction';
import PoolSwapInfo from '../../components/pool/pool-details/PoolSwapInfo';
import SecuredAllocation from '../../components/pool/pool-details/SecuredAllocation';
import Layout from '../../components/shared/Layout';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import useSmartContract from '../../hooks/useSmartContract';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePool } from '../../sdk/pool/interface';
import { PageTitle } from '../../shared/enum';
import { FETCH_INTERVAL, TOKEN_TO_DECIMALS } from '../../utils/constants';
import {
  getPoolStatus,
  isInExclusiveRound,
  isInFCFSForStakerRound,
  isInWhitelistRound,
} from '../../utils/helper';

interface Props {
  poolServer: ServerResponsePool;
}

const PoolDetails: React.FC<Props> = ({ poolServer }) => {
  const { connected } = useWallet();
  const { now } = useGlobal();
  const { refreshAllocation, getUserAllocationLevel } = useSmartContract();
  const { getPoolFullInfo, getMaxIndividualAllocationFCFSForStaker } = usePool();
  const [fetching, setFetching] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [allocation, setAllocation] = useState<number | null>(0);
  const [allocationLevel, setAllocationLevel] = useState(0);
  const [pool, setPool] = useState(() => mappingPoolServerResponse(poolServer, now));
  const [progress, setProgress] = useState(pool.progress);
  const [participants, setParticipants] = useState(pool.participants);
  const [participantAddress, setParticipantAddress] = useState<string | null>(null);
  const [tokenCurrentRaise, setTokenCurrentRaise] = useState(pool.token_current_raise);
  const [maxContributeSize, setMaxContributeSize] = useState(() => {
    return new Decimal(pool.token_max_contribution_size).dividedBy(pool.token_ratio);
  });
  const [userClaimedAt, setUserClaimedAt] = useState<string | undefined>(undefined);
  const status = useMemo(() => {
    return getPoolStatus({
      start_date: pool.start_date,
      join_pool_start: pool.join_pool_start,
      join_pool_end: pool.join_pool_end,
      is_active: pool.is_active,
      progress: progress,
      now: now,
    });
  }, [now, pool, progress]);

  const isPoolEnd = useMemo(() => {
    return moment.unix(now).isAfter(pool.join_pool_end);
  }, [pool.join_pool_end, now]);

  const maxContribution = useMemo(() => {
    const { totalStaker, individualStaker } = getMaxIndividualAllocationFCFSForStaker(
      pool,
      allocationLevel,
    );
    let maxContributionInTokenUnit: number = pool.campaign.public_phase.max_individual_alloc;

    if (!connected) {
      maxContributionInTokenUnit = pool.campaign.public_phase.max_individual_alloc;
    } else if (isInWhitelistRound(pool, now) && Boolean(participantAddress)) {
      maxContributionInTokenUnit = pool.campaign.early_join_phase.max_individual_alloc;
    } else if (isInFCFSForStakerRound(pool, now)) {
      if (allocationLevel > 0) {
        maxContributionInTokenUnit = individualStaker;
      } else {
        maxContributionInTokenUnit = 0;
      }
    } else if (isInExclusiveRound(pool, now)) {
      maxContributionInTokenUnit = totalStaker;
    }

    return parseFloat(
      new Decimal(maxContributionInTokenUnit)
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationLevel, connected, now, participantAddress]);

  const currentContribution = useMemo(() => {
    return parseFloat(((allocation || 0) / pool.token_ratio).toFixed(TOKEN_TO_DECIMALS));
  }, [allocation, pool.token_ratio]);

  const guaranteedAllocationExclusiveRound = useMemo(() => {
    let result: number = 0;
    if (isInExclusiveRound(pool, now)) {
      const { individualStaker } = getMaxIndividualAllocationFCFSForStaker(pool, allocationLevel);
      result = individualStaker;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel, now]);

  useEffect(() => {
    const init = async () => {
      setFetching(true);
      await fetchPool();
      setFetching(false);
    };

    init();

    const interval = setInterval(() => {
      fetchPool();
    }, FETCH_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchBaseInfo = async () => {
      if (!connected) {
        setAllocation(null);
        setAllocationLevel(0);
      } else {
        try {
          const { allocation: allocationResult } = await refreshAllocation(pool);
          const allocationLevelResult = await getUserAllocationLevel(pool);

          setAllocation(allocationResult);
          setAllocationLevel(allocationLevelResult);
        } catch (err) {
          setAllocation(null);
          setAllocationLevel(0);
        }
      }
    };

    fetchBaseInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const fetchPool = async () => {
    const data = await getPoolFullInfo(pool);
    setPool(data);
    setProgress((prev) => Decimal.max(data.progress, prev).toNumber());
    setTokenCurrentRaise(data.token_current_raise);
    setParticipants(data.participants);

    return Promise.resolve();
  };

  return (
    <Layout title={PageTitle.PoolsPage + ' | ' + pool.name}>
      <LoadingScreen loading={fetching || spinning} />

      <div className="mx-auto layout-container">
        <div className="pt-24">
          <div className="mb-8">
            <PoolLeadingInfo
              name={pool.name}
              tokenAddress={pool.token_address}
              tagLine={pool.tag_line}
              medium={pool.medium}
              telegram={pool.telegram}
              twitter={pool.twitter}
              image={pool.logo}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="w-full mb-4 overflow-hidden bg-gray-800 rounded-lg">
                <PoolSwapInfo
                  totalRaise={pool.token_total_raise}
                  participants={pool.participants}
                  swapProgress={progress}
                  currentSwap={pool.token_current_raise}
                  mintTokenFrom={pool.token_to}
                  mintTokenTo={pool.token_symbol}
                  tokenRatio={pool.token_ratio}
                  status={status}
                  loading={fetching}
                />
              </div>

              <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
                <PoolSwapAction
                  contributionLevel={allocationLevel}
                  guaranteedAllocationExclusiveRound={guaranteedAllocationExclusiveRound}
                  maxAllocation={maxContribution}
                  currentContribution={currentContribution}
                  allocation={allocation || 0}
                  status={status}
                  spinning={spinning}
                  pool={pool}
                  participantAddress={participantAddress}
                  allocationLevel={allocationLevel}
                  maxContributeSize={maxContributeSize.toNumber()}
                  setSpinning={setSpinning}
                  setIsClaimed={setIsClaimed}
                  setAllocation={setAllocation}
                  setParticipants={setParticipants}
                  setProgress={setProgress}
                  setTokenCurrentRaise={setTokenCurrentRaise}
                  setMaxContributeSize={setMaxContributeSize}
                />
              </div>
            </div>

            <div className="flex flex-col">
              {!isPoolEnd && (
                <div className="w-full mb-4 overflow-hidden bg-gray-800 rounded-lg">
                  <PoolRounds pool={pool} whitelistStatus="" disabled={false} />
                </div>
              )}

              <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
                <SecuredAllocation
                  status={status}
                  loading={fetching}
                  isClaimed={isClaimed}
                  userClaimedAt={userClaimedAt}
                  pool={pool}
                  spinning={spinning}
                  userAllocation={allocation}
                  setSpinning={setSpinning}
                  setIsClaimed={setIsClaimed}
                  setParticipants={setParticipants}
                  setProgress={setProgress}
                  setTokenCurrentRaise={setTokenCurrentRaise}
                  setUserClaimedAt={setUserClaimedAt}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pb-8 mt-4">
          <div className="w-full h-full overflow-hidden bg-gray-800 rounded-lg">
            <PoolDetailsMainInfo pool={pool} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params!.slug as string;
  const pool = await poolAPI.getPoolBySlug(slug);

  if (!pool) {
    return { redirect: { destination: '/not-found', permanent: false } };
  }

  return {
    props: { poolServer: pool },
  };
};

export default PoolDetails;
