interface Props {
  onClick: () => Promise<void>;
  isDisabled: boolean;
}

const MaxButton: React.FC<Props> = ({ isDisabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="absolute px-4 py-1.5 text-xs text-white transform -translate-y-1/2 rounded shadow-lg bg-pool_focus_1 right-2 top-1/2"
    >
      Max
    </button>
  );
};

export default MaxButton;
