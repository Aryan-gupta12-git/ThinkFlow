import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import app from '../../api/app';
import { config } from '../../api/config';

// Trigger nodemon restart watcher
app.listen(config.PORT, () => {
  console.log(`[ThinkFlow Server] Running on http://localhost:${config.PORT}`);
  console.log(`[ThinkFlow Server] Model configured: ${config.GROQ_MODEL}`);
});
