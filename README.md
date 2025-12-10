# MiniDrive Frontend

A beautiful, privacy-first cloud storage frontend built with Next.js and shadcn/ui.

## 🚀 Features

- **WebAuthn Authentication**: Passwordless login using biometric authentication (Fingerprint/FaceID)
- **Beautiful Modern UI**: Built with shadcn/ui and Tailwind CSS
- **File Management**: Upload, download, delete, and organize files with folders
- **Secure Sharing**: Create time-limited share links with download restrictions
- **Storage Management**: Visual storage meter with automatic quota tracking
- **Subscription Tiers**: FREE (50MB), PRO (500MB), PREMIUM (1GB)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js 18+ or Bun
- Backend API running at `http://localhost:3001` (or configure `NEXT_PUBLIC_API_URL`)

## 🛠️ Installation

1. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

2. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
   NEXT_PUBLIC_APP_NAME=MiniDrive
   ```

3. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
drive-fe/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page with WebAuthn
│   │   └── register/       # Registration page
│   ├── (dashboard)/
│   │   ├── drive/          # Main file manager
│   │   ├── shared/         # Shared links management
│   │   ├── settings/       # Account & subscription settings
│   │   └── layout.tsx      # Dashboard layout with sidebar
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Redirects to login
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── file-card.tsx       # File display component
│   ├── folder-card.tsx     # Folder display component
│   ├── upload-zone.tsx     # Drag-and-drop upload
│   ├── storage-meter.tsx   # Storage usage indicator
│   ├── breadcrumbs.tsx     # Folder navigation
│   ├── share-dialog.tsx    # Share link creator
│   └── create-folder-dialog.tsx
├── lib/
│   ├── api/                # API client layer
│   │   ├── client.ts       # Axios instance
│   │   ├── auth.ts         # Auth endpoints
│   │   ├── files.ts        # File endpoints
│   │   ├── folders.ts      # Folder endpoints
│   │   ├── shares.ts       # Share endpoints
│   │   └── subscriptions.ts
│   ├── webauthn.ts         # WebAuthn helpers
│   └── utils.ts            # Utility functions
└── store/
    ├── auth.ts             # Auth state (Zustand)
    └── files.ts            # Files & folders state
```

## 🎨 Design System

Built with **shadcn/ui** using the "new-york" style and zinc color palette. Components are:
- Fully customizable
- Accessible (ARIA compliant)
- Dark mode ready
- Responsive by default

## 🔐 Security Features

- **Zero-Knowledge Storage**: Files encrypted on backend with SSE-C
- **WebAuthn**: FIDO2 passkey authentication
- **Session Management**: Secure token-based authentication
- **Protected Routes**: Automatic redirect for unauthenticated users

## 📱 Pages

### Authentication
- `/login` - Biometric login
- `/register` - Account creation with passkey enrollment

### Dashboard
- `/drive` - File and folder browser
- `/shared` - Manage active share links
- `/settings` - Account info, storage usage, tier upgrades

## 🚦 Usage

### Register a New Account
1. Navigate to `/register`
2. Enter email, username, and device name
3. Click "Register with Biometrics"
4. Complete the biometric challenge on your device
5. You'll be redirected to login

### Upload Files
1. Click "Upload" button in drive
2. Drag files or click to select
3. Files are uploaded with progress tracking
4. Quota is checked before upload

### Share Files
1. Click the "..." menu on any file
2. Select "Share"
3. Configure expiration time and max downloads
4. Copy the generated link
5. Share link works without authentication

### Manage Storage
1. View storage meter in sidebar
2. Navigate to `/settings` for detailed usage
3. Upgrade tier for more storage

## 🏃 Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_WEBAUTHN_RP_ID` | WebAuthn Relying Party ID | `localhost` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `MiniDrive` |

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Authentication**: @simplewebauthn/browser
- **HTTP Client**: Axios
- **Icons**: lucide-react
- **Notifications**: Sonner (toast)
- **Forms**: React Hook Form + Zod (optional)

## 🎯 Key Features

### File Cards
Displays files with:
- Icon based on file type
- File name, size, and date
- Context menu (download, share, delete)
- Grid and list view modes

### Upload Zone
- Drag-and-drop support
- Multiple file selection
- Progress tracking per file
- Quota validation

### Storage Meter
- Real-time usage display
- Color-coded (green → yellow → red)
- Tier badge
- Upgrade prompt when full

### Share Dialog
- Configurable expiration (1h - 7 days)
- Download limit options
- One-click copy link
- Active share management

## 🔧 Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme.

### API Endpoint
Update `NEXT_PUBLIC_API_URL` in `.env.local`.

### Branding
Change app name, logo, and metadata in `app/layout.tsx`.

## 🐛 Known Issues

- TypeScript lint errors will appear until `node_modules` is fully indexed
- WebAuthn requires HTTPS in production (works on localhost for development)
- Some browsers may not fully support WebAuthn

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

---

Built with ❤️ using Next.js and shadcn/ui
