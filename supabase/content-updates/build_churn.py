import json
slug = "prediccion-churn-ga4-machine-learning"
excerpt = "Antes de irse, un usuario deja señales en GA4. Cómo convertirlas en una probabilidad de churn: con la métrica predictiva nativa de Google Analytics o con tu propio modelo en BigQuery ML."
meta_title = "Predicción de churn con GA4 y machine learning: guía práctica"
meta_description = "Cómo predecir qué usuarios van a abandonar con GA4: métrica predictiva de churn, exportación a BigQuery y modelos en BigQuery ML. Requisitos y costos."
quick_answer = "Predecir el churn con GA4 se puede hacer de dos formas: con la métrica predictiva nativa **Probabilidad de abandono**, que estima si un usuario activo en los últimos 7 días dejará de estarlo en los próximos 7, o exportando los eventos a BigQuery y entrenando un modelo propio con BigQuery ML. La métrica nativa exige al menos 1.000 usuarios recurrentes que abandonaron y 1.000 que no; el modelo propio no tiene ese mínimo y te deja definir qué es churn para tu negocio."
content = """## Por qué conviene predecir el churn y no solo medirlo

Un reporte de churn te dice quién se fue; un modelo de predicción te dice quién está por irse, cuando todavía podés hacer algo. Esa diferencia tiene un peso económico concreto: según Harvard Business Review, conseguir un cliente nuevo cuesta entre 5 y 25 veces más que retener a uno existente, y una investigación de Frederick Reichheld (Bain & Company) citada en el mismo artículo encontró que aumentar la retención un 5% puede subir las ganancias entre un 25% y un 95%.

El comportamiento de un usuario antes de cancelar suele dejar huellas: sesiones más cortas, menos frecuencia de visitas, abandono de funciones que antes usaba. GA4 ya captura buena parte de esas señales como eventos; el trabajo está en convertirlas en una probabilidad que te diga a quién contactar primero.

## Qué señales de abandono registra GA4

GA4 está basado en eventos: cada interacción (una sesión, un clic en un botón, una compra, el uso de una función) queda registrada con sus parámetros. Para predecir el churn, esas interacciones se agrupan en cuatro familias de variables:

- **Recencia:** cuánto tiempo pasó desde la última visita o el último evento clave.
- **Frecuencia:** cuántas sesiones tuvo el usuario en un período dado y si esa cifra viene bajando.
- **Profundidad de uso:** qué eventos clave completó (por ejemplo, usar una función central del producto) y cuántas veces.
- **Contexto:** país, dispositivo, sistema operativo, idioma o canal de adquisición.

No hace falta medir todo desde el primer día. En el ejemplo que publicó Google Cloud para predecir el churn de una app, el modelo se entrena solo con datos demográficos de la primera interacción y con la cantidad de veces que cada usuario disparó una docena de eventos durante sus primeras 24 horas.

## Dos caminos: la métrica predictiva de GA4 o un modelo propio

| Opción | Cómo funciona | Requisitos | Cuándo conviene |
|---|---|---|---|
| Métrica **Probabilidad de abandono** de GA4 | Google entrena el modelo y actualiza las predicciones a diario. La definición es fija: usuario activo en los últimos 7 días que no estará activo en los próximos 7 | Al menos 1.000 usuarios recurrentes que abandonaron y 1.000 que no, en un período de 7 días dentro de los últimos 28, y un modelo que mantenga su calidad | Sitios o apps con volumen que quieren audiencias predictivas sin escribir código |
| Modelo propio en **BigQuery ML** | Exportás los eventos de GA4 a BigQuery y entrenás el modelo con SQL (`CREATE MODEL`) | Exportación a BigQuery activa, historial suficiente y alguien que maneje SQL | Cuando necesitás tu propia definición de churn (por ejemplo, "sin compra en 60 días") o no llegás al mínimo de usuarios |

La métrica nativa es la forma más rápida de empezar: si tu propiedad es elegible, aparece en el explorador de audiencias y podés crear audiencias predictivas, como la de usuarios con probabilidad de abandonar en los próximos 7 días. Su límite es que no podés cambiar la ventana de 7 días ni ver qué variables pesan en la predicción.

El modelo propio da más control: vos decidís qué es abandono para tu negocio, qué variables entran y qué umbral usar para actuar. A cambio, requiere más trabajo de datos.

## Cómo armar tu propio modelo de churn con BigQuery ML

El primer paso es la exportación de GA4 a BigQuery, que es nativa y se activa desde la administración de la propiedad. Tiene límites que conviene conocer antes de planificar: en las propiedades estándar, la exportación diaria admite hasta 1 millón de eventos por día, y la exportación en streaming cuesta 0,05 USD por GB (unos 600.000 eventos). Podés empezar sin costo con el sandbox de BigQuery, que da 10 GiB de almacenamiento y 1 TiB de consultas por mes, pero sus tablas se borran a los 60 días: para entrenar con historial largo hace falta activar la facturación.

El segundo paso es definir la etiqueta de churn. En el ejemplo de Google Cloud, un usuario se considera "churned" si no registró ningún evento después de sus primeras 24 horas, y se descartan los que estuvieron menos de 10 minutos (los "rebotes"). Para un e-commerce o un SaaS, la definición suele ser otra, por ejemplo, sin compras o sin inicios de sesión en 30 o 60 días: lo importante es que refleje el ciclo real de tu negocio.

El tercer paso es entrenar y evaluar. Una regresión logística simple, entrenada con recencia, frecuencia y profundidad de uso, ya da una probabilidad de churn razonable y es el modelo más rápido de entrenar. Con `ML.EVALUATE` obtenés precisión, recall, F1 y ROC AUC; si el resultado no alcanza, BigQuery ML permite comparar contra XGBoost, redes neuronales o AutoML sin salir de SQL.

## De la predicción a la acción

Una vez que el modelo funciona, el mayor valor no es predecir el churn, sino entender qué variables lo explican y actuar sobre ellas antes de que el usuario llegue al punto de irse. La regresión logística ayuda justamente en eso: con `ML.WEIGHTS` podés ver el peso de cada variable y detectar, por ejemplo, que dejar de usar una función clave anticipa el abandono mejor que la caída de sesiones.

Para activar las predicciones, Google propone importarlas de vuelta a GA4 con la importación de datos y armar audiencias para campañas o mensajes dentro del producto. Un criterio práctico es priorizar a los usuarios "indecisos", con una probabilidad de churn de entre 0,4 y 0,7: los que tienen una probabilidad muy alta suelen estar demasiado lejos para recuperarlos, y los de probabilidad baja no necesitan intervención. Si además querés que los resultados lleguen solos a tu reporte mensual, en [IA generativa para automatizar reportes de GA4](/blog/ia-generativa-automatizar-reportes-ga4) explicamos cómo hacerlo sin que el modelo invente cifras.

Hay tres errores que se repiten. El primero es medir el modelo solo por su exactitud: si el 10% de los usuarios abandona, un modelo que predice "nadie se va" acierta el 90% de las veces y no sirve para nada, por eso importan más la precisión y el recall. El segundo es entrenar una vez y olvidarse: el comportamiento cambia, así que el modelo hay que reentrenarlo con datos nuevos con una frecuencia fija. El tercero es entrenar en el sandbox sin notar que las tablas se borran a los 60 días, lo que deja al modelo sin el historial que necesita.

## Fuentes

- [[GA4] Predictive metrics — Google Analytics Help](https://support.google.com/analytics/answer/9846734?hl=en)
- [BigQuery Export — Google Analytics Help](https://support.google.com/analytics/answer/9358801?hl=en)
- [Churn prediction for game developers using Google Analytics 4 (GA4) and BigQuery ML — Google Cloud Blog](https://cloud.google.com/blog/topics/developers-practitioners/churn-prediction-game-developers-using-google-analytics-4-ga4-and-bigquery-ml)
- [BigQuery sandbox — Google Cloud](https://docs.cloud.google.com/bigquery/docs/sandbox)
- [The Value of Keeping the Right Customers — Harvard Business Review](https://hbr.org/2014/10/the-value-of-keeping-the-right-customers)
"""
faqs = [
 {"question":"¿Cuántos usuarios necesito para usar la probabilidad de abandono de GA4?","answer":"Al menos 1.000 usuarios recurrentes que abandonaron y 1.000 que no, en un período de 7 días dentro de los últimos 28. Si tu propiedad no llega a ese volumen, la métrica no aparece y la alternativa es entrenar un modelo propio con los datos exportados a BigQuery."},
 {"question":"¿Es gratis exportar los datos de GA4 a BigQuery?","answer":"Podés empezar sin costo con el sandbox de BigQuery (10 GiB de almacenamiento y 1 TiB de consultas por mes), pero sus tablas se borran a los 60 días. Para guardar historial hay que activar la facturación, y la exportación en streaming cuesta 0,05 USD por GB."},
 {"question":"¿Qué modelo de machine learning conviene usar primero?","answer":"Una regresión logística en BigQuery ML: es la más rápida de entrenar, da una línea de base razonable y permite ver qué variables pesan más en la predicción. Si no alcanza, se puede comparar contra XGBoost, redes neuronales o AutoML."},
 {"question":"¿Cada cuánto hay que actualizar un modelo de churn?","answer":"La métrica nativa de GA4 se actualiza sola todos los días. Un modelo propio conviene reentrenarlo con datos nuevos con una frecuencia fija, por ejemplo una vez por mes, y revisar si sus métricas de evaluación empeoran con el tiempo."},
]
def dq(t, tag):
    assert f"${tag}$" not in t
    return f"${tag}${t}${tag}$"
sql = f"""-- Optimización para IA/SEO de la nota "{slug}" (mismo estándar que
-- "ia-generativa-automatizar-reportes-ga4"): bajada, respuesta rápida,
-- cuerpo en 5 secciones con tabla y fuentes, meta title/description y FAQs.
-- No cambia el título, el slug, la categoría, el autor ni la portada.
update public.posts set
  excerpt = {dq(excerpt,'x')},
  quick_answer = {dq(quick_answer,'q')},
  content = {dq(content,'c')},
  meta_title = {dq(meta_title,'t')},
  meta_description = {dq(meta_description,'d')},
  faqs = {dq(json.dumps(faqs, ensure_ascii=False),'f')}::jsonb
where slug = '{slug}';
"""
open(f"2026-10-03_{slug}.sql","w").write(sql)
print(len(meta_title), len(meta_description), len(excerpt), len(quick_answer.split()))
