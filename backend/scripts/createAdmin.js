import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Admin from '../models/Admin.js';
import { normalizeEmail } from '../utils/security.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FORCE_UPDATE } = process.env;
if (!ADMIN_NAME || !/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL || '') || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_NAME, a valid ADMIN_EMAIL, and ADMIN_PASSWORD of at least 8 characters are required.'); process.exit(1);
}
try {
  await connectDatabase();
  const email = normalizeEmail(ADMIN_EMAIL);
  const existing = await Admin.findOne({ email });
  if (existing && ADMIN_FORCE_UPDATE !== 'true') console.log('Admin already exists. No changes made.');
  else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    if (existing) { existing.name = ADMIN_NAME; existing.passwordHash = passwordHash; existing.isActive = true; await existing.save(); }
    else await Admin.create({ name: ADMIN_NAME, email, passwordHash, role: 'super_admin' });
    console.log(existing ? 'Admin credentials updated safely.' : 'Admin created successfully.');
  }
} catch (error) { console.error(`Unable to create admin: ${error.message}`); process.exitCode = 1; }
finally { await disconnectDatabase(); }
