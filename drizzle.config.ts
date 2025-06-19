import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: "/Users/mohammwdali/Documents/Next JS Projects/dashboard/app/config/schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: "postgresql://azcsmohdali1:f1NauxJ0RikY@ep-morning-snowflake-15132543-pooler.ap-southeast-1.aws.neon.tech/domus-dashboard?sslmode=require"
  },

});



