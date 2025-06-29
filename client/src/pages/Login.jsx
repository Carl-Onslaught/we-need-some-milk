import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  Link as ChakraLink,
  useToast,
  Alert,
  AlertIcon,
  Stack,
  Image,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginLogo from '../assets/images/Logo2.png';

function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!loginId.trim()) {
        throw new Error('Please enter your username or email');
      }
      if (!password.trim()) {
        throw new Error('Please enter your password');
      }

      // Check if loginId is an email
      const isEmail = loginId.includes('@');
      const loginData = isEmail 
        ? { email: loginId, password }
        : { username: loginId, password };

      const response = await login(loginData);
      
      if (!response.user || !response.user.role) {
        throw new Error('Invalid user data received from server');
      }

      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.user.username}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setTimeout(() => {
        switch (response.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'agent':
            navigate('/agent');
            break;
          default:
            navigate('/dashboard');
        }
      }, 100);
    } catch (error) {
      let errorMessage = error.message;
      if (error.response?.status === 401) {
        errorMessage = 'Invalid username/email or password';
      } else if (error.response?.status === 403) {
        errorMessage = 'Your account is inactive. Please contact support.';
      } else if (!error.response) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box bg="#181E20" minH="100vh" py={10}>
      <Container maxW="lg">
        <Box
          bg="#242C2E"
          p={8}
          borderRadius="lg"
          boxShadow="dark-lg"
          borderWidth="1px"
          borderColor="#181E20"
        >
          <Stack spacing={4} mb={8} textAlign="center">
            <Heading color="white">Login</Heading>
            <Image
              src={loginLogo}
              alt="Wealth Clicks Logo"
              width="150px"
              height="auto"
              mx="auto"
              mb={4}
            />

          </Stack>
          {error && (
            <Alert status="error" mb={4} borderRadius="md" bg="#242C2E" color="#E0E0E0">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color="#E0E0E0">Username</FormLabel>
                <Input
                  type="text"
                  id="loginId"
                  name="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="username"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="#E0E0E0">Password</FormLabel>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="current-password"
                />
              </FormControl>
              <Button
                type="submit"
                bg="#FDB137"
                color="#181E20"
                boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                _hover={{
                  bg: "#BD5301",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  transform: "translateY(-2px)"
                }}
                size="lg"
                fontWeight="bold"
                isLoading={isLoading}
              >
                Login
              </Button>
            </Stack>
          </form>
          <Text mt={6} textAlign="center" color="#E0E0E0">
            Don't have an account?{' '}
            <Text
              as={Link}
              to="/register"
              color="#FDB137"
              _hover={{ textDecoration: 'underline', color: '#BD5301' }}
            >
              Register
            </Text>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

export default Login; 