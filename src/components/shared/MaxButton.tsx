interface Props {
  onClick: () => Promise<void>;
  isDisabled: boolean;
}

const MaxButton: React.FC<Props> = ({ isDisabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="absolute px-2 py-1 text-xs font-semibold text-white uppercase transform -translate-y-1/2 rounded-md shadow-lg bg-secondary-300 right-2 top-1/2"
    >
      max
    </button>
  );
};

export default MaxButton;
