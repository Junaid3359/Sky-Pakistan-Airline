import { Router } from 'express';
import { searchFlights, getFlightDetails } from '../controllers/flights.controller';

const router = Router();

router.get('/search', searchFlights);
router.get('/:id', getFlightDetails);

export default router;
