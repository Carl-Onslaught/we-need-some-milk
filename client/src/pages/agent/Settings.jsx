import {
  Box,
  Container,
  Heading,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Divider,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AgentLayout from '../../components/AgentLayout';

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/agent/change-password', {
        currentPassword,
        newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AgentLayout>
      <Box>
        {/* Account Info */}
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
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">Account Information</Heading>
              <Divider borderColor="gray.700" />
              <Box>
                <Text color="gray.400">Username</Text>
                <Text fontWeight="bold" color="white">{user?.username}</Text>
              </Box>
              <Box>
                <Text color="gray.400">Email</Text>
                <Text fontWeight="bold" color="white">{user?.email}</Text>
              </Box>
              <Box>
                <Text color="gray.400">Account Type</Text>
                <Text fontWeight="bold" color="white" textTransform="capitalize">{user?.role}</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Change Password */}
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
            <VStack spacing={6} as="form" onSubmit={handlePasswordChange}>
              <Heading size="md" color="white">Change Password</Heading>
              <Divider borderColor="gray.700" />
              
              <FormControl isRequired>
                <FormLabel color="white" htmlFor="current-password">Current Password</FormLabel>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  bg="#181E20"
                  color="white"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white" htmlFor="new-password">New Password</FormLabel>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  bg="#181E20"
                  color="white"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white" htmlFor="confirm-password">Confirm New Password</FormLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  bg="#181E20"
                  color="white"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <Button
                type="submit"
                bg="#FDB137"
                color="black"
                isLoading={isSubmitting}
                loadingText="Updating"
                w="full"
                _hover={{
                  transform: 'scale(0.95)',
                  bg: '#BD5301',
                  color: 'white'
                }}
                transition="all 0.2s"
              >
                Update Password
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </AgentLayout>
  );
}
