import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AuthModal from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
  /** When true, the top navigation bar is not rendered (e.g. for /portal/circle). */
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNavigation }) => {
  return (
    <>
      {!hideNavigation && <Navigation />}
      <main className={hideNavigation ? 'main-content main-content--no-nav' : 'main-content'}>{children}</main>
      <Footer />
      <AuthModal />
    </>
  );
};

export default Layout;
