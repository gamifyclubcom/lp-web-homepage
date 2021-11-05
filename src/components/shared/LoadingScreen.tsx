import Spinner from './Spinner';

interface Props {
  loading: boolean;
}

const LoadingScreen: React.FC<Props> = ({ loading = false }) => {
  return (
    <>
      {loading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75'>
          <Spinner size='large' variant='basic' />
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
