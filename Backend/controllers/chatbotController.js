const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');

const COMPANY_CONTEXT = `
ANOVA Technology is a software development company that builds custom websites, web applications, CRM/ERP systems, and e-commerce solutions.
Website: https://anova-tecnologes.vercel.app/
Services: website development, web application development, CRM/ERP, e-commerce, digital strategy, and business software solutions.
Contact: hello@anova-tech.com or through the website contact form.
`;

function normalizeMessage(message = '') {
  return String(message || '').trim();
}

function getKnowledgeReply(message) {
  const text = normalizeMessage(message).toLowerCase();

  if (text.includes('pricing') || text.includes('cost') || text.includes('quote') || text.includes('budget')) {
    return 'Our pricing depends on the scope, timeline, and complexity of the project. We usually recommend a free consultation first so we can provide a tailored estimate for your business needs.';
  }

  if (text.includes('crm') || text.includes('erp')) {
    return 'We build CRM and ERP solutions that help teams manage customers, operations, and internal workflows more efficiently. We can tailor the system to your business processes.';
  }

  if (text.includes('ecommerce') || text.includes('shop') || text.includes('store')) {
    return 'We can build modern e-commerce platforms with product management, payments, inventory, and a polished customer experience.';
  }

  if (text.includes('web app') || text.includes('application') || text.includes('software')) {
    return 'We create scalable web applications for dashboards, portals, internal tools, and business automation workflows.';
  }

  if (text.includes('website') || text.includes('landing') || text.includes('design')) {
    return 'We build custom websites and landing pages that are fast, responsive, and designed to convert visitors into leads or customers.';
  }

  if (text.includes('contact') || text.includes('consult') || text.includes('book') || text.includes('meeting')) {
    return 'We would be happy to help. You can book a free consultation through the website or share your project details here and our team will follow up.';
  }

  if (text.includes('who are you') || text.includes('about anova')) {
    return 'I am ANOVA Technology’s assistant. I can help with service information, project ideas, pricing guidance, and follow-up inquiries.';
  }

  return `Thanks for reaching out! ANOVA Technology helps businesses with web development, web applications, CRM/ERP systems, and e-commerce solutions. If you want, I can help you choose the right service or collect your project details for a free consultation.`;
}

async function callAiProvider(message) {
  const provider = (process.env.CHATBOT_PROVIDER || 'knowledge').toLowerCase();
  const userMessage = normalizeMessage(message);

  if (provider === 'knowledge' || !userMessage) {
    return null;
  }

  try {
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are ANOVA Technology’s website assistant. Use the following company context when answering the user: ${COMPANY_CONTEXT}` },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.4
        })
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }

    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are ANOVA Technology’s website assistant. Use the following company context when answering the user: ${COMPANY_CONTEXT}\n\nUser: ${userMessage}` }] }]
        })
      });

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    }
  } catch (error) {
    console.error('Chatbot AI provider error:', error.message);
  }

  return null;
}

async function createChatReply(req, res) {
  const message = normalizeMessage(req.body?.message || req.body?.text || '');
  const sessionId = normalizeMessage(req.body?.session_id || req.body?.sessionId || 'default');

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please enter a message.' });
  }

  try {
    await pool.query(
      'INSERT INTO chatbot_conversations (session_id) VALUES (?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
      [sessionId]
    );

    await pool.query(
      'INSERT INTO chatbot_messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, 'user', message]
    );

    const aiReply = await callAiProvider(message);
    const reply = aiReply || getKnowledgeReply(message);

    await pool.query(
      'INSERT INTO chatbot_messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, 'assistant', reply]
    );

    return res.json({
      success: true,
      reply,
      provider: process.env.CHATBOT_PROVIDER || 'knowledge',
      session_id: sessionId,
      data: {
        reply,
        provider: process.env.CHATBOT_PROVIDER || 'knowledge',
        session_id: sessionId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createLead(req, res) {
  const { name, email, phone, company, project_description, budget, source = 'website_chat' } = req.body || {};

  if (!name || !email || !project_description) {
    return res.status(400).json({ success: false, message: 'Name, email, and project description are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO chatbot_leads (name, email, phone, company, project_description, budget, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [String(name).trim(), String(email).trim(), phone ? String(phone).trim() : null, company ? String(company).trim() : null, String(project_description).trim(), budget ? String(budget).trim() : null, String(source).trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Project inquiry received. Our team will contact you shortly.',
      data: { id: result.insertId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function listLeads(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query('SELECT * FROM chatbot_leads ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM chatbot_leads');

  return res.json({ success: true, data: rows, meta: { page, limit, total } });
}

async function deleteLead(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM chatbot_leads WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Lead not found.' });
  }

  return res.json({ success: true, message: 'Lead deleted successfully.' });
}

async function getChatHistory(req, res) {
  const sessionId = normalizeMessage(req.query.session_id || req.params.sessionId || 'default');
  const [rows] = await pool.query(
    'SELECT id, session_id, role, content, created_at FROM chatbot_messages WHERE session_id = ? ORDER BY created_at ASC',
    [sessionId]
  );

  return res.json({ success: true, data: rows, session_id: sessionId });
}

async function ensureChatbotTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chatbot_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chatbot_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(120) NOT NULL,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session_id (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chatbot_leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(40) DEFAULT NULL,
      company VARCHAR(160) DEFAULT NULL,
      project_description TEXT NOT NULL,
      budget VARCHAR(80) DEFAULT NULL,
      source VARCHAR(80) DEFAULT 'website_chat',
      status VARCHAR(40) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = {
  createChatReply,
  createLead,
  listLeads,
  deleteLead,
  getChatHistory,
  ensureChatbotTables
};
