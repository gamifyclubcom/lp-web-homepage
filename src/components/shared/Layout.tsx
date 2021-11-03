import Head from 'next/head';
import { PageTitle } from '../../shared/enum';
import Footer from './layout/footer';
import Header from './layout/header';

interface Props {
  title?: string;
}

const Layout: React.FC<Props> = ({ title = PageTitle.HomePage, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="mx-auto layout-container">{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
