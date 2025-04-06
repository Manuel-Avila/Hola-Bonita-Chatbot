const venom = require("venom-bot");

const menus = {
  mainMenu: `¡HOLA BONITA! 🎀  
    Regalos Personalizados • Globos • Decoración  
    Elige una opción:  
    ⏰ 1 Horario y contacto  
    📍 2 Ubicación de la tienda  
    📦 3 Ver productos/catálogo  
    💵 4 Cotizar producto  
    🧾 5 Solicitar factura  
    🛍️ 6 Hacer pedido  
    *Responde solo con el número de la opción.* `,
  workshift: `⏰ Horario de atención:  
    Lunes a Viernes: 8AM - 9PM  
    Sábados: 8AM - 8PM  
    Domingos: Cerrado  
    📞 Contacto:  
    Teléfono: 612 185 7954  
    Correo: holabonitamexico@gmail.com  

    Escribe "0" para volver al menú principal.`,
  location: `📍 Dirección:  
    Jalisco 1420 e/México y Melitón Albáñez, La Paz, México  
    (FRENTE A PREPARATORIA CBTIS 62)  

    Escribe "0" para volver al menú principal.`,
  products: `📦 OPCIONES:  
    1. Descargar catálogo completo (PDF)  
    2. Buscar producto específico  
    Envía:  
    • "1" para recibir el PDF con todos nuestros productos  
    • "2" para describir lo que buscas (ej: "globo corazón dorado")  
    • "0" para volver  
    *Próximamente tendremos categorías organizadas.*`,
  quote: `💵 Para cotizar envíanos:  
    1. Foto del producto 📸  
    2. Descripción (ej: "10 globos plateados con caja personalizada")  
    *Te enviaremos precios en menos de 15 minutos.*  
    Escribe "0" para volver.`,
  invoice: `🧾 DATOS REQUERIDOS PARA FACTURA:  
    1. Nombre completo  
    2. RFC (12-13 caracteres, OBLIGATORIO)  
    3. Correo electrónico  
    📌 Ejemplo:  
    "Ana Sánchez  
    AASX850320MNE  
    ana@gmail.com"  
    *Un asesor te enviará la factura en 15 minutos.*  

    Escribe "0" para cancelar.`,
  order: `🛍️ PARA REALIZAR TU PEDIDO:  
    Describe:  
    1. Producto(s) deseado(s)  
    2. Fecha y hora de entrega  
    Ejemplo:  
    "5 globos de letras doradas para el 25/05 a las 2PM"  
    *Un asesor confirmará disponibilidad y precio.*  

    Escribe "0" para volver. `,
  giveDescription: `Describa el producto que busca:

  Escribe "0" para volver una vez que hayas terminado.
  `
};

const menuNavegation = {
  mainMenu: {
    '1': 'workshift',
    '2': 'location',
    '3': 'products',
    '4': 'quote',
    '5': 'invoice',
    '6': 'order'
  },
  workshift: {
    '0': 'mainMenu'
  },
  location: {
    '0': 'mainMenu'
  },
  products: {
    '0': 'mainMenu',
    '1': 'productsPDF',
    '2': 'giveDescription'
  },
  quote: {
    '0': 'mainMenu'
  },
  invoice: {
    '0': 'mainMenu'
  },
  order: {
    '0': 'mainMenu'
  }, 
  giveDescription: {
    '0': 'mainMenu'
  }
};

const invalidInputMessage = `🔢 Por favor, usa sólo NÚMEROS del 1 al 6 para elegir opciones.  
Ejemplo: "3" para ver productos.
`;

let client = undefined;
const userState = {};
const userLastMessageTime = {};

venom
  .create({
    session: "bot-session",
    multidevice: true,
  })
  .then((client) => start(client))
  .catch((error) => console.log("Error al iniciar el bot:", error));

function start(c) {
  client = c
  console.log("✅ Bot conectado con éxito");

  client.onMessage(async (message) => {
    try {
      // Valida que el mensaje no sea en un grupo y tenga texto
      if (message.isGroupMsg || !message.body) return;
    
      console.log("📩 Mensaje recibido:", message.body);
      const user = message.from;

      // Delay entre mensajes de 2 segundos para evitar spam
      const now = Date.now();
      if(userLastMessageTime[user] && (now - userLastMessageTime[user]) < 2000) return;
      userLastMessageTime[user] = now;

      const userMessage = message.body.trim();

      if(userState[user]) {
        handleMenuNavegation(user, userMessage);
      } else {
        userState[user] = 'mainMenu';
        sendText(user, menus.mainMenu);
      }
    } catch(e) {
      console.log(`Error: ${e.message}`);
    }
  });
}

async function sendText(user, text) {
  await client.sendText(user, text).catch(e => {
    console.log(`Error: ${e.message}`)
  });
}

// Ejemplo sendFile(user, './assets/test.pdf', 'test.pdf', 'Pdf')
async function sendFile(user, path, name, description = '') {
  await client.sendFile(
    user,
    path,
    name,
    description
  ).catch(e => {
    console.log(`Error: ${e.message}`)
  });
}


async function sendImage(user, path, name, description = '') {
  await client.sendImage(
    user,
    path,
    name,
    description
  ).catch(e => {
    console.log(`Error: ${e.message}`)
  });
}

async function handleMenuNavegation(user, userMessage) {
  const currentMenu = userState[user];
  const nextMenu = menuNavegation[currentMenu]?.[userMessage];
  const userInputOptions = ['giveDescription', 'quote', 'invoice', 'order'];

  if(nextMenu === 'productsPDF') {
    sendFile(user, './assets/test.pdf', 'test.pdf')
    return;
  }

  // Si se cumple esta condicion es porque se espera input del usuario, ignorara cualquier cosa que no sea el '0' para regresar
  if(userInputOptions.includes(currentMenu) && !nextMenu) {
    return;
  }

  // Entra si escogio una opcion invalida
  if(!nextMenu) {
    sendText(user, invalidInputMessage);
    sendText(user, menus[currentMenu]);
    return;
  }

  userState[user] = nextMenu;
  sendText(user, menus[nextMenu]);
}