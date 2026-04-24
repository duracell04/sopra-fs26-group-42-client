import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to the App Engine backend).
 * In development, it prefers NEXT_PUBLIC_DEV_API_URL and otherwise uses the
 * current browser hostname so LAN devices can reach the backend on the same machine.
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-fs26-group-42-server.oa.r.appspot.com";
  const browserHost = typeof window !== "undefined" ? window.location.hostname : null;
  const devUrl = process.env.NEXT_PUBLIC_DEV_API_URL ||
    (browserHost ? `http://${browserHost}:8080` : "http://localhost:8080");
  return isProduction() ? prodUrl : devUrl;
}
