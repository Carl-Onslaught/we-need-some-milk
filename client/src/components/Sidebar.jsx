import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUsers, FiSettings, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

const MenuItem = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg = '#FDB137';
  const activeColor = '#181E20';
  const hoverBg = '#BD5301';

  return (
    <MotionBox
      as={RouterLink}
      to={to}
      w="full"
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : undefined}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        role="group"
        cursor="pointer"
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
          color="#FDB137"
        />
        <Text fontSize="sm" fontWeight="medium">
          {children}
        </Text>
      </Flex>
    </MotionBox>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const bgColor = '#242C2E';
  const borderColor = '#181E20';

  return (
    <Box
      as={MotionBox}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="calc(100vh - 4rem)"
      top="4rem"
    >
      <VStack spacing={2} align="stretch" pt={5}>
        <MenuItem icon={FiHome} to="/">
          Dashboard
        </MenuItem>
        <MenuItem icon={FiTrendingUp} to="/investments">
          Investments
        </MenuItem>
        <MenuItem icon={FiDollarSign} to="/earnings">
          Earnings
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem icon={FiUsers} to="/users">
            Users
          </MenuItem>
        )}
        <MenuItem icon={FiSettings} to="/settings">
          Settings
        </MenuItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;
