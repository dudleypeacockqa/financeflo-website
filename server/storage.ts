import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./env";

let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: ENV.awsRegion,
      credentials: {
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      },
    });
  }
  return _s3;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  const body = typeof data === "string" ? Buffer.from(data, "utf-8") : data;

  await s3.send(
    new PutObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Generate a presigned URL for reading
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
    }),
    { expiresIn: 604800 } // 7 days
  );

  return { key, url };
}

export async function storageDownload(relKey: string): Promise<Buffer> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
    })
  );

  const stream = response.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function storageGetPresignedPut(
  relKey: string,
  contentType: string = "application/octet-stream",
  expiresIn: number = 3600
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );

  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
    }),
    { expiresIn: 604800 } // 7 days
  );

  return { key, url };
}
