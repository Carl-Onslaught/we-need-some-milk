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
  Card,
  CardBody,
  Text,
  Badge,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaSearch } from 'react-icons/fa';

export default function EarningsHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/admin/transactions/earnings');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'commission':
        return 'blue';
      case 'referral':
        return 'purple';
      case 'click':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = search === '' || 
      tx.user.username.toLowerCase().includes(search.toLowerCase()) ||
      tx.user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color="white">
              Earnings History
            </Heading>
            <Text color="#E0E0E0">
              View all earnings transactions
            </Text>
          </Box>

      <Card bg="#242C2E" borderColor="#181E20" borderWidth="1px">
        <CardBody>
              <VStack spacing={6}>
                <HStack spacing={4} width="full">
                  <FormControl maxW="200px">
                    <FormLabel color="white">Filter by Type</FormLabel>
              <Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      bg="#181E20"
                      color="#FDB137"
                      borderColor="#181E20"
                      _hover={{
                        borderColor: '#FDB137',
                        bg: '#181E20',
                        color: '#FDB137'
                      }}
                      _focus={{
                        borderColor: '#FDB137',
                        boxShadow: '0 0 0 1px #FDB137',
                        bg: '#181E20',
                        color: '#FDB137'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
              </Select>
            </FormControl>

            <FormControl>
                    <FormLabel color="white">Search</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaSearch color="#FDB137" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by username or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        bg="#242C2E"
                        borderColor="#181E20"
                        color="white"
                        _hover={{
                          borderColor: '#FDB137'
                        }}
                        _focus={{
                          borderColor: '#FDB137',
                          boxShadow: '0 0 0 1px #FDB137'
                        }}
                      />
                    </InputGroup>
            </FormControl>
          </HStack>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="#E0E0E0">Username</Th>
                    <Th color="#E0E0E0">Type</Th>
                    <Th color="#E0E0E0">Amount</Th>
                    <Th color="#E0E0E0">Status</Th>
                    <Th color="#E0E0E0">Payment Method</Th>
                    <Th color="#E0E0E0">Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" color="#E0E0E0">
                          Loading transactions...
                        </Td>
                      </Tr>
                    ) : filteredTransactions.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" color="#E0E0E0">
                          No transactions found
                        </Td>
                      </Tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <Tr key={tx._id}>
                          <Td color="white">
                            <VStack align="start" spacing={1}>
                              <Text>{tx.user.username}</Text>
                              <Text fontSize="sm" color="#E0E0E0">
                                {tx.user.email}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(tx.type)}>
                              {tx.type.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td color="white">₱{tx.amount.toFixed(2)}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(tx.status)}>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td color="white">
                            {tx.withdrawal ? (
                              <VStack align="start" spacing={1}>
                                <Text>{tx.withdrawal.method.toUpperCase()}</Text>
                                <Text fontSize="sm" color="#E0E0E0">
                                  {tx.withdrawal.accountNumber}
                                </Text>
                                <Text fontSize="sm" color="#E0E0E0">
                                  {tx.withdrawal.accountName}
                                </Text>
                              </VStack>
                            ) : (
                              <Text>-</Text>
                            )}
                          </Td>
                          <Td color="white">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </Td>
                        </Tr>
                      ))
                    )}
                </Tbody>
              </Table>
              </VStack>
        </CardBody>
      </Card>
      </VStack>
      </Container>
    </AdminLayout>
  );
}
