import axios from "axios";

// Resolve base URL differently for server and browser
function getBaseURL() {
  const publicUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const internalUrl = process.env.BACKEND_INTERNAL_URL;
  // On the server (SSR / route handlers), use the internal Docker network URL
  if (typeof window === "undefined") {
    return internalUrl;
  }
  // In the browser, use the public URL
  return publicUrl;
}

const baseURL = getBaseURL();

export const axiosPublic = axios.create({
  baseURL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true,
});
