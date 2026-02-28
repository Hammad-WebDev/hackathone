import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import receptionistRoutes from './routes/receptionistRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import cors from 'cors';
import connectDb from './db.js';

const app = express();
app.use(cors())
let port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'server is running',
        code: 200,
    });
});

connectDb()
    .then(() => console.log('mongodb successfully connected'))
    .catch((error) => {
        console.log('error in mongodb connection');
        console.error(error);
    });

app.use('/auth', authRoutes);
app.use('/doctors', doctorRoutes);
app.use('/receptionists', receptionistRoutes);
app.use('/patients', patientRoutes);
app.use('/stats', statsRoutes);



if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log('this app is running on port ' + port);
    });
}

export default app;
