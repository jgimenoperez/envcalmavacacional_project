const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = 3000;

// Configuración de Prismic
const PRISMIC_REPO = 'encalmavacacionalblog';
const PRISMIC_TOKEN = 'MC5hYmszN1JBQUFDUUFEbWFH.77-9V0Dvv73vv71-L--_vV8_77-9emDvv73vv71H77-977-977-977-9SlMe77-977-9Ye-_vQ0hQV9i';
const PRISMIC_API = `https://${PRISMIC_REPO}.cdn.prismic.io/api/v2`;

// Tipos MIME
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Función para hacer peticiones HTTPS
function httpsRequest(options) {
    return new Promise((resolve, reject) => {
        https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject).end();
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Proxy a Prismic API
    if (pathname.startsWith('/api/prismic')) {
        const query = parsedUrl.query;
        const prismicUrl = new URL(`${PRISMIC_API}/documents`);

        // Construir query params
        for (const [key, value] of Object.entries(query)) {
            prismicUrl.searchParams.append(key, value);
        }
        prismicUrl.searchParams.append('access_token', PRISMIC_TOKEN);

        try {
            const result = await httpsRequest({
                hostname: prismicUrl.hostname,
                path: prismicUrl.pathname + prismicUrl.search,
                method: 'GET'
            });

            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            res.end(result.data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // Servir archivos estáticos
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const mimeType = mimeTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Abre en el navegador: http://localhost:${PORT}`);
});
