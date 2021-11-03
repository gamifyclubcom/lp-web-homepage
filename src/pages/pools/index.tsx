import Layout from '../../components/shared/Layout';
import { PageTitle } from '../../shared/enum';

interface Props {}

const Pools: React.FC<Props> = () => {
  return <Layout title={PageTitle.PoolsPage}>pools page</Layout>;
};

export default Pools;
