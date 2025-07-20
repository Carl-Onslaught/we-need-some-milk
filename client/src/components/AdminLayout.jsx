import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  IconButton,
  Drawer,
  DrawerContent,
  useDisclosure,
  Link,
  Icon,
  Button,
  useColorMode,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaHistory, 
  FaCog,
  FaChartLine,
  FaHandHoldingUsd,
  FaExchangeAlt,
  FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SidebarContent = ({ onClose, ...rest }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const LinkItems = [
    { name: 'Dashboard', icon: FaChartLine, href: '/admin' },
    { name: 'Pending Registration', icon: FaUsers, href: '/admin/pending-registration' },
    { name: 'Load Shared Capital', icon: FaMoneyBillWave, href: '/admin/load-shared-capital' },
    { name: 'Earnings & Withdrawals', icon: FaMoneyBillWave, href: '/admin/earnings-withdrawals' },
    { name: 'Shared Capital Withdrawal', icon: FaExchangeAlt, href: '/admin/shared-withdrawal' },
    { name: 'All Users', icon: FaClipboardList, href: '/admin/all-users' },
    { name: 'Settings', icon: FaCog, href: '/admin/settings' },
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Box
      bg="#242C2E"
      borderRight="1px"
      borderRightColor="#181E20"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Admin
        </Text>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          variant="ghost"
          aria-label="close menu"
          icon={<FiX />}
          color="white"
          _hover={{ bg: '#BD5301' }}
        />
      </Flex>
      <VStack spacing={2} align="stretch" height="calc(100vh - 80px)" overflowY="auto">
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            href={link.href}
            onClose={onClose}
            isMobile={isMobile}
          >
            {link.name}
          </NavItem>
        ))}
        <NavItem
          icon={FiLogOut}
          onClick={handleLogout}
          asButton
          onClose={onClose}
          isMobile={isMobile}
        >
          Logout
        </NavItem>
      </VStack>
    </Box>
  );
};

const NavItem = ({ icon, children, href, onClick, asButton, onClose, isMobile, ...rest }) => {
  const handleNav = (e) => {
    if (isMobile && onClose) onClose();
    if (onClick) onClick(e);
  };
  if (asButton) {
    return (
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        color="white"
        transition="all 0.2s"
        _hover={{
          bg: 'red.600',
          color: 'white',
        }}
        onClick={handleNav}
        style={{ userSelect: 'none' }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color="#FDB137"
          />
        )}
        {children}
      </Flex>
    );
  }
  return (
    <Link
      as={RouterLink}
      to={href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      onClick={handleNav}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        color="white"
        transition="all 0.2s"
        _hover={{
          bg: '#BD5301',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color="#FDB137"
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <Box minH="100vh" bg="#242C2E" position="relative">
      {/* Mobile nav - Hamburger Menu */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        p={4}
        position="sticky"
        top={0}
        bg="#242C2E"
        zIndex={20}
        borderBottom="1px"
        borderColor="#181E20"
      >
        <IconButton
          onClick={onOpen}
          variant="ghost"
          aria-label="open menu"
          icon={<FiMenu size={24} />}
          color="white"
          _hover={{
            bg: '#BD5301',
          }}
          _active={{
            bg: '#242C2E',
          }}
        />
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="white"
          ml={4}
        >
          Admin Dashboard
        </Text>
      </Flex>

      {/* Sidebar - desktop */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w={60}
        pos="fixed"
        h="full"
        bg="#242C2E"
        borderRight="1px"
        borderColor="#181E20"
      >
        <SidebarContent />
      </Box>

      {/* Drawer - mobile */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent bg="#242C2E">
          <Box p={4}>
            <SidebarContent onClose={onClose} />
          </Box>
        </DrawerContent>
      </Drawer>
      
      {/* Main content */}
      <Box 
        ml={{ base: 0, md: 60 }} 
        p={4}
        mt={{ base: 0, md: 0 }}
      >
        {children}
      </Box>
    </Box>
  );
}
