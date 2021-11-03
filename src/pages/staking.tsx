import Layout from '../components/shared/Layout';
import { PageTitle } from '../shared/enum';

interface Props {}

const Staking: React.FC<Props> = () => {
  return <Layout title={PageTitle.StakingPage}>staking page</Layout>;
};

export default Staking;
