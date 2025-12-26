import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberInput,
  NumberInputHandlers,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import { Link } from 'react-router-dom';
import MiscUtils from 'utils/MiscUtils';
import { ClientCarousel, ReviewStarGroup } from 'components';
import { BellPlus, Heart, PhotoOff, ShoppingCart } from 'tabler-icons-react';
import React, { useRef, useState } from 'react';
import {
  ClientCartRequest,
  ClientPreorderRequest,
  ClientProductResponse,
  ClientWishRequest,
  UpdateQuantityType
} from 'types';
import useCreateWishApi from 'hooks/use-create-wish-api';
import NotifyUtils from 'utils/NotifyUtils';
import useAuthStore from 'stores/use-auth-store';
import useCreatePreorderApi from 'hooks/use-create-preorder-api';
import useSaveCartApi from 'hooks/use-save-cart-api';

interface ClientProductIntroProps {
  product: ClientProductResponse;
}

function ClientProductIntro({ product }: ClientProductIntroProps) {
  const theme = useMantineTheme();

  const [selectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const quantityInputHandlers = useRef<NumberInputHandlers>(null);

  const { user, currentCartId } = useAuthStore();

  const createWishApi = useCreateWishApi();
  const createPreorderApi = useCreatePreorderApi();
  const saveCartApi = useSaveCartApi();

  const selectedVariant = product.productVariants[selectedVariantIndex];

  /* ================= SAFE HANDLERS ================= */

  const handleCreateWishButton = () => {
    if (!user) {
      NotifyUtils.simple('Vui lòng đăng nhập để sử dụng chức năng');
      return;
    }

    const request: ClientWishRequest = {
      productId: product.productId,
    };

    createWishApi.mutate(request);
  };

  const handleCreatePreorderButton = () => {
    if (!user) {
      NotifyUtils.simple('Vui lòng đăng nhập để sử dụng chức năng');
      return;
    }

    const request: ClientPreorderRequest = {
      productId: product.productId,
      status: 1,
    };

    createPreorderApi.mutate(request);
  };

  const handleAddToCartButton = () => {
    if (!user) {
      NotifyUtils.simple('Vui lòng đăng nhập để sử dụng chức năng');
      return;
    }

    if (!selectedVariant || selectedVariant.variantInventory <= 0) {
      NotifyUtils.simpleFailed('Phiên bản không hợp lệ');
      return;
    }

    const safeQuantity = Math.min(
      Math.max(quantity, 1),
      selectedVariant.variantInventory
    );

    const cartRequest: ClientCartRequest = {
      cartId: currentCartId,
      cartItems: [
        {
          variantId: selectedVariant.variantId,
          quantity: safeQuantity,
        },
      ],
      status: 1,
      updateQuantityType: UpdateQuantityType.INCREMENTAL,
    };

    saveCartApi.mutate(cartRequest, {
      onSuccess: () =>
        NotifyUtils.simpleSuccess(
          <Text inherit>
            Đã thêm vào{' '}
            <Anchor component={Link} to="/cart" inherit>
              giỏ hàng
            </Anchor>
          </Text>
        ),
    });
  };

  /* ================= UI ================= */

  return (
    <Card radius="md" shadow="sm" p="lg">
      <Stack>
        <Breadcrumbs>
          <Anchor component={Link} to="/">Trang chủ</Anchor>
          {product.productCategory &&
            MiscUtils.makeCategoryBreadcrumbs(product.productCategory).map(c => (
              <Anchor
                key={c.categorySlug}
                component={Link}
                to={`/category/${encodeURIComponent(c.categorySlug)}`}
              >
                {c.categoryName}
              </Anchor>
            ))}
          <Text color="dimmed">{product.productName}</Text>
        </Breadcrumbs>

        <Grid gutter="lg">
          {/* ================= IMAGE ================= */}
          <Grid.Col md={6}>
            {product.productImages.length > 0 ? (
              <ClientCarousel>
                {product.productImages.map(image => (
                  <Image
                    key={image.id}
                    radius="md"
                    src={image.path}
                    styles={{ image: { aspectRatio: '1 / 1' } }}
                    withPlaceholder
                  />
                ))}
              </ClientCarousel>
            ) : (
              <Box
                sx={{
                  borderRadius: theme.radius.md,
                  aspectRatio: '1 / 1',
                  border: `2px dotted ${theme.colors.gray[5]}`,
                }}
              >
                <Stack align="center" justify="center" sx={{ height: '100%' }}>
                  <PhotoOff size={100} strokeWidth={1} />
                  <Text>Không có hình cho sản phẩm này</Text>
                </Stack>
              </Box>
            )}
          </Grid.Col>

          {/* ================= INFO ================= */}
          <Grid.Col md={6}>
            <Stack spacing="lg">
              {!product.productSaleable && (
                <Badge color="red">Hết hàng</Badge>
              )}

              <Text sx={{ fontSize: 26 }} weight={500}>
                {product.productName}
              </Text>

              <Group spacing="xs">
                <ReviewStarGroup ratingScore={product.productAverageRatingScore} />
                <Text size="sm">{product.productCountReviews} đánh giá</Text>
              </Group>

              {product.productShortDescription && (
                <Text color="dimmed">{product.productShortDescription}</Text>
              )}

              {/* ================= PRICE ================= */}
              <Box
                sx={{
                  backgroundColor:
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[5]
                      : theme.colors.gray[0],
                  borderRadius: theme.radius.md,
                  padding: '16px 20px',
                }}
              >
                <Text sx={{ fontSize: 24 }} weight={700} color="pink">
                  {MiscUtils.formatPrice(
                    MiscUtils.calculateDiscountedPrice(
                      selectedVariant.variantPrice,
                      product.productPromotion?.promotionPercent || 0
                    )
                  )}{' '}
                  ₫
                </Text>
              </Box>

              {/* ================= QUANTITY ================= */}
              {product.productSaleable && (
                <Group>
                  <ActionIcon onClick={() => quantityInputHandlers.current?.decrement()}>
                    –
                  </ActionIcon>

                  <NumberInput
                    hideControls
                    value={quantity}
                    min={1}
                    max={selectedVariant.variantInventory}
                    handlersRef={quantityInputHandlers}
                    onChange={(value) =>
                      setQuantity(Math.max(1, Number(value) || 1))
                    }
                    styles={{ input: { width: 54, textAlign: 'center' } }}
                  />

                  <ActionIcon onClick={() => quantityInputHandlers.current?.increment()}>
                    +
                  </ActionIcon>
                </Group>
              )}

              {/* ================= ACTION ================= */}
              <Group>
                {product.productSaleable ? (
                  <Button
                    leftIcon={<ShoppingCart />}
                    color="pink"
                    onClick={handleAddToCartButton}
                  >
                    Chọn mua
                  </Button>
                ) : (
                  <Button
                    leftIcon={<BellPlus />}
                    color="teal"
                    onClick={handleCreatePreorderButton}
                  >
                    Đặt trước
                  </Button>
                )}

                <Button
                  variant="outline"
                  leftIcon={<Heart />}
                  onClick={handleCreateWishButton}
                >
                  Yêu thích
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}

export default ClientProductIntro;
