import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Bitespeed Identity Reconciliation API is running!');
});

app.use('/', contactRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});