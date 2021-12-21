import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import PoolRounds from '../../components/pool/pool-details/PoolRounds';
import PoolSwapAction from '../../components/pool/pool-details/PoolSwapAction';
import PoolSwapInfo from '../../components/pool/pool-details/PoolSwapInfo';
import PoolUserWhitelist from '../../components/pool/pool-details/PoolUserWhitelist';
import SecuredAllocation from '../../components/pool/pool-details/SecuredAllocation';
import Layout from '../../components/shared/Layout';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DetailsLeadingInfo from '../../components/shared/pool/DetailsLeadingInfo';
import DetailsMainInfo from '../../components/shared/pool/DetailsMainInfo';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import useSmartContract from '../../hooks/useSmartContract';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePool } from '../../sdk/pool/interface';
import { PageTitle, PoolStatusType } from '../../shared/enum';
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
  const { connected, publicKey } = useWallet();
  const { now } = useGlobal();
  const {
    refreshAllocation,
    getUserAllocationLevel,
    getParticipantAddress,
    getUserMaxContributeSize,
  } = useSmartContract();
  const { getPoolFullInfo, getMaxIndividualAllocationForStaker } = usePool();
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
  }, [now, pool.is_active, pool.join_pool_end, pool.join_pool_start, pool.start_date, progress]);

  const allowContribute = useMemo(() => {
    return status.type === PoolStatusType.OPEN && progress < 100;
  }, [progress, status.type]);

  const maxContribution = useMemo(() => {
    const { totalStaker, individualStaker } = getMaxIndividualAllocationForStaker(
      pool,
      allocationLevel,
      true,
    );
    let maxContributionInTokenUnit: number = pool.campaign.public_phase.max_individual_alloc;

    if (!connected) {
      maxContributionInTokenUnit = pool.campaign.public_phase.max_individual_alloc;
    } else if (isInWhitelistRound(pool, now)) {
      if (Boolean(participantAddress)) {
        maxContributionInTokenUnit = pool.campaign.early_join_phase.max_individual_alloc;
      } else {
        maxContributionInTokenUnit = 0;
      }
    } else if (isInFCFSForStakerRound(pool, now)) {
      if (allocationLevel > 0) {
        maxContributionInTokenUnit = totalStaker;
      } else {
        maxContributionInTokenUnit = 0;
      }
    } else if (isInExclusiveRound(pool, now)) {
      maxContributionInTokenUnit = individualStaker;
    }

    return parseFloat(
      new Decimal(
        // fakeWithClaimablePercentage(maxContributionInTokenUnit, pool.claimable_percentage),
        maxContributionInTokenUnit,
      )
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationLevel, connected, now, participantAddress]);

  const currentContribution = useMemo(() => {
    const realContributionInSOL = parseFloat(
      new Decimal(allocation || 0).dividedBy(pool.token_ratio).toFixed(TOKEN_TO_DECIMALS),
    );
    return realContributionInSOL;

    // return fakeWithClaimablePercentage(realContributionInSOL, pool.claimable_percentage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocation, pool.token_ratio, pool.claimable_percentage]);

  const isShowPoolSwapActionSection = useMemo(() => {
    return status.type !== PoolStatusType.UPCOMING && status.type !== PoolStatusType.CLOSED;
  }, [status.type]);
  const isShowPoolClaimSection = useMemo(() => {
    return pool.is_active && moment.unix(now).isAfter(pool.join_pool_end);
  }, [now, pool.is_active, pool.join_pool_end]);
  const isShowPoolRoundSection = useMemo(() => {
    return true;
  }, []);
  const isShowPoolUserWhitelist = useMemo(() => {
    return pool.is_active;
  }, [pool.is_active]);

  const guaranteedAllocationExclusiveRound = useMemo(() => {
    let result: number = 0;
    if (isInExclusiveRound(pool, now)) {
      const { individualStaker } = getMaxIndividualAllocationForStaker(pool, allocationLevel, true);
      result = individualStaker;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel, now]);

  useEffect(() => {
    const init = async () => {
      setFetching(true);

      try {
        await fetchPool();
      } catch (err) {
        console.log({ err });
      } finally {
        setFetching(false);
      }
    };

    init();

    const interval = setInterval(() => {
      fetchPool();
    }, FETCH_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClaimed && publicKey) {
      poolAPI
        .userGetClaimedTokenTime(publicKey.toString(), pool.contract_address, pool.token_address)
        .then((data) => {
          if (data) {
            setUserClaimedAt(data);
          }
        });
    }
  }, [isClaimed, pool.contract_address, pool.token_address, publicKey]);

  useEffect(() => {
    const init = async () => {
      setSpinning(true);
      if (publicKey) {
        try {
          const userJoinPoolHistory = await poolAPI.getUserJoinPoolHistory(
            publicKey.toString(),
            pool.contract_address.toString(),
          );
          setJoinPoolDates(userJoinPoolHistory);
        } catch (err) {
          console.log({ err });
        } finally {
          setSpinning(false);
        }
      } else {
        setSpinning(false);
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
        setIsClaimed(false);
      } else {
        setSpinning(true);
        try {
          const { allocation: allocationResult, amountToken: amountTokenResult } =
            await refreshAllocation(pool);
          if (allocationResult && allocationResult > 0 && amountTokenResult === 0) {
            setIsClaimed(true);
          }

          const allocationLevelResult = await getUserAllocationLevel(pool);

          setAllocation(allocationResult);
          setAllocationLevel(allocationLevelResult);
          setSpinning(false);
        } catch (err) {
          setAllocation(null);
          setAllocationLevel(0);
          setSpinning(false);
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

  const refresh = async () => {
    setSpinning(true);
    try {
      await fetchPool();
      const newMaxContributeSize = await getUserMaxContributeSize(pool, allocationLevel);
      setMaxContributeSize(new Decimal(newMaxContributeSize));
    } catch (err) {
      console.log({ err });
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Layout title={PageTitle.PoolsPage + ' | ' + pool.name}>
      <LoadingScreen loading={fetching || spinning} />
      {/* <LoadingScreen loading={false} /> */}

      <div className="mx-auto md:px-12 layout-container">
        <div className="pt-12">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 lg:col-span-1">
              <div className="w-full h-full">
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
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1">
              {isShowPoolUserWhitelist && (
                <div className="w-full min-h-115p">
                  <PoolUserWhitelist
                    connected={connected}
                    allocationLevel={allocationLevel}
                    pool={pool}
                    participantAddress={participantAddress}
                    status={status}
                    loading={fetching || spinning}
                  />
                </div>
              )}
            </div>

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
                  loading={fetching || spinning}
                />
              </div>
            </div>
            {isShowPoolRoundSection && (
              <div className="col-span-2 lg:col-span-1">
                <div className="w-full h-full overflow-hidden rounded-lg bg-303035">
                  <PoolRounds
                    pool={pool}
                    loading={fetching || spinning}
                    allowContribute={allowContribute}
                    alreadyContribute={Boolean(allocation && allocation > 0)}
                    refreshData={refresh}
                  />
                </div>
              </div>
            )}
            {isShowPoolSwapActionSection && (
              <div className="col-span-2">
                <div className="w-full overflow-hidden rounded-lg bg-303035">
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
              </div>
            )}
            {isShowPoolClaimSection && (
              <div className="col-span-2">
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
              </div>
            )}

            <div className="col-span-2 mb-8">
              <div className="w-full h-full overflow-hidden rounded-lg bg-303035">
                <DetailsMainInfo
                  participantAddress={participantAddress}
                  pool={pool}
                  allocationLevel={allocationLevel}
                />
              </div>
            </div>
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
