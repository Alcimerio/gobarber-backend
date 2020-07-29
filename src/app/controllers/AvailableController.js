
import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);

    try {
      const available = await AvailableService.run({
        date: searchDate,
        provider_id: req.params.id
      });

      return res.json(available);
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
  }
}

export default new AvailableController();
