// jest.setup.ts
import { config } from 'dotenv';

// Load .env.local file for testing environment variables
// In the real world we would use a more secure way to manage secrets but this will suffice for example purposes
config({ path: '.env' });
