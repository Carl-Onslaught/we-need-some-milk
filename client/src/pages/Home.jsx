import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  VStack,
  Image,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMoneyBillWave, FaUserFriends, FaChartLine, FaShieldAlt, FaArrowRight, FaFacebook, FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logoGold from '../assets/images/logo_gold_transparent.png';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);
const MotionButton = motion.create(Button);

// Custom background pattern using CSS
const BackgroundPattern = () => (
  <Box
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    zIndex={0}
    opacity={0.1}
    backgroundImage="radial-gradient(circle at 1px 1px, hsl(220, 14%, 70%) 1px, transparent 0)"
    backgroundSize="40px 40px"
    animation="rotate 120s linear infinite"
    sx={{
      '@keyframes rotate': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' }
      }
    }}
  />
);

const Feature = ({ title, text, icon, delay }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Stack
        align={'center'}
        textAlign={'center'}
        p={8}
        borderRadius="lg"
        bg="#242C2E"
        shadow="dark-lg"
        transition="all 0.3s"
        _hover={{ 
          transform: 'translateY(-5px)', 
          shadow: 'xl',
          borderColor: '#FDB137',
        }}
        borderWidth="2px"
        borderColor="#181E20"
      >
        <Flex
          w={16}
          h={16}
          align={'center'}
          justify={'center'}
          rounded={'full'}
          bg="#FDB137"
          mb={4}
          animation="float 3s ease-in-out infinite"
          _hover={{
            animation: 'rotate 2s linear infinite',
            bg: '#BD5301',
          }}
          sx={{
            '@keyframes float': {
              '0%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
              '100%': { transform: 'translateY(0px) rotate(0deg)' }
            },
            '@keyframes rotate': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            }
          }}
        >
          <Icon as={icon} w={8} h={8} color="white" />
        </Flex>
        <Text fontWeight={600} fontSize="lg" mb={2} color="white">{title}</Text>
        <Text color="#E0E0E0" fontSize={'sm'}>{text}</Text>
      </Stack>
    </MotionBox>
  );
};

export default function Home() {
  const bgGradient = useColorModeValue(
    'linear(to-r, brand.primary, brand.400)',
    'linear(to-r, brand.primary, brand.400)'
  );

  return (
    <Box 
      bg="#181E20" 
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      <BackgroundPattern />

      {/* Hero Section */}
      <Box
        position="relative"
        zIndex={1}
        minH={'90vh'}
        overflow="hidden"
      >
        <Container maxW={'7xl'} py={{ base: 20, md: 28 }}>
          <Stack
            align={'center'}
            spacing={{ base: 8, md: 10 }}
            textAlign={'center'}
          >
            <Image
              src={logoGold}
              alt="Wealth Clicks Logo"
              maxW={{ base: '90vw', sm: '500px', md: '600px' }}
              mx="auto"
              mb={2}
              mt={-8}
              draggable={false}
            />
            <Stack spacing={6} direction={'row'}>
              <MotionButton
                as={RouterLink}
                to="/register"
                rounded={'full'}
                px={6}
                py={8}
                size="lg"
                variant="solid"
                bg="#FDB137"
                color="#181E20"
                boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                _hover={{ bg: '#BD5301', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                rightIcon={<FaArrowRight />}
              >
                Get Started
              </MotionButton>
              <MotionButton
                as={RouterLink}
                to="/login"
                rounded={'full'}
                px={6}
                py={8}
                size="lg"
                variant="outline"
                borderColor="#FDB137"
                color="#FDB137"
                _hover={{ bg: '#BD5301', color: 'white', borderColor: '#BD5301', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </MotionButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} position="relative" zIndex={1}>
        <Container maxW={'7xl'}>
          <VStack spacing={4} mb={16} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Heading size="2xl" color="hsl(220, 14%, 90%)">Why Choose Wealth Clicks?</Heading>
            </MotionBox>
            <MotionText
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              color="hsl(220, 14%, 70%)"
              maxW={'3xl'}
            >
              We provide a secure and efficient platform for your investment needs,
              backed by innovative technology and expert support.
            </MotionText>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature
              icon={FaMoneyBillWave}
              title={'Smart Investments'}
              text={'Access diverse investment opportunities tailored to your goals and risk appetite.'}
              delay={0.1}
            />
            <Feature
              icon={FaUserFriends}
              title={'Community Growth'}
              text={'Join a thriving community of investors and learn from shared experiences.'}
              delay={0.2}
            />
            <Feature
              icon={FaChartLine}
              title={'Performance Tracking'}
              text={'Monitor your investments with real-time analytics and comprehensive reporting.'}
              delay={0.3}
            />
            <Feature
              icon={FaShieldAlt}
              title={'Secure Platform'}
              text={'Your investments are protected by state-of-the-art security measures.'}
              delay={0.4}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box 
        as="footer" 
        py={6}
        borderTop="1px"
        borderColor="#2C4A3A"
        position="relative"
        zIndex={1}
      >
        <Container maxW="7xl">
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={{ base: 4, sm: 6 }}
            justify="center"
            align="center"
          >
            <Button
              as="a"
              href="https://www.facebook.com/share/19PmtF48jq/"
              target="_blank"
              rel="noopener noreferrer"
              leftIcon={<Icon as={FaFacebook} boxSize={5} />}
              bg="#FDB137"
              color="#181E20"
              boxShadow="0 2px 8px rgba(0,0,0,0.12)"
              border="none"
              px={6}
              fontSize="md"
              fontWeight="medium"
              _hover={{ bg: '#BD5301', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }}
            >
              Follow us on Facebook
            </Button>
            <Text 
              color="#E0E0E0"
              fontSize="sm"
              fontWeight="medium"
            >
              © {new Date().getFullYear()} Wealth Clicks
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 