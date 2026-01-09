import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { MemoryStorageFile } from 'nest-file-fastify';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enum/error-code';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

export enum FolderType {
  PRODUCTS = 'products',
  AVATAR = 'avatar',
}

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Process file before upload
async function processImageUpload(file: MemoryStorageFile) {
  try {
    const compressedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    return compressedBuffer;
  } catch (error) {
    throw new BadRequestException({
      message: error?.message || 'Failed to process file',
      errorCode: ErrorCode.INVALID_FILE,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

// Upload file to cloudinary
export async function uploadToCloudinary(
  file: MemoryStorageFile,
  folder: FolderType,
): Promise<UploadApiResponse> {
  const compressedBuffer = await processImageUpload(file);
  const folderPrefix = process.env.NODE_ENV === 'development' ? 'test' : 'prod';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        filename_override: file.filename,
        folder: `barestore-${folderPrefix}/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed with no result'));
        resolve(result);
      },
    );

    if (compressedBuffer) {
      Readable.from(compressedBuffer).pipe(uploadStream);
    } else {
      reject(new Error('Invalid file object: no buffer found'));
    }
  });
}

export async function uploadToCloudinaryFromBase64(
  base64String: string,
  folder: FolderType,
): Promise<UploadApiResponse> {
  const folderPrefix = process.env.NODE_ENV === 'development' ? 'test' : 'prod';

  return cloudinary.uploader.upload(base64String, {
    public_id: uuidv4(),
    folder: `barestore-${folderPrefix}/${folder}`,
    resource_type: 'auto',
  });
}

// Create thumbnail
export async function createThumbnail(publicId: string) {
  return cloudinary.image(publicId, {
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    secure: true,
  });
}

// Delete file from cloudinary
export async function deleteFile(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'File not found or already deleted',
      };
    }
  } catch (error) {
    throw new BadRequestException({
      message: error?.message || 'Failed to delete image',
      errorCode: ErrorCode.INVALID_FILE,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}
