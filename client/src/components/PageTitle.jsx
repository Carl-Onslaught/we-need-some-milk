import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getTitle = (pathname) => {
      switch (pathname) {
        case '/':
          return 'Wealth Clicks';
        case '/login':
          return 'Login | Wealth Clicks';
        case '/register':
          return 'Register | Wealth Clicks';
        case '/admin/dashboard':
          return 'Admin Dashboard | Wealth Clicks';
        case '/agent/dashboard':
          return 'Agent Dashboard | Wealth Clicks';
        case '/agent/team':
          return 'My Team | Wealth Clicks';
        case '/agent/withdraw':
          return 'Withdraw | Wealth Clicks';
        case '/agent/settings':
          return 'Settings | Wealth Clicks';
        case '/admin/load-shared-capital':
          return 'Load Shared Capital | Wealth Clicks';
        case '/admin/pending-registrations':
          return 'Pending Registrations | Wealth Clicks';
        case '/admin/earnings-withdrawals':
          return 'Earnings Withdrawals | Wealth Clicks';
        case '/admin/earnings-history':
          return 'Earnings History | Wealth Clicks';
        case '/admin/shared-withdrawal':
          return 'Shared Capital Withdrawals | Wealth Clicks';
        case '/admin/shared-history':
          return 'Shared Capital History | Wealth Clicks';
        case '/admin/settings':
          return 'Admin Settings | Wealth Clicks';
        case '/agent/payment-methods':
          return 'Payment Methods | Wealth Clicks';
        default:
          return 'Wealth Clicks';
      }
    };

    document.title = getTitle(location.pathname);
  }, [location]);

  return null;
};

export default PageTitle;
