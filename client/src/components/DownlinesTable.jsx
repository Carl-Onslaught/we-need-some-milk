import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';

export default function DownlinesTable({ downlines, stats }) {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Direct Downlines</StatLabel>
              <StatNumber>{stats.totalDirectDownlines}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Indirect Downlines</StatLabel>
              <StatNumber>{stats.totalIndirectDownlines}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Downlines</StatLabel>
              <StatNumber>{stats.totalDownlines}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Level</Th>
              <Th>Referral Code</Th>
              <Th>Join Date</Th>
              <Th isNumeric>Total Earnings</Th>
              {/* Only show Upline column for indirect downlines */}
              <Th>Upline</Th>
            </Tr>
          </Thead>
          <Tbody>
            {downlines.map((downline) => (
              <Tr key={downline._id}>
                <Td>{downline.username}</Td>
                <Td>{downline.email}</Td>
                <Td>
                  <Badge colorScheme={downline.level === 1 ? 'green' : 'blue'}>
                    Level {downline.level}
                  </Badge>
                </Td>
                <Td>{downline.referralCode}</Td>
                <Td>{downline.createdAt}</Td>
                <Td isNumeric>₱{downline.totalEarnings.toFixed(2)}</Td>
                <Td>{downline.upline || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
