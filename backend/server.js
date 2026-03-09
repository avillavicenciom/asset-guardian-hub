const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT || 3001;

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============ AUTH ============
const crypto = require('crypto');

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const [rows] = await pool.query(
      'SELECT id, name, email, username, role, is_active, permissions FROM operators WHERE username = ? AND password = ? AND is_active = 1',
      [username, hash]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = rows[0];
    user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
    await pool.query(
      'INSERT INTO audit_log (operator_id, operator_name, action, module, details) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, 'LOGIN', 'Auth', `Inicio de sesión: ${user.username}`]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const [existing] = await pool.query('SELECT id FROM operators WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).json({ error: 'El usuario ya existe' });
    const [result] = await pool.query(
      'INSERT INTO operators (name, email, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, username, hash, 'READONLY', '[]']
    );
    res.status(201).json({ id: result.insertId, name, email, username, role: 'READONLY', is_active: true, permissions: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ GENERIC CRUD HELPER ============
function crudRoutes(path, table, options = {}) {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
      if (options.parseJSON) {
        rows.forEach(r => {
          options.parseJSON.forEach(field => {
            if (r[field] && typeof r[field] === 'string') r[field] = JSON.parse(r[field]);
          });
        });
      }
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(`/api/${path}/:id`, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      const row = rows[0];
      if (options.parseJSON) {
        options.parseJSON.forEach(field => {
          if (row[field] && typeof row[field] === 'string') row[field] = JSON.parse(row[field]);
        });
      }
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(`/api/${path}`, async (req, res) => {
    try {
      const data = { ...req.body };
      if (options.parseJSON) {
        options.parseJSON.forEach(field => {
          if (data[field] && Array.isArray(data[field])) data[field] = JSON.stringify(data[field]);
        });
      }
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const [result] = await pool.query(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      const [newRow] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      res.status(201).json(newRow[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const data = { ...req.body };
      delete data.id;
      if (options.parseJSON) {
        options.parseJSON.forEach(field => {
          if (data[field] && Array.isArray(data[field])) data[field] = JSON.stringify(data[field]);
        });
      }
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
      const [updated] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ============ REGISTER ALL ROUTES ============
crudRoutes('statuses', 'status_catalog');
crudRoutes('asset-types', 'asset_types');
crudRoutes('asset-models', 'asset_models');
crudRoutes('locations', 'locations');
crudRoutes('operators', 'operators', { parseJSON: ['permissions'] });
crudRoutes('users', 'users');
crudRoutes('assets', 'assets', { parseJSON: ['tags'] });
crudRoutes('assignments', 'assignments');
crudRoutes('repairs', 'repairs');
crudRoutes('technicians', 'technicians');
crudRoutes('hardware-parts', 'hardware_parts');
crudRoutes('repair-parts', 'repair_parts');
crudRoutes('audit-log', 'audit_log');
crudRoutes('status-history', 'asset_status_history');
crudRoutes('delivery-evidence', 'delivery_evidence');
crudRoutes('departments', 'departments');
crudRoutes('repair-statuses', 'repair_statuses');

// ============ EXTRA ENDPOINTS ============

app.get('/api/assets/:id/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.display_name as user_name FROM assignments a LEFT JOIN users u ON a.user_id = u.id WHERE a.asset_id = ? ORDER BY a.assigned_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assets/:id/status-history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.*, 
        sf.label as from_status_label, st.label as to_status_label, 
        o.name as operator_name 
       FROM asset_status_history h 
       LEFT JOIN status_catalog sf ON h.from_status_id = sf.id 
       LEFT JOIN status_catalog st ON h.to_status_id = st.id 
       LEFT JOIN operators o ON h.changed_by_operator_id = o.id 
       WHERE h.asset_id = ? ORDER BY h.changed_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assets/:id/repairs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT r.*, t.name as technician_name FROM repairs r LEFT JOIN technicians t ON r.technician_id = t.id WHERE r.asset_id = ? ORDER BY r.opened_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [[totalAssets]] = await pool.query('SELECT COUNT(*) as count FROM assets');
    const [[assigned]] = await pool.query('SELECT COUNT(*) as count FROM assets a JOIN status_catalog s ON a.status_id = s.id WHERE s.code = "ASIGNADO"');
    const [[available]] = await pool.query('SELECT COUNT(*) as count FROM assets a JOIN status_catalog s ON a.status_id = s.id WHERE s.code IN ("EN_ALMACEN","POR_ASIGNAR","DISPONIBLE")');
    const [[inRepair]] = await pool.query('SELECT COUNT(*) as count FROM assets a JOIN status_catalog s ON a.status_id = s.id WHERE s.code = "EN_REPARACION"');
    const [[totalUsers]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[activeAssignments]] = await pool.query('SELECT COUNT(*) as count FROM assignments WHERE returned_at IS NULL');
    res.json({
      totalAssets: totalAssets.count,
      assigned: assigned.count,
      available: available.count,
      inRepair: inRepair.count,
      totalUsers: totalUsers.count,
      activeAssignments: activeAssignments.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`\n🚀 Asset Guardian API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
