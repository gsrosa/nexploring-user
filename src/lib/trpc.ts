import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'atlas-bff/trpc';

export const trpc = createTRPCReact<AppRouter>();
