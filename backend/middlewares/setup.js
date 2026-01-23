import cors from 'cors';
import express from 'express';

const setupMiddleware = (app) => {
    app.use(cors());
    app.use(express.json());
};

export default setupMiddleware;
