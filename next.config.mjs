/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // The e2e dev server builds into its own folder so it can run alongside a
  // normal `next dev` without the two fighting over `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    /*
     * `output: 'export'` means no image optimisation server, so the responsive
     * widths are pre-rendered into `public/_img` (npm run images:variants) and
     * this loader maps a requested width onto one of them. `unoptimized: true`
     * used to stand here, which made `next/image` emit a bare `src`: every
     * phone downloaded the desktop original of every picture.
     *
     * These two lists are the only widths `next/image` will ever ask for, and
     * they are duplicated in scripts/generate-image-variants.mjs — keep them
     * in step. They are Next's defaults with the three widths above 1920
     * dropped — nothing here is served larger than that, and each entry is a
     * real file in the repo. The 750/828 rungs earn their place: a 380px card
     * on a 1.75x phone needs 665px, and without them it fell all the way up to
     * 1080 and downloaded two-thirds more than it showed.
     */
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js',
    deviceSizes: [640, 750, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // allow all domains
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
