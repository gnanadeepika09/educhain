# EduChain - Blockchain-Based Education Fund Management System

A complete web application that connects students needing financial assistance with donors, using Ethereum blockchain for transparent donation tracking.

## 🎯 Project Overview

**EduChain** enables:
- **Students** to submit funding requests and track received donations
- **Donors** to browse approved requests and donate via MetaMask
- **Admins** to review requests and allocate collected funds
- **Everyone** to verify transactions on the blockchain (Ganache)

## 🛠️ Technology Stack

### Frontend
- **React.js** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Ethers.js** v6 for blockchain interaction
- **Bootstrap 5** for styling

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with Mongoose
- **JWT** authentication with bcrypt
- **Multer** for file uploads

### Blockchain
- **Solidity** ^0.8.19
- **Hardhat** for development
- **Ganache** local blockchain
- **MetaMask** for transactions

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. ~~**MongoDB**~~ **Using MongoDB Atlas (Cloud)** - No local installation needed! ☁️
3. **Ganache** (GUI or CLI) - [Download](https://trufflesuite.com/ganache/)
4. **MetaMask** browser extension - [Download](https://metamask.io/)
5. **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## 🚀 Setup Instructions

> **⚠️ IMPORTANT FOR GITHUB:** Before pushing this project to GitHub, ensure you:
> 1. Have the `.gitignore` file in place (already created)
> 2. Never commit `.env` files (they're gitignored)
> 3. Use `.env.example` files as templates
> 4. Replace all sensitive credentials in your local `.env` files

### Step 1: Clone or Open the Project

Open VS Code and navigate to the project directory:
```bash
cd d:\edutech\educhain
```

### Step 2: Install Dependencies

Open three terminals in VS Code (one for each component):

**Terminal 1 - Backend:**
```bash
cd server
npm install
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
```

**Terminal 3 - Blockchain:**
```bash
cd blockchain
npm install
```

### Step 3: MongoDB Atlas (Cloud Database)

✅ **Already configured!** This project uses **MongoDB Atlas** (cloud database).

No need to install or start MongoDB locally - your database is already running in the cloud at:
- Cluster: `shopzo.yg5p8be.mongodb.net`
- Database: `education_fund_db`

The connection string is already configured in `server/.env`

### Step 4: Start Ganache

1. Open Ganache GUI application
2. Click **"QUICKSTART"** to create a new workspace
3. Note down the **RPC Server** URL (should be `http://127.0.0.1:7545`)
4. Note down the **Network ID** (should be `1337`)
5. Keep Ganache running throughout development

### Step 5: Compile and Deploy Smart Contract

In the blockchain terminal:
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache
```

After deployment, you'll see:
```
✅ EducationFund deployed successfully!
📍 Contract Address: 0x... (copy this address)
```

**Copy the contract address!**

### Step 6: Configure Environment Variables

**Backend (.env):**

Open `server/.env` and update:
```env
CONTRACT_ADDRESS=0x... (paste the contract address from step 5)
```

**Frontend (.env):**

Open `client/.env` and update:
```env
VITE_CONTRACT_ADDRESS=0x... (paste the same contract address)
```

### Step 7: Start the Backend Server

In the server terminal:
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Admin account created successfully
   Email: admin@educhain.com
   Password: Admin@123
🚀 Server running at: http://localhost:5000
```

### Step 8: Start the Frontend

In the client terminal:
```bash
cd client
npm run dev
```

You should see:
```
VITE ready in ... ms
Local: http://localhost:5173
```

### Step 9: Configure MetaMask

1. Open MetaMask extension in your browser
2. Click **Network dropdown** → **Add Network** → **Add a network manually**
3. Fill in these details:
   - **Network Name:** Ganache Local
   - **New RPC URL:** http://127.0.0.1:7545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
4. Click **Save**

5. Import a Ganache test account:
   - In Ganache, click the **key icon** next to any account
   - Copy the **Private Key**
   - In MetaMask: **Account menu** → **Import Account** → Paste the private key
   - This account now has 100 test ETH

### Step 10: Test the Application

Open your browser and navigate to: **http://localhost:5173**

## 🎓 How to Use EduChain

### 🔑 Test Accounts (Auto-Created on Server Start)

The following test accounts are automatically created when you start the backend server:

#### Admin Account
- **Email:** `admin@educhain.com`
- **Password:** `Admin@123`

#### Student Accounts
- **Student 1:**
  - Email: `student@test.com`
  - Password: `Student@123`
  - College: PVPSIT
  - Course: B.Tech (3rd Year)

- **Student 2:**
  - Email: `student2@test.com`
  - Password: `Student@123`
  - College: IIT Delhi
  - Course: M.Tech (2nd Year)

#### Donor Account
- **Email:** `donor@test.com`
- **Password:** `Donor@123`
- **Organization:** Tech Foundation

> **Note:** These accounts are created automatically by the seed script for demo purposes. You can still register new accounts manually through the UI.

### As Admin:
1. Login with admin credentials
2. View dashboard statistics
3. Navigate to **Requests** to approve/reject student funding requests
4. Navigate to **Allocations** to allocate funds to approved students
5. Navigate to **Users** to view all registered students and donors
6. Navigate to **Transactions** to view all blockchain transactions

### As Student:
1. **Option A:** Use test account - Login with `student@test.com` or `student2@test.com` / `Student@123`
2. **Option B:** Click **Register** → Select **Student** role and create new account
3. Login with your credentials
4. Navigate to **Apply** to submit a funding request
5. Wait for admin approval
6. View your requests in **My Requests**
7. View donations and allocations in **Transactions**

### As Donor:
1. **Option A:** Use test account - Login with `donor@test.com` / `Donor@123`
2. **Option B:** Click **Register** → Select **Donor** role and create new account
3. Login with your credentials
3. Click **Connect Wallet** to connect MetaMask
4. Navigate to **Browse Students** to see approved requests
5. Click **Donate Now** on any student card
6. Enter donation amount (e.g., 0.1 ETH)
7. Approve the transaction in MetaMask popup
8. View your donations in **My Donations**

## 📁 Project Structure

```
educhain/
├── blockchain/               # Solidity smart contracts
│   ├── contracts/
│   │   └── EducationFund.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth & upload middleware
│   ├── utils/               # Helpers & blockchain utils
│   ├── uploads/             # Student documents
│   ├── server.js           # Entry point
│   ├── .env                # Environment config
│   └── package.json
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── student/   # Student pages
│   │   │   └── donor/     # Donor pages
│   │   ├── services/       # API service
│   │   ├── utils/          # Blockchain utilities
│   │   ├── App.jsx         # Main component
│   │   └── main.jsx        # Entry point
│   ├── .env                # Frontend config
│   └── package.json
│
└── README.md               # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/wallet` - Update donor wallet address

### Funding Requests
- `GET /api/funding-requests` - Get all requests (role-based)
- `POST /api/funding-requests` - Student submits request
- `GET /api/funding-requests/:id` - Get single request
- `PUT /api/funding-requests/:id/review` - Admin reviews request

### Donations
- `POST /api/donations` - Record donation (after blockchain tx)
- `GET /api/donations` - Get donations (role-based)

### Allocations
- `POST /api/allocations` - Admin allocates funds
- `GET /api/allocations` - Get allocations (role-based)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle` - Toggle user status
- `GET /api/admin/transactions` - Get all blockchain transactions

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth with bcrypt password hashing
- **Role-Based Access Control** - Admin, Student, Donor roles with protected routes
- **Input Validation** - Server-side validation for all user inputs
- **Blockchain Verification** - All transactions verified on-chain before DB storage
- **File Upload Security** - Only PDF, JPG, PNG allowed, 5MB limit
- **CORS Protection** - Configured for localhost development
- **Environment Variables** - Sensitive data stored in .env files

## 🧪 Testing the Complete Flow

### End-to-End Test Scenario:

1. **Admin Login** (admin@educhain.com / Admin@123)
   - View empty dashboard

2. **Student Registration & Request**
   - Register as student (e.g., john@student.com)
   - Login and submit funding request for 0.5 ETH
   - Upload supporting documents

3. **Admin Approval**
   - Login as admin
   - Go to Requests → Approve the student's request

4. **Donor Registration & Donation**
   - Register as donor (e.g., jane@donor.com)
   - Login and connect MetaMask wallet
   - Browse students → Select approved request
   - Donate 0.2 ETH via MetaMask
   - Verify transaction in Ganache and "My Donations"

5. **Admin Allocation**
   - Login as admin
   - Go to Allocations → Allocate 0.2 ETH to the student
   - (In production, this would trigger an actual ETH transfer)

6. **Student Verification**
   - Login as student
   - View received donations in Transactions tab
   - Verify blockchain transaction hash

## ⚠️ Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:** This project uses MongoDB Atlas (cloud). Check:
- Internet connection is active
- The password in `.env` is correct: `Manoj524`
- The connection string in `server/.env` is properly formatted
- MongoDB Atlas cluster is running (should be automatic)

### Issue 2: Ganache Not Connected
**Solution:** 
- Ensure Ganache is running
- Verify RPC URL is `http://127.0.0.1:7545`
- Check that `GANACHE_RPC_URL` in server `.env` matches

### Issue 3: Contract Not Deployed
**Solution:**
```bash
cd blockchain
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache
```

### Issue 4: MetaMask Transaction Failing
**Solution:**
- Make sure MetaMask is connected to Ganache network (Chain ID 1337)
- Ensure you imported a Ganache account with test ETH
- Check that `CONTRACT_ADDRESS` is set in both `.env` files
- Try resetting your MetaMask account: Settings → Advanced → Reset Account

### Issue 5: CORS Errors
**Solution:** Make sure `CLIENT_URL` in `server/.env` matches your frontend URL (http://localhost:5173)

### Issue 6: Port Already in Use
**Solution:**
- Backend: Change `PORT` in `server/.env`
- Frontend: Use `npm run dev -- --port 3000` to change port

## 📊 Database Collections

- **users** - All user accounts (admin, student, donor)
- **students** - Extended student profiles
- **donors** - Extended donor profiles
- **fundingrequests** - Student funding applications
- **donations** - Donor contributions (linked to blockchain)
- **fundallocations** - Admin allocations to students
- **blockchaintransactions** - Master log of all blockchain events

## 🎨 Key Features Implemented

✅ JWT-based authentication with role-based access control  
✅ Student funding request submission with file uploads  
✅ Admin approval workflow for funding requests  
✅ MetaMask wallet connection and integration  
✅ Real blockchain transactions using Ethers.js  
✅ Transaction verification before database recording  
✅ Real-time dashboard statistics  
✅ Complete donation and allocation tracking  
✅ Responsive UI with Bootstrap 5  
✅ Blockchain transaction audit trail  
✅ MongoDB data persistence  
✅ Separate layouts for Admin, Student, and Donor  

## 🚧 Production Deployment Considerations

For production deployment, you would need to:

1. **Replace Ganache with a real Ethereum network:**
   - Testnet: Sepolia, Goerli
   - Mainnet: Ethereum mainnet (requires real ETH)

2. **Update environment variables:**
   - Change MongoDB URI to Atlas or production server
   - Update RPC URLs to Infura/Alchemy
   - Set strong JWT secrets
   - Configure proper CORS origins

3. **Deploy smart contract:**
   - Use Hardhat to deploy to testnet/mainnet
   - Verify contract on Etherscan

4. **Host the application:**
   - Frontend: Vercel, Netlify, or AWS S3
   - Backend: Heroku, AWS EC2, or DigitalOcean
   - Database: MongoDB Atlas

5. **Add additional security:**
   - HTTPS/SSL certificates
   - Rate limiting
   - Input sanitization
   - Security headers

## 📝 Notes for Demonstration

When presenting this project:

1. **Show the complete flow:** Student applies → Admin approves → Donor donates → Admin allocates
2. **Highlight blockchain verification:** Show transaction hash in Ganache
3. **Explain transparency:** Anyone can verify transactions on blockchain
4. **Demonstrate MetaMask integration:** Show the signing process
5. **Show role-based dashboards:** Different views for different users
6. **Explain the technology stack:** React + Node + MongoDB + Solidity

## 🤝 Contributing

This is a college project for educational purposes. Feel free to fork and enhance!

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

**EduChain Project**  
Built as a demonstration of blockchain integration in web applications.

---

**Need help?** Check the troubleshooting section or review the code comments for detailed explanations.
