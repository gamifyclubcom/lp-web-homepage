import Layout from '../../components/shared/Layout';
import { PageTitle } from '../../shared/enum';

interface Props {}

const PoolsVoting: React.FC<Props> = () => {
  return <Layout title={PageTitle.PoolsVotingPage}>pools voting page</Layout>;
};

export default PoolsVoting;
