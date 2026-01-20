// packages/types/auth.ts
// Authentication types

import { User } from './user';
import { SchoolConfig } from './school';

export interface AuthResponse {
    user: User;
    school: SchoolConfig;
    token: string;
}
