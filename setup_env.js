import fs from 'fs';

const content = `MONGODB_URI=mongodb+srv://tharunvarshans087_db_user:gbrBtOtzQJxjPEyg@cluster0.zifztjc.mongodb.net/healthcare_db?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=HEALTHCARE_ADMIN_2024_SECRET
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`;

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file updated successfully with MongoDB Atlas URI');
