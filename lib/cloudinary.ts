/**
 * Upload an image using a server-generated signed signature.
 * This ensures only authenticated users can upload to our Cloudinary account.
 * The API secret never leaves the server.
 */
export async function uploadImage(file: File): Promise<string> {
  // Step 1: Get a signed upload signature from our server (authenticated endpoint)
  const signRes = await fetch("/api/upload/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Failed to get upload signature");

  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

  // Step 2: Upload directly to Cloudinary using the signed params
  const formData = new FormData();
  formData.append("file",      file);
  formData.append("api_key",   apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder",    folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Image upload failed");

  const data = await uploadRes.json();
  return data.secure_url as string;
}
