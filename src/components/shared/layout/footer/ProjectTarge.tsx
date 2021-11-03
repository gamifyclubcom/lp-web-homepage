interface Props {
  title: string;
  descriptions: string[];
}

const ProjectTarget: React.FC<Props> = ({ title, descriptions }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-start">
        <div className="w-full mb-2">
          <span className="text-sm text-primary-300">{title}</span>
        </div>

        <ul className="flex flex-col w-full">
          {descriptions.map((des, index) => (
            <li key={`${des}__${index}`} className="mb-1 text-xs font-light text-white">
              {des}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectTarget;
