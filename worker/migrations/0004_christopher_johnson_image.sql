UPDATE reviews
SET image_key = 'static/reviewers/bbmlogo.jpg',
    image_content_type = 'image/jpeg'
WHERE lower(trim(customer_name)) = 'christopher johnson'
  AND (image_key IS NULL OR image_key = '');
