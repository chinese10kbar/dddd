fx_version 'cerulean'
games { 'gta5' }
lua54 'yes'
ui_page "ui/index.html"
minify "yes"

files {
    "cfg/client.lua",
    "cfg/cfg_*.lua",
    "cfg/events/cfg_*.lua",
    "cfg/weapons.lua",
    "cfg/blips_markers.lua",
    "cfg/atms.lua",
    "cfg/peds.meta",
    "ui/index.html",
    "ui/design.css",
    "ui/main.js",
    "ui/ProgressBar.js",
    "ui/WPrompt.js",
    "ui/RequestManager.js",
    "ui/AnnounceManager.js",
    "ui/Div.js",
    "ui/dynamic_classes.js",
    "ui/fonts/*.woff",
    "ui/sounds/*",
    "ui/index.css",
    "ui/index.js",
    "ui/SoundManager.js",
    "ui/pnc/js/*.js",
    "ui/pnc/css/*.css",
    "ui/fortniteui/*",
    "ui/fingerprintHacking/*",
    "ui/playerlist_images/*.png",
    "ui/killfeed/*",
    "ui/pnc/components/*",
    "ui/progress/*",
    "ui/radios/*",
    "ui/speedometer/*",
    "ui/money/*",
    "ui/radialmenu/*",
    "ui/skin/*",
    "ui/pma/*",
    "audio/dlcvinewood_*.dat*",
    "audio/sfx/dlc_vinewood/*.awc"
}

shared_scripts {
    "sharedcfg/*",
    "shared/*.lua",
    "pma/shared.lua"
}

client_scripts {
    "client_prod/cl_spawn.lua",
    "rageui/RMenu.lua",
    "rageui/menu/*.lua",
    "rageui/components/*.lua",
    "rageui/menu/elements/*.lua",
    "rageui/menu/items/*.lua",
    "rageui/menu/panels/*.lua",
    "rageui/menu/windows/*.lua",
    'pma/client/utils/*',
    'pma/client/init/*.lua',
    'pma/client/module/*.lua',
    'pma/client/*.lua',
    'dpclothing/*.lua',
    "lib/*.lua",
    "client_prod/*.lua",
    "utils/cl_*.lua"
}

server_scripts {
    'modules/ghmattimysql-server.js',
    'modules/ghmattimysql-server.lua',
    "lib/utils.lua",
    "base.lua",
    "modules/*.lua",
    "cfg/discordroles.lua",
    'pma/server/**/*.lua',
    'pma/server/**/*.js',
    "bot.js"
}

provides {
    'mumble-voip',
    'tokovoip',
    'toko-voip',
    'tokovoip_script'
}

server_exports {
    "GetDiscordRoles",
    "GetRoleIdFromRoleName",
    "GetDiscordAvatar",
    "GetDiscordName",
    "IsDiscordEmailVerified",
    "GetDiscordNickname",
    "GetGuildIcon",
    "GetGuildSplash",
    "GetGuildName",
    "GetGuildDescription",
    "GetGuildMemberCount",
    "GetGuildOnlineMemberCount",
    "GetGuildRoleList",
    "ResetCaches",
    "CheckEqual",
    "SetNickname",
    'dmUser',
    'storedm'
}

convar_category 'PMA-Voice' {
    "PMA-Voice Configuration Options",
    {
        { "Use native audio", "$voice_useNativeAudio", "CV_BOOL", "false" },
        { "Use 2D audio", "$voice_use2dAudio", "CV_BOOL", "false" },
        { "Use sending range only", "$voice_useSendingRangeOnly", "CV_BOOL", "false" },
        { "Enable UI", "$voice_enableUi", "CV_INT", "0" },
        { "Enable F11 proximity key", "$voice_enableProximityCycle", "CV_INT", "1" },
        { "Proximity cycle key", "$voice_defaultCycle", "CV_STRING", "F11" },
        { "Voice radio volume", "$voice_defaultRadioVolume", "CV_INT", "30" },
        { "Voice call volume", "$voice_defaultCallVolume", "CV_INT", "60" },
        { "Enable radios", "$voice_enableRadios", "CV_INT", "1" },
        { "Enable calls", "$voice_enableCalls", "CV_INT", "1" },
        { "Enable submix", "$voice_enableSubmix", "CV_INT", "1" },
        { "Enable radio animation", "$voice_enableRadioAnim", "CV_INT", "0" },
        { "Radio key", "$voice_defaultRadio", "CV_STRING", "LALT" },
        { "UI refresh rate", "$voice_uiRefreshRate", "CV_INT", "200" },
        { "Allow players to set audio intent", "$voice_allowSetIntent", "CV_INT", "1" },
        { "External mumble server address", "$voice_externalAddress", "CV_STRING", "" },
        { "External mumble server port", "$voice_externalPort", "CV_INT", "0" },
        { "Voice debug mode", "$voice_debugMode", "CV_INT", "0" },
        { "Disable players being allowed to join", "$voice_externalDisallowJoin", "CV_INT", "0" },
        { "Hide server endpoints in logs", "$voice_hideEndpoints", "CV_INT", "1" }
    }
}

data_file "PED_METADATA_FILE" "cfg/peds.meta"
data_file 'AUDIO_GAMEDATA' 'audio/dlcvinewood_game.dat'
data_file 'AUDIO_SOUNDDATA' 'audio/dlcvinewood_sounds.dat'
data_file 'AUDIO_DYNAMIXDATA' 'audio/dlcvinewood_mix.dat'
data_file 'AUDIO_SYNTHDATA' 'audio/dlcVinewood_amp.dat'
data_file 'AUDIO_SPEECHDATA' 'audio/dlcvinewood_speech.dat'
data_file 'AUDIO_WAVEPACK' 'audio/sfx/dlc_vinewood'

server_export "getCurrentGameType"
server_export "getCurrentMap"
server_export "changeGameType"
server_export "changeMap"
server_export "doesMapSupportGameType"
server_export "getMaps"
server_export "roundEnded"

export 'getRandomSpawnPoint'
export 'spawnPlayer'
export 'addSpawnPoint'
export 'removeSpawnPoint'
export 'loadSpawns'
export 'setAutoSpawn'
export 'setAutoSpawnCallback'
export 'forceRespawn'

resource_type 'map' { gameTypes = { fivem = true } }
map 'map.lua'
