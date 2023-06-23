import express from 'express';
import { acceptLatestTerm } from './handler';

const router = express.Router();

router.post('/:id/accept', async(request, response) => {
	try {
		const result = await acceptLatestTerm(request.params.id);
		response.status(200).json(result);
	} catch (e) {
		response.status(500).json({ err: e });
	}
});
export default router;
