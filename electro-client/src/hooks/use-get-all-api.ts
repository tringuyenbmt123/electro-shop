import { useQuery } from 'react-query';
import useAppStore from 'stores/use-app-store';
import FilterUtils from 'utils/FilterUtils';
import FetchUtils, { ErrorMessage, ListResponse, RequestParams } from 'utils/FetchUtils';
import NotifyUtils from 'utils/NotifyUtils';
import { UseQueryOptions } from 'react-query/types/react/types';

function useGetAllApi<O>(
  resourceUrl: string,
  resourceKey: string,
  requestParams?: RequestParams,
  successCallback?: (data: ListResponse<O>) => void,
  options?: UseQueryOptions<ListResponse<O>, ErrorMessage>,
  isAdmin = true,
  useToken = true
) {
  const {
    activePage,
    activePageSize,
    activeFilter,
    searchToken,
  } = useAppStore();

  if (!requestParams) {
    requestParams = {
      page: activePage,
      size: activePageSize,
      sort: FilterUtils.convertToSortRSQL(activeFilter),
      filter: FilterUtils.convertToFilterRSQL(activeFilter),
      search: searchToken,
    };
  }

  const queryKey = [resourceKey, 'getAll', requestParams, useToken, isAdmin];

  return useQuery<ListResponse<O>, ErrorMessage>(
    queryKey,
    () => useToken
      ? FetchUtils.getWithToken<ListResponse<O>>(resourceUrl, requestParams, isAdmin)
      : FetchUtils.get<ListResponse<O>>(resourceUrl, requestParams),
    {
      keepPreviousData: true,
      onSuccess: successCallback,
      onError: (error) =>
        NotifyUtils.simpleFailed(`Lỗi ${error.statusCode || 'chưa biết'}: Lấy dữ liệu không thành công`),
      ...options,
    }
  );
  
}

export default useGetAllApi;
