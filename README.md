# Discord Bot Monitor

Este bot monitorea el estado de otros bots en un servidor de Discord y muestra un embed con el estado actual de cada bot.

![Imagen del Bot en Acción](https://i.gyazo.com/bfaca0ccf079777c4236e3aabd16e65c.png)

## Requisitos

- Node.js
- npm (Node Package Manager)

## Instalación

1. Clona el repositorio:

    ```bash
    git clone https://github.com/tu-usuario/discord-bot-monitor.git
    cd discord-bot-monitor
    ```

2. Instala las dependencias:

    ```bash
    npm install
    ```

3. Crea un archivo `config.json` en el directorio raíz del proyecto con el siguiente contenido:

    ```json
    {
        "token": "TU_DISCORD_BOT_TOKEN",
        "clientId": "TU_CLIENT_ID",
        "guildId": "TU_GUILD_ID",
        "id_canal": "ID_DEL_CANAL"
    }
    ```

4. Inicia el bot:

    ```bash
    node index.js
    ```

## Uso

El bot tiene los siguientes comandos:

- `/addbot <name> <id>`: Añade un bot al monitoreo.
- `/removebot <id>`: Elimina un bot del monitoreo.
- `/listbots`: Lista todos los bots guardados.

![Comando /listbots](https://i.gyazo.com/0f4eb31d5ca11d368fbf28e24f62ab58.png)
![Comando /addbot](https://i.gyazo.com/0a69e408e8773f097395e6bdde113827.jpg)


## Soporte y Contacto

Si quieres contactar conmigo puedes hacerlo a través de Discord enviando una solicitúd de amistad. Mi usuario: paco_rguez 

O entrando a mi comunidad discord: https://discord.gg/9KJgC6cVx3