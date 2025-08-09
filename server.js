const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(bodyParser.json());

// Supabase client (service role recommended)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// VAPID setup
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BIVlyFUQ-yULBvPPAjHTY12_G5llH_LAboo2mGPXwlZVjjmnqp6tri4zbRUZ1hpoerYWBHHIqgP7IsdstXIeVFk';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'q1W51Ers6ASg2bHRgr8UMbSV-1WkrAHSyh7JLnr54CA';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:getitrenderedgoa@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

// Subscribe endpoint (persist in Supabase when configured)
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint || !sub.keys) return res.status(400).json({ success: false });

    if (supabase) {
      const { endpoint, keys } = sub;
      const { auth, p256dh } = keys;
      const userId = req.headers['x-user-id'] || null;
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: 'endpoint' });
      if (error) throw error;
    }

    res.status(201).json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

// Utility: broadcast a push to all stored subscriptions (Supabase)
const broadcastPush = async (payload) => {
  const message = JSON.stringify(payload);
  if (!supabase) return;
  const { data } = await supabase.from('push_subscriptions').select('endpoint, p256dh, auth');
  const tasks = (data || []).map((row) =>
    webpush.sendNotification(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth }
      },
      message
    ).catch(() => {})
  );
  await Promise.all(tasks);
};

// Activity push trigger endpoint
app.post('/api/push/trigger', async (req, res) => {
  try {
    const payload = req.body || {};
    await broadcastPush(payload);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 