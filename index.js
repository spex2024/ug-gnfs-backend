import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './database/db.js';
import bodyParser from 'body-parser';
import employeeRoutes from './route/employee.js'
import cookieParser from 'cookie-parser';
import adminRoutes from './route/admin.js'


const app = express();
dotenv.config();

app.use(cors(
  {
    origin: ['http://localhost:3000','https://dashboard-green-nu.vercel.app'], // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }
));


app.get('/', (req, res) => {
  res.send('API is running...');
}
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/employee' , employeeRoutes)
app.use('/api/admin' , adminRoutes)















connectDB()
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
 
});