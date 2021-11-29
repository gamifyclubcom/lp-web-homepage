interface Props {
  title: string;
}

const PoolCardTitle: React.FC<Props> = ({ title }) => {
  return <h2 className="text-base text-white uppercase">{title}</h2>;
};

export default PoolCardTitle;
