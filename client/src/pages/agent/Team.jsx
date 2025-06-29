import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Button,
  useToast,
  HStack,
  Icon,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaUsers, FaCopy, FaUserPlus, FaLink } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AgentLayout from '../../components/AgentLayout';

export default function Team() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState({
    directDownlines: [],
    indirectDownlines: [],
    stats: {
      totalDirectDownlines: 0,
      totalIndirectDownlines: 0,
      totalDownlines: 0
    }
  });
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const { hasCopied, onCopy } = useClipboard(referralCode);
  const { hasCopied: hasCopiedLink, onCopy: onCopyLink } = useClipboard(referralLink);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
    fetchReferralCode();
  }, []);

  useEffect(() => {
    // Generate referral link when referral code is available
    if (referralCode) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/register?ref=${referralCode}`);
    }
  }, [referralCode]);

  const fetchReferralCode = async () => {
    try {
      const { data } = await axios.get('/api/agent/profile');
      setReferralCode(data.referralCode || '');
    } catch (error) {
      console.error('Error fetching referral code:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch referral code',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/agent/downlines');
      setTeamData(data || {
        directDownlines: [],
        indirectDownlines: [],
        stats: {
          totalDirectDownlines: 0,
          totalIndirectDownlines: 0,
          totalDownlines: 0
        }
      });
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch team data',
        status: 'error',
        duration: 3000,
      });
      // Set default values on error
      setTeamData({
        directDownlines: [],
        indirectDownlines: [],
        stats: {
          totalDirectDownlines: 0,
          totalIndirectDownlines: 0,
          totalDownlines: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReferral = () => {
    onCopy();
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const handleCopyReferralLink = () => {
    onCopyLink();
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <AgentLayout>
      <Box>
        {/* Referral Section with Tabs */}
        <Card 
          bg="#1E2528" 
          borderWidth="1px"
          borderColor="gray.700"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: 'translateY(-2px)',
            borderColor: '#FDB137',
            boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
          }}
          mb={8}
        >
          <CardBody>
            <Tabs variant="soft-rounded" colorScheme="orange">
              <TabList>
                <Tab color="white" _selected={{ bg: '#FDB137', color: 'black' }}>Referral Code</Tab>
                <Tab color="white" _selected={{ bg: '#FDB137', color: 'black' }}>Referral Link</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">Your Referral Code</Heading>
                    <Text color="gray.400" fontSize="sm">
                      Share this code with others to earn referral bonuses
                    </Text>
              <HStack>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUserPlus} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={referralCode}
                    isReadOnly
                    bg="#181E20"
                    color="white"
                    borderColor="gray.700"
                    _hover={{ borderColor: '#FDB137' }}
                    _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  />
                </InputGroup>
                <Button
                  leftIcon={<FaCopy />}
                  onClick={handleCopyReferral}
                  bg="#FDB137"
                  color="black"
                  _hover={{
                    transform: 'scale(0.95)',
                    bg: '#BD5301',
                    color: 'white'
                  }}
                  transition="all 0.2s"
                >
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
              </HStack>
            </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="white">Your Referral Link</Heading>
                    <Text color="gray.400" fontSize="sm">
                      Share this link directly with potential referrals
                    </Text>
                    <HStack>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaLink} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={referralLink}
                          isReadOnly
                          bg="#181E20"
                          color="white"
                          borderColor="gray.700"
                          _hover={{ borderColor: '#FDB137' }}
                          _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                          fontSize="sm"
                        />
                      </InputGroup>
                      <Button
                        leftIcon={<FaCopy />}
                        onClick={handleCopyReferralLink}
                        bg="#FDB137"
                        color="black"
                        _hover={{
                          transform: 'scale(0.95)',
                          bg: '#BD5301',
                          color: 'white'
                        }}
                        transition="all 0.2s"
                      >
                        {hasCopiedLink ? 'Copied!' : 'Copy'}
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Team Stats */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
          <Card 
            bg="#1E2528" 
            borderWidth="1px"
            borderColor="gray.700"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
          >
            <CardBody>
              <VStack align="start">
                <Text color="#FDB137">Direct Referrals</Text>
                <Heading size="lg" color="#FDB137">
                  {isLoading ? 'Loading...' : teamData.stats?.totalDirectDownlines || 0}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
          <Card 
            bg="#1E2528" 
            borderWidth="1px"
            borderColor="gray.700"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
          >
            <CardBody>
              <VStack align="start">
                <Text color="#FDB137">Indirect Referrals</Text>
                <Heading size="lg" color="#FDB137">
                  {isLoading ? 'Loading...' : teamData.stats?.totalIndirectDownlines || 0}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Team Members List */}
        <Card 
          bg="#1E2528" 
          borderWidth="1px"
          borderColor="gray.700"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: 'translateY(-2px)',
            borderColor: '#FDB137',
            boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
          }}
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="#FDB137">Direct Downlines</Heading>
              <Divider borderColor="#2C4A3A" />
              {isLoading ? (
                <Text color="#FDB137" textAlign="center" py={4}>
                  Loading...
                </Text>
              ) : teamData.directDownlines?.length > 0 ? (
                teamData.directDownlines.map((member, index) => (
                  <Box 
                    key={index} 
                    p={4} 
                    bg="#162520" 
                    borderRadius="md"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateX(4px)',
                      borderColor: '#FDB137',
                    }}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="#FDB137">{member.username}</Text>
                        <Text fontSize="sm" color="#A7EFC5">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="bold" color={member.isActive ? '#FDB137' : 'red.400'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Text fontSize="sm" color={member.status === 'approved' ? '#A7EFC5' : 'yellow.400'}>
                          {member.status === 'approved' ? 'Approved' : 'Pending Approval'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color="#FDB137" textAlign="center" py={4}>
                  No direct downlines yet
                </Text>
              )}

              <Heading size="md" mt={6} color="#FDB137">Indirect Downlines</Heading>
              <Divider borderColor="#2C4A3A" />
              {isLoading ? (
                <Text color="#FDB137" textAlign="center" py={4}>
                  Loading...
                </Text>
              ) : teamData.indirectDownlines?.length > 0 ? (
                teamData.indirectDownlines.map((member, index) => (
                  <Box 
                    key={index} 
                    p={4} 
                    bg="#162520" 
                    borderRadius="md"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateX(4px)',
                      borderColor: '#FDB137',
                    }}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="#FDB137">{member.username}</Text>
                        <Text fontSize="sm" color="#A7EFC5">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="bold" color={member.isActive ? '#FDB137' : 'red.400'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Text fontSize="sm" color={member.status === 'approved' ? '#A7EFC5' : 'yellow.400'}>
                          {member.status === 'approved' ? 'Approved' : 'Pending Approval'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color="#FDB137" textAlign="center" py={4}>
                  No indirect downlines yet
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </AgentLayout>
  );
}
