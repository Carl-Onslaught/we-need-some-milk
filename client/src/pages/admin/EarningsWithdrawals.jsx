import { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Input,
  Select,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import { FaSync } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

export default function EarningsWithdrawals() {
  const [earnings, setEarnings] = useState({
    directIndirect: [],
    clickEarnings: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      // Fetch direct and indirect referral earnings, and click earnings
      const [directRes, indirectRes, clicksRes] = await Promise.all([
        axios.get('/api/admin/earnings/direct-referral', { withCredentials: true }),
        axios.get('/api/admin/earnings/indirect-referral', { withCredentials: true }),
        axios.get('/api/admin/earnings/clicks', { withCredentials: true })
      ]);

      // Merge direct and indirect referral data
      const directIndirect = [
        ...Array.isArray(directRes.data) ? directRes.data : [],
        ...Array.isArray(indirectRes.data) ? indirectRes.data : []
      ];

      setEarnings({
        directIndirect,
        clickEarnings: Array.isArray(clicksRes.data) ? clicksRes.data : []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch earnings data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setEarnings({
        directIndirect: [],
        clickEarnings: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchEarnings();
  };

  const TransactionsTable = ({ data }) => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = data.filter(item => {
      const matchesFilter = filter === 'all' || item.status === filter;
      const matchesSearch = search === '' || 
        item.user?.username?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    useEffect(() => {
      setCurrentPage(1);
    }, [filter, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if (isLoading) {
      return (
        <Flex justify="center" py={8}>
          <Spinner size="lg" color="#FDB137" />
        </Flex>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {data.length > 0 && (
          <HStack spacing={4}>
            <Input
              placeholder="Search by username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="300px"
              bg="#242C2E"
              color="white"
              borderColor="#181E20"
              _hover={{ borderColor: "#FDB137" }}
              _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              maxW="200px"
              bg="#242C2E"
              color="white"
              borderColor="#181E20"
              _hover={{ borderColor: "#FDB137" }}
              _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </Select>
          </HStack>
        )}
        <Box overflowX="auto" bg="#242C2E" borderRadius="lg" p={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="#FDB137">USERNAME</Th>
                <Th color="#FDB137">AMOUNT</Th>
                <Th color="#FDB137">STATUS</Th>
                <Th color="#FDB137">PAYMENT METHOD</Th>
                <Th color="#FDB137">DATE</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="#FDB137">
                    No transactions found
                  </Td>
                </Tr>
              ) : (
                paginatedData.map((item) => (
                  <Tr key={item._id} _hover={{ bg: "#162520" }} bg="#22332F">
                    <Td>
                      <Text color="white">{item.user?.username}</Text>
                      <Text fontSize="sm" color="#A7EFC5">{item.user?.email}</Text>
                    </Td>
                    <Td color="white">₱{item.amount?.toFixed(2)}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item.status === 'completed' ? 'green' :
                          item.status === 'pending' ? 'yellow' : 'red'
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      {item.withdrawal ? (
                        <Box>
                          <Text color="white">{item.withdrawal.method}</Text>
                          <Text fontSize="sm" color="#FDB137">{item.withdrawal.accountNumber}</Text>
                        </Box>
                      ) : (
                        <Text color="#FDB137">-</Text>
                      )}
                    </Td>
                    <Td color="white">
                      {new Date(item.createdAt).toLocaleDateString()}
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
              variant="outline"
              bg="#FDB137"
              color="#181E20"
              _hover={{ bg: '#BD5301', color: 'white' }}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? 'solid' : 'ghost'}
                bg="#FDB137"
              color="#181E20"
              _hover={{ bg: '#BD5301', color: 'white' }}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              variant="outline"
              bg="#FDB137"
              color="#181E20"
              _hover={{ bg: '#BD5301', color: 'white' }}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    );
  };

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="white">Earnings & Withdrawals</Heading>
              <Text color="hsl(220, 14%, 70%)">View and manage all earnings and withdrawal transactions</Text>
            </VStack>
            <Tooltip label="Refresh data" hasArrow>
              <IconButton
                icon={<FaSync />}
                onClick={handleRefresh}
                isLoading={isLoading}
                variant="ghost"
                color="#FDB137"
                aria-label="Refresh data"
                _hover={{ bg: '#242C2E', color: '#BD5301' }}
              />
            </Tooltip>
          </HStack>
          <Tabs variant="line">
            <TabList borderBottomColor="#181E20">
              <Tab color="#E0E0E0" _selected={{ color: 'white', borderColor: '#FDB137', bg: '#242C2E' }}>Direct/Indirect</Tab>
              <Tab color="#E0E0E0" _selected={{ color: 'white', borderColor: '#FDB137', bg: '#242C2E' }}>Click Earnings</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Box mb={2} p={4} bg="#242C2E" borderRadius="md" borderWidth="1px" borderColor="#181E20">
                  <Text color="#FDB137" fontWeight="bold">
                    Total Commission Balance: ₱
                    {earnings.directIndirect.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
                  </Text>
                </Box>
                <TransactionsTable data={earnings.directIndirect} />
              </TabPanel>
              <TabPanel p={0}>
                <Box mb={2} p={4} bg="#242C2E" borderRadius="md" borderWidth="1px" borderColor="#181E20">
                  <Text color="#FDB137" fontWeight="bold">
                    Total Commission Balance: ₱
                    {earnings.clickEarnings.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
                  </Text>
                </Box>
                <TransactionsTable data={earnings.clickEarnings} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </AdminLayout>
  );
} 