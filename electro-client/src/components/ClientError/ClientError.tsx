import React from 'react';
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ErrorMessage } from 'utils/FetchUtils';

interface ClientErrorProps {
  error?: ErrorMessage | null;
}

function ClientError({ error }: ClientErrorProps) {
  const message =
    error?.statusCode === 400
      ? error.message || 'Dữ liệu không hợp lệ'
      : 'Đã có lỗi xảy ra';

  return (
    <main>
      <Container size="xl">
        <Stack spacing="xl" sx={{ textAlign: 'center' }}>
          <Text
            weight={700}
            sx={(theme) => ({
              fontSize: 120,
              color:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2],
            })}
          >
            Oops...
          </Text>

          <Title>{message}</Title>

          <Group position="center">
            <Button component={Link} to="/" variant="subtle" size="md">
              Trở về Trang chủ
            </Button>
          </Group>
        </Stack>
      </Container>
    </main>
  );
}

export default ClientError;
