import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import React, { useEffect } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalProvider } from '../contexts/global';
import { PoolProvider } from '../contexts/pool';
import '../styles/globals.css';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

NProgress.configure({ showSpinner: false });

const WalletConnectionProvider = dynamic<{ children: React.ReactNode }>(
  () =>
    import('../contexts/wallet').then(({ WalletConnectionProvider }) => WalletConnectionProvider),
  {
    ssr: false,
  },
);

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    let routeChangeStart = () => NProgress.start();
    let routeChangeComplete = () => NProgress.done();

    router.events.on('routeChangeStart', routeChangeStart);
    router.events.on('routeChangeComplete', routeChangeComplete);
    router.events.on('routeChangeError', routeChangeComplete);

    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      router.events.off('routeChangeComplete', routeChangeComplete);
      router.events.off('routeChangeError', routeChangeComplete);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <WalletConnectionProvider>
        <WalletModalProvider logo="/icons/apple-touch-icon.png">
          <GlobalProvider>
            <PoolProvider>
              <Component {...pageProps} />
              <ToastContainer
                hideProgressBar
                position="bottom-left"
                limit={2}
                newestOnTop
                closeButton={false}
                autoClose={2000}
                transition={Zoom}
              />
            </PoolProvider>
          </GlobalProvider>
        </WalletModalProvider>
      </WalletConnectionProvider>
    </>
  );
}

export default MyApp;
