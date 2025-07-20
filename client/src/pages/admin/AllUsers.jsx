import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Heading, Input, VStack, Text, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, Spinner, Flex, Card, CardBody, Tooltip, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, InputGroup, InputRightElement, IconButton
} from '@chakra-ui/react';
import { FaSyncAlt, FaUserSlash, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

const ITEMS_PER_PAGE = 10;

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetUserId, setResetUserId] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [deactivateLoadingId, setDeactivateLoadingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users');
      // Sort by createdAt descending (newest first)
      const sorted = res.data
        .filter(u => u.isActive && u.status === 'approved')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(sorted);
    } catch (err) {
      setUsers([]);
    }
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleRowClick = (user, e) => {
    // Prevent modal open if clicking a button
    if (e.target.closest('button')) return;
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeactivate = async (userId) => {
    setDeactivateLoadingId(userId);
    try {
      await axios.post(`/admin/users/${userId}/toggle-status`);
      toast({ title: 'User deactivated successfully!', status: 'success', duration: 2000, isClosable: true });
      fetchUsers();
      setModalOpen(false);
    } catch (err) {
      toast({ title: 'Error deactivating user', status: 'error', duration: 2000, isClosable: true });
    }
    setDeactivateLoadingId(null);
  };
  const handlePasswordReset = async (userId) => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1000));
      toast({ title: 'Password reset link sent!', status: 'success', duration: 2000, isClosable: true });
      setModalOpen(false);
    } catch (err) {
      toast({ title: 'Error resetting password', status: 'error', duration: 2000, isClosable: true });
    }
    setActionLoading(false);
  };

  const openResetModal = (userId) => {
    setResetUserId(userId);
    setResetPassword('');
    setResetModalOpen(true);
  };
  const closeResetModal = () => {
    setResetModalOpen(false);
    setResetUserId(null);
    setResetPassword('');
  };
  const submitResetPassword = async () => {
    setResetLoading(true);
    try {
      await axios.post(`/admin/users/${resetUserId}/reset-password`, { newPassword: resetPassword });
      toast({ title: 'Password reset successfully!', status: 'success', duration: 2000, isClosable: true });
      closeResetModal();
    } catch (err) {
      toast({ title: 'Error resetting password', status: 'error', duration: 2000, isClosable: true });
    }
    setResetLoading(false);
  };

  const tableBg = '#242C2E';
  const headerBg = '#181E20';
  const borderColor = '#181E20';
  const accentColor = '#FDB137';

  return (
    <AdminLayout>
      <VStack spacing={6} align="stretch" px={{ base: 2, md: 8 }}>
        <Box mt={{ base: 8, md: 12 }} mb={2}>
          <Heading size="lg" color={accentColor} textAlign="left" letterSpacing="tight">
            All Users
          </Heading>
          <Text color="gray.300" textAlign="left">
            View and manage all active members
          </Text>
        </Box>
        <Box>
          <Input
            placeholder="Search users by name or email..."
            size="md"
            mb={4}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            bg={headerBg}
            borderColor={borderColor}
            color="white"
            _placeholder={{ color: 'gray.500' }}
            w="100%"
            maxW="100%"
          />
          <Card bg={tableBg} borderRadius="lg" boxShadow="dark-lg" borderColor={borderColor} borderWidth="1px" w="100%">
            <CardBody p={{ base: 0, md: 0 }}>
              {loading ? (
                <Flex justify="center" align="center" minH="200px"><Spinner color={accentColor} /></Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" colorScheme="gray" size="md" bg={tableBg} minW="900px">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>USERNAME</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>EMAIL</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>DIRECT REFERRAL INCOME</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>INDIRECT REFERRAL INCOME</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>TOTAL CLICK EARNINGS</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>ACTIVE SHARED CAPITAL</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>SHARED CAPITAL EARNINGS</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>TOTAL WITHDRAWN</Th>
                        <Th color={accentColor} fontSize={{ base: 'xs', md: 'sm' }} py={3} borderColor={borderColor}>ACTIONS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginated.length === 0 ? (
                        <Tr><Td colSpan={9} textAlign="center" color="gray.400" bg={tableBg}>No users found.</Td></Tr>
                      ) : paginated.map(user => (
                        <Tr
                          key={user._id}
                          _hover={{ bg: '#23292b', cursor: 'pointer', boxShadow: 'md', transition: 'all 0.2s' }}
                          borderBottomWidth="1px"
                          borderColor={borderColor}
                          onClick={e => handleRowClick(user, e)}
                        >
                          <Td fontWeight="bold" color="white" fontSize={{ base: 'xs', md: 'md' }}>{user.username}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>{user.email}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>₱{user.referralEarnings?.direct?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>₱{user.referralEarnings?.indirect?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>₱{user.clickEarnings?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>{user.investments?.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>₱{user.sharedEarnings?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td color="gray.200" fontSize={{ base: 'xs', md: 'md' }}>₱{user.totalWithdraw?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Reset Password" hasArrow>
                                <Button
                                  size="sm"
                                  colorScheme="yellow"
                                  variant="outline"
                                  borderColor={accentColor}
                                  color={accentColor}
                                  _hover={{ bg: accentColor, color: '#181E20', transform: 'scale(1.05)' }}
                                  onClick={e => { e.stopPropagation(); openResetModal(user._id); }}
                                  transition="all 0.2s"
                                >
                                  Reset
                                </Button>
                              </Tooltip>
                              <Tooltip label="Deactivate User" hasArrow>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="solid"
                                  _hover={{ bg: '#a30000', transform: 'scale(1.05)' }}
                                  onClick={e => { e.stopPropagation(); handleDeactivate(user._id); }}
                                  isLoading={deactivateLoadingId === user._id}
                                  transition="all 0.2s"
                                >
                                  Deactivate
                                </Button>
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
          {/* Pagination */}
          <Flex justify="space-between" align="center" mt={4} direction={{ base: 'column', md: 'row' }} gap={2}>
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              bg={accentColor}
              color="#181E20"
              borderColor={accentColor}
              _hover={{ bg: '#181E20', color: accentColor, borderColor: accentColor }}
              w={{ base: '100%', md: 'auto' }}
            >
              Previous
            </Button>
            <Text color="gray.400" fontSize={{ base: 'sm', md: 'md' }}>Page {page} of {totalPages || 1}</Text>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              bg={accentColor}
              color="#181E20"
              borderColor={accentColor}
              _hover={{ bg: '#181E20', color: accentColor, borderColor: accentColor }}
              w={{ base: '100%', md: 'auto' }}
            >
              Next
            </Button>
          </Flex>
        </Box>
      </VStack>
      {/* User Detail Modal */}
      <Modal isOpen={modalOpen} onClose={handleModalClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg={tableBg} color="white">
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} color={accentColor}>
            User Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack align="start" spacing={3}>
                <Text><b>Username:</b> {selectedUser.username}</Text>
                <Text><b>Email:</b> {selectedUser.email}</Text>
                <Text><b>Direct Referral Income:</b> ₱{selectedUser.referralEarnings?.direct?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
                <Text><b>Indirect Referral Income:</b> ₱{selectedUser.referralEarnings?.indirect?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
                <Text><b>Total Click Earnings:</b> ₱{selectedUser.clickEarnings?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
                <Text><b>Active Shared Capital:</b> {selectedUser.investments?.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
                <Text><b>Shared Capital Earnings:</b> ₱{selectedUser.sharedEarnings?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
                <Text><b>Total Withdrawn:</b> ₱{selectedUser.totalWithdraw?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              colorScheme="yellow"
              variant="outline"
              borderColor={accentColor}
              color={accentColor}
              _hover={{ bg: accentColor, color: '#181E20', transform: 'scale(1.05)' }}
              onClick={() => openResetModal(selectedUser?._id)}
              mr={3}
              transition="all 0.2s"
            >
              Reset
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="solid"
              _hover={{ bg: '#a30000', transform: 'scale(1.05)' }}
              onClick={() => handleDeactivate(selectedUser?._id)}
              isLoading={deactivateLoadingId === selectedUser?._id}
              transition="all 0.2s"
            >
              Deactivate
            </Button>
            <Button onClick={handleModalClose} ml={3} colorScheme="gray" variant="ghost">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Reset Password Modal */}
      <Modal isOpen={resetModalOpen} onClose={closeResetModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={tableBg} color="white">
          <ModalHeader color={accentColor}>Please enter new password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel color="gray.300">New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  placeholder="Enter new password"
                  bg={headerBg}
                  color="white"
                  borderColor={borderColor}
                  _placeholder={{ color: 'gray.500' }}
                  disabled={resetLoading}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    icon={showResetPassword ? <FaEyeSlash /> : <FaEye />}
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    onClick={() => setShowResetPassword(s => !s)}
                    tabIndex={-1}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="yellow"
              mr={3}
              onClick={submitResetPassword}
              isLoading={resetLoading}
              disabled={!resetPassword}
            >
              Submit
            </Button>
            <Button onClick={closeResetModal} colorScheme="gray" variant="ghost" disabled={resetLoading}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
} 