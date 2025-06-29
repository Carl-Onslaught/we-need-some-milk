import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  HStack,
  Text,
  VStack,
  Icon,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  IconButton,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
} from '@chakra-ui/react';
import { FaSearch, FaHistory, FaFilter, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import { format } from 'date-fns';
import AdminLayout from '../../components/AdminLayout';

const SharedHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/withdrawals/shared');
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'blue';
      case 'withdrawal':
        return 'orange';
      case 'earning':
        return 'green';
      default:
        return 'gray';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch = search === '' || 
      (transaction.agentId?.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (transaction.agentId?.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Calculate summary stats
  const getTotalAmount = (status) => {
    return transactions
      .filter(t => status === 'all' || t.status === status)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getTransactionCount = (status) => {
    return transactions.filter(t => status === 'all' || t.status === status).length;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <AdminLayout>
      <VStack spacing={6} align="stretch" px={{ base: 2, md: 8 }}>
        <Box mb={2}>
          <Heading size="lg" color="hsl(220, 14%, 90%)" textAlign="left">
            Shared Capital Earnings Withdrawal History
          </Heading>
          <Text color="hsl(220, 14%, 70%)" textAlign="left">
            View all shared capital earnings withdrawal transactions and their status
          </Text>
        </Box>

        {/* Summary Cards */}
        <Flex gap={4} flexWrap="wrap" justify="flex-start" align="stretch" mb={2}>
          <Card 
            flex={1} 
            minW="250px" 
            bg="#242C2E" 
            borderColor="#181E20" 
            borderWidth="1px"
            boxShadow="dark-lg"
            p={0}
          >
            <CardBody px={6} py={4}>
              <Stat>
                <StatLabel color="hsl(220, 14%, 70%)">Total Withdrawals</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="#FDB137">
                  ₱{getTotalAmount('all').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </StatNumber>
                <StatHelpText color="hsl(220, 14%, 70%)">
                  {getTransactionCount('all')} transactions
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card 
            flex={1} 
            minW="250px" 
            bg="#242C2E" 
            borderColor="#181E20" 
            borderWidth="1px"
            boxShadow="dark-lg"
            p={0}
          >
            <CardBody px={6} py={4}>
              <Stat>
                <StatLabel color="hsl(220, 14%, 70%)">Completed Withdrawals</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.400">
                  ₱{getTotalAmount('completed').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </StatNumber>
                <StatHelpText color="hsl(220, 14%, 70%)">
                  {getTransactionCount('completed')} transactions
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card 
            flex={1} 
            minW="250px" 
            bg="#242C2E" 
            borderColor="#181E20" 
            borderWidth="1px"
            boxShadow="dark-lg"
            p={0}
          >
            <CardBody px={6} py={4}>
              <Stat>
                <StatLabel color="hsl(220, 14%, 70%)">Pending Withdrawals</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="yellow.400">
                  ₱{getTotalAmount('pending').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </StatNumber>
                <StatHelpText color="hsl(220, 14%, 70%)">
                  {getTransactionCount('pending')} transactions
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Flex>
        <Card 
          bg="#242C2E" 
          borderColor="#181E20" 
          borderWidth="1px"
          boxShadow="dark-lg"
        >
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack spacing={4} width="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
                <FormControl maxW={{ base: "full", md: "200px" }}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaFilter} color="#FDB137" />
                      <Text color="hsl(220, 14%, 90%)" _hover={{ color: '#FDB137' }}>Filter by Status</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    bg="#242C2E"
                    borderColor="#181E20"
                    color="hsl(220, 14%, 90%)"
                    _hover={{ borderColor: '#FDB137' }}
                    _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  >
                    <option value="all" style={{ color: 'black' }}>All Status</option>
                    <option value="completed" style={{ color: 'black' }}>Completed</option>
                    <option value="pending" style={{ color: 'black' }}>Pending</option>
                    <option value="rejected" style={{ color: 'black' }}>Rejected</option>
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaSearch} color="#FDB137" />
                      <Text color="hsl(220, 14%, 90%)" _hover={{ color: '#FDB137' }}>Search</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="#FDB137" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by username or email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      bg="#242C2E"
                      borderColor="#181E20"
                      color="hsl(220, 14%, 90%)"
                      _hover={{ borderColor: '#FDB137' }}
                      _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl maxW={{ base: "full", md: "200px" }}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaCalendar} color="#FDB137" />
                      <Text color="hsl(220, 14%, 90%)" _hover={{ color: '#FDB137' }}>Date Range</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    bg="#242C2E"
                    borderColor="#181E20"
                    color="hsl(220, 14%, 90%)"
                    _hover={{ borderColor: '#FDB137' }}
                    _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  >
                    <option value="all" style={{ color: 'black' }}>All Time</option>
                    <option value="today" style={{ color: 'black' }}>Today</option>
                    <option value="week" style={{ color: 'black' }}>This Week</option>
                    <option value="month" style={{ color: 'black' }}>This Month</option>
                  </Select>
                </FormControl>
              </HStack>
              <Box overflowX="auto" bg="#242C2E" borderRadius="lg" p={4} boxShadow="dark-lg">
                <Table variant="simple" bg="#242C2E">
                  <Thead bg="#242C2E">
                    <Tr>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                      >USER</Th>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                      >PACKAGE</Th>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                        isNumeric
                      >AMOUNT</Th>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                      >STATUS</Th>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                      >DATE</Th>
                      <Th 
                        color="#FDB137" 
                        borderColor="#181E20"
                        fontWeight="bold"
                        fontSize="sm"
                      >DESCRIPTION</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" color="hsl(220, 14%, 70%)">
                          Loading transactions...
                        </Td>
                      </Tr>
                    ) : paginatedTransactions.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" color="white">
                          No transactions found
                        </Td>
                      </Tr>
                    ) : (
                      paginatedTransactions.map((transaction) => (
                        <Tr 
                          key={transaction._id} 
                          _hover={{ bg: '#181E20' }}
                          transition="background-color 0.2s"
                        >
                          <Td color="white" fontWeight="medium">
                            <VStack align="start" spacing={0}>
                              <Text>{transaction.agentId?.username || 'Unknown User'}</Text>
                              <Text fontSize="xs" color="gray.400">{transaction.agentId?.email}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={transaction.package === 'Package 1' ? 'blue' : 'purple'}
                              variant="subtle"
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {transaction.package}
                            </Badge>
                          </Td>
                          <Td isNumeric color="white" fontWeight="medium">
                            ₱{transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getStatusColor(transaction.status)}
                              px={2}
                              py={1}
                              borderRadius="full"
                              textTransform="capitalize"
                            >
                              {transaction.status}
                            </Badge>
                          </Td>
                          <Td color="white">
                            {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, yyyy') : '-'}
                          </Td>
                          <Td color="white" maxW="300px" isTruncated>
                            {transaction.description || '-'}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
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
};

export default SharedHistory;
