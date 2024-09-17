//Declaración de constantes
const { app, BrowserWindow } = require('electron');
const dropArea = document.getElementById('drop-area');
const XLSX = require('xlsx');
const mysql = require('mysql2');

//Inicio
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Mi Aplicación Electron',
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');//Cargamos el archivo index.html dentro de esta ventana.

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-custom-css', 'body { background-color: #f0f0f0; }');
  });
}

app.whenReady().then(createWindow);


//Soltar archivos
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    // Aquí procesarás el archivo
});


dropArea.addEventListener('drop', (event) => {
    // ...
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData); // Transformar los datos en formato JSON
    };
    reader.readAsArrayBuffer(file);
});

// Crear una conexión a la base de datos
const connection = mysql.createConnection({
    host: 'tu_host',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'tu_base_de_datos'
});

// Insertar los datos en la base de datos
connection.query('INSERT INTO tu_tabla (columna1, columna2, ...) VALUES ?', [jsonData], (error, results) => {
    if (error) throw error;
    console.log('Datos insertados correctamente');
});

//Barra de progreso para mostrar al usuario
const progressBar = new ProgressBar.Line('#progress-bar', {
  strokeWidth: 4,
  easing: 'easeInOut',
  duration: 1000,
  color: '#FFEA82',
  trailColor: '#eee',
  text: {
      style: {
      }
  },
  from: { color: '#FFEA82' },
  to: { color: '#ED6A5A' },
  step: (state, bar) => {
      bar.setText(Math.round(bar.value() * 100) + '%');
  }
});

// Actualizar la barra de progreso mientras se lee el archivo
reader.onprogress = (event) => {
  const progress = (event.loaded / event.total) * 100;
  progressBar.set(progress / 100);
};

//Validar el formato del archivo de Excel
if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
  file.type !== 'application/vnd.ms-excel') {
  alert('Por favor, selecciona un archivo de Excel válido.');
  return;
}
