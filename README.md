# Folink - Smart Link Monetization Platform

---

## Technical Specifications & System Layout

```
app/               - Routing controllers
components/        - Reusable presentation components
lib/               - Helpers (Cloudinary, Security, Auth, Adsterra settings)
services/          - Core engines (Wallet ledger database adjustments, Anti-Fraud check evaluations, API developer tokens generator)
prisma/            - PostgreSQL Neon schema setup configuration
public/            - Static CDN layout assets
```

---

## Configuration Variables (.env)

```env
# Database Credentials
DATABASE_URL="postgresql://user:password@ep-dummy-123456.us-east-2.aws.neon.tech/folink?sslmode=require"

# Auth credentials
AUTH_SECRET="super-secret-random-key-change-in-production-12345"
AUTH_URL="http://localhost:3000"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Adsterra Integrations
ADSTERRA_PUBLISHER_ID="123456"
ADSTERRA_DIRECT_LINK="https://directlinkurl.com"
ADSTERRA_BANNER_ZONE="987654"
ADSTERRA_SOCIAL_BAR_ZONE="543210"
ADSTERRA_NATIVE_ZONE="112233"
ADSTERRA_POPUNDER_ZONE="445566"
```

---

## Deployment to Vercel

1. Import your GitHub workspace repository into Vercel dashboard.
2. Select **Next.js** framework preset.
3. Configure the environment variables list to match production parameters.
4. Deploy the application bundle.

---

## Integration APIs

### Create Developer Bypass Key
- **Endpoint**: `POST /api/v1/key/create`
- **Headers**: `Authorization: Bearer <API_KEY>`
- **Response Success**:
```json
{
  "key": "FoKey_xxxxx",
  "bypassUrl": "https://folink.vn/go/FoKey_xxxxx",
  "status": "PENDING"
}
```

### Complete Step Bypass Validation
- **Endpoint**: `POST /api/v1/key/verify`
- **Body**: `{ "key": "FoKey_xxxxx" }`
- **Response**: `SUCCESS` | `PENDING`

---

## Adsterra Integration Details
- **Publisher ID**: Identifies your publisher dashboard account.
- **Zone ID**: Numerical string uniquely identifying ad placements (Banners, Native widgets).
- **Direct Link**: A target monetized URL that visitors are redirected to.
- **Toggles**: Toggle settings dynamically under `/admin/settings/ads` inside the Admin panel.

---

## Troubleshooting FAQ

### How to configure Custom Domain?
Navigate to Vercel Domain Configuration, add your domain, and point standard CNAME records accordingly.

### Database Connection failure?
Ensure Neon connection string uses standard pooling parameters or includes `?sslmode=require` query modifier.
