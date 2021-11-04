import moment from 'moment';
import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import PoolDetailsMainInfo from '../../components/pool/pool-details/PoolDetailsMainInfo';
import PoolLeadingInfo from '../../components/pool/pool-details/PoolLeadingInfo';
import PoolRounds from '../../components/pool/pool-details/PoolRounds';
import PoolSwapAction from '../../components/pool/pool-details/PoolSwapAction';
import PoolSwapInfo from '../../components/pool/pool-details/PoolSwapInfo';
import Layout from '../../components/shared/Layout';
import { useGlobal } from '../../hooks/useGlobal';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePool } from '../../sdk/pool/interface';
import { PageTitle } from '../../shared/enum';
import { getPoolStatus } from '../../utils/helper';

interface Props {
  poolServer: ServerResponsePool;
}

const PoolDetails: React.FC<Props> = ({ poolServer }) => {
  const { now } = useGlobal();
  const [pool, setPool] = useState(() => mappingPoolServerResponse(poolServer, now));
  const [progress, setProgress] = useState(pool.progress);
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

  return (
    <Layout title={PageTitle.PoolsPage + ' | ' + pool.name}>
      <div className="mx-auto layout-container">
        <div className="pt-24 pb-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-5">
            <div className="col-span-1 lg:col-span-2 lg:row-span-1">
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

            <div className="col-span-1 lg:row-span-2">
              <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
                <PoolSwapInfo
                  totalRaise={pool.token_total_raise}
                  participants={pool.participants}
                  swapProgress={progress}
                  currentSwap={pool.token_current_raise}
                  mintTokenFrom=""
                  mintTokenTo=""
                  tokenRatio={pool.token_ratio}
                  status={status}
                  loading={false}
                />
              </div>
            </div>

            <div className="col-span-1 lg:row-span-4">
              {!isPoolEnd && (
                <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
                  <PoolRounds pool={pool} whitelistStatus="" disabled={false} />
                </div>
              )}
            </div>

            <div className="col-span-1 lg:row-span-2">
              <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
                <PoolSwapAction
                  contributionLevel={2}
                  guaranteedAllocationExclusiveRound={12}
                  maxAllocation={12}
                  currentContribution={12}
                />
              </div>
            </div>

            {/*  */}
          </div>
        </div>

        <div className="pb-8">
          <div
            className="w-full h-full overflow-hidden bg-gray-800 rounded-lg"
            style={{ height: 500 }}
          >
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
