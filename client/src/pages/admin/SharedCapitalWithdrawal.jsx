import {
  Box,
  Container,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Card,
  CardBody,
  Text,
  Badge,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

export default function SharedCapitalWithdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get('/api/admin/shared-capital/withdrawals');
      setWithdrawals(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch withdrawal requests',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleWithdrawalAction = async (id, action) => {
    setProcessingId(id);
    setIsLoading(true);
    try {
      await axios.post(`/api/admin/shared-capital/withdrawals/${id}/${action}`);
      
      toast({
        title: 'Success',
        description: `Withdrawal ${action}ed successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchWithdrawals();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${action} withdrawal`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPackageLabel = (packageType) => {
    switch (packageType) {
      case 1:
        return '12 Days';
      case 2:
        return '20 Days';
      default:
        return 'Unknown';
    }
  };

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box mb={4} px={4}>
            <Heading size="lg" mb={1} color="white" textAlign="left">
              Shared Capital Withdrawals
            </Heading>
            <Text color="gray.300" fontSize="md" textAlign="left">
              Manage shared capital withdrawal requests
            </Text>
          </Box>

          <Card boxShadow="lg" borderRadius="lg" p={4}>
            <CardBody p={0}>
              <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                      <Th color="white" textAlign="left">User</Th>
                      <Th color="white" textAlign="left">Package</Th>
                      <Th color="white" textAlign="left">Amount</Th>
                      <Th color="white" textAlign="left">Status</Th>
                      <Th color="white" textAlign="left">Date</Th>
                      <Th color="white" textAlign="left">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {withdrawals.map((withdrawal) => (
                    <Tr key={withdrawal._id}>
                        <Td color="white" verticalAlign="top">
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="bold" fontSize="md">{withdrawal.user.username}</Text>
                            <Text fontSize="sm" color="gray.300">
                            {withdrawal.user.email}
                          </Text>
                        </VStack>
                      </Td>
                        <Td verticalAlign="top">
                        <Tooltip 
                          label={`Package Type ${withdrawal.packageType}`} 
                          hasArrow
                        >
                            <Badge colorScheme="purple" fontSize="sm">
                            {getPackageLabel(withdrawal.packageType)}
                          </Badge>
                        </Tooltip>
                      </Td>
                        <Td color="white" fontWeight="bold" verticalAlign="top">₱{withdrawal.amount.toFixed(2)}</Td>
                        <Td verticalAlign="top">
                          <Badge colorScheme={getStatusColor(withdrawal.status)} fontSize="sm">
                          {withdrawal.status.toUpperCase()}
                        </Badge>
                      </Td>
                        <Td color="white" fontSize="sm" verticalAlign="top">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </Td>
                        <Td verticalAlign="top">
                        {withdrawal.status === 'pending' && (
                          <HStack spacing={2}>
                            <Tooltip label="Approve Withdrawal" hasArrow>
                              <Button
                                size="sm"
                                colorScheme="green"
                                leftIcon={<FaCheckCircle />}
                                isLoading={isLoading && processingId === withdrawal._id}
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'approve')}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip label="Reject Withdrawal" hasArrow>
                              <Button
                                size="sm"
                                colorScheme="red"
                                leftIcon={<FaTimesCircle />}
                                isLoading={isLoading && processingId === withdrawal._id}
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'reject')}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </HStack>
                        )}
                        {withdrawal.status !== 'pending' && (
                          <Tooltip label="Action already taken" hasArrow>
                            <Box>
                              <FaInfoCircle color="white" />
                            </Box>
                          </Tooltip>
                        )}
                      </Td>
                    </Tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <Tr>
                      <Td colSpan={6} textAlign="center" color="white">
                        No withdrawal requests found
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </AdminLayout>
  );
} 