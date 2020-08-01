import { Router } from 'express';
import Brute from "express-brute";
import BruteRedis from "express-brute-redis";
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';
import AppointmentController from './app/controllers/AppointmentController';

import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';
import validateSessionStore from './app/validators/SessionStore';
import validateAppointmentStore from './app/validators/AppointmentStore';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.post('/users', validateUserStore, UserController.store);
routes.post('/sessions', bruteForce.prevent, validateSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:id/available', AvailableController.index);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', validateAppointmentStore, AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.put('/users', validateUserUpdate, UserController.update);

routes.post('/files', upload.single('file'), FileController.store);
export default routes;
