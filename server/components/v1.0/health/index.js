import express from 'express';
import { replyToHealthPing } from './handler';
const router = express.Router();
router.get('/', async(request, response) => {
	try {
		const healthResponse = await replyToHealthPing();
		response.status(200).json(healthResponse);
	} catch (e) {
		response.status(500).json({ err: e });
	}
});
export default router;
