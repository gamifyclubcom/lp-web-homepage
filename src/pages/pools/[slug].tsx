import Layout from '../../components/shared/Layout';
import { PageTitle } from '../../shared/enum';

interface Props {}

const PoolDetails: React.FC<Props> = () => {
  return <Layout title={PageTitle.PoolsPage + 'Pool name'}>pools details page</Layout>;
};

export default PoolDetails;
