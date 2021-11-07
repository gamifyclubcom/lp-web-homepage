import Decimal from 'decimal.js';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import PoolVotingAction from '../../components/pool/pool-voting-details/PoolVotingAction';
import PoolVotingInfo from '../../components/pool/pool-voting-details/PoolVotingInfo';
import Layout from '../../components/shared/Layout';
import LoadingScreen from '../../components/shared/LoadingScreen';
import DetailsLeadingInfo from '../../components/shared/pool/DetailsLeadingInfo';
import DetailsMainInfo from '../../components/shared/pool/DetailsMainInfo';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import { mappingPoolVotingServerResponse, poolAPI } from '../../sdk/pool';
import { IPoolVoting, ServerResponsePoolVoting } from '../../sdk/pool/interface';
import { PageTitle } from '../../shared/enum';
import { FETCH_INTERVAL } from '../../utils/constants';
import { getPoolVotingStatus } from '../../utils/helper';

interface Props {
  poolVotingServer: ServerResponsePoolVoting;
}

const PoolsVotingDetails: React.FC<Props> = ({ poolVotingServer }) => {
  const { now } = useGlobal();
  const { getPoolVotingFullInfo } = usePool();
  const [poolVoting, setPoolVoting] = useState<IPoolVoting>(() => {
    return mappingPoolVotingServerResponse(poolVotingServer, now);
  });
  const [progress, setProgress] = useState(poolVoting.voting_progress);
  const [fetching, setFetching] = useState(true);

  const currentVoting = useMemo(() => {
    if (poolVoting.voting_total_up > poolVoting.voting_total_down) {
      return poolVoting.voting_total_up - poolVoting.voting_total_down;
    }

    return 0;
  }, [poolVoting.voting_total_up, poolVoting.voting_total_down]);

  const poolVotingStatus = useMemo(() => {
    return getPoolVotingStatus(poolVoting, now);
  }, [poolVoting, now]);

  const remainVoteForActive = useMemo(() => {
    const result = new Decimal(poolVoting.voting_min_can_active)
      .plus(poolVoting.voting_total_down)
      .minus(poolVoting.voting_total_up)
      .toNumber();

    if (result < 0) {
      return 0;
    }

    return result;
  }, [poolVoting.voting_min_can_active, poolVoting.voting_total_up, poolVoting.voting_total_down]);

  useEffect(() => {
    const init = async () => {
      await fetchPoolVoting();
      setFetching(false);
    };

    init();

    const interval = setInterval(() => {
      fetchPoolVoting();
    }, FETCH_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPoolVoting = async () => {
    const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
    setPoolVoting(poolVotingFullInfo);
    setProgress((prev) => Decimal.max(poolVotingFullInfo.voting_progress, prev).toNumber());

    return Promise.resolve();
  };

  return (
    <Layout title={PageTitle.PoolsVotingPage + ' | ' + poolVoting.name}>
      <LoadingScreen loading={fetching} />

      <div className="mx-auto layout-container">
        <div className="pt-24">
          <div className="mb-8">
            <DetailsLeadingInfo
              name={poolVoting.name}
              tokenAddress={poolVoting.token_address}
              tagLine={poolVoting.tag_line}
              medium={poolVoting.medium}
              telegram={poolVoting.telegram}
              twitter={poolVoting.twitter}
              image={poolVoting.logo}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-1">
            <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
              <PoolVotingInfo
                status={poolVotingStatus}
                loading={fetching}
                joinPoolStart={poolVoting.join_pool_start}
                totalVote={poolVoting.voting_min_can_active}
                currentVote={currentVoting}
                absoluteVote={poolVoting.voting_absolute_vote}
                remainVoteForActive={remainVoteForActive}
                votingProgress={progress}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="w-full overflow-hidden bg-gray-800 rounded-lg">
              <PoolVotingAction
                poolVoting={poolVoting}
                initLoading={fetching}
                setPoolVoting={setPoolVoting}
                setProgress={setProgress}
              />
            </div>
          </div>
        </div>

        <div className="pb-8 mt-4">
          <div className="w-full h-full overflow-hidden bg-gray-800 rounded-lg">
            <DetailsMainInfo pool={poolVoting} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params!.slug as string;
  const poolVoting = await poolAPI.getPoolVotingBySlug(slug);

  if (!poolVoting) {
    return { redirect: { destination: '/not-found', permanent: false } };
  }

  return {
    props: { poolVotingServer: poolVoting },
  };
};

export default PoolsVotingDetails;
