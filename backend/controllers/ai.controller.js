const db = require('../config/db');
const { askProjectQuestion } = require('../services/ai.service');

exports.askQuestion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question } = req.body;
    const userId = req.user.id;

    // Verify project access
    const projectAccess = await db.query(
      `SELECT 1 FROM projects 
       WHERE id = $1 AND (created_by = $2 OR $2 IN (
         SELECT user_id FROM project_team WHERE project_id = $1
       ))`,
      [projectId, userId]
    );

    if (projectAccess.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { answer, sources } = await askProjectQuestion(projectId, question);
    res.status(200).json({ answer, sources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.askAI = async (req, res) => {
  try {
    const { projectId, question } = req.body;
    if (!projectId || !question) {
      return res.status(400).json({ message: 'projectId and question are required' });
    }
    const result = await askProjectQuestion(projectId, question);
    res.json(result);
  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};