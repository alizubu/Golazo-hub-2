/**
 * Validates the presence of required environment variables at build/startup time.
 * If critical variables are missing, this will throw an error and fail the build
 * rather than producing a cryptic 500 error in production.
 */

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}. Please check your .env file or Vercel environment variables.`);
  }

  return true;
}
