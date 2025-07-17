import {
  Box,
  VStack,
  Heading,
  Image,
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
import { FaChartLine, FaUsers, FaWallet, FaCog, FaCreditCard, FaFacebook } from 'react-icons/fa';
import Logo2 from '../assets/images/Logo2.png';
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
        <Flex align="center" gap={2}>
          <Image src={Logo2} boxSize="28px" alt="logo" />
          <Heading size="lg" color="white" letterSpacing="tight">
            AGENT
          </Heading>
        </Flex>
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
      <SidebarButton icon={FiLogOut} onClick={handleLogout} asButton>
        Logout
      </SidebarButton>
      
      <Spacer />
    </VStack>
  );
};

const SidebarButton = ({ icon, children, to, onClick, asButton }) => {
  const buttonBg = '#FDB137';
  const hoverBg = '#BD5301';
  const location = useLocation();
  const isActive = to && location.pathname === to;

  if (asButton) {
    return (
      <Button
        leftIcon={<Icon as={icon} boxSize="20px" />}
        bg="transparent"
        color="white"
        _hover={{
          bg: 'red.600',
          color: 'white',
        }}
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        fontSize="md"
        fontWeight="medium"
        h="48px"
        transition="all 0.2s"
        onClick={onClick}
        style={{ userSelect: 'none' }}
      >
        {children}
      </Button>
    );
  }
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
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  // Only show heading on /agent (dashboard)
  const showHeading = location.pathname === '/agent';

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
        {/* Account Heading - only on dashboard, now at the very top of content */}
        {showHeading && (
          <Box mb={8}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              justify={{ base: 'flex-start', md: 'flex-end' }}
              gap={4}
            >
              <Heading color="white" size="md" mb={{ base: 1, md: 0 }} fontFamily="'Montserrat', sans-serif">
                Hello, {user?.username || ''}
              </Heading>
              <Link
                href="https://www.facebook.com/groups/849872732994941/?ref=share&mibextid=NSMWBT"
                isExternal
                style={{ textDecoration: 'none' }}
              >
                <Button
                  size="sm" leftIcon={<Icon as={FaFacebook} boxSize={3} />}
                  bg="#1877F2"
                  color="white"
                  _hover={{ bg: '#145DBF' }}
                  _active={{ bg: '#0E4A99' }}
                >
                  Facebook Group
                </Button>
              </Link>
              <Image src={Logo2} boxSize="56px" ml={{ base: 0, md: 2 }} alt="logo" />
            </Flex>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
