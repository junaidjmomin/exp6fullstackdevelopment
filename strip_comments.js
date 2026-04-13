const fs = require('fs');
const cleanHTML = (f) => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/<!--[\s\S]*?-->/g, '');
    fs.writeFileSync(f, c);
};
const cleanCSS = (f) => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/\/\*[\s\S]*?\*\//g, '');
    fs.writeFileSync(f, c);
};
const cleanJS = (f) => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/(?<!['":S])\/\/.*$/gm, '');
    fs.writeFileSync(f, c);
};

['frontend/index.html'].forEach(cleanHTML);
['frontend/style.css'].forEach(cleanCSS);
['frontend/app.js', 'backend/server.js'].forEach(cleanJS);
