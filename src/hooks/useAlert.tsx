import { toast } from 'react-toastify';

export function useAlert() {
  const alertSuccess = (message: string) => {
    toast.success(
      <div className="flex items-start">
        <span className="text-sm">{message}</span>
      </div>,
    );
  };

  const alertError = (message: string) => {
    toast.error(
      <div className="flex items-start">
        <span className="text-sm">{message}</span>
      </div>,
    );
  };

  const alertInfo = (message: string) => {
    toast.info(
      <div className="flex items-start">
        <span className="text-sm">{message}</span>
      </div>,
    );
  };

  const alertWarning = (message: string) => {
    toast.warning(
      <div className="flex items-start">
        <span className="text-sm">{message}</span>
      </div>,
    );
  };

  return {
    alertSuccess,
    alertError,
    alertInfo,
    alertWarning,
  };
}
