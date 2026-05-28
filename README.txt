LA CEBADA - SITIO WEB REVISADO

Esta versión corrige la integración completa entre:
- Catálogo
- Carrito
- Formulario de envío
- WhatsApp
- Registro de ventas en Google Sheets
- Control de stock desde Google Sheets

Hojas esperadas en Google Sheets:
1. VENTAS
2. STOCK

Columnas de STOCK:
SKU | PRODUCTO | TIPO | OPCION_1 | OPCION_2 | STOCK | ACTIVO

Notas:
- El stock se lee desde Google Sheets.
- El cliente no ve la cantidad exacta de stock.
- Si STOCK es 0 o ACTIVO es NO, aparece "Sin stock".
- El stock NO baja automáticamente al recibir pedidos.
- Las columnas ESTADO DEL PEDIDO y OBSERVACIONES quedan vacías para control manual.
- Para cambios de stock, solo modificá Google Sheets. No hace falta pasar por GitHub/Vercel.
- Para cambios de diseño, textos, fotos o productos nuevos, sí hay que actualizar GitHub/Vercel.
