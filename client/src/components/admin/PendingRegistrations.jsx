import {
  Box,
  Card,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  useToast,
  Text
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PendingRegistrations() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get('/api/admin/pending-registrations');
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending registrations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleApproval = async (userId, action) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/admin/approve-registration/${userId}`, { action });
      toast({
        title: 'Success',
        description: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process registration',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    // Refresh every minute
    const interval = setInterval(fetchPendingUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardBody>
        <Heading size="md" mb={4}>Pending Registrations</Heading>
        
        {pendingUsers.length === 0 ? (
          <Text color="gray.500">No pending registrations</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Registration Date</Th>
                  <Th>Referral Code</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pendingUsers.map((user) => (
                  <Tr key={user._id}>
                    <Td>{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>{user.referralCode}</Td>
                    <Td>
                      <Badge colorScheme="yellow">Pending</Badge>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="green"
                        mr={2}
                        isLoading={isLoading}
                        onClick={() => handleApproval(user._id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        isLoading={isLoading}
                        onClick={() => handleApproval(user._id, 'reject')}
                      >
                        Reject
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
    </Card>
  );
} 