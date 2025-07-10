import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

function UserDashboard() {
  const { user } = useAuth();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Welcome, {user?.username}!</Heading>
          <Text color="gray.600">Your personal dashboard</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Balance</StatLabel>
              <StatNumber>₱{user?.balance || 0}</StatNumber>
              <StatHelpText>Available funds</StatHelpText>
            </Stat>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Referral Code</StatLabel>
              <StatNumber fontSize="2xl">{user?.referralCode || 'N/A'}</StatNumber>
              <StatHelpText>Share with friends</StatHelpText>
            </Stat>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Referral Earnings</StatLabel>
              <StatNumber>₱{user?.referralEarnings?.total || 0}</StatNumber>
              <StatHelpText>Total earnings from referrals</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Additional sections can be added here */}
      </VStack>
    </Container>
  );
}

export default UserDashboard; 