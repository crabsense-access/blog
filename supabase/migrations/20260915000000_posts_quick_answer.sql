-- "Respuesta rápida": bloque corto en Markdown que se muestra antes del
-- contenido completo del post, a modo de resumen ejecutivo / respuesta
-- directa (útil también para AI Overviews / respuestas generativas).
alter table public.posts add column if not exists quick_answer text;
