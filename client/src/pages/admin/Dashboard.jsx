import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Link,
  Input,
  InputGroup,
  InputRightElement,
  useClipboard,
  HStack,
  Tooltip,
  IconButton,
  Flex,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import AddSharedCapital from '../../components/admin/AddSharedCapital';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaHandHoldingUsd, 
  FaExchangeAlt, 
  FaWallet, 
  FaClock, 
  FaCopy, 
  FaShare, 
  FaChartLine, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight, 
  FaHistory, 
  FaCog, 
  FaClipboardList,
  FaMousePointer,
  FaCoins
} from 'react-icons/fa';

const StatCard = ({ title, stat, icon, helpText }) => {
  return (
    <Box
      p={6}
      bg="#1E2528"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="dark-lg"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', borderColor: '#FDB137', boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)' }}
    >
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'center', md: 'center' }}>
        <Box flex="1" textAlign={{ base: 'center', md: 'left' }}>
          <Stat>
            <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
              {title}
            </StatLabel>
            <StatNumber color="white" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold" wordBreak="normal">
              {stat}
            </StatNumber>
            {helpText && (
              <StatHelpText color="gray.400" fontSize="sm">
                {helpText}
              </StatHelpText>
            )}
          </Stat>
        </Box>
        <Box
          mt={{ base: 2, md: 0 }}
          ml={{ base: 0, md: 4 }}
          p={2}
          bg="#FDB137"
          borderRadius="full"
          color="black"
          width="36px"
          height="36px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} w={5} h={5} color="white" />
        </Box>
      </Flex>
    </Box>
  );
};

function AdminDashboard() {
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard('');
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalInvestments: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    totalReferralEarnings: 0,
    totalPointsSent: 0,
    withdrawalStats: {
      referral: { total: 0, pending: 0 },
      click: { total: 0, pending: 0 },
      shared: { total: 0, pending: 0 }
    }
  });
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchField, setUserSearchField] = useState('username');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Add fetchStats function
  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stats',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add useEffect to fetch initial data
  useEffect(() => {
    fetchStats();
  }, []);

  // Enhanced user filtering logic
  const filteredUsers = users.filter(user => {
    const query = userSearchQuery.toLowerCase();
    switch(userSearchField) {
      case 'username':
        return user.username.toLowerCase().includes(query);
      case 'email':
        return user.email.toLowerCase().includes(query);
      case 'role':
        return user.role.toLowerCase().includes(query);
      case 'status':
        return (user.isActive ? 'active' : 'inactive').includes(query);
      case 'date':
        return new Date(user.createdAt).toLocaleDateString().includes(query);
      default:
        return true;
    }
  });

  // Calculate pagination for users
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * usersPerPage,
    userCurrentPage * usersPerPage
  );

  // Add polling interval
  const POLLING_INTERVAL = 30000; // 30 seconds

  useEffect(() => {
    let isMounted = true;
    let pollingInterval;

    const loadData = async () => {
      if (isMounted) {
        try {
          const [
            dashboardStatsRes, 
            usersRes, 
            investmentsRes, 
            withdrawalsRes,
            totalPointsRes
          ] = await Promise.all([
            axios.get('/admin/stats'),
            axios.get('/admin/users'),
            axios.get('/admin/investments/pending'),
            axios.get('/admin/withdrawals/pending'),
            axios.get('/admin/load-capital/total-sent') // <-- updated endpoint
          ]);

          // Fetch withdrawal stats by source type
          const withdrawalStatsRes = await axios.get('/admin/withdrawals/stats');
          
          console.log('Dashboard stats response:', dashboardStatsRes.data);
          console.log('Total points sent:', totalPointsRes.data);
          
          setStats({
            totalUsers: dashboardStatsRes.data?.totalUsers || 0,
            totalAgents: usersRes.data?.filter(user => user.role === 'agent')?.length || 0,
            totalInvestments: dashboardStatsRes.data?.totalInvestments || 0,
            totalWithdrawals: dashboardStatsRes.data?.totalWithdrawals || 0,
            totalEarnings: dashboardStatsRes.data?.totalEarnings || 0,
            totalReferralEarnings: dashboardStatsRes.data?.totalReferralEarnings || 0,
            totalSharedEarnings: dashboardStatsRes.data?.totalSharedEarnings || 0,
            totalPointsSent: totalPointsRes.data?.totalSent || 0, // <-- use totalSent
            withdrawalStats: {
              referral: { 
                total: dashboardStatsRes.data?.withdrawalStats?.referral || 0, 
                pending: dashboardStatsRes.data?.withdrawalStats?.pending?.referral || 0 
              },
              click: { 
                total: dashboardStatsRes.data?.withdrawalStats?.click || 0, 
                pending: dashboardStatsRes.data?.withdrawalStats?.pending?.click || 0 
              },
              shared: { 
                total: dashboardStatsRes.data?.withdrawalStats?.sharedCapital || 0, 
                pending: dashboardStatsRes.data?.withdrawalStats?.pending?.sharedCapital || 0 
              }
            }
          });
      setUsers(usersRes.data || []);
      setInvestments(investmentsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
        }
      }
    };

    loadData();
    pollingInterval = setInterval(loadData, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, []);

  // Add real-time updates for earnings and shared history
  useEffect(() => {
    let isMounted = true;
    let pollingInterval;

    const loadHistoryData = async () => {
      if (isMounted) {
        try {
          const [earningsData, sharedData] = await Promise.all([
            axios.get('/admin/transactions/earnings'),
            axios.get('/admin/transactions/shared')
          ]);
          setEarningsHistory(earningsData.data || []);
          setReferralData(sharedData.data?.transactions || []);
        } catch (error) {
          console.error('Error fetching history data:', error);
        }
      }
    };

    // Initial load
    loadHistoryData();

    // Set up polling
    pollingInterval = setInterval(() => {
      if (isMounted) {
        loadHistoryData();
      }
    }, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, []);

  // Add real-time updates for referral data
  useEffect(() => {
    let isMounted = true;
    let pollingInterval;

    const loadReferralData = async () => {
      if (isMounted) {
        try {
          const response = await axios.get('/admin/referral');
          const data = response.data || {};
          setReferralCode(data.referralCode || '');
          setReferralLink(`${window.location.origin}/register?ref=${data.referralCode || ''}`);
          setReferralStats({
            totalReferrals: data.totalReferrals || 0,
            activeReferrals: data.activeReferrals || 0,
          });
        } catch (error) {
          console.error('Error fetching referral data:', error);
        }
      }
    };

    // Initial load
    loadReferralData();

    // Set up polling
    pollingInterval = setInterval(() => {
      if (isMounted) {
        loadReferralData();
      }
    }, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, []);

  const handleWithdrawalAction = async (id, action) => {
    try {
      await axios.post(`/admin/withdrawals/${id}/${action}`);
      toast({
        title: 'Success',
        description: `Withdrawal ${action}ed successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchWithdrawals();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${action} withdrawal`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadRegistration = async (userId, amount) => {
    try {
      await axios.post('/admin/load-registration', { userId, amount });
      toast({
        title: 'Success',
        description: 'Registration loaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchUsers();
    } catch (error) {
      console.error('Error loading registration:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadSharedCapital = async (userId, amount, packageType) => {
    try {
      await axios.post('/admin/load-shared-capital', { userId, amount, packageType });
      toast({
        title: 'Success',
        description: 'Shared capital loaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchInvestments();
    } catch (error) {
      console.error('Error loading shared capital:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load shared capital',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCopyLink = () => {
    onCopy(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Wealth Clicks',
          text: 'Join Wealth Clicks using my referral link',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: 'Sharing not supported',
        description: 'Your browser does not support the share API',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add handleUserStatusToggle function
  const handleUserStatusToggle = async (userId, newStatus) => {
    try {
      await axios.post(`/admin/users/${userId}/toggle-status`, { isActive: newStatus });
      toast({
        title: 'Success',
        description: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData(); // Refresh the data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await axios.post(`/admin/users/${selectedUser._id}/change-password`, {
        newPassword
      });
      toast({
        title: 'Success',
        description: 'Password updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AdminLayout sidebarBg="#181E20">
      <Box bg="#181E20" minH="100vh">
        <Container maxW="7xl" py={8}>
          {/* Main Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <StatCard
              title="Total Users"
              stat={stats.totalUsers || 0}
              icon={FaUsers}
              helpText={`Agents: ${stats.totalAgents || 0}`}
            />
            <StatCard
              title="Investments"
              stat={stats.totalPointsSent?.toLocaleString() || 0}
              icon={FaMoneyBillWave}
              // Removed helpText
            />
            <StatCard
              title="Total Earnings"
              stat={`₱${(stats.totalEarnings || 0).toFixed(2)}`}
              icon={FaChartLine}
            />
            <StatCard
              title="Withdrawals"
              stat={`₱${(stats.totalWithdrawals || 0).toFixed(2)}`}
              icon={FaHandHoldingUsd}

            />
          </SimpleGrid>

          {/* Withdrawal Breakdown */}
          <Box mb={8} p={4} bg="#1E2528" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
            <Heading size="md" color="white" mb={4}>Withdrawal Breakdown</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Referral Withdrawals</Text>
                <Flex align="center">
                  <Icon as={FaExchangeAlt} color="#FDB137" mr={2} />
                  <Text color="white" fontWeight="bold">
                    ₱{(stats.withdrawalStats?.referral?.total || 0).toFixed(2)}
                    
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Click Earnings Withdrawals</Text>
                <Flex align="center">
                  <Icon as={FaMousePointer} color="#FDB137" mr={2} />
                  <Text color="white" fontWeight="bold">
                    ₱{(stats.withdrawalStats?.click?.total || 0).toFixed(2)}
                    
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Shared Capital Withdrawals</Text>
                <Flex align="center">
                  <Icon as={FaCoins} color="#FDB137" mr={2} />
                  <Text color="white" fontWeight="bold">
                    ₱{(stats.withdrawalStats?.shared?.total || 0).toFixed(2)}
                  </Text>
                </Flex>
              </Box>
            </SimpleGrid>
          </Box>

              {/* Referral Section */}
          <Box mb={8}>
            <Heading size="lg" color="white" mb={6}>
              Referral System
            </Heading>
            <Card bg="#1E2528" borderColor="gray.700" borderWidth="1px">
                  <CardBody>
                <VStack spacing={4} align="stretch">
                    <Box>
                    <Text color="gray.400" mb={2}>Your Referral Code</Text>
                    <InputGroup>
                        <Input
                        value={referralCode}
                          isReadOnly
                        bg="#1E2528"
                        color="white"
                        borderColor="gray.700"
                      />
                      <InputRightElement>
                        <Tooltip label="Copy Code">
                              <IconButton
                                icon={<FaCopy />}
                                onClick={handleCopyLink}
                                variant="ghost"
                            colorScheme="brand"
                            aria-label="Copy referral code"
                              />
                            </Tooltip>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Box>
                    <Text color="gray.400" mb={2}>Your Referral Link</Text>
                    <InputGroup>
                        <Input
                        value={referralLink}
                          isReadOnly
                        bg="#1E2528"
                        color="white"
                        borderColor="gray.700"
                      />
                      <InputRightElement>
                        <Tooltip label="Copy Link">
                          <IconButton
                            icon={<FaCopy />}
                            onClick={handleCopyLink}
                            variant="ghost"
                            colorScheme="brand"
                            aria-label="Copy referral link"
                          />
                        </Tooltip>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                  <Button
                    bg="#FDB137"
                    color="black"
                    boxShadow="lg"
                    _hover={{
                      bg: "#BD5301",
                      color: "white",
                      boxShadow: "0 4px 16px rgba(253, 177, 55, 0.1)",
                      transform: "translateY(-2px)"
                    }}
                    fontWeight="bold"
                    leftIcon={<FaShare />}
                    onClick={handleShare}
                  >
                    Share Referral Link
                  </Button>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <StatCard
                      title="Total Referrals"
                      stat={referralStats.totalReferrals || 0}
                      icon={FaUsers}
                    />
                    <StatCard
                      title="Active Referrals"
                      stat={referralStats.activeReferrals || 0}
                      icon={FaUsers}
                    />

                  </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
        </Box>
      </Container>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboard;
