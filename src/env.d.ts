/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Runtime } from '@astrojs/cloudflare';

declare namespace App {
  interface Locals {
    locale: 'zh' | 'en';
    runtime: Runtime;
  }
}

export {};
