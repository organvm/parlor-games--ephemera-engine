-- Note: Requires pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'generate-prousts-answer-daily',
  '0 10 * * *', -- 10 AM daily
  $$
    -- Call the edge function via pg_net (pseudo-code)
    -- SELECT net.http_post(url:='https://.../functions/v1/generate-prousts-answer');
    SELECT 1;
  $$
);
