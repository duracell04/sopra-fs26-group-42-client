import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it prefers NEXT_PUBLIC_DEV_API_URL and otherwise uses the
 * current browser hostname so LAN devices can reach the backend on the same machine.
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "http://localhost:8080"; // TODO: update with your production URL as needed.
  const browserHost = typeof window !== "undefined" ? window.location.hostname : null;
  const devUrl = process.env.NEXT_PUBLIC_DEV_API_URL ||
    (browserHost ? `http://${browserHost}:8080` : "http://localhost:8080");
  return isProduction() ? prodUrl : devUrl;
}
