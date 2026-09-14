ALTER TABLE reviews ADD COLUMN image_key TEXT;
ALTER TABLE reviews ADD COLUMN image_content_type TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_status_rating
  ON reviews(status, rating);