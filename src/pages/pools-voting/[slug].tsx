import Layout from '../../components/shared/Layout';
import { PageTitle } from '../../shared/enum';

interface Props {}

const PoolsVotingDetails: React.FC<Props> = () => {
  return <Layout title={PageTitle.PoolsVotingPage + 'Pool name'}>pools voting details page</Layout>;
};

export default PoolsVotingDetails;
