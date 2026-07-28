import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_URL } from "@/lib/config";

export default async function TestProduct() {
  const slug = "pholy-fish-dead";
  let output = "";
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${slug}`, {
      next: { revalidate: 0 },
    });
    const json = await res.json();
    output = JSON.stringify(json, null, 2);
  } catch (err: any) {
    output = err.message || err.toString();
  }

  return <pre>{output}</pre>;
}
