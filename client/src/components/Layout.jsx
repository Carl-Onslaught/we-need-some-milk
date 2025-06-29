import { Box, Container, Flex, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MotionBox = motion(Box);

const Layout = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const containerBg = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box
          as={MotionBox}
          flex="1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          p={4}
        >
          <Container
            maxW="container.xl"
            bg={containerBg}
            borderRadius="xl"
            boxShadow="lg"
            p={6}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
