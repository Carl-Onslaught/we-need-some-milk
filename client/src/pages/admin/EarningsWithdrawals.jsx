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
  const [withdrawals, setWithdrawals] = useState({
    directIndirect: [],
    clickEarnings: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      // Fetch withdrawal requests by source
      const [directRes, clickRes] = await Promise.all([
        axios.get('/admin/withdrawals/by-source?source=direct_indirect', { withCredentials: true }),
        axios.get('/admin/withdrawals/by-source?source=click_earnings', { withCredentials: true })
      ]);
      setWithdrawals({
        directIndirect: Array.isArray(directRes.data) ? directRes.data : [],
        clickEarnings: Array.isArray(clickRes.data) ? clickRes.data : []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch withdrawal requests. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setWithdrawals({
        directIndirect: [],
        clickEarnings: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWithdrawals();
  };

  const handleApprove = async (withdrawalId) => {
    try {
      await axios.post(`/admin/withdrawals/${withdrawalId}/approve`);
      toast({
        title: 'Success',
        description: 'Withdrawal approved.',
        status: 'success',
        duration: 3000,
      });
      setWithdrawals(prev => ({
        ...prev,
        directIndirect: prev.directIndirect.filter(w => w._id !== withdrawalId),
        clickEarnings: prev.clickEarnings.filter(w => w._id !== withdrawalId)
      }));
      fetchWithdrawals();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve withdrawal.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleReject = async (withdrawalId) => {
    try {
      await axios.post(`/admin/withdrawals/${withdrawalId}/reject`);
      toast({
        title: 'Success',
        description: 'Withdrawal rejected.',
        status: 'success',
        duration: 3000,
      });
      setWithdrawals(prev => ({
        ...prev,
        directIndirect: prev.directIndirect.filter(w => w._id !== withdrawalId),
        clickEarnings: prev.clickEarnings.filter(w => w._id !== withdrawalId)
      }));
      fetchWithdrawals();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject withdrawal.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const WithdrawalsTable = ({ data }) => {
    const [filter, setFilter] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = data.filter(item => {
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesFilter;
    });

    useEffect(() => {
      setCurrentPage(1);
    }, [filter]);

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
        <HStack spacing={4}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            maxW="200px"
            bg="#181E20"
            color="#FDB137"
            borderColor="#FDB137"
            _hover={{ borderColor: '#FDB137', bg: '#181E20', color: '#FDB137' }}
            _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137', bg: '#181E20', color: '#FDB137' }}
          >
            <option style={{ color: '#FDB137', background: '#181E20' }} value="pending">Pending</option>
            <option style={{ color: '#FDB137', background: '#181E20' }} value="approved">Approved</option>
            <option style={{ color: '#FDB137', background: '#181E20' }} value="rejected">Rejected</option>
          </Select>
        </HStack>
        <Box overflowX="auto" bg="#242C2E" borderRadius="lg" p={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="#FDB137">USERNAME</Th>
                <Th color="#FDB137">AMOUNT</Th>
                <Th color="#FDB137">STATUS</Th>
                <Th color="#FDB137">PAYMENT METHOD</Th>
                <Th color="#FDB137">DATE</Th>
                <Th color="#FDB137">ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="#FDB137">
                    No withdrawal requests found
                  </Td>
                </Tr>
              ) : (
                paginatedData.map((item) => (
                  <Tr key={item._id} _hover={{ bg: "#162520" }} bg="#242C2E">
                    <Td>
                      <Text color="white">{item.agentId?.username}</Text>
                      <Text fontSize="sm" color="#A7EFC5">{item.agentId?.email}</Text>
                    </Td>
                    <Td color="white">₱{item.amount?.toFixed(2)}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item.status === 'completed' ? 'green' :
                          item.status === 'pending' ? 'yellow' :
                          item.status === 'approved' ? 'blue' : 'red'
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text color="white">{item.method?.toUpperCase() || '-'}</Text>
                        <Text fontSize="sm" color="#FDB137">{item.accountNumber || ''}</Text>
                        <Text fontSize="sm" color="#FDB137">{item.accountName || ''}</Text>
                      </VStack>
                    </Td>
                    <Td color="white">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>
                      {item.status === 'pending' && (
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleApprove(item._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleReject(item._id)}
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
              <Text color="hsl(220, 14%, 70%)">View and manage all agent withdrawal requests by source</Text>
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
              <Tab color="#E0E0E0" _selected={{ color: 'white', borderColor: '#FDB137', bg: '#242C2E' }}>Referral Earnings (Direct/Indirect)</Tab>
              <Tab color="#E0E0E0" _selected={{ color: 'white', borderColor: '#FDB137', bg: '#242C2E' }}>Click Earnings</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <WithdrawalsTable data={withdrawals.directIndirect} />
              </TabPanel>
              <TabPanel p={0}>
                <WithdrawalsTable data={withdrawals.clickEarnings} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </AdminLayout>
  );
} 