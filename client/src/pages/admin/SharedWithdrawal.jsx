import {
  Box,
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
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Badge,
  Text,
  HStack,
  InputGroup,
  InputLeftElement,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Spinner,
  Flex,
  Select
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaSearch, FaMoneyBillWave, FaFilter, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function SharedWithdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    // Only show pending withdrawals
    const matchesSearch = !searchEmail || 
      (withdrawal.agentId?.username || '').toLowerCase().includes(searchEmail.toLowerCase());
    return matchesSearch;
  });

  // Calculate paginated withdrawals
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchEmail]);

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

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get('/api/admin/sharedWithdrawals');
      setWithdrawals(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching withdrawals',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const approveWithdrawal = async (withdrawalId) => {
    setProcessingId(withdrawalId);
    setLoading(true);
    try {
      const response = await axios.post(`/api/admin/sharedWithdrawals/${withdrawalId}/approve`);
      toast({
        title: 'Success',
        description: 'Withdrawal approved and moved to history',
        status: 'success',
        duration: 3000,
      });
      // Remove the approved withdrawal from the list
      setWithdrawals(withdrawals.filter(w => w._id !== withdrawalId));
      fetchPendingWithdrawals();
    } catch (error) {
      toast({
        title: 'Error approving withdrawal',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const rejectWithdrawal = async (withdrawalId) => {
    setProcessingId(withdrawalId);
    setLoading(true);
    try {
      const response = await axios.post(`/api/admin/sharedWithdrawals/${withdrawalId}/reject`);
      toast({
        title: 'Success',
        description: 'Withdrawal rejected and moved to history',
        status: 'success',
        duration: 3000,
      });
      // Remove the rejected withdrawal from the list
      setWithdrawals(withdrawals.filter(w => w._id !== withdrawalId));
      fetchPendingWithdrawals();
    } catch (error) {
      toast({
        title: 'Error rejecting withdrawal',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);



  const getTotalAmount = (status) => {
    return withdrawals
      .filter(w => status === 'all' || w.status === status)
      .reduce((sum, w) => sum + w.amount, 0);
  };

  return (
    <AdminLayout>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" color="hsl(220, 14%, 90%)">
            Shared Capital Withdrawal
          </Heading>
          <Text color="hsl(220, 14%, 70%)">
            Manage pending claims from Package 1 and Package 2 investments
          </Text>
        </Box>

        <Card 
          bg="#242C2E" 
          borderColor="#181E20" 
          borderWidth="1px"
          boxShadow="dark-lg"
        >
        <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Stat>
                  <StatLabel color="hsl(220, 14%, 70%)">Total Withdrawals</StatLabel>
                  <StatNumber fontSize="4xl" fontWeight="bold" color="#FDB137">
                  ₱{getTotalAmount('all').toFixed(2)}
                </StatNumber>
                  <StatHelpText color="hsl(220, 14%, 70%)">
                    {filteredWithdrawals.length} requests
                  </StatHelpText>
                </Stat>

                <HStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="#FDB137" />
                    </InputLeftElement>
            <Input
                      placeholder="Search by username"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
                      bg="#181E20"
                      color="white"
                      borderColor="#181E20"
                      _hover={{ borderColor: "#FDB137" }}
                      _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
                    />
                  </InputGroup>

                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    maxW="200px"
                    bg="#181E20"
                    color="white"
                    borderColor="#181E20"
                    _hover={{ borderColor: "#FDB137" }}
                    _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </HStack>
              </HStack>

              <Box overflowX="auto" bg="#242C2E" borderRadius="lg" p={4}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="#FDB137">USERNAME</Th>
                      <Th color="#FDB137">PACKAGE</Th>
                      <Th color="#FDB137">AMOUNT</Th>
                      <Th color="#FDB137">PAYMENT DETAILS</Th>
                      <Th color="#FDB137">REQUEST DATE</Th>
                      <Th color="#FDB137">STATUS</Th>
                      <Th color="#FDB137">ACTIONS</Th>
                    </Tr>
                  </Thead>
              <Tbody>
                    {paginatedWithdrawals.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={8} color="#FDB137" bg="#242C2E">
                          No withdrawal requests found
                        </Td>
                      </Tr>
                    ) : (
                      paginatedWithdrawals.map((withdrawal) => (
                        <Tr key={withdrawal._id} _hover={{ bg: "#181E20" }} bg="#242C2E">
                          <Td color="white">{withdrawal.agentId?.username || 'Unknown User'}</Td>
                          <Td color="white">
                            <Badge 
                              colorScheme={withdrawal.package === 1 ? 'blue' : 'purple'}
                              variant="subtle"
                            >
                              Package {withdrawal.package || 1}
                            </Badge>
                          </Td>
                          <Td color="white">₱{withdrawal.amount.toFixed(2)}</Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text color="white">{withdrawal.method}</Text>
                              <Text fontSize="sm" color="hsl(220, 14%, 70%)">
                                {withdrawal.accountNumber}
                              </Text>
                            </VStack>
                          </Td>
                          <Td color="white">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(withdrawal.status)}
                              px={2}
                              py={1}
                              borderRadius="full"
                              textTransform="capitalize"
                              fontSize="sm"
                            >
                              {withdrawal.status}
                            </Badge>
                          </Td>
                          <Td>
                            {withdrawal.status === 'pending' ? (
                              <HStack spacing={2}>
                                <Tooltip label="Approve Withdrawal" hasArrow>
                                  <Button
                                    size="sm"
                                    leftIcon={<FaCheckCircle />}
                                    isLoading={loading && processingId === withdrawal._id}
                                    onClick={() => approveWithdrawal(withdrawal._id)}
                                    bg="#FDB137"
                                    color="#181E20"
                                    _hover={{
                                      bg: '#BD5301',
                                      color: 'white'
                                    }}
                                  >
                                    Approve
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Reject Withdrawal" hasArrow>
                                  <Button
                                    size="sm"
                                    leftIcon={<FaTimesCircle />}
                                    isLoading={loading && processingId === withdrawal._id}
                                    onClick={() => rejectWithdrawal(withdrawal._id)}
                                    bg="#FDB137"
                                    color="#181E20"
                                    _hover={{
                                      bg: '#BD5301',
                                      color: 'white'
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </Tooltip>
                              </HStack>
                            ) : (
                              <Text color="hsl(220, 14%, 70%)">-</Text>
                            )}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <HStack justify="center" pt={4}>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    isDisabled={currentPage === 1}
                    bg="#242C2E"
                    color="white"
                    borderColor="#181E20"
                    _hover={{ bg: '#FDB137', color: '#181E20' }}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      bg={currentPage === i + 1 ? '#FDB137' : '#242C2E'}
                      color={currentPage === i + 1 ? '#181E20' : 'white'}
                      borderColor="#181E20"
                      _hover={{ bg: '#FDB137', color: '#181E20' }}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                    bg="#242C2E"
                    color="white"
                    borderColor="#181E20"
                    _hover={{ bg: '#FDB137', color: '#181E20' }}
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </AdminLayout>
  );
}
