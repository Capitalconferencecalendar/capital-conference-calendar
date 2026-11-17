export const accountsEnabled = process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === "true"
  || (process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === undefined && process.env.NODE_ENV === "development");
