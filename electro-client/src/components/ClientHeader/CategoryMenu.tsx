import React, { Dispatch, SetStateAction } from 'react';
import {
  Anchor,
  Grid,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import PageConfigs from 'pages/PageConfigs';
import { useQuery } from 'react-query';
import { ClientCategoryResponse, CollectionWrapper } from 'types';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
import { AlertTriangle, Folder } from 'tabler-icons-react';

function CategoryMenu({
  setOpenedCategoryMenu,
}: {
  setOpenedCategoryMenu: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const {
    data: categoryResponses,
    isLoading,
    isError,
  } = useQuery<CollectionWrapper<ClientCategoryResponse>, ErrorMessage>(
    ['client-api', 'categories', 'getAllCategories'],
    () => FetchUtils.get(ResourceURL.CLIENT_CATEGORY),
    {
      onError: () => NotifyUtils.simpleFailed('Lấy dữ liệu không thành công'),
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <Stack>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={50} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack my={theme.spacing.xl} align="center" sx={{ color: theme.colors.pink[6] }}>
        <AlertTriangle size={120} strokeWidth={1} />
        <Text size="xl" weight={500}>
          Đã có lỗi xảy ra
        </Text>
      </Stack>
    );
  }

  const handleAnchor = (slug: string) => {
    setOpenedCategoryMenu(false);
    setTimeout(() => {
      navigate('/category/' + encodeURIComponent(slug));
    }, 200);
  };

  return (
    <Tabs
      variant="pills"
      tabPadding="md"
      styles={{
        tabActive: {
          color:
            (theme.colorScheme === 'dark'
              ? theme.colors.blue[2]
              : theme.colors.blue[6]) + '!important',
          backgroundColor:
            (theme.colorScheme === 'dark'
              ? theme.fn.rgba(theme.colors.blue[8], 0.35)
              : theme.colors.blue[0]) + '!important',
        },
      }}
    >
      {categoryResponses?.content?.map((firstCategory) => {
        const FirstCategoryIcon =
          PageConfigs.categorySlugIconMap[firstCategory.categorySlug] ?? Folder;

        return (
          <Tabs.Tab
            key={firstCategory.categorySlug}
            label={firstCategory.categoryName}
            icon={<FirstCategoryIcon size={14} />}
          >
            <Stack>
              <Group>
                <ThemeIcon variant="light" size={42}>
                  <FirstCategoryIcon />
                </ThemeIcon>

                <Anchor
                  sx={{ fontSize: theme.fontSizes.sm * 2 }}
                  weight={500}
                  onClick={() => handleAnchor(firstCategory.categorySlug)}
                >
                  {firstCategory.categoryName}
                </Anchor>
              </Group>

              <ScrollArea style={{ height: 325 }}>
                <Grid sx={{ width: '100%' }}>
                  {firstCategory.categoryChildren?.map((secondCategory) => (
                    <Grid.Col
                      key={secondCategory.categorySlug}
                      span={6}
                      xs={4}
                      sm={3}
                      md={2.4}
                      mb="sm"
                    >
                      <Stack spacing="xs">
                        <Anchor
                          weight={500}
                          color="pink"
                          onClick={() =>
                            handleAnchor(secondCategory.categorySlug)
                          }
                        >
                          {secondCategory.categoryName}
                        </Anchor>

                        {secondCategory.categoryChildren?.map((thirdCategory) => (
                          <Anchor
                            key={thirdCategory.categorySlug}
                            onClick={() =>
                              handleAnchor(thirdCategory.categorySlug)
                            }
                          >
                            {thirdCategory.categoryName}
                          </Anchor>
                        ))}
                      </Stack>
                    </Grid.Col>
                  ))}
                </Grid>
              </ScrollArea>
            </Stack>
          </Tabs.Tab>
        );
      })}
    </Tabs>
  );
}

export default CategoryMenu;