import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  Heading,
  useToast,
  Spinner,
  Flex,
  Card,
  CardBody,
  Button,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaSearch, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';

const EarningHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWithdrawals();
    // Set up polling interval for real-time updates
    const interval = setInterval(fetchWithdrawals, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get('/api/admin/earnings/withdrawals');
      setWithdrawals(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch withdrawal requests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalAction = async (id, action) => {
    try {
      await axios.post(`/api/admin/withdrawals/${id}/${action}`);
      toast({
        title: 'Success',
        description: `Withdrawal ${action}ed successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchWithdrawals(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${action} withdrawal`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  const filteredWithdrawals = withdrawals.filter(w => {
    // Only show approved/completed withdrawals
    const isApproved = w.status === 'approved' || w.status === 'completed';
    const matchesSearch = search === '' || 
      w.user.username.toLowerCase().includes(search.toLowerCase()) ||
      w.user.email.toLowerCase().includes(search.toLowerCase());
    return isApproved && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page if filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <VStack spacing={6} align="stretch">
      <Card bg="#242C2E" borderColor="#181E20" borderWidth="1px">
        <CardBody>
          <VStack spacing={6}>
            <HStack spacing={4} width="full">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="#FDB137" />
                </InputLeftElement>
                <Input
                  placeholder="Search by username or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </HStack>

            <Box overflowX="auto" bg="#242C2E" borderRadius="lg" p={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="#FDB137">USER</Th>
                    <Th color="#FDB137">AMOUNT</Th>
                    <Th color="#FDB137">PAYMENT METHOD</Th>
                    <Th color="#FDB137">STATUS</Th>
                    <Th color="#FDB137">DATE</Th>
                    <Th color="#FDB137">SOURCE</Th>
                    <Th color="#FDB137">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center">
                        <Spinner size="xl" color="brand.primary" />
                      </Td>
                    </Tr>
                  ) : paginatedWithdrawals.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8} color="#FDB137" bg="#242C2E">
                        No withdrawal requests found
                      </Td>
                    </Tr>
                  ) : (
                    paginatedWithdrawals.map((withdrawal) => (
                      <Tr key={withdrawal._id} _hover={{ bg: "#162520" }} bg="#242C2E">
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color="white">{withdrawal.user.username}</Text>
                            <Text fontSize="sm" color="hsl(220, 14%, 70%)">
                              {withdrawal.user.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td color="white">₱{withdrawal.amount.toFixed(2)}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color="white">{withdrawal.method.toUpperCase()}</Text>
                            <Text fontSize="sm" color="hsl(220, 14%, 70%)">
                              {withdrawal.accountNumber}
                            </Text>
                            <Text fontSize="sm" color="hsl(220, 14%, 70%)">
                              {withdrawal.accountName}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(withdrawal.status)}>
                            {withdrawal.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td color="white">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </Td>
                        <Td color="white">{withdrawal.source === 'direct_indirect' ? 'Direct/Indirect' : withdrawal.source === 'click_earnings' ? 'Click Earnings' : '-'}</Td>
                        <Td>
                          {withdrawal.status === 'pending' && (
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                bg="#FDB137"
                                color="#181E20"
                                _hover={{ bg: '#BD5301', color: 'white' }}
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                bg="#FDB137"
                                color="#181E20"
                                _hover={{ bg: '#BD5301', color: 'white' }}
                                onClick={() => handleWithdrawalAction(withdrawal._id, 'reject')}
                              >
                                Reject
                              </Button>
                            </HStack>
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
                  bg="#FDB137"
                  color="#181E20"
                  _hover={{ bg: '#BD5301', color: 'white' }}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    bg={currentPage === i + 1 ? '#FDB137' : 'transparent'}
                    color={currentPage === i + 1 ? '#181E20' : '#FDB137'}
                    _hover={{ bg: '#BD5301', color: 'white' }}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="sm"
                  bg="#FDB137"
                  color="#181E20"
                  _hover={{ bg: '#BD5301', color: 'white' }}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  isDisabled={currentPage === totalPages}
                  variant="outline"
                  colorScheme="teal"
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default EarningHistory; 