Данни за ssh - би трябвало автоматично да те пусне без парола.
157.90.129.12
ако иска : root  pass : 1Borabora@#
Моля тествай дали работи.



Based on the conversation summary, I was documenting the production server issues in ERRORS.md. The documentation has been completed with all 5 production runtime errors and the deployment checklist. The current situation is: Production Status:
Admin panel loads successfully at https://dshome.dev/admin
Backend API responds to health checks
Database connections are working
Remaining issue: Admin panel has hardcoded localhost:4000 in the code, causing API calls to fail
Root Cause: The file packages/admin/lib/api.ts contains:
const API_URL = "http://localhost:4000/api";
Required Fix (to be done from work computer):
Change the hardcoded URL to use relative paths:
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
Rebuild the admin Docker image
Redeploy to production
What I've Completed:
✅ Fixed Docker port mappings (3000:3000)
✅ Fixed Nginx proxy configuration (localhost:3000)
✅ Fixed backend environment variable (API_PORT)
✅ Fixed PostgreSQL networking (listen_addresses, pg_hba.conf)
✅ Fixed DATABASE_URL (host.docker.internal)
✅ Documented all issues and solutions in ERRORS.md
✅ Created deployment checklist
Next Steps Required (User Action): Since you mentioned the files on this computer aren't correct and everything works at home, you'll need to:
From your work computer, apply the fix to packages/admin/lib/api.ts
Push changes to GitHub
On production server, rebuild and redeploy:
cd /opt/dshome
git pull
docker-compose -f docker-compose.prod.yml build admin
docker-compose -f docker-compose.prod.yml up -d admin
The production server is now properly configured for Docker networking. Once the admin code is fixed and rebuilt, the admin panel will work correctly with the API. All fixes and instructions are documented in ERRORS.md for future reference.