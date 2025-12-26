import { useMutation } from 'react-query';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import { CollectionWrapper } from 'types';
import { UploadedImageResponse } from 'models/Image';
import NotifyUtils from 'utils/NotifyUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

function validateImages(images: File[]) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new UploadValidationError('Không có hình ảnh để tải lên');
  }

  if (images.length > MAX_FILES) {
    throw new UploadValidationError(`Chỉ được tải tối đa ${MAX_FILES} hình ảnh`);
  }

  images.forEach((image) => {
    if (!(image instanceof File)) {
      throw new UploadValidationError('Dữ liệu hình ảnh không hợp lệ');
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      throw new UploadValidationError('Định dạng hình ảnh không hợp lệ');
    }

    if (image.size > MAX_FILE_SIZE) {
      throw new UploadValidationError('Dung lượng hình ảnh vượt quá 5MB');
    }
  });
}

function useUploadMultipleImagesApi() {
  return useMutation<
    CollectionWrapper<UploadedImageResponse>,
    ErrorMessage | UploadValidationError,
    File[]
  >(
    async (images) => {
      validateImages(images);
      return FetchUtils.uploadMultipleImages(images);
    },
    {
      onSuccess: () => {
        NotifyUtils.simpleSuccess('Tải hình lên thành công');
      },
      onError: (error) => {
        if (error instanceof UploadValidationError) {
          NotifyUtils.simpleFailed(error.message);
          return;
        }

        // Không hiển thị raw message từ backend để tránh rủi ro XSS/UI injection
        NotifyUtils.simpleFailed('Tải hình lên không thành công');
      },
    }
  );
}

export default useUploadMultipleImagesApi;
