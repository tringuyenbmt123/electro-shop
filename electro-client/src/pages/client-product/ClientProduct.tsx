import React from 'react';
import { Container, Skeleton, Stack, useMantineTheme } from '@mantine/core';
import { useQuery } from 'react-query';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import { useParams } from 'react-router-dom';
import { ClientProductResponse } from 'types';
import useTitle from 'hooks/use-title';
import { ClientError } from 'components';
import ClientProductIntro from 'pages/client-product/ClientProductIntro';
import ClientProductSpecification from 'pages/client-product/ClientProductSpecification';
import ClientProductDescription from 'pages/client-product/ClientProductDescription';
import ClientProductReviews from 'pages/client-product/ClientProductReviews';
import ClientProductRelatedProducts from 'pages/client-product/ClientProductRelatedProducts';

function ClientProduct() {
  const theme = useMantineTheme();
  const { slug } = useParams<{ slug: string }>();

  const encodedSlug = encodeURIComponent(slug || '');

  const {
    productResponse,
    isLoadingProductResponse,
    isErrorProductResponse,
  } = useGetProductApi(encodedSlug);

  const product = productResponse as ClientProductResponse | undefined;

  useTitle(product?.productName ?? 'Sản phẩm');

  // ===== Loading =====
  if (isLoadingProductResponse) {
    return <ClientProductSkeleton />;
  }

  // ===== API error (400 / 404 / 500) =====
  if (isErrorProductResponse) {
    return <ClientError />;
  }

  // ===== Data không tồn tại =====
  if (!product) {
    return <ClientError />;
  }

  // ===== Success =====
  return (
    <main>
      <Container size="xl">
        <Stack spacing={theme.spacing.xl * 2}>
          <ClientProductIntro product={product} />

          {product.productSpecifications && (
            <ClientProductSpecification product={product} />
          )}

          {product.productDescription && (
            <ClientProductDescription product={product} />
          )}

          <ClientProductReviews productSlug={encodedSlug} />

          {product.productRelatedProducts?.length > 0 && (
            <ClientProductRelatedProducts product={product} />
          )}
        </Stack>
      </Container>
    </main>
  );
}

function ClientProductSkeleton() {
  return (
    <main>
      <Container size="xl">
        <Stack>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={50} radius="md" />
          ))}
        </Stack>
      </Container>
    </main>
  );
}

function useGetProductApi(productSlug: string) {
  const {
    data: productResponse,
    isLoading: isLoadingProductResponse,
    isError: isErrorProductResponse,
  } = useQuery<ClientProductResponse, ErrorMessage>(
    ['client-api', 'products', 'getProduct', productSlug],
    () => FetchUtils.get(`${ResourceURL.CLIENT_PRODUCT}/${productSlug}`),
    {
      // ❗ KHÔNG notify cho 400/404
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    productResponse,
    isLoadingProductResponse,
    isErrorProductResponse,
  };
}

export default ClientProduct;
