import { IPool } from '../../../sdk/pool/interface';

interface Props {
  pool: IPool;
}

const PoolDetailsMainInfo: React.FC<Props> = ({ pool }) => {
  return <div className="text-white">pool details main info</div>;
};

export default PoolDetailsMainInfo;
