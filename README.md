# MarketAppQR

MarketAppQR is a QR code-based market application. This project is a Node.js application developed using modern web technologies.

## 🚀 Features

- QR code generation and scanning
- Secure user authentication
- RESTful API architecture
- MongoDB database integration
- Swagger API documentation
- Security measures (rate limiting, XSS protection, etc.)
- Shopping cart functionality
- Market stock management
- Product catalog
- User role management

## 📋 Requirements

- Node.js >= 19.6.0
- MongoDB
- npm or yarn

## 🔧 Installation

1. Clone the project:
```bash
git clone [repo-url]
cd MarketAppQR
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create `.env` file and set required environment variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 🚀 Running the Application

To run in development mode:
```bash
npm run start:dev
# or
yarn start:dev
```

To run in production mode:
```bash
npm run start:prod
# or
yarn start:prod
```

## 📚 API Documentation

Access API documentation at:
```
http://localhost:3000/api-docs
```

## 🛠️ Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Swagger
- ESLint
- Prettier

## 🔒 Security

The project includes the following security measures:
- Rate limiting
- XSS protection
- MongoDB injection protection
- Security headers with Helmet.js
- HPP (HTTP Parameter Pollution) protection
- Password hashing with bcrypt
- JWT token authentication

## 📊 Database Schema

![Database Schema](https://www.mermaidchart.com/raw/5b7bb94c-218c-46ae-a586-5d73585af9a9?theme=light&version=v0.1&format=svg)

The database schema consists of the following main entities:

### User
- name: string
- email: string
- role: string
- password: string
- passwordChangedAt: date
- passwordResetToken: string
- passwordResetExpires: date
- responsibleMarkets: ObjectId[]
- active: boolean

### Market
- name: string
- QRCodeImage: string
- address: string

### Product
- _id: string
- name: string
- brand: string
- description: string
- image: string
- category: string

### MarketStock
- marketid: ObjectId
- productid: string
- price: number
- quantity: number

### Cart
- userId: ObjectId
- marketId: ObjectId
- products: array
- status: string

## 📝 License

ISC

## 👥 Author

- Can Dagdeviren

