const axios = require('axios');
const db = require('../config/db');

const askProjectQuestion = async (projectId, question) => {
  try {
    // Fetch project, tasks, and all comments (project and task level)
    const projectRes = await db.query(
      `SELECT * FROM projects WHERE id = $1`, [projectId]
    );
    if (projectRes.rows.length === 0) throw new Error('Project not found');
    const project = projectRes.rows[0];

    const tasksRes = await db.query(
      `SELECT * FROM tasks WHERE project_id = $1`, [projectId]
    );
    const tasks = tasksRes.rows;

    // Get all comments for the project and its tasks
    const commentsRes = await db.query(
      `SELECT * FROM comments WHERE (parent_type = 'project' AND parent_id = $1)
       OR (parent_type = 'task' AND parent_id IN (SELECT id FROM tasks WHERE project_id = $1))`,
      [projectId]
    );
    const comments = commentsRes.rows;

    // Build context string
    let context = `Project Title: ${project.title}\n`;
    context += `Description: ${project.description}\n`;
    context += `Budget: ₹${project.budget}\nDeadline: ${project.deadline}\nStatus: ${project.status}\nTags: ${(project.tags || []).join(', ')}\n\n`;

    context += `Tasks:\n`;
    tasks.forEach(task => {
      context += `- [Task ${task.id}] ${task.title} (Status: ${task.status})\n  Description: ${task.description}\n`;
    });

    context += `\nComments:\n`;
    comments.forEach(comment => {
      context += `- [Comment ${comment.id}] On ${comment.parent_type} ${comment.parent_id}: ${comment.content}\n`;
    });

    // Only include the 3 most recent project-level comments as sources
    const projectComments = comments
      .filter(comment => comment.parent_type === 'project')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    let sources = [
      ...tasks.map(task => ({ type: 'task', id: task.id, title: task.title, snippet: task.description })),
      ...projectComments.map(comment => ({
        type: 'comment',
        id: comment.id,
        title: `Comment on project ${comment.parent_id}`,
        snippet: comment.content.slice(0, 80)
      }))
    ];

    // LLM prompt
    const ollamaPrompt = `You are a helpful assistant for the SkillSync platform. Answer questions based only on the following project context:\n\n${context}\n\nAlways cite your sources by referencing the specific task or comment IDs when applicable.`;
    const ollamaPayload = {
      model: "llama2:7b",
      prompt: `${ollamaPrompt}\n\nUser question: ${question}`,
      stream: false
    };

    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', ollamaPayload);
    const answer = ollamaResponse.data.response || ollamaResponse.data.message || ollamaResponse.data.text || '';

    return { answer, sources };
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
};

module.exports = {
  askProjectQuestion
};