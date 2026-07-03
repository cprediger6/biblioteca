// types/next.d.ts
import type { NextConfig } from 'next';

declare module 'next' {
  export interface NextConfig {
    images?: {
      domains?: string[];
      remotePatterns?: Array<{
        protocol: string;
        hostname: string;
        port?: string;
        pathname?: string;
      }>;
    };
    experimental?: {
      serverActions?: {
        bodySizeLimit?: string;
      };
    };
  }
}