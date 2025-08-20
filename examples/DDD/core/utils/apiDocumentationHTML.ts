import type { OpenAPIObjectConfig } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator'

import { openApi } from 'nitro-router'

export default function apiDocumentationHTML(documentation: OpenAPIObjectConfig) {
  const apiDocumentation = openApi(documentation)

  const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>API Docs</title>
  </head>
  <body>
    <div id="app"></div>

    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      const blob = new Blob([JSON.stringify(${JSON.stringify(apiDocumentation)})], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      Scalar.createApiReference('#app', { url });
    </script>
  </body>
</html>
`
  return htmlContent
}
