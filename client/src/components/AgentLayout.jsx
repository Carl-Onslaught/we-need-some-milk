import {
  Box,
  VStack,
  Heading,
  Icon,
  Button,
  Link,
  Grid,
  Flex,
  IconButton,
  Drawer,
  DrawerContent,
  useDisclosure,
  CloseButton,
  useColorModeValue,
  Text,
  Spacer
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaWallet, FaCog, FaCreditCard } from 'react-icons/fa';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const SidebarContent = ({ onClose = null }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <VStack spacing={4} align="stretch" bg="#181E20" p={4} h="full">
      <Flex alignItems="center" justify="space-between" mb={6}>
        <Heading size="lg" color="white" letterSpacing="tight">
          AGENT
        </Heading>
        {onClose && (
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onClose}
            variant="ghost"
            color="white"
            icon={<FiX size={20} />}
            _hover={{
              bg: '#1E2528',
            }}
          />
        )}
      </Flex>
      
      <SidebarButton icon={FaChartLine} to="/agent">
        Dashboard
      </SidebarButton>
      <SidebarButton icon={FaUsers} to="/agent/team">
        My Team
      </SidebarButton>
      <SidebarButton icon={FaCreditCard} to="/agent/payment-methods">
        Mode of Payment
      </SidebarButton>
      <SidebarButton icon={FaWallet} to="/agent/withdraw">
        Withdraw
      </SidebarButton>
      <SidebarButton icon={FaCog} to="/agent/settings">
        Settings
      </SidebarButton>
      
      <Spacer />

      <Button
        leftIcon={<FiLogOut />}
        bg="transparent"
        color="white"
        width="full"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        fontWeight="normal"
        borderRadius="lg"
        py={3}
        px={4}
        _hover={{
          bg: 'red.600',
          color: 'white',
        }}
        transition="all 0.2s"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </VStack>
  );
};

const SidebarButton = ({ icon, children, to }) => {
  const buttonBg = '#FDB137';
  const hoverBg = '#BD5301';
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full"
    >
      <Button
        leftIcon={<Icon as={icon} boxSize="20px" />}
        bg={isActive ? '#FDB137' : 'transparent'}
        color={isActive ? 'black' : 'white'}
        _hover={{
          bg: '#BD5301',
          color: 'white'
        }}
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        fontSize="md"
        fontWeight="medium"
        h="48px"
        transition="all 0.2s"
      >
        {children}
      </Button>
    </Link>
  );
};

export default function AgentLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="#181E20" position="relative">
      {/* Mobile nav - Hamburger Menu */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        p={4}
        position="sticky"
        top={0}
        bg="#181E20"
        zIndex={20}
        borderBottom="1px"
        borderColor="gray.700"
      >
        <IconButton
          onClick={onOpen}
          variant="ghost"
          aria-label="open menu"
          icon={<FiMenu size={24} />}
          color="white"
          _hover={{
            bg: '#1E2528',
          }}
          _active={{
            bg: '#1E2528',
          }}
        />
      </Flex>

      {/* Sidebar - desktop */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w={60}
        pos="fixed"
        h="full"
        bg="#181E20"
        borderRight="1px"
        borderColor="gray.700"
        p={4}
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
        <DrawerContent bg="#181E20">
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
        bg="#181E20"
        minH="100vh"
      >
        {children}
      </Box>
    </Box>
  );
}
