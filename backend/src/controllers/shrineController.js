const { Shrine } = require('../models');

module.exports = {
  createShrine: async (req, res) => {
    try {
      const { code, content } = req.body;
      if (!code || !content) {
        return res.status(400).json({ message: 'Missing code or content' });
      }
      const shrine = await Shrine.create({
        title: `Shrine ${code}`,
        code,
        content,
      });
      res.status(201).json({ message: 'Shrine created', shrine });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },
  getRandomShrine: async (req, res) => {
  try {
    const count = await Shrine.countDocuments();
    console.log('Shrine count:', count);
    if (count === 0) return res.status(404).json({ message: 'No shrines found' });
    const random = Math.floor(Math.random() * count);
    const shrine = await Shrine.findOne().skip(random);
    console.log('Random shrine:', shrine);
    if (!shrine) return res.status(404).json({ message: 'No shrine found' });
    res.json(shrine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
},
};