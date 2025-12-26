import Titles from 'constants/Titles';
import { matchRoutes, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';

const routes = Object.keys(Titles).map((title) => ({ path: title }));

/**
 * Sanitize cho context document.title (plain text).
 * Không dùng cho HTML context.
 */
function sanitizeTitle(input: string): string {
  return input
    .replace(/[<>]/g, '')   // loại bỏ ký tự HTML cơ bản
    .replace(/\s+/g, ' ')   // chuẩn hoá khoảng trắng
    .trim();
}

function useTitle(explicitTitle?: string) {
  const location = useLocation();
  const match = matchRoutes(routes, location);
  const path = match ? match[0].route.path : '';

  const baseTitle = explicitTitle
    ? sanitizeTitle(explicitTitle)
    : sanitizeTitle(Titles[path] ?? 'Electro');

  useDocumentTitle(`${baseTitle} – Electro`);
}

export default useTitle;
