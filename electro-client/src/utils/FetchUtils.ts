import ApplicationConstants from 'constants/ApplicationConstants';
import { CollectionWrapper } from 'types';
import { UploadedImageResponse } from 'models/Image';

/**
 * RequestParams dùng để chứa các query param
 */
export interface RequestParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
  search?: string;
  all?: number;
}

/**
 * ListResponse dùng để thể hiện đối tượng trả về sau lệnh getAll
 */
export interface ListResponse<O = unknown> {
  content: O[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * ErrorMessage dùng để thể hiện đối tượng lỗi trả về sau lệnh fetch
 */
export interface ErrorMessage {
  status: number;
  statusCode: number;
  timestamp: string;
  message: string;
  description: string;
}

type BasicRequestParams = Record<string, string | number | null | boolean>;


class FetchUtils {

  private static getJwtToken(isAdmin?: boolean): string {
    const raw = localStorage.getItem(
      isAdmin ? 'electro-admin-auth-store' : 'electro-auth-store'
    );

    if (!raw) {
      throw {
        statusCode: 401,
        message: 'JWT token not found (storage empty)',
      };
    }

    const parsed = JSON.parse(raw);
    const token = parsed?.state?.jwtToken;

    if (!token || typeof token !== 'string') {
      throw {
        statusCode: 401,
        message: 'JWT token not found (invalid state)',
      };
    }

    return token;
  }

  /**
   * Hàm get cho các trường hợp truy vấn dữ liệu bên client
   * @param resourceUrl
   * @param requestParams
   */
  static async get<O>(resourceUrl: string, requestParams?: BasicRequestParams): Promise<O> {
    const response = await fetch(FetchUtils.concatParams(resourceUrl, requestParams));
    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  }

  /**
   * Hàm post cho các trường hợp thực hiện truy vấn POST
   * @param resourceUrl
   * @param requestBody
   */
  static async post<I, O>(resourceUrl: string, requestBody: I): Promise<O> {
    const response = await fetch(resourceUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  }

  /**
   * Hàm put cho các trường hợp thực hiện truy vấn PUT
   * @param resourceUrl
   * @param requestBody
   * @param requestParams
   */
  static async put<I, O>(resourceUrl: string, requestBody: I, requestParams?: BasicRequestParams): Promise<O> {
    const response = await fetch(FetchUtils.concatParams(resourceUrl, requestParams), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  }

  /**
   * Hàm getWithToken
   * @param resourceUrl
   * @param requestParams
   * @param isAdmin
   */
  static async getWithToken<O>(
    resourceUrl: string,
    requestParams?: RequestParams,
    isAdmin?: boolean
  ): Promise<O> {

    const token = FetchUtils.getJwtToken(isAdmin);

    // Chuẩn hoá: loại bỏ undefined
    const params: BasicRequestParams | undefined = requestParams
      ? Object.fromEntries(
        Object.entries(requestParams)
          .filter(([, v]) => v !== undefined && v !== null)
      )
      : undefined;

    const response = await fetch(
      FetchUtils.concatParams(resourceUrl, params),
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  }


  /**
   * Hàm postWithToken
   * @param resourceUrl
   * @param requestBody
   * @param isAdmin
   */
  static async postWithToken<I, O>(
    resourceUrl: string,
    requestBody: I,
    isAdmin?: boolean
  ): Promise<O> {

    const token = FetchUtils.getJwtToken(isAdmin);

    const response = await fetch(resourceUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  }

  /**
   * Hàm putWithToken
   * @param resourceUrl
   * @param requestBody
   * @param isAdmin
   */
  static async putWithToken<I, O>(
    resourceUrl: string,
    requestBody: I,
    isAdmin?: boolean
  ): Promise<O> {

    const token = FetchUtils.getJwtToken(isAdmin);

    const response = await fetch(resourceUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  }


  /**
   * Hàm deleteWithToken
   * @param resourceUrl
   * @param entityIds
   * @param isAdmin
   */
  static async deleteWithToken<T>(
    resourceUrl: string,
    entityIds: T[],
    isAdmin?: boolean
  ) {

    const token = FetchUtils.getJwtToken(isAdmin);

    const response = await fetch(resourceUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(entityIds),
    });

    if (!response.ok) {
      throw await response.json();
    }
  }

  /**
   * Hàm getAll dùng để lấy danh sách tất cả đối tượng (có thể theo một số tiêu chí, cài đặt trong requestParams)
   * @param resourceUrl
   * @param requestParams
   * @param isAdmin
   */
  static async getAll<O>(resourceUrl: string, requestParams?: RequestParams, isAdmin?: boolean): Promise<ListResponse<O>> {
    // Sử dụng getWithToken để thêm token nếu cần (giả sử getAll có thể yêu cầu token tùy endpoint)
    return await FetchUtils.getWithToken<ListResponse<O>>(resourceUrl, requestParams, isAdmin);
  }

  /**
   * Hàm getById dùng để lấy entity có id cho trước
   * @param resourceUrl
   * @param entityId
   * @param isAdmin
   */
  static async getById<O>(resourceUrl: string, entityId: number, isAdmin?: boolean): Promise<O> {
    // Sử dụng getWithToken để thêm header Authorization
    return await FetchUtils.getWithToken<O>(resourceUrl + '/' + entityId, undefined, isAdmin);
  }

  /**
   * Hàm create dùng để tạo entity từ requestBody
   * @param resourceUrl
   * @param requestBody
   * @param isAdmin
   */
  static async create<I, O>(resourceUrl: string, requestBody: I, isAdmin?: boolean): Promise<O> {
    // Sử dụng postWithToken để thêm token
    return await FetchUtils.postWithToken<I, O>(resourceUrl, requestBody, isAdmin);
  }

  /**
   * Hàm update dùng để cập nhật entity theo id và requestBody nhận được
   * @param resourceUrl
   * @param entityId
   * @param requestBody
   * @param isAdmin
   */
  static async update<I, O>(resourceUrl: string, entityId: number, requestBody: I, isAdmin?: boolean): Promise<O> {
    // Sử dụng putWithToken để thêm token
    return await FetchUtils.putWithToken<I, O>(resourceUrl + '/' + entityId, requestBody, isAdmin);
  }

  /**
   * Hàm deleteById xóa entity theo id nhận được
   * @param resourceUrl
   * @param entityId
   * @param isAdmin
   */
  static async deleteById<T>(resourceUrl: string, entityId: T, isAdmin?: boolean) {
    const token = FetchUtils.getJwtToken(isAdmin);
    const response = await fetch(resourceUrl + '/' + entityId, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw await response.json();
    }
  }

  /**
   * Hàm deleteByIds xóa hàng loạt entity theo mảng id nhận được
   * @param resourceUrl
   * @param entityIds
   * @param isAdmin
   */
  static async deleteByIds<T>(resourceUrl: string, entityIds: T[], isAdmin?: boolean) {
    const token = FetchUtils.getJwtToken(isAdmin);
    const response = await fetch(resourceUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(entityIds),
    });
    if (!response.ok) {
      throw await response.json();
    }
  }

  /**
   * Hàm uploadMultipleImages dùng để tải lên nhiều tệp hình
   * @param images
   * @param isAdmin
   */
  static async uploadMultipleImages(images: File[], isAdmin?: boolean): Promise<CollectionWrapper<UploadedImageResponse>> {
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    const token = FetchUtils.getJwtToken(isAdmin);
    const response = await fetch(ApplicationConstants.HOME_PATH + '/images/upload-multiple', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  }

  /**
   * Hàm concatParams dùng để nối url và requestParams
   * @param url
   * @param requestParams
   */
  private static concatParams = (url: string, requestParams?: BasicRequestParams) => {
    if (requestParams) {
      const filteredRequestParams = Object.fromEntries(Object.entries(requestParams)
        .filter(([, v]) => v != null && String(v).trim() !== '')) as Record<string, string>;
      if (Object.keys(filteredRequestParams).length === 0) {
        return url;
      }
      return url + '?' + new URLSearchParams(filteredRequestParams).toString();
    }
    return url;
  };
}

export default FetchUtils;