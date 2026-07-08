import 'dotenv/config';

export interface EnvConfig {
  baseUrl: string;
  username: string;
  password: string;
}

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env: EnvConfig = {
  baseUrl: required('BASE_URL', 'https://opensource-demo.orangehrmlive.com'),
  username: required('ORANGEHRM_USERNAME'),
  password: required('ORANGEHRM_PASSWORD'),
};
