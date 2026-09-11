import { Router } from 'express';
import { listAirports, createAirport, getAirport, updateAirport, deleteAirport } from '../controllers/admin/airports.controller';
import { listAircraft, createAircraft, getAircraft, updateAircraft, deleteAircraft } from '../controllers/admin/aircraft.controller';
import { listFlights, createFlight, getFlight, updateFlight, deleteFlight } from '../controllers/admin/flights.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

// Airports
router.get('/airports', listAirports);
router.post('/airports', createAirport);
router.get('/airports/:id', getAirport);
router.put('/airports/:id', updateAirport);
router.delete('/airports/:id', deleteAirport);

// Aircraft
router.get('/aircraft', listAircraft);
router.post('/aircraft', createAircraft);
router.get('/aircraft/:id', getAircraft);
router.put('/aircraft/:id', updateAircraft);
router.delete('/aircraft/:id', deleteAircraft);

// Flights
router.get('/flights', listFlights);
router.post('/flights', createFlight);
router.get('/flights/:id', getFlight);
router.put('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

export default router;
