import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import AdminLayout from '../../components/AdminLayout';
import EarningHistory from '../../components/admin/EarningHistory';

const EarningHistoryPage = () => {
  return (
    <AdminLayout>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="white">
              Earning History
            </Heading>
            <Text color="hsl(220, 14%, 70%)">
              View and manage all agent withdrawal requests
            </Text>
          </VStack>
          <EarningHistory />
        </VStack>
      </Container>
    </AdminLayout>
  );
};

export default EarningHistoryPage; 