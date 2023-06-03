# Discord Ticket bot
🤖 Discord ticket bot with locales, debugger mod and commented open source code

![enter image description here](https://img.shields.io/github/downloads/Dimidroll06/discord-ticket-bot/total?style=for-the-badge) ![enter image description here](https://img.shields.io/github/license/Dimidroll06/discord-ticket-bot?style=for-the-badge) ![enter image description here](https://img.shields.io/github/stars/Dimidroll06/discord-ticket-bot?style=for-the-badge)

## English
### Hierarchy

 - **configs** - *configs*
	 - **bot.jsonc** - *all variables used by **discord.js***
	 - **db.jsonc** - *database data (if disabled, **litesql** will work)*
	 - **tickets.jsonc** - *all tickets, bot settings*
- **controllers** - *controllers*
	- **tickets.js** - *all actions with tickets (open, close, accept, etc.)*
- **data**
	- **db** - *file **tickets.sqlite** will be created here if database is disabled in **db.jsonc***
- **events** - *all events for ticket bot*
	-  **clientReady.js** - *when the discord bot is running*
	- **interactionCreate.js** - *when the user interacts with the bot*
	-  **ticketOpened.js** - *when a new ticket was opened*
	- **ticketSelect.js** - *when the user has selected a ticket from the list*
- **locales** - *files for translating the text of the bot (the file can be selected in **/configs/bot.json**)*
	- **main.json** - *main file, in English*
- **utils** - *tools to help you work with the bot*
	- **cleardb.js** - *script that clears the database of tickets*
	- **db.js** - *utility to connect **QuickDB** to the bot*
	- **emmiter.js** - *connection of all events from **/events***
	- **locales.js** - *localization tool*
	- **logger.js** - *utility for outputting messages to a channel via **WebHooks***

## Русский
### Иерархия

 - **configs** - *конфиги*
	 - **bot.jsonc** - *все переменные используемые **discord.js***
	 - **db.jsonc** - *данные о базе данных (если выключить, то будет работать **litesql**)*
	 - **tickets.jsonc** - *все тикеты, настройки бота*
- **controllers** - *контроллеры*
	- **tickets.js** - *все действия с тикетами (открыть, закрыть, принять и т.д.)*
- **data**
	- **db** - *здесь будет создан файл **tickets.sqlite** если в **db.jsonc** будет отключена бд*
- **events** - *все ивенты для тикет бота*
	-  **clientReady.js** - *когда discord бот запущен*
	- **interactionCreate.js** - *когда пользователь взаимодействует с ботом*
	-  **ticketOpened.js** - *когда был открыт новый тикет*
	- **ticketSelect.js** - *когда пользователь выбрал тикет из списка*
- **locales** - *файлы для перевода текста бота (файл можно выбрать в **/configs/bot.json**)*
	- **main.json** - *главный файл, на английском языке*
- **utils** - *утилиты для помощи в работе с ботом*
	- **cleardb.js** - *скрипт, очищающий бд от тикетов*
	- **db.js** - *утилита, для подключения **QuickDB** к боту*
	- **emmiter.js** - *подключение всех ивентов из **/events***
	- **locales.js** - *утилита для работы с локализацией*
	- **logger.js** - *утилита для вывода сообщений в канал посредством **WebHooks***


