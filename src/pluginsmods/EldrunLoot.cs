using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using Oxide.Game.Rust.Cui;

namespace Oxide.Plugins
{
    [Info("EldrunLoot", "SirEldrun", "36187")]
    [Description("Loot System - BETA")]
    public class EldrunLoot : RustPlugin
    {
        // === LOCALIZATION HELPERS (AUTO-INJECTED) ===
        [PluginReference] private Plugin EldrunLocale;
        
        private string GetLocalizedMessage(string key, BasePlayer player = null, Dictionary<string, string> vars = null)
        {
            if (EldrunLocale != null)
            {
                return EldrunLocale.Call<string>("Eldrun_Translate", key, player, vars) ?? $"[Missing: {key}]";
            }
            return $"[{key}]";
        }
        
        private void LogLocalizedMessage(string key, Dictionary<string, string> vars = null)
        {
            var msg = GetLocalizedMessage(key, null, vars);
            Puts(msg);
        }
        
        private void SendLocalizedReply(BasePlayer player, string key, Dictionary<string, string> vars = null)
        {
            var msg = GetLocalizedMessage(key, player, vars);
            SendReply(player, msg);
        }
        [PluginReference] private Plugin EldrunFraktion;
        [PluginReference] private Plugin EldrunXP;
        [PluginReference] private Plugin EldrunCore;

        private const string DataFileName = "eldrun_loot_data";
        private const string PermUse = "eldrunloot.use";
        private const string PermAdmin = "eldrunloot.admin";
        private const string PermMagic = "eldrunloot.magic";
        
        // 👑 SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        private const string PanelName = "EldrunLootUI";
        private const string ToastPanelName = "EldrunLootToast";

        private Dictionary<ulong, PlayerLootData> _playerData = new Dictionary<ulong, PlayerLootData>();
        private LootConfig _config;
        private Dictionary<string, LootTable> _lootTables = new Dictionary<string, LootTable>();
        private Dictionary<string, MagicItem> _magicItems = new Dictionary<string, MagicItem>();

        // === UI STATE ===
        private enum UITab { Overview, Tables, Magic, Statistics, Roll, Help }
        private Dictionary<ulong, UITab> _activeTab = new Dictionary<ulong, UITab>();
        private Dictionary<ulong, int> _tablesPage = new Dictionary<ulong, int>();
        private Dictionary<ulong, int> _magicPage = new Dictionary<ulong, int>();
        private Dictionary<ulong, string> _tablesFilter = new Dictionary<ulong, string>();
        private Dictionary<ulong, string> _magicFilter = new Dictionary<ulong, string>();

        public enum LootRarity { Common, Uncommon, Rare, Epic, Legendary, Mythic, Godlike }
        public enum MagicType { Fire, Ice, Lightning, Shadow, Light, Poison, Blood }
        public enum LootSource { Crate, Barrel, Animal, Player, Airdrop, Helicopter, Bradley }

        public class PlayerLootData
        {
            public Dictionary<string, int> ItemsFound = new Dictionary<string, int>();
            public int TotalLoots = 0;
            public int RareLoots = 0;
            public int MagicLoots = 0;
            public float LootMultiplier = 1.0f;
            public List<string> UnlockedTables = new List<string>();
            public DateTime LastMagicFind = DateTime.MinValue;
            public DateTime LastRollTime = DateTime.MinValue;
            public int LuckBonus = 0;
        }

        public class LootTable
        {
            public string Id;
            public string Name;
            public string Description;
            public LootSource Source;
            public string RequiredFaction = "";
            public int RequiredLevel = 0;
            public float BaseChance = 1.0f;
            public List<LootEntry> Items = new List<LootEntry>();
            public string IconEmoji = "";
            public bool IsMagical = false;
        }

        public class LootEntry
        {
            public string Shortname;
            public int Amount = 1;
            public int AmountMax = 1;
            public float Chance = 0.1f;
            public LootRarity Rarity = LootRarity.Common;
            public ulong SkinId = 0;
            public string DisplayName = "";
            public bool CanBeMagical = false;
            public List<string> MagicTypes = new List<string>();
        }

        public class MagicItem
        {
            public string Id = Guid.NewGuid().ToString();
            public string BaseItem;
            public string Name;
            public string Description;
            public MagicType Type;
            public LootRarity Rarity = LootRarity.Rare;
            public Dictionary<string, float> Enchantments = new Dictionary<string, float>();
            public string EffectDescription = "";
            public string IconEmoji = "";
            public int Value = 100;
            public bool IsUnique = false;
        }

        public class LootConfig
        {
            public bool Enabled = true;
            public string ChatPrefix = "[<color=#D4AF37>ELDRUN LOOT</color>]";
            public bool BetterLootEnabled = true;
            public bool MagicLootEnabled = true;
            public bool CustomTablesEnabled = true;
            public float GlobalLootMultiplier = 1.5f;
            public float MagicChance = 0.05f; // 5% chance
            public bool RequireFaction = false; // Faction requirement removed
            public int VIPLuckBonus = 50;
            public bool EnableRollSystem = true;
            public int RollCooldownMinutes = 30;
            public bool EnableLootNotifications = true;
            public bool EnableMagicEffects = true;
            public bool EnableLootStatistics = true;
            public bool EnableAdminLogging = true;
            public float RareItemBonus = 1.2f;
            public int MaxLuckBonus = 500;
            public bool EnableAutoSave = true;
            public int AutoSaveIntervalMinutes = 5;
            public Dictionary<string, float> FactionLootBonuses = new Dictionary<string, float>
            {
                ["stark"] = 1.1f,
                ["lannister"] = 1.2f,
                ["targaryen"] = 1.3f,
                ["baratheon"] = 1.1f,
                ["tyrell"] = 1.1f
            };

            public Dictionary<string, LootTable> GoTLootTables = new Dictionary<string, LootTable>
            {
                ["kings_landing_crates"] = new LootTable
                {
                    Id = "kings_landing_crates",
                    Name = "King's Landing Crates",
                    Description = "Rich loot from the capital city",
                    Source = LootSource.Crate,
                    BaseChance = 2.0f,
                    IconEmoji = "👑",
                    Items = new List<LootEntry>
                    {
                        new LootEntry { Shortname = "metal.refined", Amount = 50, AmountMax = 200, Chance = 0.8f, Rarity = LootRarity.Common },
                        new LootEntry { Shortname = "cloth", Amount = 100, AmountMax = 500, Chance = 0.7f, Rarity = LootRarity.Common },
                        new LootEntry { Shortname = "pistol.revolver", Amount = 1, Chance = 0.3f, Rarity = LootRarity.Rare, CanBeMagical = true },
                        new LootEntry { Shortname = "rifle.ak", Amount = 1, Chance = 0.1f, Rarity = LootRarity.Epic, CanBeMagical = true },
                        new LootEntry { Shortname = "explosive.timed", Amount = 1, AmountMax = 3, Chance = 0.05f, Rarity = LootRarity.Legendary }
                    }
                },
                
                ["winterfell_barrels"] = new LootTable
                {
                    Id = "winterfell_barrels",
                    Name = "Winterfell Barrels", 
                    Description = "Northern survival equipment",
                    Source = LootSource.Barrel,
                    RequiredFaction = "stark",
                    BaseChance = 1.5f,
                    IconEmoji = "🐺",
                    Items = new List<LootEntry>
                    {
                        new LootEntry { Shortname = "wood", Amount = 500, AmountMax = 2000, Chance = 0.9f, Rarity = LootRarity.Common },
                        new LootEntry { Shortname = "leather", Amount = 50, AmountMax = 200, Chance = 0.6f, Rarity = LootRarity.Uncommon },
                        new LootEntry { Shortname = "bow.hunting", Amount = 1, Chance = 0.4f, Rarity = LootRarity.Rare, CanBeMagical = true },
                        new LootEntry { Shortname = "crossbow", Amount = 1, Chance = 0.2f, Rarity = LootRarity.Epic, CanBeMagical = true }
                    }
                },
                
                ["dragonstone_treasure"] = new LootTable
                {
                    Id = "dragonstone_treasure",
                    Name = "Dragonstone Treasure",
                    Description = "Ancient Targaryen relics",
                    Source = LootSource.Airdrop,
                    RequiredLevel = 50,
                    BaseChance = 0.5f,
                    IconEmoji = "🐉",
                    IsMagical = true,
                    Items = new List<LootEntry>
                    {
                        new LootEntry { Shortname = "rifle.m249", Amount = 1, Chance = 0.3f, Rarity = LootRarity.Legendary, CanBeMagical = true, MagicTypes = new List<string> { "Fire", "Lightning" } },
                        new LootEntry { Shortname = "rocket.launcher", Amount = 1, Chance = 0.1f, Rarity = LootRarity.Mythic, CanBeMagical = true },
                        new LootEntry { Shortname = "ammo.rifle.explosive", Amount = 50, AmountMax = 200, Chance = 0.2f, Rarity = LootRarity.Epic }
                    }
                }
            };

            public Dictionary<string, MagicItem> MagicItems = new Dictionary<string, MagicItem>
            {
                ["lightbringer"] = new MagicItem
                {
                    Id = "lightbringer",
                    BaseItem = "longsword",
                    Name = "Lightbringer",
                    Description = "The legendary flaming sword of Azor Ahai",
                    Type = MagicType.Fire,
                    Rarity = LootRarity.Mythic,
                    Enchantments = new Dictionary<string, float> { ["fire_damage"] = 2.0f, ["durability"] = 3.0f },
                    EffectDescription = "Ignites enemies on hit",
                    IconEmoji = "🔥",
                    Value = 10000,
                    IsUnique = true
                },
                
                ["ice_blade"] = new MagicItem
                {
                    Id = "ice_blade",
                    BaseItem = "longsword",
                    Name = "Ice Blade",
                    Description = "A blade from the eternal winter",
                    Type = MagicType.Ice,
                    Rarity = LootRarity.Legendary,
                    Enchantments = new Dictionary<string, float> { ["ice_damage"] = 1.5f, ["slow_effect"] = 1.0f },
                    EffectDescription = "Slows enemies on hit",
                    IconEmoji = "❄️",
                    Value = 5000
                },
                
                ["shadow_bow"] = new MagicItem
                {
                    Id = "shadow_bow",
                    BaseItem = "bow.hunting",
                    Name = "Shadow Bow",
                    Description = "A bow from the shadows of Asshai",
                    Type = MagicType.Shadow,
                    Rarity = LootRarity.Epic,
                    Enchantments = new Dictionary<string, float> { ["stealth"] = 1.0f, ["crit_chance"] = 0.3f },
                    EffectDescription = "Grants temporary invisibility",
                    IconEmoji = "🌑",
                    Value = 3000
                }
            };
        }

        private void Init()
        {
            // Load config first
            LoadConfigValues();
            
            permission.RegisterPermission(PermUse, this);
            permission.RegisterPermission(PermAdmin, this);
            permission.RegisterPermission(PermMagic, this);
        }

        private void OnServerInitialized()
        {
            LoadData();
            InitializeLootTables();
            if (_config.EnableAutoSave)
            {
                timer.Every(_config.AutoSaveIntervalMinutes * 60f, () => {
                    SaveData();
                    if (_config.EnableAdminLogging)
                        LogLocalizedMessage("loot.auto_saved");
                });
            }
            
            LogLocalizedMessage("loot.loaded");
        }

        private void OnPlayerConnected(BasePlayer player)
        {
            if (player == null) return;
            
            NextTick(() => {
                var playerData = GetPlayerData(player.userID);
                
                // Check for VIP status and apply bonus
                if (IsVIP(player) && playerData.LuckBonus < _config.VIPLuckBonus)
                {
                    playerData.LuckBonus = Math.Min(Math.Max(playerData.LuckBonus, _config.VIPLuckBonus), _config.MaxLuckBonus);
                    if (_config.EnableLootNotifications)
                    {
                        SendReply(player, $"{_config.ChatPrefix} ⭐ VIP Status detected! Luck bonus set to {Math.Min(_config.VIPLuckBonus, _config.MaxLuckBonus)}!");
                    }
                }
            });
        }

        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            if (player != null)
            {
                SaveData();
            }
        }

        private void OnServerSave()
        {
            SaveData();
        }

        private void Unload()
        {
            foreach (var player in BasePlayer.activePlayerList)
            {
                CuiHelper.DestroyUi(player, PanelName);
            }
            
            // CRITICAL: Save data before unload to prevent data loss
            SaveData();
        }

        protected override void LoadDefaultConfig()
        {
            _config = new LootConfig();
        }
        
        private void LoadConfigValues()
        {
            try
            {
                _config = Config.ReadObject<LootConfig>();
                if (_config == null)
                {
                    throw new Exception("Config deserialized to null");
                }
            }
            catch
            {
                LogLocalizedMessage("loot.config_error");
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config);

        private void LoadData()
        {
            try
            {
                _playerData = Interface.Oxide.DataFileSystem.ReadObject<Dictionary<ulong, PlayerLootData>>(DataFileName) ?? new Dictionary<ulong, PlayerLootData>();
            }
            catch
            {
                _playerData = new Dictionary<ulong, PlayerLootData>();
            }
        }

        private void SaveData()
        {
            Interface.Oxide.DataFileSystem.WriteObject(DataFileName, _playerData);
        }

        private void InitializeLootTables()
        {
            _lootTables = _config.GoTLootTables;
            _magicItems = _config.MagicItems;
            
            LogLocalizedMessage("loot.message", null);
        }

        // Loot Container Hooks
        private void OnLootSpawn(LootContainer container)
        {
            if (_config == null || !_config.Enabled || !_config.BetterLootEnabled) return;
            
            NextTick(() => {
                ModifyContainerLoot(container);
            });
        }

        private void OnPlayerLootEntity(BasePlayer player, BaseEntity entity)
        {
            if (_config == null || !_config.Enabled) return;
            if (!EnsureFaction(player)) return;

            var playerData = GetPlayerData(player.userID);
            playerData.TotalLoots++;
            
            // Check for magic loot
            if (_config.MagicLootEnabled && HasPermission(player, PermMagic))
            {
                var magicChance = _config.MagicChance + (playerData.LuckBonus / 1000f);
                if (UnityEngine.Random.Range(0f, 1f) < magicChance)
                {
                    SpawnMagicLoot(player, entity.transform.position);
                }
            }
        }

        private void ModifyContainerLoot(LootContainer container)
        {
            if (container?.inventory?.itemList == null) return;

            var lootTable = GetLootTableForContainer(container);
            if (lootTable == null) return;

            // Clear existing items
            container.inventory.Clear();

            // Add new items based on loot table
            foreach (var entry in lootTable.Items)
            {
                // Normalize amounts
                var minAmount = Math.Min(entry.Amount, entry.AmountMax);
                var maxAmount = Math.Max(entry.Amount, entry.AmountMax);
                if (minAmount < 1) minAmount = 1;
                if (maxAmount < 1) maxAmount = 1;

                // Scale chance by table/base multipliers (no player context here)
                var effectiveChance = Math.Min(1f, entry.Chance * lootTable.BaseChance * _config.GlobalLootMultiplier);

                if (UnityEngine.Random.Range(0f, 1f) <= effectiveChance)
                {
                    var amount = UnityEngine.Random.Range(minAmount, maxAmount + 1);
                    var item = ItemManager.CreateByName(entry.Shortname, amount, entry.SkinId);
                    
                    if (item != null)
                    {
                        if (!string.IsNullOrEmpty(entry.DisplayName))
                            item.name = entry.DisplayName;
                            
                        container.inventory.Insert(item);
                    }
                }
            }
        }

        private LootTable GetLootTableForContainer(LootContainer container)
        {
            var containerName = container.ShortPrefabName.ToLower();
            
            LootSource desiredSource = LootSource.Crate;
            if (containerName.Contains("barrel"))
            {
                desiredSource = LootSource.Barrel;
            }
            else if (containerName.Contains("supply") || containerName.Contains("drop"))
            {
                desiredSource = LootSource.Airdrop;
            }
            else if (containerName.Contains("heli") || containerName.Contains("helicopter"))
            {
                desiredSource = LootSource.Helicopter;
            }
            else if (containerName.Contains("bradley"))
            {
                desiredSource = LootSource.Bradley;
            }
            else if (containerName.Contains("crate"))
            {
                desiredSource = LootSource.Crate;
            }

            var candidates = new List<LootTable>();
            foreach (var kv in _lootTables)
            {
                var t = kv.Value;
                if (t != null && t.Source == desiredSource)
                {
                    candidates.Add(t);
                }
            }
            if (candidates.Count == 0) return null;
            if (candidates.Count == 1) return candidates[0];

            float total = 0f;
            for (int i = 0; i < candidates.Count; i++)
            {
                var w = candidates[i].BaseChance;
                if (w > 0f) total += w;
            }
            if (total <= 0f) return candidates[UnityEngine.Random.Range(0, candidates.Count)];

            float r = UnityEngine.Random.Range(0f, total);
            float acc = 0f;
            for (int i = 0; i < candidates.Count; i++)
            {
                var w = Math.Max(0f, candidates[i].BaseChance);
                acc += w;
                if (r <= acc)
                    return candidates[i];
            }
            return candidates[candidates.Count - 1];
        }

        private void SpawnMagicLoot(BasePlayer player, Vector3 position)
        {
            var availableMagicItems = new List<MagicItem>();
            foreach (var m in _magicItems.Values)
            {
                if (m != null && CanPlayerGetMagicItem(player, m))
                {
                    availableMagicItems.Add(m);
                }
            }
            if (availableMagicItems.Count == 0) return;

            var magicItem = availableMagicItems[UnityEngine.Random.Range(0, availableMagicItems.Count)];
            var item = ItemManager.CreateByName(magicItem.BaseItem, 1);
            
            if (item != null)
            {
                // Set custom name per item (avoid changing global ItemDefinition)
                item.name = $"{magicItem.IconEmoji} {magicItem.Name}";

                // Drop item at location
                item.Drop(position + Vector3.up, Vector3.zero);
                
                var playerData = GetPlayerData(player.userID);
                playerData.MagicLoots++;
                playerData.LastMagicFind = DateTime.Now;
                
                SendReply(player, $"{_config.ChatPrefix} ✨ You found a magic item: {magicItem.IconEmoji} {magicItem.Name}!");
                ShowToast(player, $"✨ Magic Item: {magicItem.Name}", "0.2 0.5 0.9 0.92");
                
                // Notify nearby players
                NotifyNearbyPlayers(position, $"{_config.ChatPrefix} 🔮 {player.displayName} discovered a magic item!", 50f);
            }
        }

        [ChatCommand("loot")]
        private void CmdLoot(BasePlayer player, string command, string[] args)
        {
            if (!HasPermission(player, PermUse))
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ You do not have permission to use /loot.");
                return;
            }
            if (!EnsureFaction(player)) return;

            if (args.Length == 0)
            {
                OpenLootUI(player);
                return;
            }

            switch (args[0].ToLower())
            {
                case "stats":
                    SetActiveTab(player.userID, UITab.Statistics);
                    OpenLootUI(player);
                    break;
                case "magic":
                    SetActiveTab(player.userID, UITab.Magic);
                    OpenLootUI(player);
                    break;
                case "tables":
                    SetActiveTab(player.userID, UITab.Tables);
                    OpenLootUI(player);
                    break;
                case "roll":
                    RollForLoot(player);
                    break;
                case "luck":
                    ShowLuckBonus(player);
                    break;
                case "help":
                    SetActiveTab(player.userID, UITab.Help);
                    OpenLootUI(player);
                    break;
                case "filter":
                    {
                        // Set filter for Tables tab via chat: /loot filter <term>
                        string term = args.Length >= 2 ? args[1] : "";
                        if (args.Length > 2)
                        {
                            for (int i = 2; i < args.Length; i++) term += " " + args[i];
                        }
                        _tablesFilter[player.userID] = (term ?? "").Trim();
                        _tablesPage[player.userID] = 0;
                        SetActiveTab(player.userID, UITab.Tables);
                        OpenLootUI(player);
                    }
                    break;
                case "filtermagic":
                    {
                        // Set filter for Magic tab via chat: /loot filtermagic <term>
                        string term = args.Length >= 2 ? args[1] : "";
                        if (args.Length > 2)
                        {
                            for (int i = 2; i < args.Length; i++) term += " " + args[i];
                        }
                        _magicFilter[player.userID] = (term ?? "").Trim();
                        _magicPage[player.userID] = 0;
                        SetActiveTab(player.userID, UITab.Magic);
                        OpenLootUI(player);
                    }
                    break;
                case "ui":
                    OpenLootUI(player);
                    break;
                default:
                    OpenLootUI(player);
                    break;
            }
        }

        [ChatCommand("lootadmin")]
        private void CmdLootAdmin(BasePlayer player, string command, string[] args)
        {
            if (!HasAdmin(player)) 
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ No permission!");
                return;
            }

            if (args.Length == 0)
            {
                OpenAdminUI(player);
                return;
            }

            switch (args[0].ToLower())
            {
                case "reload":
                    LoadData();
                    SendReply(player, $"{_config.ChatPrefix} ✅ Plugin reloaded successfully!");
                    LogAdminAction(player, "reload");
                    break;
                    
                case "reset":
                    if (args.Length > 1)
                    {
                        var targetPlayer = BasePlayer.Find(args[1]);
                        if (targetPlayer != null)
                        {
                            _playerData.Remove(targetPlayer.userID);
                            SendReply(player, $"{_config.ChatPrefix} ✅ Loot data for {targetPlayer.displayName} has been reset!");
                            LogAdminAction(player, "reset", targetPlayer.displayName);
                        }
                        else
                        {
                            SendReply(player, $"{_config.ChatPrefix} ❌ Player not found!");
                        }
                    }
                    break;
                    
                case "give":
                    if (args.Length >= 3)
                    {
                        var targetPlayer = BasePlayer.Find(args[1]);
                        var itemId = args[2];
                        
                        if (targetPlayer != null && _magicItems.ContainsKey(itemId))
                        {
                            GiveMagicItem(targetPlayer, itemId);
                            SendReply(player, $"{_config.ChatPrefix} ✨ Magic item '{itemId}' given to {targetPlayer.displayName}!");
                            LogAdminAction(player, "give", $"{itemId} -> {targetPlayer.displayName}");
                        }
                        else
                        {
                            SendReply(player, $"{_config.ChatPrefix} ❌ Player or item not found!");
                        }
                    }
                    break;
                    
                case "luck":
                    if (args.Length >= 3)
                    {
                        var targetPlayer = BasePlayer.Find(args[1]);
                        if (targetPlayer != null && int.TryParse(args[2], out var luckValue))
                        {
                            var playerData = GetPlayerData(targetPlayer.userID);
                            playerData.LuckBonus = Math.Min(luckValue, _config.MaxLuckBonus);
                            SendReply(player, $"{_config.ChatPrefix} ⭐ Luck bonus for {targetPlayer.displayName} set to {luckValue}!");
                            LogAdminAction(player, "luck", $"{targetPlayer.displayName} = {playerData.LuckBonus}");
                        }
                    }
                    break;
                    
                case "spawn":
                    if (args.Length >= 2)
                    {
                        var tableId = args[1];
                        if (_lootTables.ContainsKey(tableId))
                        {
                            SpawnLootFromTable(player, tableId);
                            SendReply(player, $"{_config.ChatPrefix} 🎲 Loot from table '{tableId}' spawned!");
                            LogAdminAction(player, "spawn", tableId);
                        }
                        else
                        {
                            SendReply(player, $"{_config.ChatPrefix} ❌ Loot table not found!");
                        }
                    }
                    break;
                    
                case "toggle":
                    if (args.Length >= 2)
                    {
                        switch (args[1].ToLower())
                        {
                            case "enabled":
                                _config.Enabled = !_config.Enabled;
                                SendReply(player, $"{_config.ChatPrefix} 🔧 Plugin {(_config.Enabled ? "enabled" : "disabled")}!");
                                SaveConfig();
                                LogAdminAction(player, "toggle enabled", $"Enabled={_config.Enabled}");
                                break;
                            case "magic":
                                _config.MagicLootEnabled = !_config.MagicLootEnabled;
                                SendReply(player, $"{_config.ChatPrefix} ✨ Magic Loot {(_config.MagicLootEnabled ? "enabled" : "disabled")}!");
                                SaveConfig();
                                LogAdminAction(player, "toggle magic", $"Magic={_config.MagicLootEnabled}");
                                break;
                            case "better":
                                _config.BetterLootEnabled = !_config.BetterLootEnabled;
                                SendReply(player, $"{_config.ChatPrefix} 💼 Better Loot {(_config.BetterLootEnabled ? "enabled" : "disabled")}!");
                                SaveConfig();
                                LogAdminAction(player, "toggle better", $"Better={_config.BetterLootEnabled}");
                                break;
                        }
                    }
                    break;
                    
                default:
                    SendReply(player, $"{_config.ChatPrefix} 📜 ADMIN COMMANDS:\n" +
                                     "• /lootadmin reload - Reload plugin\n" +
                                     "• /lootadmin reset <player> - Reset player data\n" +
                                     "• /lootadmin give <player> <itemId> - Give magic item\n" +
                                     "• /lootadmin luck <player> <amount> - Set luck bonus\n" +
                                     "• /lootadmin toggle enabled\n" +
                                     "• /lootadmin toggle magic\n" +
                                     "• /lootadmin toggle better");
                    break;
            }
        }

        private void OpenLootUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            var container = new CuiElementContainer();
            var theme = GetEldrunTheme();
            var playerData = GetPlayerData(player.userID);
            var activeTab = GetActiveTab(player.userID);

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            // Subtle overlay layer for depth (consistent with Eldrun UIs)
            container.Add(new CuiPanel
            {
                Image = { Color = "0.08 0.12 0.18 0.4" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, PanelName, "UIOverlay");

            // Enable cursor for input fields
            container.Add(new CuiElement
            {
                Name = "NeedsCursor",
                Parent = PanelName,
                Components =
                {
                    new CuiNeedsCursorComponent()
                }
            });

            // Header Panel mit blauen Balken
            container.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95" },
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.81 0.99" }
            }, "UIOverlay", "HeaderPanel");

            // Blauer Border oben
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" }
            }, "HeaderPanel");
            
            // Blauer Border unten
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" }
            }, "HeaderPanel");

            // Globaler Eldrun-Header-Text für Loot System
            var headerText = $"⚔ EldrunRust BETA  | 📦 Loot System | 👤 {player.displayName} | ⚔ Total Loots: {playerData.TotalLoots} | 💀 Magic Loots: {playerData.MagicLoots} | ⭐ Luck: +{playerData.LuckBonus}%";
            container.Add(new CuiLabel
            {
                Text = { Text = headerText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.85 0.92 1 1" },
                RectTransform = { AnchorMin = "0.03 0.15", AnchorMax = "0.80 0.88" }
            }, "HeaderPanel");

            // Header-Actions oben rechts: Refresh (links), Close (rechts) – neben dem Header-Balken (EldrunKits-Stil)
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.refresh", Color = "0 0.4 0.2 0.9", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.84 0.91", AnchorMax = "0.91 0.99" },
                Text = { Text = "🔄 REFRESH", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" }
            }, PanelName);

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = "0.4 0 0 0.9", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.92 0.91", AnchorMax = "0.99 0.99" },
                Text = { Text = "❌ CLOSE", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 0.3 0.3 1" }
            }, PanelName);

            // Search input for active tab (Tables/Magic)
            if (activeTab == UITab.Tables || activeTab == UITab.Magic)
            {
                var section = activeTab == UITab.Tables ? "tables" : "magic";
                string current = "";
                if (activeTab == UITab.Tables) _tablesFilter.TryGetValue(player.userID, out current);
                else _magicFilter.TryGetValue(player.userID, out current);

                // Background for input (place right of tabs)
                container.Add(new CuiPanel
                {
                    Image = { Color = theme.GetValueOrDefault("SecondaryColor", "0.10 0.10 0.16 0.95") },
                    RectTransform = { AnchorMin = "0.80 0.05", AnchorMax = "0.98 0.35" }
                }, "HeaderPanel", "SearchBg");

                // Input field
                container.Add(new CuiElement
                {
                    Name = "SearchInput",
                    Parent = "SearchBg",
                    Components =
                    {
                        new CuiInputFieldComponent { Align = TextAnchor.MiddleLeft, FontSize = 12, Color = "1 1 1 1", Command = $"eldrunloot.ui.setfilter {section}", CharsLimit = 48, Text = current ?? string.Empty },
                        new CuiRectTransformComponent { AnchorMin = "0.02 0.15", AnchorMax = "0.98 0.85" }
                    }
                });
            }

            // Content Area
            container.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.3", FadeIn = 0.15f },
                RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.81 0.89" }
            }, "UIOverlay", "ContentArea");

            // Zeichne Inhalt entsprechend aktivem Tab
            switch (activeTab)
            {
                case UITab.Overview:
                case UITab.Tables:
                    DrawLootTables(container, player);
                    break;
                case UITab.Magic:
                    DrawMagicItemsList(container, player);
                    break;
                case UITab.Statistics:
                    DrawLootStatsSection(container, player, theme, playerData);
                    break;
                case UITab.Roll:
                    DrawRollSection(container, player, theme);
                    break;
                case UITab.Help:
                    DrawHelpSection(container, player);
                    break;
            }

            DrawLootSidebar(container, player, theme);
            DrawLootStats(container, player, theme, playerData);

            CuiHelper.AddUi(player, container);
        }

        private void DrawLootTables(CuiElementContainer container, BasePlayer player)
        {
            // Build list
            var tables = new List<LootTable>();
            foreach (var t in _lootTables.Values)
            {
                if (t != null && CanAccessLootTable(player, t))
                    tables.Add(t);
            }

            // Apply filter
            string filter = "";
            _tablesFilter.TryGetValue(player.userID, out filter);
            if (!string.IsNullOrEmpty(filter))
            {
                var fl = filter.ToLower();
                tables = tables.FindAll(t =>
                    (t.Name ?? "").ToLower().Contains(fl) ||
                    (t.Description ?? "").ToLower().Contains(fl) ||
                    (t.Id ?? "").ToLower().Contains(fl)
                );
            }

            // Sort by Source then Name
            tables.Sort((a,b) =>
            {
                int s = a.Source.CompareTo(b.Source);
                if (s != 0) return s;
                return string.Compare(a.Name, b.Name, StringComparison.OrdinalIgnoreCase);
            });

            if (tables.Count == 0)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = string.IsNullOrEmpty(filter) ? "No loot tables available." : $"No tables match filter: '{filter}'", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.8 0.8 0.8 1" },
                    RectTransform = { AnchorMin = "0.2 0.4", AnchorMax = "0.8 0.6" }
                }, "ContentArea");

                // Filter hint
                container.Add(new CuiLabel
                {
                    Text = { Text = "Tip: use /loot filter <text>", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.7 0.7 0.7 1" },
                    RectTransform = { AnchorMin = "0.2 0.32", AnchorMax = "0.8 0.38" }
                }, "ContentArea");
                return;
            }

            // Paging
            int pageSize = 6;
            int page = GetPage(_tablesPage, player.userID);
            int totalPages = (tables.Count + pageSize - 1) / pageSize;
            if (totalPages <= 0) totalPages = 1;
            if (page >= totalPages) page = totalPages - 1;
            if (page < 0) page = 0;
            SetPage(_tablesPage, player.userID, page);

            int start = page * pageSize;
            int end = Math.Min(start + pageSize, tables.Count);

            // Loot Table Grid (2 rows x 3 cols)
            int slot = 0;
            for (int i = start; i < end; i++)
            {
                var table = tables[i];
                var x = slot % 3;
                var y = slot / 3;
                var xMin = 0.1f + (x * 0.28f);
                var xMax = xMin + 0.25f;
                var yMin = 0.7f - (y * 0.3f);
                var yMax = yMin + 0.25f;

                var sourceColor = GetSourceColor(table.Source);

                container.Add(new CuiPanel
                {
                    Image = { Color = sourceColor },
                    RectTransform = { AnchorMin = $"{xMin} {yMin}", AnchorMax = $"{xMax} {yMax}" }
                }, "ContentArea", $"Table_{table.Id}");

                var itemCount = table.Items.Count;
                var magicStatus = table.IsMagical ? "Magical" : "Normal";

                container.Add(new CuiLabel
                {
                    Text = { Text = $"{table.IconEmoji}\n{table.Name}\n{itemCount} Items\n{magicStatus}", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0.9 0.9 0.9 1" },
                    RectTransform = { AnchorMin = "0.05 0.4", AnchorMax = "0.95 0.9" }
                }, $"Table_{table.Id}");

                container.Add(new CuiButton
                {
                    Button = { Command = $"eldrunloot.ui.view {table.Id}", Color = "0.2 0.6 0.2 0.9" },
                    RectTransform = { AnchorMin = "0.1 0.05", AnchorMax = "0.9 0.35" },
                    Text = { Text = "View Details", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, $"Table_{table.Id}");

                slot++;
            }

            // Pagination controls
            container.Add(new CuiLabel
            {
                Text = { Text = $"Page {page + 1}/{totalPages}" + (string.IsNullOrEmpty(filter) ? "" : $"  •  Filter: '{filter}'"), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.85 0.85 0.9 1" },
                RectTransform = { AnchorMin = "0.25 0.12", AnchorMax = "0.58 0.18" }
            }, "UIOverlay");

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.page tables prev", Color = "0.25 0.25 0.25 0.9" },
                RectTransform = { AnchorMin = "0.18 0.12", AnchorMax = "0.24 0.18" },
                Text = { Text = "◀", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "UIOverlay");

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.page tables next", Color = "0.25 0.25 0.25 0.9" },
                RectTransform = { AnchorMin = "0.60 0.12", AnchorMax = "0.66 0.18" },
                Text = { Text = "▶", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "UIOverlay");

            if (!string.IsNullOrEmpty(filter))
            {
                container.Add(new CuiButton
                {
                    Button = { Command = "eldrunloot.ui.clearfilter tables", Color = "0.6 0.3 0.3 0.9" },
                    RectTransform = { AnchorMin = "0.68 0.12", AnchorMax = "0.79 0.18" },
                    Text = { Text = "Clear Filter", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "UIOverlay");
            }
        }

        private void DrawMagicItemsList(CuiElementContainer container, BasePlayer player)
        {
            // Build list
            var items = new List<MagicItem>();
            foreach (var m in _magicItems.Values)
            {
                if (m != null && CanPlayerGetMagicItem(player, m))
                    items.Add(m);
            }

            // Apply filter
            string filter = "";
            _magicFilter.TryGetValue(player.userID, out filter);
            if (!string.IsNullOrEmpty(filter))
            {
                var fl = filter.ToLower();
                items = items.FindAll(m =>
                    (m.Name ?? "").ToLower().Contains(fl) ||
                    (m.Description ?? "").ToLower().Contains(fl) ||
                    (m.Id ?? "").ToLower().Contains(fl) ||
                    (m.BaseItem ?? "").ToLower().Contains(fl)
                );
            }

            // Sort by Rarity desc, then Name
            items.Sort((a,b) =>
            {
                int r = ((int)b.Rarity).CompareTo((int)a.Rarity);
                if (r != 0) return r;
                return string.Compare(a.Name, b.Name, StringComparison.OrdinalIgnoreCase);
            });

            if (items.Count == 0)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = string.IsNullOrEmpty(filter) ? "No magic items available." : $"No magic items match: '{filter}'", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.8 0.8 0.8 1" },
                    RectTransform = { AnchorMin = "0.2 0.4", AnchorMax = "0.8 0.6" }
                }, "ContentArea");

                container.Add(new CuiLabel
                {
                    Text = { Text = "Tip: use /loot filtermagic <text>", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.7 0.7 0.7 1" },
                    RectTransform = { AnchorMin = "0.2 0.32", AnchorMax = "0.8 0.38" }
                }, "ContentArea");
                return;
            }

            // Paging
            int pageSize = 6;
            int page = GetPage(_magicPage, player.userID);
            int totalPages = (items.Count + pageSize - 1) / pageSize;
            if (totalPages <= 0) totalPages = 1;
            if (page >= totalPages) page = totalPages - 1;
            if (page < 0) page = 0;
            SetPage(_magicPage, player.userID, page);

            int start = page * pageSize;
            int end = Math.Min(start + pageSize, items.Count);

            int slot = 0;
            for (int i = start; i < end; i++)
            {
                var item = items[i];
                var x = slot % 3;
                var y = slot / 3;
                var xMin = 0.1f + (x * 0.28f);
                var xMax = xMin + 0.25f;
                var yMin = 0.7f - (y * 0.3f);
                var yMax = yMin + 0.25f;

                var rarityColor = GetRarityColor(item.Rarity);

                container.Add(new CuiPanel
                {
                    Image = { Color = rarityColor },
                    RectTransform = { AnchorMin = $"{xMin} {yMin}", AnchorMax = $"{xMax} {yMax}" }
                }, "ContentArea", $"Magic_{item.Id}");

                container.Add(new CuiLabel
                {
                    Text = { Text = $"{item.IconEmoji} {item.Name}\nType: {item.Type} | {item.Rarity}", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0.95 0.95 0.95 1" },
                    RectTransform = { AnchorMin = "0.05 0.45", AnchorMax = "0.95 0.9" }
                }, $"Magic_{item.Id}");

                container.Add(new CuiLabel
                {
                    Text = { Text = item.Description, FontSize = 9, Align = TextAnchor.UpperCenter, Color = "1 1 1 1" },
                    RectTransform = { AnchorMin = "0.05 0.18", AnchorMax = "0.95 0.42" }
                }, $"Magic_{item.Id}");

                slot++;
            }

            // Pagination controls
            container.Add(new CuiLabel
            {
                Text = { Text = $"Page {page + 1}/{totalPages}" + (string.IsNullOrEmpty(filter) ? "" : $"  •  Filter: '{filter}'"), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.85 0.85 0.9 1" },
                RectTransform = { AnchorMin = "0.25 0.12", AnchorMax = "0.58 0.18" }
            }, "UIOverlay");

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.page magic prev", Color = "0.25 0.25 0.25 0.9" },
                RectTransform = { AnchorMin = "0.18 0.12", AnchorMax = "0.24 0.18" },
                Text = { Text = "◀", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "UIOverlay");

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.page magic next", Color = "0.25 0.25 0.25 0.9" },
                RectTransform = { AnchorMin = "0.60 0.12", AnchorMax = "0.66 0.18" },
                Text = { Text = "▶", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "UIOverlay");

            if (!string.IsNullOrEmpty(filter))
            {
                container.Add(new CuiButton
                {
                    Button = { Command = "eldrunloot.ui.clearfilter magic", Color = "0.6 0.3 0.3 0.9" },
                    RectTransform = { AnchorMin = "0.68 0.12", AnchorMax = "0.79 0.18" },
                    Text = { Text = "Clear Filter", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "UIOverlay");
            }
        }

        private void DrawLootStatsSection(CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme, PlayerLootData playerData)
        {
            var statsText = "📊 DETAILED LOOT STATISTICS\n\n" +
                           $"📦 Total Loots Found: {playerData.TotalLoots}\n" +
                           $"✨ Rare Loots: {playerData.RareLoots}\n" +
                           $"🔮 Magic Loots: {playerData.MagicLoots}\n" +
                           $"⭐ Luck Bonus: +{playerData.LuckBonus}%\n" +
                           $"📈 Loot Multiplier: {playerData.LootMultiplier:F1}x\n" +
                           $"⏰ Last Magic Find: {(playerData.LastMagicFind == DateTime.MinValue ? "Never" : playerData.LastMagicFind.ToString("dd.MM.yyyy HH:mm"))}\n\n" +
                           $"🏆 TOP FOUND ITEMS:\n";

            var topItems = new List<KeyValuePair<string, int>>(playerData.ItemsFound);
            topItems.Sort((a, b) => b.Value.CompareTo(a.Value));
            int maxShow = Math.Min(5, topItems.Count);
            for (int i = 0; i < maxShow; i++)
            {
                var kv = topItems[i];
                statsText += $"  {kv.Key}: {kv.Value}x\n";
            }

            container.Add(new CuiLabel
            {
                Text = { Text = statsText, FontSize = 12, Align = TextAnchor.UpperLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.06 0.18", AnchorMax = "0.78 0.86" }
            }, "ContentArea");
        }

        private void DrawRollSection(CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            container.Add(new CuiLabel
            {
                Text = { Text = "🎲 ROLL FOR LOOT\nUse your luck to win magic items or bonus luck!", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = theme.GetValueOrDefault("HeaderColor", "1 0.88 0.42 1") },
                RectTransform = { AnchorMin = "0.1 0.65", AnchorMax = "0.9 0.85" }
            }, "ContentArea");

            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.roll", Color = theme.GetValueOrDefault("SuccessColor", "0.28 0.88 0.38 1") },
                RectTransform = { AnchorMin = "0.4 0.40", AnchorMax = "0.6 0.52" },
                Text = { Text = "🎲 ROLL NOW", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentArea");
        }

        private void DrawHelpSection(CuiElementContainer container, BasePlayer player)
        {
            var helpMessage = $"{_config.ChatPrefix} 📚 ELDRUN LOOT SYSTEM - HELP\n\n" +
                             $"📜 COMMANDS:\n" +
                             $"• /loot - Opens the loot UI\n" +
                             $"• /loot stats - Shows your statistics\n" +
                             $"• /loot magic - Shows magic items\n" +
                             $"• /loot tables - Shows loot tables\n" +
                             $"• /loot roll - Roll for luck\n\n" +
                             $"✨ MAGIC ITEMS:\n" +
                             $"• Find them in loot containers\n" +
                             $"• Higher level = better chances\n" +
                             $"• Faction membership helps\n\n" +
                             $"🛡️ FACTIONS:\n" +
                             $"• Stark, Lannister, Targaryen\n" +
                             $"• Each faction has unique loot tables\n\n" +
                             $"⭐ LUCK SYSTEM:\n" +
                             $"• Collect luck bonus through activities\n" +
                             $"• Higher bonus = better loot chances";

            container.Add(new CuiLabel
            {
                Text = { Text = helpMessage, FontSize = 11, Align = TextAnchor.UpperLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.06 0.2", AnchorMax = "0.9 0.86" }
            }, "ContentArea");
        }

        private void DrawLootSidebar(CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            // 🎮 Sidebar rechts im Fraktions-/MultiShop-Stil
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.95" },
                RectTransform = { AnchorMin = "0.82 0.16", AnchorMax = "0.98 0.90" }
            }, "UIOverlay", "Sidebar");
            
            // Linker Cyan-Rand
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0 1 1 0.5") },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "0.02 1" }
            }, "Sidebar");
            
            // Sidebar-Header (Balken + NAVIGATION)
            container.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95" },
                RectTransform = { AnchorMin = "0 0.92", AnchorMax = "1 1" }
            }, "Sidebar", "SidebarHeader");
            container.Add(new CuiLabel
            {
                Text = { Text = "📋 NAVIGATION", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.05 0.15", AnchorMax = "0.95 0.85" }
            }, "SidebarHeader");

            var buttons = new[]
            {
                ("🏰 OVERVIEW", "eldrunloot.ui.tab Overview"),
                ("📦 LOOT TABLES", "eldrunloot.ui.tab Tables"),
                ("✨ MAGIC ITEMS", "eldrunloot.ui.tab Magic"),
                ("📊 STATISTICS", "eldrunloot.ui.tab Statistics"),
                ("🎲 ROLL", "eldrunloot.ui.tab Roll"),
                ("❓ HELP & TIPS", "eldrunloot.ui.tab Help")
            };

            var buttonHeight = 0.09f;
            var spacing = 0.02f;
            var startY = 0.88f; // Angepasst wegen Titel

            for (int i = 0; i < buttons.Length; i++)
            {
                var (text, command) = buttons[i];
                var yPos = startY - i * (buttonHeight + spacing);
                // Close Button in rot, andere in dunklem Theme
                var color = i == buttons.Length - 1 
                    ? theme.GetValueOrDefault("ErrorColor", "0.88 0.28 0.28 1") 
                    : theme.GetValueOrDefault("SecondaryColor", "0.10 0.10 0.16 0.95");

                container.Add(new CuiButton
                {
                    Button = { Command = command, Color = color },
                    RectTransform = { AnchorMin = $"0.05 {yPos - buttonHeight}", AnchorMax = $"0.95 {yPos}" },
                    Text = { Text = text, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.9 0.9 0.9 1" }
                }, "Sidebar");
            }
        }

        private void DrawLootStats(CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme, PlayerLootData playerData)
        {
            // 📊 FOOTER PANEL (blauer Design, zentriert wie andere Eldrun UIs)
            container.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.12 0.02", AnchorMax = "0.88 0.10" }
            }, "UIOverlay", "FooterPanel");

            // Blauer Border oben
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" }
            }, "FooterPanel");

            // Blauer Border unten
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" }
            }, "FooterPanel");

            // Globaler Eldrun-Footertext
            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            container.Add(new CuiLabel
            {
                Text = { Text = footerText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.02 0.2", AnchorMax = "0.98 0.8" }
            }, "FooterPanel");
        }

        // Console Commands
        [ConsoleCommand("eldrunloot.ui.close")]
        private void CCClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            CuiHelper.DestroyUi(player, PanelName);
        }

        [ConsoleCommand("eldrunloot.ui.refresh")]
        private void CCRefresh(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, PermUse)) return;
            OpenLootUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.tab")]
        private void CCTab(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, PermUse)) return;
            if (arg.Args == null || arg.Args.Length == 0) { OpenLootUI(player); return; }
            UITab tab;
            if (!Enum.TryParse<UITab>(arg.Args[0], true, out tab)) tab = UITab.Overview;
            SetActiveTab(player.userID, tab);
            OpenLootUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.page")]
        private void CCPage(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, PermUse)) return;
            if (arg.Args == null || arg.Args.Length < 2) return;
            var section = arg.Args[0].ToLower();
            var dir = arg.Args[1].ToLower();
            int delta = (dir == "next") ? 1 : (dir == "prev" ? -1 : 0);
            if (delta == 0) return;
            if (section == "tables")
            {
                var p = GetPage(_tablesPage, player.userID) + delta;
                SetPage(_tablesPage, player.userID, p);
                SetActiveTab(player.userID, UITab.Tables);
            }
            else if (section == "magic")
            {
                var p = GetPage(_magicPage, player.userID) + delta;
                SetPage(_magicPage, player.userID, p);
                SetActiveTab(player.userID, UITab.Magic);
            }
            OpenLootUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.clearfilter")]
        private void CCClearFilter(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, PermUse)) return;
            if (arg.Args == null || arg.Args.Length < 1) return;
            var section = arg.Args[0].ToLower();
            if (section == "tables")
            {
                _tablesFilter[player.userID] = "";
                SetPage(_tablesPage, player.userID, 0);
                SetActiveTab(player.userID, UITab.Tables);
            }
            else if (section == "magic")
            {
                _magicFilter[player.userID] = "";
                SetPage(_magicPage, player.userID, 0);
                SetActiveTab(player.userID, UITab.Magic);
            }
            ShowToast(player, "Filter cleared", "0.25 0.25 0.25 0.92");
            OpenLootUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.setfilter")]
        private void CCSetFilter(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, PermUse)) return;
            if (arg.Args == null || arg.Args.Length < 2) return;
            var section = arg.Args[0].ToLower();
            // Join remaining args as filter text
            var text = "";
            for (int i = 1; i < arg.Args.Length; i++)
            {
                if (i > 1) text += " ";
                text += arg.Args[i];
            }
            text = (text ?? "").Trim();
            if (section == "tables")
            {
                _tablesFilter[player.userID] = text;
                SetPage(_tablesPage, player.userID, 0);
                SetActiveTab(player.userID, UITab.Tables);
            }
            else if (section == "magic")
            {
                _magicFilter[player.userID] = text;
                SetPage(_magicPage, player.userID, 0);
                SetActiveTab(player.userID, UITab.Magic);
            }
            ShowToast(player, string.IsNullOrEmpty(text) ? "Filter cleared" : $"Filter: '{text}'", "0.25 0.25 0.25 0.92");
            OpenLootUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.stats")]
        private void CCStats(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowLootStatsDetailed(player);
        }

        [ConsoleCommand("eldrunloot.ui.magic")]
        private void CCMagic(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowMagicItemsDetailed(player);
        }

        [ConsoleCommand("eldrunloot.ui.tables")]
        private void CCTables(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowLootTablesDetailed(player);
        }

        [ConsoleCommand("eldrunloot.ui.roll")]
        private void CCRoll(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            RollForLoot(player);
        }

        [ConsoleCommand("eldrunloot.ui.luck")]
        private void CCLuck(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowLuckBonus(player);
        }

        [ConsoleCommand("eldrunloot.ui.help")]
        private void CCHelp(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowHelpUI(player);
        }

        [ConsoleCommand("eldrunloot.ui.view")]
        private void CCView(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || arg.Args.Length == 0) return;
            ViewLootTable(player, arg.Args[0]);
        }

        [ConsoleCommand("eldrunloot.admin.reload")]
        private void CCAdminReload(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player != null && !HasAdmin(player)) return;
            LoadData();
            var message = "[EldrunLoot] ✅ Plugin successfully reloaded!";
            if (player != null) SendReply(player, message);
            else Puts(message);
        }

        [ConsoleCommand("eldrunloot.admin.reset")]
        private void CCAdminReset(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player != null && !HasAdmin(player)) return;
            
            if (arg.Args.Length > 0)
            {
                var targetPlayer = BasePlayer.Find(arg.Args[0]);
                if (targetPlayer != null)
                {
                    _playerData.Remove(targetPlayer.userID);
                    var message = $"[EldrunLoot] ✅ Loot data for {targetPlayer.displayName} reset!";
                    if (player != null) SendReply(player, message);
                    else Puts(message);
                }
            }
        }

        [ConsoleCommand("eldrunloot.admin.give")]
        private void CCAdminGive(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player != null && !HasPermission(player, PermAdmin)) return;
            
            if (arg.Args.Length >= 2)
            {
                var targetPlayer = BasePlayer.Find(arg.Args[0]);
                var magicItemId = arg.Args[1];
                
                if (targetPlayer != null && _magicItems.ContainsKey(magicItemId))
                {
                    GiveMagicItem(targetPlayer, magicItemId);
                    var message = $"[EldrunLoot] ✨ Magic item '{magicItemId}' given to {targetPlayer.displayName}!";
                    if (player != null) SendReply(player, message);
                    else Puts(message);
                }
            }
        }

        // Helper Methods
        private PlayerLootData GetPlayerData(ulong userId)
        {
            if (!_playerData.TryGetValue(userId, out var data))
            {
                data = new PlayerLootData();
                _playerData[userId] = data;
            }
            return data;
        }

        private bool HasPermission(BasePlayer player, string perm) => permission.UserHasPermission(player.UserIDString, perm);

        private bool HasAdmin(BasePlayer player)
        {
            if (player == null) return false;
            return HasPermission(player, PermAdmin) || IsServerAdmin(player);
        }

        // === UI STATE HELPERS ===
        private UITab GetActiveTab(ulong userId)
        {
            UITab tab;
            if (!_activeTab.TryGetValue(userId, out tab))
            {
                tab = UITab.Overview;
                _activeTab[userId] = tab;
            }
            return tab;
        }

        private void SetActiveTab(ulong userId, UITab tab)
        {
            _activeTab[userId] = tab;
        }

        private int GetPage(Dictionary<ulong, int> store, ulong userId)
        {
            int page;
            if (!store.TryGetValue(userId, out page)) page = 0;
            return page;
        }

        private void SetPage(Dictionary<ulong, int> store, ulong userId, int page)
        {
            store[userId] = Math.Max(0, page);
        }

        // === MICRO TOASTS ===
        private void ShowToast(BasePlayer player, string message, string color = "0.1 0.1 0.1 0.92")
        {
            if (player == null) return;
            try
            {
                CuiHelper.DestroyUi(player, ToastPanelName);
                var container = new CuiElementContainer();
                container.Add(new CuiPanel
                {
                    Image = { Color = color },
                    RectTransform = { AnchorMin = "0.35 0.92", AnchorMax = "0.65 0.98" }
                }, "Overlay", ToastPanelName);

                container.Add(new CuiLabel
                {
                    Text = { Text = message, FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                    RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
                }, ToastPanelName);

                CuiHelper.AddUi(player, container);
                timer.Once(3f, () => { if (player != null) CuiHelper.DestroyUi(player, ToastPanelName); });
            }
            catch { }
        }

        private bool EnsureFaction(BasePlayer player)
        {
            return true; // Faction requirement removed
        }

        private bool CanAccessLootTable(BasePlayer player, LootTable table)
        {
            var playerLevel = GetPlayerLevel(player);
            if (playerLevel < table.RequiredLevel) return false;

            if (!string.IsNullOrEmpty(table.RequiredFaction))
            {
                var playerFaction = GetPlayerFaction(player);
                if (playerFaction != table.RequiredFaction) return false;
            }

            return true;
        }

        private bool CanPlayerGetMagicItem(BasePlayer player, MagicItem magicItem)
        {
            if (magicItem.IsUnique)
            {
                var playerData = GetPlayerData(player.userID);
                return !playerData.ItemsFound.ContainsKey(magicItem.Id);
            }
            return true;
        }

        private Dictionary<string, string> GetEldrunTheme()
        {
            return new Dictionary<string, string>
            {
                ["PrimaryColor"]    = "0.02 0.02 0.03 0.98",
                ["SecondaryColor"]  = "0.06 0.06 0.09 0.96",
                ["BackgroundColor"] = "0.02 0.02 0.03 0.98",

                ["HeaderColor"]   = "0.95 0.83 0.42 1",
                ["CategoryGold"]  = "0.79 0.60 0.29 1",
                ["AccentColor"]   = "0.79 0.60 0.29 1",
                ["HoverColor"]    = "0.89 0.70 0.35 0.9",
                ["BorderColor"]   = "0.42 0.32 0.19 0.9",

                ["TextColor"]     = "0.96 0.96 0.98 1",
                ["SubTextColor"]  = "0.68 0.69 0.77 1",
                ["LabelColor"]    = "0.68 0.69 0.77 1",

                ["SuccessColor"]  = "0.28 0.88 0.39 1",
                ["WarningColor"]  = "0.92 0.68 0.28 1",
                ["ErrorColor"]    = "0.88 0.27 0.27 1",
                ["InfoColor"]     = "0.22 0.74 0.97 1",

                ["RarityBasic"]      = "0.6 0.6 0.6 1",
                ["RarityAdvanced"]   = "0.4 0.8 0.4 1",
                ["RarityElite"]      = "0.4 0.6 0.9 1",
                ["RarityLegendary"]  = "0.8 0.4 0.8 1",
                ["RarityMythic"]     = "0.9 0.6 0.2 1",
                ["RarityGodlike"]    = "1 0.8 0.2 1",

                ["accent_gold"]  = "0.95 0.83 0.42 1",
                ["tab_inactive"] = "0.25 0.25 0.30 0.85",
                ["close_btn"]    = "0.88 0.27 0.27 0.95"
            };
        }

        private string GetSourceColor(LootSource source)
        {
            switch (source)
            {
                case LootSource.Crate: return "0.6 0.3 0.0 0.8";
                case LootSource.Barrel: return "0.4 0.4 0.4 0.8";
                case LootSource.Airdrop: return "0.0 0.6 0.8 0.8";
                case LootSource.Helicopter: return "0.8 0.0 0.0 0.8";
                case LootSource.Bradley: return "0.8 0.4 0.0 0.8";
                default: return "0.2 0.2 0.2 0.8";
            }
        }

        private int GetPlayerLevel(BasePlayer player)
        {
            try
            {
                if (EldrunXP != null)
                {
                    var level = EldrunXP.Call("GetLevel", player.UserIDString);
                    if (level != null) return Convert.ToInt32(level);
                }
            }
            catch { }
            return 1;
        }

        private string GetPlayerFaction(BasePlayer player)
        {
            try
            {
                if (EldrunFraktion != null)
                {
                    var faction = EldrunFraktion.Call("Eldrun_GetPlayerFaction", player.UserIDString) as string;
                    if (!string.IsNullOrEmpty(faction)) return faction;
                }
            }
            catch { }
            return "";
        }

        private void ShowLootStats(BasePlayer player)
        {
            var playerData = GetPlayerData(player.userID);
            var message = $"{_config.ChatPrefix} 📊 YOUR LOOT STATISTICS:\n" +
                         $"📦 Total Loots Found: {playerData.TotalLoots}\n" +
                         $"✨ Rare Loots: {playerData.RareLoots}\n" +
                         $"🔮 Magic Loots: {playerData.MagicLoots}\n" +
                         $"⭐ Luck Bonus: +{playerData.LuckBonus}%\n" +
                         $"📈 Loot Multiplier: {playerData.LootMultiplier:F1}x";
            SendReply(player, message);
        }

        private void ShowMagicItems(BasePlayer player)
        {
            var availableItems = new List<MagicItem>();
            foreach (var m in _magicItems.Values)
            {
                if (m != null && CanPlayerGetMagicItem(player, m))
                    availableItems.Add(m);
            }
            var message = $"{_config.ChatPrefix} ✨ AVAILABLE MAGIC ITEMS:\n";
            
            if (availableItems.Count == 0)
            {
                message += "🚫 No magic items available!";
            }
            else
            {
                int showCount = 0;
                for (int i = 0; i < availableItems.Count && showCount < 10; i++)
                {
                    var item = availableItems[i];
                    message += $"{item.IconEmoji} {item.Name} ({item.Rarity})\n";
                    showCount++;
                }
            }
            
            SendReply(player, message);
        }

        private void ShowLootTables(BasePlayer player)
        {
            var availableTables = new List<LootTable>();
            foreach (var t in _lootTables.Values)
            {
                if (t != null && CanAccessLootTable(player, t))
                    availableTables.Add(t);
            }
            var message = $"{_config.ChatPrefix} 📜 AVAILABLE LOOT TABLES:\n";
            
            if (availableTables.Count == 0)
            {
                message += "🚫 No loot tables available!";
            }
            else
            {
                foreach (var table in availableTables)
                {
                    message += $"{table.IconEmoji} {table.Name} ({table.Items.Count} Items)\n";
                }
            }
            
            SendReply(player, message);
        }

        // === ERWEITERTE UI-METHODEN ===
        private void ShowLootStatsDetailed(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();
            var theme = GetEldrunTheme();
            var playerData = GetPlayerData(player.userID);

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            // Stats Content
            var statsText = "📊 DETAILED LOOT STATISTICS\n\n" +
                           $"📦 Total Loots Found: {playerData.TotalLoots}\n" +
                           $"✨ Rare Loots: {playerData.RareLoots}\n" +
                           $"🔮 Magic Loots: {playerData.MagicLoots}\n" +
                           $"⭐ Luck Bonus: +{playerData.LuckBonus}%\n" +
                           $"📈 Loot Multiplier: {playerData.LootMultiplier:F1}x\n" +
                           $"⏰ Last Magic Find: {(playerData.LastMagicFind == DateTime.MinValue ? "Never" : playerData.LastMagicFind.ToString("dd.MM.yyyy HH:mm"))}\n\n" +
                           $"🏆 TOP FOUND ITEMS:\n";

            var topItems = new List<KeyValuePair<string, int>>(playerData.ItemsFound);
            topItems.Sort((a, b) => b.Value.CompareTo(a.Value));
            int maxShow = Math.Min(5, topItems.Count);
            for (int i = 0; i < maxShow; i++)
            {
                var kv = topItems[i];
                statsText += $"  {kv.Key}: {kv.Value}x\n";
            }

            container.Add(new CuiLabel
            {
                Text = { Text = statsText, FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.8" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void ShowMagicItemsDetailed(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();
            var availableItems = new List<MagicItem>();
            foreach (var m in _magicItems.Values)
            {
                if (m != null && CanPlayerGetMagicItem(player, m))
                {
                    availableItems.Add(m);
                }
            }

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            var magicText = "✨ AVAILABLE MAGIC ITEMS\n\n";
            
            if (availableItems.Count == 0)
            {
                magicText += "🚫 No magic items currently available!\n\n";
                magicText += "💡 Tips to find magic items:\n";
                magicText += "⭐ Increase your luck bonus\n";
                magicText += "🛡️ Join a faction\n";
                magicText += "📈 Reach higher levels\n";
                magicText += "🗺️ Explore rare loot sources";
            }
            else
            {
                foreach (var item in availableItems)
                {
                    magicText += $"{item.IconEmoji} {item.Name}\n";
                    magicText += $"   Type: {item.Type} | Rarity: {item.Rarity}\n";
                    magicText += $"   {item.Description}\n";
                    magicText += $"   Value: {item.Value} Coins\n\n";
                }
            }

            container.Add(new CuiLabel
            {
                Text = { Text = magicText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.8" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void ShowLootTablesDetailed(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();
            var availableTables = new List<LootTable>();
            foreach (var t in _lootTables.Values)
            {
                if (t != null && CanAccessLootTable(player, t))
                {
                    availableTables.Add(t);
                }
            }

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            var tablesText = "📜 AVAILABLE LOOT TABLES\n\n";
            
            if (availableTables.Count == 0)
            {
                tablesText += "🚫 No loot tables available!\n";
                tablesText += "📊 Increase your level or join a faction!";
            }
            else
            {
                foreach (var table in availableTables)
                {
                    tablesText += $"{table.IconEmoji} {table.Name}\n";
                    tablesText += $"   {table.Description}\n";
                    tablesText += $"   📦 Source: {table.Source} | Items: {table.Items.Count}\n";
                    if (table.RequiredLevel > 0) tablesText += $"   Min. Level: {table.RequiredLevel}\n";
                    if (!string.IsNullOrEmpty(table.RequiredFaction)) tablesText += $"   Faction: {table.RequiredFaction}\n";
                    tablesText += $"   Base Chance: {table.BaseChance:F1}x\n\n";
                }
            }

            container.Add(new CuiLabel
            {
                Text = { Text = tablesText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.8" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void RollForLoot(BasePlayer player)
        {
            if (!HasPermission(player, PermUse)) return;
            if (!_config.EnableRollSystem)
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ Roll system is disabled!");
                return;
            }
            
            var playerData = GetPlayerData(player.userID);
            var rollCooldown = DateTime.Now.AddMinutes(-_config.RollCooldownMinutes);

            if (playerData.LastRollTime > rollCooldown)
            {
                var remainingTime = (playerData.LastRollTime.AddMinutes(_config.RollCooldownMinutes) - DateTime.Now).TotalMinutes;
                SendReply(player, $"{_config.ChatPrefix} ⏰ You can roll again in {remainingTime:F0} minutes!");
                ShowToast(player, $"⏰ Roll cooldown: {remainingTime:F0}m", "0.4 0.4 0.15 0.92");
                return;
            }

            var roll = UnityEngine.Random.Range(1, 101);
            var luckBonus = playerData.LuckBonus;
            var totalRoll = roll + luckBonus;

            SendReply(player, $"{_config.ChatPrefix} 🎲 You rolled: {roll} (+{luckBonus} Luck) = {totalRoll}");
            ShowToast(player, $"🎲 Roll: {totalRoll}", "0.25 0.5 0.25 0.92");

            if (totalRoll >= 90)
            {
                // Epic success - give magic item
                var availableMagicItems = new List<MagicItem>();
                foreach (var m in _magicItems.Values)
                {
                    if (m != null && CanPlayerGetMagicItem(player, m))
                        availableMagicItems.Add(m);
                }
                if (availableMagicItems.Count > 0)
                {
                    var magicItem = availableMagicItems[UnityEngine.Random.Range(0, availableMagicItems.Count)];
                    GiveMagicItem(player, magicItem.Id);
                    SendReply(player, $"{_config.ChatPrefix} 🎉 JACKPOT! You receive: {magicItem.IconEmoji} {magicItem.Name}!");
                    ShowToast(player, $"🎉 JACKPOT: {magicItem.Name}", "0.2 0.6 0.2 0.95");
                }
            }
            else if (totalRoll >= 70)
            {
                // Good success - increase luck bonus
                playerData.LuckBonus = Math.Min(playerData.LuckBonus + 5, _config.MaxLuckBonus);
                SendReply(player, $"{_config.ChatPrefix} ✨ Lucky! +5 Luck Bonus (Total: {playerData.LuckBonus})");
                ShowToast(player, $"✨ +5 Luck (Total {playerData.LuckBonus})", "0.2 0.6 0.2 0.92");
            }
            else if (totalRoll >= 50)
            {
                // Minor success - small reward
                SendReply(player, $"{_config.ChatPrefix} 🍀 Not bad! You feel your luck improving...");
                playerData.LuckBonus = Math.Min(playerData.LuckBonus + 1, _config.MaxLuckBonus);
                ShowToast(player, $"🍀 +1 Luck (Total {playerData.LuckBonus})", "0.2 0.5 0.2 0.9");
            }
            else
            {
                // Bad luck
                SendReply(player, $"{_config.ChatPrefix} 😞 Bad luck! Try again later.");
                ShowToast(player, "😞 Bad luck!", "0.88 0.28 0.28 0.95");
            }

            playerData.LastRollTime = DateTime.Now;
            // Apply faction bonus if applicable
            ApplyFactionBonus(player, playerData);

            // If user is on Roll tab, refresh UI after roll
            if (GetActiveTab(player.userID) == UITab.Roll)
            {
                NextTick(() => { if (player != null) OpenLootUI(player); });
            }
        }

        private void ShowLuckBonus(BasePlayer player)
        {
            var playerData = GetPlayerData(player.userID);
            var message = $"{_config.ChatPrefix} ⭐ YOUR LUCK BONUS:\n\n" +
                         $"🎯 Current Bonus: +{playerData.LuckBonus}%\n" +
                         $"📈 Loot Multiplier: {playerData.LootMultiplier:F1}x\n" +
                         $"✨ Magic Chance: {(_config.MagicChance + playerData.LuckBonus / 1000f) * 100:F1}%\n\n" +
                         $"💡 Tips to increase luck:\n" +
                         $"🎲 Use /loot roll (every 30 min)\n" +
                         $"🏆 Find rare loots\n" +
                         $"👑 VIP Status for +{_config.VIPLuckBonus} bonus";
            
            SendReply(player, message);
        }

        private void ShowHelpUI(BasePlayer player)
        {
            var helpMessage = $"{_config.ChatPrefix} 📚 ELDRUN LOOT SYSTEM - HELP\n\n" +
                             $"📜 COMMANDS:\n" +
                             $"• /loot - Opens the loot UI\n" +
                             $"• /loot stats - Shows your statistics\n" +
                             $"• /loot magic - Shows magic items\n" +
                             $"• /loot tables - Shows loot tables\n" +
                             $"• /loot roll - Roll for luck\n\n" +
                             $"✨ MAGIC ITEMS:\n" +
                             $"• Find them in loot containers\n" +
                             $"• Higher level = better chances\n" +
                             $"• Faction membership helps\n\n" +
                             $"🛡️ FACTIONS:\n" +
                             $"• Stark, Lannister, Targaryen\n" +
                             $"• Each faction has unique loot tables\n\n" +
                             $"⭐ LUCK SYSTEM:\n" +
                             $"• Collect luck bonus through activities\n" +
                             $"• Higher bonus = better loot chances";
                             
            SendReply(player, helpMessage);
        }

        private void ViewLootTable(BasePlayer player, string tableId)
        {
            if (!_lootTables.TryGetValue(tableId, out var table)) return;
            if (!CanAccessLootTable(player, table)) return;

            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            var tableText = $"{table.IconEmoji} {table.Name}\n\n";
            tableText += $"  {table.Description}\n";
            tableText += $"  📦 Source: {table.Source}\n";
            tableText += $"  🎲 Base Chance: {table.BaseChance:F1}x\n\n";
            tableText += "📜 ITEMS IN THIS TABLE:\n\n";

            var itemsSorted = new List<LootEntry>(table.Items);
            itemsSorted.Sort((a, b) => ((int)b.Rarity).CompareTo((int)a.Rarity));
            foreach (var item in itemsSorted)
            {
                var rarityColor = GetRarityColor(item.Rarity);
                tableText += $"  📦 {item.Shortname} ({item.Amount}-{item.AmountMax})\n";
                tableText += $"  ⭐ {item.Rarity} | 🎯 {item.Chance * 100:F1}%";
                if (item.CanBeMagical) tableText += " | ✨ Magic possible";
                tableText += "\n\n";
            }

            container.Add(new CuiLabel
            {
                Text = { Text = tableText, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.8" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void GiveMagicItem(BasePlayer player, string magicItemId)
        {
            if (!_magicItems.TryGetValue(magicItemId, out var magicItem)) return;

            var item = ItemManager.CreateByName(magicItem.BaseItem, 1);
            if (item != null)
            {
                item.name = $"{magicItem.IconEmoji} {magicItem.Name}";
                
                if (player.inventory.containerBelt.itemList.Count < 6)
                    player.inventory.containerBelt.Insert(item);
                else if (player.inventory.containerMain.itemList.Count < 24)
                    player.inventory.containerMain.Insert(item);
                else
                    item.Drop(player.transform.position + Vector3.up, Vector3.zero);

                var playerData = GetPlayerData(player.userID);
                playerData.MagicLoots++;
                playerData.ItemsFound[magicItem.Id] = playerData.ItemsFound.GetValueOrDefault(magicItem.Id, 0) + 1;
            }
        }

        private string GetRarityColor(LootRarity rarity)
        {
            switch (rarity)
            {
                case LootRarity.Common: return "0.6 0.6 0.6 1";
                case LootRarity.Uncommon: return "0.4 0.8 0.4 1";
                case LootRarity.Rare: return "0.4 0.6 0.9 1";
                case LootRarity.Epic: return "0.8 0.4 0.8 1";
                case LootRarity.Legendary: return "0.9 0.6 0.2 1";
                case LootRarity.Mythic: return "0.9 0.2 0.2 1";
                case LootRarity.Godlike: return "1 0.8 0.2 1";
                default: return "0.6 0.6 0.6 1";
            }
        }

        private void OpenAdminUI(BasePlayer player)
        {
            if (!HasPermission(player, PermAdmin)) return;

            CuiHelper.DestroyUi(player, PanelName);

            var container = new CuiElementContainer();
            var theme = GetEldrunTheme();

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            // ⭐ Admin Header Panel mit blauen Balken
            container.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95" },
                RectTransform = { AnchorMin = "0.15 0.85", AnchorMax = "0.85 0.93" }
            }, PanelName, "AdminHeaderPanel");

            // Blauer Balken oben
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" }
            }, "AdminHeaderPanel");
            
            // Blauer Balken unten
            container.Add(new CuiPanel
            {
                Image = { Color = theme.GetValueOrDefault("InfoColor", "0.18 0.40 0.80 0.95") },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" }
            }, "AdminHeaderPanel");
            
            // Header Titel
            container.Add(new CuiLabel
            {
                Text = { Text = "⚙️ ELDRUN LOOT - ADMIN PANEL", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = theme.GetValueOrDefault("HeaderColor", "1 0.88 0.42 1") },
                RectTransform = { AnchorMin = "0.05 0.15", AnchorMax = "0.95 0.88" }
            }, "AdminHeaderPanel");

            // Status Panel
            var statusText = $"📊 PLUGIN STATUS:\n\n" +
                            $"✅ Plugin: {(_config.Enabled ? "Enabled" : "Disabled")}\n" +
                            $"✨ Magic Loot: {(_config.MagicLootEnabled ? "Enabled" : "Disabled")}\n" +
                            $"💼 Better Loot: {(_config.BetterLootEnabled ? "Enabled" : "Disabled")}\n" +
                            $"📜 Loot Tables: {_lootTables.Count}\n" +
                            $"✨ Magic Items: {_magicItems.Count}\n" +
                            $"👥 Registered Players: {_playerData.Count}";

            container.Add(new CuiLabel
            {
                Text = { Text = statusText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.5", AnchorMax = "0.5 0.8" }
            }, PanelName);

            // Admin Buttons
            var adminButtons = new[]
            {
                ("🔄 RELOAD", "eldrunloot.admin.reload", "0.2 0.8 0.2 0.9"),
                ("🗑️ RESET DATA", "eldrunloot.admin.resetall", "0.8 0.3 0.3 0.9"),
                ("📊 STATISTICS", "eldrunloot.admin.stats", "0.3 0.6 0.8 0.9"),
                ("🎲 SPAWN LOOT", "eldrunloot.admin.spawnui", "0.6 0.4 0.8 0.9"),
                ("⚙️ SETTINGS", "eldrunloot.admin.settings", "0.8 0.6 0.2 0.9")
            };

            var buttonHeight = 0.06f;
            var spacing = 0.02f;
            var startY = 0.4f;

            for (int i = 0; i < adminButtons.Length; i++)
            {
                var (text, command, color) = adminButtons[i];
                var yPos = startY - i * (buttonHeight + spacing);

                container.Add(new CuiButton
                {
                    Button = { Command = command, Color = color },
                    RectTransform = { AnchorMin = $"0.55 {yPos - buttonHeight}", AnchorMax = $"0.9 {yPos}" },
                    Text = { Text = text, FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, PanelName);
            }

            // ❌ Close Button (Consistent with Main UI)
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.ui.close", Color = theme.GetValueOrDefault("ErrorColor", "0.88 0.28 0.28 1") },
                RectTransform = { AnchorMin = "0.42 0.05", AnchorMax = "0.58 0.12" },
                Text = { Text = "✖ CLOSE", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void SpawnLootFromTable(BasePlayer player, string tableId)
        {
            if (!_lootTables.TryGetValue(tableId, out var table)) return;

            var spawnPosition = player.transform.position + player.transform.forward * 2f + Vector3.up;
            var spawnedItems = 0;

            foreach (var entry in table.Items)
            {
                // Normalize amounts
                var minAmount = Math.Min(entry.Amount, entry.AmountMax);
                var maxAmount = Math.Max(entry.Amount, entry.AmountMax);
                if (minAmount < 1) minAmount = 1;
                if (maxAmount < 1) maxAmount = 1;

                // Scale chance similar to ModifyContainerLoot
                var effectiveChance = Math.Min(1f, entry.Chance * table.BaseChance * _config.GlobalLootMultiplier);

                if (UnityEngine.Random.Range(0f, 1f) <= effectiveChance)
                {
                    var amount = UnityEngine.Random.Range(minAmount, maxAmount + 1);
                    var item = ItemManager.CreateByName(entry.Shortname, amount, entry.SkinId);
                    
                    if (item != null)
                    {
                        if (!string.IsNullOrEmpty(entry.DisplayName))
                            item.name = entry.DisplayName;
                            
                        var dropPosition = spawnPosition + new Vector3(
                            UnityEngine.Random.Range(-1f, 1f), 
                            0f, 
                            UnityEngine.Random.Range(-1f, 1f)
                        );
                        
                        item.Drop(dropPosition, Vector3.zero);
                        spawnedItems++;
                        
                        // Magic item chance
                        if (entry.CanBeMagical && _config.MagicLootEnabled && UnityEngine.Random.Range(0f, 1f) < 0.3f)
                        {
                            var availableMagicItems = new List<MagicItem>();
                            foreach (var m in _magicItems.Values)
                            {
                                if (m != null && m.BaseItem == entry.Shortname)
                                    availableMagicItems.Add(m);
                            }
                            if (availableMagicItems.Count > 0)
                            {
                                var magicItem = availableMagicItems[UnityEngine.Random.Range(0, availableMagicItems.Count)];
                                var magicDropPosition = dropPosition + Vector3.up * 0.5f;
                                
                                var magicDropItem = ItemManager.CreateByName(magicItem.BaseItem, 1);
                                if (magicDropItem != null)
                                {
                                    magicDropItem.name = $"{magicItem.IconEmoji} {magicItem.Name}";
                                    magicDropItem.Drop(magicDropPosition, Vector3.zero);
                                }
                            }
                        }
                    }
                }
            }

            SendReply(player, $"{_config.ChatPrefix} 🎲 {spawnedItems} items spawned from table '{table.Name}'!");
        }

        // === 🛠️ EXTENDED ADMIN CONSOLE COMMANDS ===
        [ConsoleCommand("eldrunloot.admin.resetall")]
        private void CCAdminResetAll(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player != null && !HasAdmin(player)) return;
            
            _playerData.Clear();
            var message = "[EldrunLoot]  All player data has been reset!";
            if (player != null) SendReply(player, message);
            else Puts(message);
        }

        [ConsoleCommand("eldrunloot.admin.stats")]
        private void CCAdminStats(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player != null && !HasAdmin(player)) return;
            
            int totalLoots = 0;
            int totalMagic = 0;
            int totalRare = 0;
            foreach (var pdata in _playerData.Values)
            {
                if (pdata == null) continue;
                totalLoots += pdata.TotalLoots;
                totalMagic += pdata.MagicLoots;
                totalRare += pdata.RareLoots;
            }
            
            var statsMessage = $"[EldrunLoot]  SERVER STATISTICS:\n" +
                              $" Registered Players: {_playerData.Count}\n" +
                              $" Total Loots: {totalLoots}\n" +
                              $" Magic Loots: {totalMagic}\n" +
                              $" Rare Loots: {totalRare}\n" +
                              $" Loot Tables: {_lootTables.Count}\n" +
                              $" Magic Items: {_magicItems.Count}";
            
            if (player != null) SendReply(player, statsMessage);
            else Puts(statsMessage);
        }

        [ConsoleCommand("eldrunloot.admin.spawnui")]
        private void CCAdminSpawnUI(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasAdmin(player)) return;
            
            OpenSpawnUI(player);
        }

        [ConsoleCommand("eldrunloot.admin.settings")]
        private void CCAdminSettings(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasAdmin(player)) return;
            
            OpenSettingsUI(player);
        }

        [ConsoleCommand("eldrunloot.admin.ui")]
        private void CCAdminUI(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasAdmin(player)) return;
            
            OpenAdminUI(player);
        }

        private void OpenSpawnUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            // Header  
            container.Add(new CuiLabel
            {
                Text = { Text = "🎲 LOOT SPAWNING PANEL", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "0.83 0.69 0.22 1" },
                RectTransform = { AnchorMin = "0.1 0.9", AnchorMax = "0.9 0.95" }
            }, PanelName);

            var spawnText = "📜 AVAILABLE LOOT TABLES FOR SPAWNING:\n\n";
            
            foreach (var table in _lootTables.Values)
            {
                spawnText += $"{table.IconEmoji} {table.Name} (ID: {table.Id})\n";
                spawnText += $"   📝 {table.Description}\n";
                spawnText += $"   📦 Items: {table.Items.Count} | 🎲 Chance: {table.BaseChance:F1}x\n\n";
            }

            spawnText += "\n💡 Use: /lootadmin spawn <tableId>";

            container.Add(new CuiLabel
            {
                Text = { Text = spawnText, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.85" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.admin.ui", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        private void OpenSettingsUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            var container = new CuiElementContainer();

            // Main Background
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "Overlay", PanelName);

            // Header  
            container.Add(new CuiLabel
            {
                Text = { Text = "⚙️ PLUGIN SETTINGS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "0.83 0.69 0.22 1" },
                RectTransform = { AnchorMin = "0.1 0.9", AnchorMax = "0.9 0.95" }
            }, PanelName);

            var settingsText = $"🛠️ CURRENT CONFIGURATION:\n\n" +
                              $"✅ Plugin Enabled: {(_config.Enabled ? "YES" : "NO")}\n" +
                              $"✨ Magic Loot: {(_config.MagicLootEnabled ? "YES" : "NO")}\n" +
                              $"💼 Better Loot: {(_config.BetterLootEnabled ? "YES" : "NO")}\n" +
                              $"📊 Global Multiplier: {_config.GlobalLootMultiplier:F1}x\n" +
                              $"🎲 Magic Chance: {_config.MagicChance * 100:F1}%\n" +
                              $"🛡️ Faction Required: {(_config.RequireFaction ? "YES" : "NO")}\n" +
                              $"👑 VIP Luck Bonus: +{_config.VIPLuckBonus}\n\n" +
                              $"💡 TOGGLE COMMANDS:\n" +
                              $"• /lootadmin toggle enabled\n" +
                              $"• /lootadmin toggle magic\n" +
                              $"• /lootadmin toggle better";

            container.Add(new CuiLabel
            {
                Text = { Text = settingsText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.3", AnchorMax = "0.9 0.85" }
            }, PanelName);

            // Back Button
            container.Add(new CuiButton
            {
                Button = { Command = "eldrunloot.admin.ui", Color = "0.8 0.3 0.3 0.9" },
                RectTransform = { AnchorMin = "0.4 0.1", AnchorMax = "0.6 0.2" },
                Text = { Text = "◀ BACK", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, PanelName);

            CuiHelper.AddUi(player, container);
        }

        // === 🛠️ EXTENDED HELPER METHODS ===
        private bool IsVIP(BasePlayer player)
        {
            // Check various VIP systems - customize as needed
            if (permission.UserHasPermission(player.UserIDString, "vip")) return true;
            if (permission.UserHasPermission(player.UserIDString, "premium")) return true;
            if (permission.UserHasPermission(player.UserIDString, "eldrun.vip")) return true;
            
            // Check for VIP groups
            var groups = permission.GetUserGroups(player.UserIDString);
            if (groups != null)
            {
                for (int i = 0; i < groups.Length; i++)
                {
                    var g = groups[i];
                    if (!string.IsNullOrEmpty(g))
                    {
                        var gl = g.ToLower();
                        if (gl.Contains("vip") || gl.Contains("premium"))
                            return true;
                    }
                }
            }
            
            return false;
        }

        private void ApplyFactionBonus(BasePlayer player, PlayerLootData playerData)
        {
            var faction = GetPlayerFaction(player);
            if (string.IsNullOrEmpty(faction)) return;
            
            if (_config.FactionLootBonuses.TryGetValue(faction.ToLower(), out var bonus))
            {
                var oldMultiplier = playerData.LootMultiplier;
                playerData.LootMultiplier = Math.Max(playerData.LootMultiplier, bonus);
                
                if (playerData.LootMultiplier > oldMultiplier && _config.EnableLootNotifications)
                {
                    SendReply(player, $"{_config.ChatPrefix} 🛡️ Faction bonus for {faction}: {bonus:F1}x Loot Multiplier!");
                }
            }
        }

        private void ProcessLootFind(BasePlayer player, LootEntry entry, Vector3 position)
        {
            var playerData = GetPlayerData(player.userID);
            
            // Update statistics
            if (_config.EnableLootStatistics)
            {
                if (!playerData.ItemsFound.ContainsKey(entry.Shortname))
                    playerData.ItemsFound[entry.Shortname] = 0;
                playerData.ItemsFound[entry.Shortname]++;
                
                // Check for rare item
                if ((int)entry.Rarity >= (int)LootRarity.Rare)
                {
                    playerData.RareLoots++;
                    
                    // Rare item bonus
                    if (_config.RareItemBonus > 1.0f)
                    {
                        var bonusChance = UnityEngine.Random.Range(0f, 1f);
                        if (bonusChance < 0.1f) // 10% chance for bonus luck
                        {
                            var bonusLuck = (int)(5 * _config.RareItemBonus);
                            playerData.LuckBonus = Math.Min(playerData.LuckBonus + bonusLuck, _config.MaxLuckBonus);
                            
                            if (_config.EnableLootNotifications)
                            {
                                SendReply(player, $"{_config.ChatPrefix} ✨ Rare item found! +{bonusLuck} Luck Bonus!");
                            }
                        }
                    }
                }
            }
        }

        private bool CanPlayerAccessFeature(BasePlayer player, string feature)
        {
            switch (feature.ToLower())
            {
                case "magic":
                    return _config.MagicLootEnabled && HasPermission(player, PermMagic);
                case "roll":
                    return _config.EnableRollSystem && HasPermission(player, PermUse);
                case "statistics":
                    return _config.EnableLootStatistics;
                default:
                    return true;
            }
        }

        private string FormatTimeSpan(TimeSpan span)
        {
            if (span.TotalDays >= 1)
                return $"{span.Days}d {span.Hours}h {span.Minutes}m";
            else if (span.TotalHours >= 1)
                return $"{span.Hours}h {span.Minutes}m";
            else
                return $"{span.Minutes}m {span.Seconds}s";
        }

        private void LogAdminAction(BasePlayer admin, string action, string details = "")
        {
            if (!_config.EnableAdminLogging) return;
            
            var logMessage = $"[EldrunLoot Admin] {admin?.displayName ?? "Console"}: {action}";
            if (!string.IsNullOrEmpty(details))
                logMessage += $" - {details}";
                
            Puts(logMessage);
        }

        private void NotifyNearbyPlayers(Vector3 position, string message, float radius = 50f)
        {
            if (!_config.EnableLootNotifications) return;
            
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (Vector3.Distance(player.transform.position, position) <= radius)
                {
                    SendReply(player, message);
                }
            }
        }

        private float CalculateTotalLootChance(BasePlayer player, LootTable table)
        {
            var baseChance = table.BaseChance;
            var playerData = GetPlayerData(player.userID);
            
            // Apply player multiplier
            baseChance *= playerData.LootMultiplier;
            
            // Apply global multiplier
            baseChance *= _config.GlobalLootMultiplier;
            
            // Apply faction bonus
            var faction = GetPlayerFaction(player);
            if (!string.IsNullOrEmpty(faction) && _config.FactionLootBonuses.TryGetValue(faction.ToLower(), out var factionBonus))
            {
                baseChance *= factionBonus;
            }
            
            // Apply VIP bonus
            if (IsVIP(player))
            {
                baseChance *= 1.2f; // 20% VIP bonus
            }
            
            return baseChance;
        }

        // === 🔌 API HOOKS FOR OTHER PLUGINS ===
        
        [HookMethod("EldrunLoot_GetPlayerLootData")]
        public PlayerLootData API_GetPlayerLootData(ulong userId)
        {
            return GetPlayerData(userId);
        }
        
        [HookMethod("EldrunLoot_GiveMagicItem")]
        public bool API_GiveMagicItem(BasePlayer player, string itemId)
        {
            if (player == null || !_magicItems.ContainsKey(itemId)) return false;
            GiveMagicItem(player, itemId);
            return true;
        }
        
        [HookMethod("EldrunLoot_AddLuckBonus")]
        public void API_AddLuckBonus(BasePlayer player, int amount)
        {
            if (player == null) return;
            var playerData = GetPlayerData(player.userID);
            playerData.LuckBonus = Math.Min(playerData.LuckBonus + amount, _config.MaxLuckBonus);
        }
        
        [HookMethod("EldrunLoot_IsEnabled")]
        public bool API_IsEnabled()
        {
            return _config.Enabled;
        }
    }
}

