import clsx from 'clsx';
import Spinner from '../../../shared/Spinner';

interface Props {
  loading: boolean;
  variant: 'confirm' | 'success';
  modalName: string;
  title: string;
  subTitle?: string | null;
  headContent?: JSX.Element;
  bodyContents: {
    left: JSX.Element;
    right: JSX.Element;
  }[];
  onClose: (...args: any[]) => void;
  handleConfirm?: (...args: any[]) => void;
  cancelText?: string;
  confirmText?: string;
  backText?: string;
  modalIcon?: JSX.Element;
  titleSize?: 'small' | 'medium' | 'large';
  modalSize?: 'normal' | 'large';
  customTitle?: JSX.Element;
  customSubtitle?: JSX.Element;
  customBody?: JSX.Element;
  dense?: boolean;
  preTextFooter?: JSX.Element;
}

const BaseModalV2: React.FC<Props> = ({
  loading,
  variant,
  modalName,
  title,
  subTitle = "You've secured:",
  headContent,
  bodyContents,
  onClose,
  handleConfirm,
  cancelText = 'CANCEL',
  confirmText = 'CONFIRM',
  backText = 'BACK',
  modalIcon,
  titleSize = 'large',
  modalSize = 'normal',
  customTitle,
  customSubtitle,
  customBody,
  dense,
  preTextFooter,
}) => {
  return (
    <div className="relative flex flex-col items-center w-full overflow-hidden rounded-md shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <Spinner size="medium" variant="basic" />
        </div>
      )}

      <div
        className={clsx(
          'flex items-center justify-between w-full p-4 font-medium text-white bg-1C0045',
          {
            'border-b border-20459B': variant === 'confirm',
          },
        )}
      >
        {modalName}
        {modalIcon && <div className="cursor-pointer self-end ml-auto">{modalIcon}</div>}
      </div>
      <div
        className={clsx('w-full bg-1C0045', {
          'px-8': variant === 'success',
        })}
      >
        {customTitle ? (
          customTitle
        ) : title ? (
          variant === 'confirm' ? (
            <h3
              className={clsx('mb-4 text-center text-white max-w-md m-auto', {
                'text-3xl': titleSize === 'large',
                'text-xl': titleSize === 'medium',
                'text-lg': titleSize === 'small',
              })}
            >
              {title}
            </h3>
          ) : (
            <>
              <h3
                className={clsx('mt-2 text-center text-white', {
                  'text-3xl': titleSize === 'large',
                  'text-xl': titleSize === 'medium',
                  'text-lg': titleSize === 'small',
                })}
              >
                {title}
              </h3>
              {subTitle ? (
                <p className="mt-2 mb-6 text-sm font-normal text-center text-white">{subTitle}</p>
              ) : null}
            </>
          )
        ) : null}

        {customSubtitle ? (
          customSubtitle
        ) : loading || headContent ? (
          <div className="flex items-center justify-center p-4 mb-4 text-white">
            {loading ? <div className="w-24 h-5 bg-gray-500 animate-pulse" /> : headContent}
          </div>
        ) : null}

        {customBody ? (
          customBody
        ) : (
          <div className="flex flex-col mb-4">
            {bodyContents.map((ct, index) => (
              <div
                key={index}
                className={clsx('grid grid-cols-2 gap-4 px-4 text-sm text-white', {
                  'py-3': dense,
                  'py-4': !dense,
                  'border-b border-20459B': variant === 'confirm',
                })}
              >
                <div className="flex items-center justify-start w-full">{ct.left}</div>
                <div className="flex items-center justify-end w-full">{ct.right}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between w-full mb-4 px-4">
          {variant === 'confirm' ? (
            <>
              {preTextFooter}
              <button
                className="w-32 h-10 px-4 py-2 text-white rounded-full bg-B91D1D hover:bg-opacity-60"
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full mb-4">
              <button
                className="h-10 px-4 py-2 text-white rounded-full w-52 bg-secondary-500 hover:bg-opacity-60"
                onClick={onClose}
              >
                {backText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseModalV2;
