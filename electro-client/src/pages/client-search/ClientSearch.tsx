import React, { useState } from 'react';
import {
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Pagination,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowsDownUp,
  ChartCandle,
  Marquee
} from 'tabler-icons-react';
import { ClientProductCard } from 'components';
import ApplicationConstants from 'constants/ApplicationConstants';
import { useQuery } from 'react-query';
import FetchUtils, { ErrorMessage, ListResponse } from 'utils/FetchUtils';
import { ClientListedProductResponse } from 'types';
import ResourceURL from 'constants/ResourceURL';
import useTitle from 'hooks/use-title';

function ClientSearch() {
  const theme = useMantineTheme();

  const rawSearchQuery =
    new URLSearchParams(useLocation().search).get('q') || '';

  const searchQuery = rawSearchQuery.trim();

  useTitle(`Kết quả tìm kiếm cho "${searchQuery}"`);

  const [activePage, setActivePage] = useState(1);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [activeSaleable, setActiveSaleable] = useState(false);

  const requestParams = {
    page: activePage,
    size: ApplicationConstants.DEFAULT_CLIENT_SEARCH_PAGE_SIZE,
    filter: null,
    sort: activeSort,
    search: searchQuery ? encodeURIComponent(searchQuery) : null,
    newable: true,
    saleable: activeSaleable,
  };

  const {
    data: productResponses,
    isLoading: isLoadingProductResponses,
    isError: isErrorProductResponses,
    error,
  } = useQuery<ListResponse<ClientListedProductResponse>, ErrorMessage>(
    ['client-api', 'products', 'getAllProducts', requestParams],
    () => FetchUtils.get(ResourceURL.CLIENT_PRODUCT, requestParams),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  let resultFragment;

  if (isLoadingProductResponses) {
    resultFragment = (
      <Stack>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={50} radius="md" />
        ))}
      </Stack>
    );
  }
  else if (isErrorProductResponses) {
    const isBadRequest = error?.statusCode === 400;

    resultFragment = (
      <Stack
        my={theme.spacing.xl}
        align="center"
        sx={{ color: isBadRequest ? theme.colors.yellow[7] : theme.colors.pink[6] }}
      >
        <AlertTriangle size={125} strokeWidth={1} />
        <Text size="xl" weight={500}>
          {isBadRequest
            ? 'Từ khóa tìm kiếm không hợp lệ'
            : 'Đã có lỗi xảy ra'}
        </Text>
      </Stack>
    );
  }
  else if (productResponses && productResponses.totalElements === 0) {
    resultFragment = (
      <Stack
        my={theme.spacing.xl}
        align="center"
        sx={{ color: theme.colors.blue[6] }}
      >
        <Marquee size={125} strokeWidth={1} />
        <Text size="xl" weight={500}>
          Không có sản phẩm
        </Text>
      </Stack>
    );
  }
  else if (productResponses) {
    resultFragment = (
      <>
        <Grid mt={theme.spacing.xs}>
          {productResponses.content.map((product, index) => (
            <Grid.Col key={index} span={6} sm={4} md={3}>
              <ClientProductCard
                product={product}
                search={searchQuery}
              />
            </Grid.Col>
          ))}
        </Grid>

        <Group position="apart" mt={theme.spacing.lg}>
          <Pagination
            page={activePage}
            total={productResponses.totalPages}
            onChange={(page) =>
              page !== activePage && setActivePage(page)
            }
          />
          <Text>
            <Text component="span" weight={500}>
              Trang {activePage}
            </Text>
            <span> / {productResponses.totalPages}</span>
          </Text>
        </Group>
      </>
    );
  }

  return (
    <main>
      <Container size="xl">
        <Stack spacing={theme.spacing.xl * 1.5}>
          <Card radius="md" shadow="sm" p="lg">
            <Title order={2}>
              Kết quả tìm kiếm cho &quot;
              <Text component="span" color="yellow" inherit>
                {searchQuery}
              </Text>
              &quot;
            </Title>
          </Card>

          <Stack spacing="lg">
            <Group position="apart">
              <Group spacing="xs">
                <ArrowsDownUp size={20} />
                <Text weight={500} mr={theme.spacing.xs}>
                  Sắp xếp theo
                </Text>
                <RadioGroup
                  value={activeSort || ''}
                  onChange={(value) =>
                    setActiveSort(
                      (value as
                        | ''
                        | 'lowest-price'
                        | 'highest-price') || null
                    )
                  }
                >
                  <Radio value="" label="Mới nhất" />
                  <Radio value="lowest-price" label="Giá thấp → cao" />
                  <Radio value="highest-price" label="Giá cao → thấp" />
                </RadioGroup>
              </Group>
              <Text>{productResponses?.totalElements || 0} sản phẩm</Text>
            </Group>

            <Group spacing="xs">
              <ChartCandle size={20} />
              <Text weight={500} mr={theme.spacing.xs}>
                Lọc theo
              </Text>
              <Checkbox
                label="Chỉ tính còn hàng"
                checked={activeSaleable}
                onChange={(event) => {
                  setActiveSaleable(event.currentTarget.checked);
                  setActivePage(1);
                }}
              />
            </Group>

            {resultFragment}
          </Stack>
        </Stack>
      </Container>
    </main>
  );
}

export default ClientSearch;
