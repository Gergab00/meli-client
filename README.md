# meli-client

<span style="color:red"><b>EL PRESENTE PAQUETE SE ENCUENTRA EN DESARROLLO. CUALQUIER DUDA O COMENTARIO SE AGRADECE AL CORREO [gergab00@hotmail.com](mailto:gergab00@hotmail.com) o [gergab00@gmail.com](mailto:gergab00@gmail.com)</b></span>

`meli-client` es un paquete de Node.js que proporciona un cliente para interactuar con la API de MercadoLibre. Maneja la autenticación, el almacenamiento de tokens y facilita las solicitudes a la API de MercadoLibre de manera sencilla.

## Características

- **Autenticación Automática**: Se encarga de obtener y actualizar el token de acceso automáticamente.
- **Almacenamiento de Tokens**: Permite almacenar los tokens en MongoDB o en un archivo JSON, dependiendo de la configuración.
- **Interfaz Simple**: Facilita la realización de solicitudes a la API de MercadoLibre con una simple llamada a un método.

## Requisitos

- Node.js v12 o superior
- MongoDB (opcional, si decides almacenar tokens en una base de datos)

## Instalación

Para instalar el paquete, utiliza npm:

```bash
npm install meli-client
```

## Configuración del Archivo .env

Para utilizar el paquete, configura un archivo `.env` en la raíz de tu proyecto con las siguientes variables de entorno:

```ini
APP_ID=tu_app_id_de_mercadolibre
SECRET_KEY=tu_secret_key_de_mercadolibre
REDIRECT_URI=tu_redirect_uri_configurada_en_mercadolibre
USE_DATABASE=true  # Define si se utiliza la base de datos para almacenar tokens (true/false)
MONGO_URI=mongodb://tu_url_de_mongodb  # Solo necesario si USE_DATABASE es true
```

## Uso del Cliente

### 1. Configuración de la Conexión con MongoDB

Para almacenar los tokens en la base de datos, es necesario proporcionar una instancia de `mongoose` al cliente `meli-client`. 

Ejemplo de conexión a MongoDB en tu aplicación principal:

```javascript
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();
```

### 2. Importar e Instanciar el Cliente

Importa e instancia `MercadoLibreClient` en tu aplicación principal, asegurándote de pasar `mongoose` como una opción de configuración si deseas almacenar los tokens en la base de datos.

```javascript
const MercadoLibreClient = require('meli-client');
const mongoose = require('mongoose');
require('dotenv').config();

const meliClient = new MercadoLibreClient({
  appId: process.env.APP_ID,
  secretKey: process.env.SECRET_KEY,
  redirectUri: process.env.REDIRECT_URI,
  mongoose: mongoose,  // Es necesario pasar mongoose si se quiere guardar en la BD
});
```

### 3. Realizar una Llamada a la API

Utiliza el método `callAPI` para realizar una solicitud a la API de MercadoLibre:

```javascript
// Llamar a la API de MercadoLibre
meliClient.callAPI('users/me', 'GET')
    .then(response => {
        console.log('Datos del usuario:', response);
    })
    .catch(error => {
        console.error('Error al llamar a la API:', error);
    });
```

### 4. Configuración Alternativa

Si prefieres no usar variables de entorno, puedes pasar los parámetros directamente al instanciar el cliente:

```javascript
const meliClient = new MercadoLibreClient({
    appId: 'your_app_id',
    secretKey: 'your_secret_key',
    redirectUri: 'your_redirect_uri',
    mongoose: mongoose,  // Asegúrate de pasar la instancia de mongoose si deseas almacenar en BD
});
```

## Licencia

Este proyecto está bajo la Licencia MIT.

## Autor

Creado por [Gerardo Gabriel Gonzalez Velazquez](https://www.linkedin.com/in/gerardo-gabriel-gonzalez-velazquez/).

## Contribución

¡Nos encantaría recibir contribuciones de la comunidad! Si tienes alguna idea, sugerencia o corrección, por favor abre un issue o envía un pull request en el repositorio de GitHub.

## Soporte

Si tienes alguna pregunta o necesitas ayuda con el paquete `meli-client`, puedes consultar la documentación oficial en el repositorio de GitHub o unirte a nuestra comunidad en el canal de Slack.

## Versiones Disponibles

Puedes encontrar las versiones disponibles del paquete `meli-client` en el repositorio de GitHub. Asegúrate de utilizar la versión más reciente para acceder a las últimas características y mejoras.

## Problemas Conocidos

En el repositorio de GitHub también encontrarás una lista de problemas conocidos y soluciones alternativas. Si encuentras algún problema que no esté documentado, por favor abre un issue para que podamos solucionarlo.

## Contribuidores

Agradecemos a todos los contribuidores que han ayudado a mejorar el paquete `meli-client`. Puedes encontrar una lista completa de los contribuidores en el archivo CONTRIBUTORS.md del repositorio de GitHub.

