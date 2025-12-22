/**
 * 文件上传工具
 * 使用 Supabase Storage（通过后端 API）
 */

export async function uploadFile(
  file: File | Blob,
  pathname: string,
  options?: {
    access?: 'public' | 'private';
  }
): Promise<{ url: string }> {
  // 将文件转换为 base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 调用后端上传 API
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64,
      pathname,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '上传失败' }));
    throw new Error(error.message || '上传失败');
  }

  const result = await response.json();
  return { url: result.url };
}

