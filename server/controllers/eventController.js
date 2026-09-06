const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { isActive: true },
      order: [['date', 'DESC']],
    });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all events (admin)
// @route   GET /api/events/admin
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'DESC']],
    });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('getAllEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.update(req.body);
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('updateEvent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.destroy();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
