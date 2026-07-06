import app from './app';
import { config } from './config';

// Trigger nodemon restart watcher
app.listen(config.PORT, () => {
  console.log(`[ThinkFlow Server] Running on http://localhost:${config.PORT}`);
  console.log(`[ThinkFlow Server] Model configured: ${config.GROQ_MODEL}`);
});
