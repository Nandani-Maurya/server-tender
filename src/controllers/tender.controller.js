const db = require('../config/db');

class TenderController {
  async createTender(req, res) {
    try {
      const { title, description, start_date, end_date, budget } = req.body;
      const userId = req.user.id; // From auth middleware

      const result = await db.query(
        `INSERT INTO tender.tenders (title, description, start_date, end_date, budget, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, description, start_date, end_date, budget, userId]
      );

      return res.status(201).json({
        success: true,
        message: 'Tender created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create Tender Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllTenders(req, res) {
    try {
      const result = await db.query(
        `SELECT t.*, u.name as creator_name 
         FROM tender.tenders t 
         LEFT JOIN tender.users u ON t.created_by = u.id 
         ORDER BY t.created_at DESC`
      );

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get Tenders Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTenderById(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT t.*, u.name as creator_name 
         FROM tender.tenders t 
         LEFT JOIN tender.users u ON t.created_by = u.id 
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get Tender Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTender(req, res) {
    try {
      const { id } = req.params;
      const { title, description, start_date, end_date, budget, status } = req.body;

      const result = await db.query(
        `UPDATE tender.tenders 
         SET title = $1, description = $2, start_date = $3, end_date = $4, budget = $5, status = $6, updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [title, description, start_date, end_date, budget, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tender updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update Tender Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteTender(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM tender.tenders WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tender deleted successfully'
      });
    } catch (error) {
      console.error('Delete Tender Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bid logic
  async submitBid(req, res) {
    try {
      const { tender_id, bid_amount, proposal } = req.body;
      const userId = req.user.id;

      // Check if tender is still open
      const tender = await db.query('SELECT status, end_date FROM tender.tenders WHERE id = $1', [tender_id]);
      if (tender.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Tender not found' });
      }
      if (tender.rows[0].status !== 'OPEN' || new Date(tender.rows[0].end_date) < new Date()) {
        return res.status(400).json({ success: false, message: 'Tender is closed for bidding' });
      }

      const result = await db.query(
        `INSERT INTO tender.bids (tender_id, user_id, bid_amount, proposal)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [tender_id, userId, bid_amount, proposal]
      );

      return res.status(201).json({
        success: true,
        message: 'Bid submitted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'You have already submitted a bid for this tender' });
      }
      console.error('Submit Bid Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBidsByTender(req, res) {
    try {
      const { tenderId } = req.params;
      const result = await db.query(
        `SELECT b.*, u.name as bidder_name, u.email as bidder_email
         FROM tender.bids b
         JOIN tender.users u ON b.user_id = u.id
         WHERE b.tender_id = $1
         ORDER BY b.bid_amount ASC`,
        [tenderId]
      );

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get Bids Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyBids(req, res) {
    try {
      const userId = req.user.id;
      const result = await db.query(
        `SELECT b.*, t.title as tender_title, t.status as tender_status
         FROM tender.bids b
         JOIN tender.tenders t ON b.tender_id = t.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get My Bids Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TenderController();
