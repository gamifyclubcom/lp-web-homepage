interface Props {
  name: string;
  description: string;
  image?: string;
  redirectLink?: string;
}

const ProductItem: React.FC<Props> = ({ name, description, image, redirectLink }) => {
  const handleItemClick = () => {
    if (redirectLink) {
      window.open(redirectLink, '_blank');
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative flex flex-col h-full p-4 overflow-hidden bg-center rounded-lg cursor-pointer bg-primary-400"
        style={{
          backgroundImage: `url(${image})`,
        }}
        onClick={handleItemClick}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <span className="mb-4 text-sm text-white uppercase">{name}</span>

        <span className="text-xs text-white">{description}</span>
      </div>
    </div>
  );
};

export default ProductItem;
