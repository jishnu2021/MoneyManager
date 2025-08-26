import express from 'express'
import { refreshAccessToken } from '../controllers/Token.controller';
const router = express.Router()

router.post('/refresh-token',refreshAccessToken)


export default router;