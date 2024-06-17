const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { token, clientId, guildId, id_canal } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences] });

let botsToMonitor = [];
const botsFilePath = './bots.json';
const embedMessageIdPath = './embedMessageId.json';
let channelId = id_canal;
let embedMessageId;

// Función para cargar los bots desde el archivo
const loadBots = () => {
    if (fs.existsSync(botsFilePath)) {
        const data = fs.readFileSync(botsFilePath);
        botsToMonitor = JSON.parse(data);
    }
};

// Función para guardar los bots en el archivo
const saveBots = () => {
    fs.writeFileSync(botsFilePath, JSON.stringify(botsToMonitor, null, 2));
};

// Función para cargar la ID del mensaje del embed desde el archivo
const loadEmbedMessageId = () => {
    if (fs.existsSync(embedMessageIdPath)) {
        const data = fs.readFileSync(embedMessageIdPath);
        embedMessageId = JSON.parse(data).id;
    }
};

// Función para guardar la ID del mensaje del embed en el archivo
const saveEmbedMessageId = (id) => {
    fs.writeFileSync(embedMessageIdPath, JSON.stringify({ id }));
};

// Función para actualizar el embed
const updateEmbed = async () => {
    const embed = new EmbedBuilder()
        .setTitle('📊 Monitoreo de Bots')
        .setColor(0x00FF00)
        .setImage('https://i.gyazo.com/87914e116dc8a954b4a9a5235d9c2426.jpg')
        .setThumbnail('https://images.emojiterra.com/google/noto-emoji/unicode-15/animated/1f6a8.gif')
        .setTimestamp()
        .setFooter({ text: 'Estado de Bots', iconURL: 'https://images.emojiterra.com/google/noto-emoji/unicode-15/animated/1f6a8.gif' });

    const fields = await Promise.all(botsToMonitor.map(async (bot) => {
        const botUser = await client.users.fetch(bot.id).catch(() => null);
        const presence = botUser ? client.guilds.cache.first().presences.resolve(bot.id) : null;
        const status = presence ? presence.status : 'offline';

        const statusEmoji = {
            online: '🟢',
            idle: '🟠',
            dnd: '🔴',
            offline: '⚫'
        }[status] || '⚫';

        return { name: `${statusEmoji} ${bot.name}`, value: `**Estado:** ${status}`, inline: true };
    }));

    embed.addFields(fields);

    const channel = await client.channels.fetch(channelId);
    if (embedMessageId) {
        try {
            const message = await channel.messages.fetch(embedMessageId);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching or editing the existing embed message:', error);
            const sentMessage = await channel.send({ embeds: [embed] });
            embedMessageId = sentMessage.id;
            saveEmbedMessageId(embedMessageId);
        }
    } else {
        const sentMessage = await channel.send({ embeds: [embed] });
        embedMessageId = sentMessage.id;
        saveEmbedMessageId(embedMessageId);
    }
};

// Evento cuando el bot está listo
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    loadBots();
    loadEmbedMessageId();
    await updateEmbed();
    setInterval(updateEmbed, 30000);  // Actualizar cada 30 segundos
});

// Configuración de los slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('addbot')
        .setDescription('Añadir un bot al monitoreo')
        .addStringOption(option => option.setName('name').setDescription('Nombre del bot').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('ID del bot (APPLICATION ID)').setRequired(true)),
    new SlashCommandBuilder()
        .setName('removebot')
        .setDescription('Eliminar un bot del monitoreo')
        .addStringOption(option => option.setName('id').setDescription('ID del bot (APPLICATION ID)').setRequired(true)),
    new SlashCommandBuilder()
        .setName('listbots')
        .setDescription('Listar todos los bots guardados')
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

// Evento para manejar los slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'addbot') {
        const name = options.getString('name');
        const id = options.getString('id');

        botsToMonitor.push({ name, id });
        saveBots();
        await interaction.reply({ content: `Bot ${name} añadido al monitoreo.`, ephemeral: true });

        updateEmbed();
    } else if (commandName === 'removebot') {
        const id = options.getString('id');

        botsToMonitor = botsToMonitor.filter(bot => bot.id !== id);
        saveBots();
        await interaction.reply({ content: `Bot con ID ${id} eliminado del monitoreo.`, ephemeral: true });

        updateEmbed();
    } else if (commandName === 'listbots') {
        const embed = new EmbedBuilder()
            .setTitle('📋 Lista de Bots Guardados')
            .setColor(0x00FF00)
            .setTimestamp()
            .setFooter({ text: 'Estado de Bots', iconURL: 'https://images.emojiterra.com/google/noto-emoji/unicode-15/animated/1f6a8.gif' });

        botsToMonitor.forEach(bot => {
            embed.addFields({ name: bot.name, value: `ID: ${bot.id}`, inline: true });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.login(token);
