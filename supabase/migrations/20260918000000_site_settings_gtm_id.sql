-- ID de Google Tag Manager (ej. "GTM-XXXXXXX"), configurable desde
-- /admin/settings en vez de hardcodeado en el código. Nullable: mientras
-- no se cargue ninguno, el layout raíz no inyecta el script de GTM.
alter table public.site_settings add column if not exists gtm_id text;
