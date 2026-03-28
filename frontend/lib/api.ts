import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function getAuthHeader() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  return { Authorization: `Bearer ${token}` };
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  userId: string
) {
  const headers = await getAuthHeader();
  const response = await axios.post(
    `${API_URL}/presign`,
    { fileName, fileType, fileSize, userId },
    { headers }
  );
  return response.data;
}

export async function uploadToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
) {
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
}

export async function convertFile(
  s3Key: string,
  targetFormat: string,
  userId: string
) {
  const headers = await getAuthHeader();
  const response = await axios.post(
    `${API_URL}/convert`,
    { s3Key, targetFormat, userId },
    { headers }
  );
  return response.data;
}