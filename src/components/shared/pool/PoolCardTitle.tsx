interface Props {
  title: string;
}

const PoolCardTitle: React.FC<Props> = ({ title }) => {
  return <h2 className="text-xl font-semibold text-white uppercase opacity-30">{title}</h2>;
};

export default PoolCardTitle;
