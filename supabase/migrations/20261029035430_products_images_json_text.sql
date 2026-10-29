ALTER TABLE public.products
  ALTER COLUMN images_json DROP DEFAULT;
ALTER TABLE public.products
  ALTER COLUMN images_json TYPE text USING images_json::text;
ALTER TABLE public.products
  ALTER COLUMN images_json SET DEFAULT '[]';
