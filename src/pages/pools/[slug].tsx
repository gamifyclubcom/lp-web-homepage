import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import DetailsMainInfo from '../../components/shared/pool/DetailsMainInfo';
import PoolRounds from '../../components/pool/pool-details/PoolRounds';
import PoolSwapAction from '../../components/pool/pool-details/PoolSwapAction';
import PoolSwapInfo from '../../components/pool/pool-details/PoolSwapInfo';
import SecuredAllocation from '../../components/pool/pool-details/SecuredAllocation';
import Layout from '../../components/shared/Layout';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DetailsLeadingInfo from '../../components/shared/pool/DetailsLeadingInfo';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import useSmartContract from '../../hooks/useSmartContract';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePool } from '../../sdk/pool/interface';
import { PageTitle, PoolStatusType } from '../../shared/enum';
import { FETCH_INTERVAL, TOKEN_TO_DECIMALS } from '../../utils/constants';
import PoolUserWhitelist from '../../components/pool/pool-details/PoolUserWhitelist';
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
  const { connected, publicKey } = useWallet();
  const { now } = useGlobal();
  const { refreshAllocation, getUserAllocationLevel, getParticipantAddress } = useSmartContract();
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
  const [joinPoolDates, setJoinPoolDates] = useState<string[]>([]);
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
  const allowContribute = useMemo(() => {
    return status.type === PoolStatusType.OPEN && progress < 100;
  }, [progress, status.type]);

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

  const isShowPoolSwapActionSection = useMemo(() => {
    return status.type !== PoolStatusType.UPCOMING && status.type !== PoolStatusType.CLOSED;
  }, [status.type]);
  const isShowPoolClaimSection = useMemo(() => {
    return pool.is_active && moment.unix(now).isAfter(pool.claim_at);
  }, [now, pool.claim_at, pool.is_active]);
  const isShowPoolRoundSection = useMemo(() => {
    return status.type !== PoolStatusType.UPCOMING;
  }, [status.type]);

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
      await fetchPool();
    };

    init();

    const interval = setInterval(() => {
      fetchPool();
    }, FETCH_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        setFetching(true);
        try {
          const userJoinPoolHistory = await poolAPI.getUserJoinPoolHistory(
            publicKey.toString(),
            pool.contract_address.toString(),
          );
          setJoinPoolDates(userJoinPoolHistory);

          setFetching(false);
        } catch (err) {
          setFetching(false);
        }
      }
    };

    init();
  }, [pool.contract_address, publicKey]);

  useEffect(() => {
    const initParticipantAddress = async () => {
      if (!participantAddress && connected) {
        const { exists, accountDataWithSeed } = await getParticipantAddress(
          new PublicKey(pool.contract_address),
        );
        if (exists) {
          setParticipantAddress(accountDataWithSeed.toString());
        }
      }
    };

    initParticipantAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantAddress, connected]);

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

      <div className="mx-auto md:px-12 layout-container">
        <div className="pt-12">
          <div className="mb-3.5 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <DetailsLeadingInfo
              name={pool.name}
              tokenAddress={pool.token_address}
              tagLine={pool.tag_line}
              medium={pool.medium}
              telegram={pool.telegram}
              twitter={pool.twitter}
              image={pool.logo}
              description={pool.description}
            />
            <PoolUserWhitelist
              connected={connected}
              allocationLevel={allocationLevel}
              pool={pool}
              participantAddress={participantAddress}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 lg:col-span-1">
              <div className="w-full overflow-hidden rounded-lg bg-303035">
                <PoolSwapInfo
                  totalRaise={pool.token_total_raise}
                  participants={participants}
                  swapProgress={progress}
                  currentSwap={tokenCurrentRaise}
                  mintTokenFrom={pool.token_to}
                  mintTokenTo={pool.token_symbol}
                  tokenRatio={pool.token_ratio}
                  status={status}
                  loading={fetching}
                />
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1">
              {isShowPoolRoundSection && (
                <div className="w-full h-full overflow-hidden rounded-lg bg-303035">
                  <PoolRounds pool={pool} loading={fetching} allowContribute={allowContribute} />
                </div>
              )}
            </div>
            <div className="col-span-2">
              {isShowPoolSwapActionSection && (
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
                    currentSwap={tokenCurrentRaise}
                    joinPoolDates={joinPoolDates}
                    allowContribute={allowContribute}
                    setSpinning={setSpinning}
                    setIsClaimed={setIsClaimed}
                    setAllocation={setAllocation}
                    setParticipants={setParticipants}
                    setProgress={setProgress}
                    setTokenCurrentRaise={setTokenCurrentRaise}
                    setMaxContributeSize={setMaxContributeSize}
                    setJoinPoolDates={setJoinPoolDates}
                  />
                </div>
              )}
            </div>
            <div className="col-span-2">
              {isShowPoolClaimSection && (
                <div className="w-full overflow-hidden rounded-lg bg-303035">
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
              )}
            </div>
          </div>
        </div>

        <div className="pb-8 mt-2">
          <div className="w-full h-full overflow-hidden rounded-lg bg-303035">
            <DetailsMainInfo pool={pool} />
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
