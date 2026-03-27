/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      "https://audio-to-notes-app.onrender.com",
  },
}

export default nextConfig
