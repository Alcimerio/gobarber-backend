import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

import Cache from '../../lib/cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:${page}`;
    const cached = await Cache.get(cacheKey);

    if(cached) {
      return res.json(cached);
    }

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancellable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    await Cache.set(cacheKey, appointments);

    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;
    
    try {
      const appointment = await CreateAppointmentService.run({ 
        provider_id,
        user_id: req.userId,
        date
       });
  
      return res.json(appointment);
    } catch (err) {
    }
  }

  async delete(req, res) {
    try {
      const appointment = await CancelAppointmentService.run({
        appointment_id: req.params.id,
        user_id: req.userId
      })
  
      return res.json(appointment);
    } catch(err) {
      return res.status(400).json({ error: err.message })
    }
  }
}

export default new AppointmentController();
