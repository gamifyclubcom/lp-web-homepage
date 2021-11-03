import { AiOutlineWarning } from 'react-icons/ai';
import { CgDanger } from 'react-icons/cg';
import { FaInfoCircle, FaRegCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export function useAlert() {
  const alertSuccess = (message: string) => {
    toast.success(
      <div className='flex items-start'>
        <div className='w-6 h-6 mr-2'>
          <FaRegCheckCircle className='text-xl' />
        </div>
        <span className='text-sm'>{message}</span>
      </div>
    );
  };

  const alertError = (message: string) => {
    toast.error(
      <div className='flex items-start'>
        <div className='w-6 h-6 mr-2'>
          <CgDanger className='text-xl' />
        </div>
        <span className='text-sm'>{message}</span>
      </div>
    );
  };

  const alertInfo = (message: string) => {
    toast.info(
      <div className='flex items-start'>
        <div className='w-6 h-6 mr-2'>
          <FaInfoCircle className='text-xl' />
        </div>
        <span className='text-sm'>{message}</span>
      </div>
    );
  };

  const alertWarning = (message: string) => {
    toast.warning(
      <div className='flex items-start'>
        <div className='w-6 h-6 mr-2'>
          <AiOutlineWarning className='text-xl' />
        </div>
        <span className='text-sm'>{message}</span>
      </div>
    );
  };

  return {
    alertSuccess,
    alertError,
    alertInfo,
    alertWarning,
  };
}
