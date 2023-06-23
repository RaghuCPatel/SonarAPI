import mongoose from 'mongoose';

const mongoCon = mongoose.connect(process.env.MONGO_URL);

export { mongoose, mongoCon };
