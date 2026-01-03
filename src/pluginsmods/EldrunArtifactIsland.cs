using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using Oxide.Game.Rust.Cui;

namespace Oxide.Plugins
{
    [Info("EldrunArtifactIsland", "SirEldrun", "36187")]
    [Description("ArtifactIsland System - BETA")]
    public class EldrunArtifactIsland : RustPlugin
    {
        [PluginReference] private Plugin EldrunLocale;
        
        private string GetLocalizedMessage(string key, BasePlayer player = null, Dictionary<string, string> vars = null)
        {
            if (EldrunLocale != null)
            {
                return EldrunLocale.Call<string>("Eldrun_Translate", key, player, vars) ?? $"[Missing: {key}]";
            }
            return $"[{key}]";
        }
        
        // Centralized localized logging helper
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
        [PluginReference]
        private Plugin EldrunCore;
        [PluginReference]
        private Plugin EldrunBridgeGates;

        private const string AdminPerm = "eldrunartifactisland.admin";
        private const string UsePerm = "eldrunartifactisland.use";
        private const string TeleportPerm = "eldrunartifactisland.teleport";
        
        // SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        private const string PanelName = "EldrunArtifactIslandUI";
        private const string AdminPanelName = "EldrunArtifactIslandAdminUI";
        private const string HUDPanelName = "EldrunArtifactIslandHUD";
        
        // UI Tab System
        private enum UITab { Info, Stats, Players, Events, Admin }
        private readonly Dictionary<ulong, UITab> _playerCurrentTab = new Dictionary<ulong, UITab>();

        private class IslandConfig
        {
            public bool Enabled = true;
            public string ChatPrefix = "<color=#D4AF37><b>[ARTIFACT ISLAND]</b></color>";
            
            public float TickSeconds = 0.5f;
            public float BounceBackMeters = 2.5f;
            public bool NotifyOnBlock = true;
            
            public bool EnableStormwallDamage = true;
            public float StormwallDamagePerSecond = 1f;
            public float StormwallTickRate = 1f; // Damage every X seconds
            public bool ShowStormwallWarning = true;
            public bool ShowStormwallEffects = true;
            public string StormwallWarningMessage = "The Artifact Island Stormwall is damaging you! 1 HP/second!";
            public string StormwallEnterMessage = "You are entering the dangerous Stormwall Zone!";
            public string StormwallExitMessage = "You left the Stormwall Zone - you are safe!";
            
            public bool TrackIslandStats = true;
            public bool LogIslandActivity = true;
            public int MaxPlayersOnIsland = 20; // Performance limit
            
            public bool ShowIslandEffects = true;
            public float EffectInterval = 5f;
            public string IslandColor = "0.8 0.2 0.2 0.3"; // Red danger zone
            
            public bool EnablePvPEvents = true;
            public float LootMultiplier = 2.0f;
            public bool EnableLootBoost = true;
            public string PvPEventMessage = "PvP Event on Artifact Island activated! Double loot!";
            
            public bool EnableTeleportCommands = true;
            public Vector3 IslandSpawnPoint = new Vector3(0f, 10f, 0f);
            public float TeleportCooldown = 300f; // 5 minutes
            
            public bool EnableAutoEvents = true;
            public float EventInterval = 1800f; // 30 minutes
            public int MinPlayersForEvent = 3;
            
            public bool EnableAutoBackup = true;
            public float BackupInterval = 3600f; // 1 hour
            public int MaxBackups = 24; // Keep 24 backups

            // Configurable Zone IDs
            public string IslandZoneId = "artifact_island";
            public string CorridorZoneId1 = "artifact_corridor_team1";
            public string CorridorZoneId2 = "artifact_corridor_team2";

            // HUD Overlay
            public bool EnableHudOverlay = true;
            public float HudUpdateInterval = 2f;
        }

        private class IslandData
        {
            public Dictionary<ulong, PlayerIslandInfo> PlayerStats = new Dictionary<ulong, PlayerIslandInfo>();
            public Dictionary<string, int> DailyStats = new Dictionary<string, int>();
            public int TotalEntriesBlocked = 0;
            public int TotalPlayersKilled = 0;
            public int TotalDamageDealt = 0;
            public DateTime LastReset = DateTime.Now;
            // Maintain backup file names for rotation
            public List<string> Backups = new List<string>();
        }
        
        private class PlayerIslandInfo
        {
            public ulong UserId;
            public string PlayerName;
            public int TimesEntered = 0;
            public int TimesBlocked = 0;
            public float TotalTimeOnIsland = 0f;
            public float TotalDamageTaken = 0f;
            public DateTime LastEntry = DateTime.MinValue;
            public DateTime FirstEntry = DateTime.Now;
            public bool IsCurrentlyOnIsland = false;
            public DateTime CurrentEntryTime = DateTime.Now;
        }

        private IslandConfig _config;
        private IslandData _data;
        private readonly Dictionary<ulong, Vector3> _lastPos = new Dictionary<ulong, Vector3>();
        private readonly Dictionary<ulong, bool> _lastInArtifact = new Dictionary<ulong, bool>();
        private readonly Dictionary<ulong, DateTime> _lastStormwallDamage = new Dictionary<ulong, DateTime>();
        private readonly Dictionary<ulong, DateTime> _lastWarningMessage = new Dictionary<ulong, DateTime>();
        private Timer _tick;
        private Timer _stormwallTick;
        private Timer _saveTimer; // Optimiert: Batch Save System
        private Timer _eventTimer;
        private Timer _backupTimer;
        private Timer _effectTimer;
        private Timer _hudTimer;
        private bool _dataChanged = false;
        private bool _islandEventActive = false;
        private DateTime? _eventEndTime = null;
        private readonly Dictionary<ulong, DateTime> _teleportCooldowns = new Dictionary<ulong, DateTime>();
        private readonly HashSet<ulong> _playersInEvent = new HashSet<ulong>();
        // Throttle for block notifications to avoid spam at border
        private readonly Dictionary<ulong, DateTime> _lastBlockNotice = new Dictionary<ulong, DateTime>();

        private Dictionary<string, string> GetThemeColors()
        {
            return new Dictionary<string, string>
            {
                ["Background"] = "0.03 0.05 0.08 0.95",
                ["Panel"] = "0.04 0.07 0.12 0.90",
                ["HeaderFooter"] = "0.05 0.25 0.45 0.95",
                ["Accent"] = "0.18 0.45 0.80 1",
                ["AccentSoft"] = "0.18 0.45 0.80 0.85",
                ["Button"] = "0.08 0.15 0.25 0.95",
                ["ButtonActive"] = "0.18 0.45 0.80 0.95",
                ["ButtonDanger"] = "0.75 0.20 0.25 0.95",
                ["TextPrimary"] = "0.92 0.96 1 1",
                ["TextSecondary"] = "0.82 0.88 0.96 1",
                ["TextMuted"] = "0.70 0.78 0.88 1"
            };
        }

        protected override void LoadDefaultConfig()
        {
            _config = new IslandConfig();
            LogLocalizedMessage("artifactisland._eldrunartifactisland__created_default_configuration_");
        }

        private void LoadConfigValues()
        {
            try
            {
                _config = Config.ReadObject<IslandConfig>();
                if (_config == null) throw new Exception("Config null");
            }
            catch
            {
                LogLocalizedMessage("artifactisland._eldrunartifactisland__invalid_config__creating_defaults_");
                _config = new IslandConfig();
                SaveConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);
        
        private void LoadData()
        {
            try { _data = Interface.Oxide.DataFileSystem.ReadObject<IslandData>("eldrun_artifactisland_data") ?? new IslandData(); }
            catch { _data = new IslandData(); }
        }

        private void SaveData() => Interface.Oxide.DataFileSystem.WriteObject("eldrun_artifactisland_data", _data);

        private void Init()
        {
            LoadConfigValues(); // Load config FIRST!
            LoadData();
            permission.RegisterPermission(AdminPerm, this);
            permission.RegisterPermission(UsePerm, this);
            permission.RegisterPermission(TeleportPerm, this);
            
            cmd.AddChatCommand("island", this, "CmdIsland");
            cmd.AddChatCommand("insel", this, "CmdInselDE");
            cmd.AddChatCommand("artefaktinsel", this, "CmdInselDE");
            cmd.AddChatCommand("islandtp", this, "CmdIslandTeleport");
            cmd.AddChatCommand("islandadmin", this, "CmdIslandAdmin");
            
            LogLocalizedMessage("artifactisland.message", null);
        }

        private void OnServerInitialized()
        {
            if (_config != null && _config.Enabled)
            {
                _tick = timer.Every(Mathf.Max(0.1f, _config.TickSeconds), Tick);
                
                if (_config.EnableStormwallDamage)
                {
                    _stormwallTick = timer.Every(Mathf.Max(0.1f, _config.StormwallTickRate), StormwallDamageTick);
                    LogLocalizedMessage("artifactisland._eldrunartifactisland__stormwall_damage_system_activated___1_hp_second_on_island_");
                }
                
                _saveTimer = timer.Every(30f, () => {
                    if (_dataChanged)
                    {
                        SaveData();
                        _dataChanged = false;
                    }
                });
                
                if (_config.EnableAutoEvents)
                {
                    _eventTimer = timer.Every(_config.EventInterval, TriggerAutoEvent);
                }
                
                if (_config.EnableAutoBackup)
                {
                    _backupTimer = timer.Every(_config.BackupInterval, CreateBackup);
                }
                
                if (_config.ShowIslandEffects)
                {
                    _effectTimer = timer.Every(_config.EffectInterval, ShowIslandEffects);
                }

                if (_config.EnableHudOverlay)
                {
                    _hudTimer = timer.Every(Mathf.Max(0.5f, _config.HudUpdateInterval), UpdateHUDForAll);
                }
            }
        }

        private void Unload()
        {
            _lastPos.Clear();
            _lastInArtifact.Clear();
            _lastStormwallDamage.Clear();
            _lastWarningMessage.Clear();
            try { _tick?.Destroy(); } catch { }
            try { _stormwallTick?.Destroy(); } catch { }
            try { _saveTimer?.Destroy(); } catch { }
            try { _eventTimer?.Destroy(); } catch { }
            try { _backupTimer?.Destroy(); } catch { }
            try { _effectTimer?.Destroy(); } catch { }
            try { _hudTimer?.Destroy(); } catch { }
            _tick = null;
            _stormwallTick = null;
            _saveTimer = null;
            _eventTimer = null;
            _backupTimer = null;
            _effectTimer = null;
            _hudTimer = null;
            SaveData(); // Final save on unload
        }

        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            _lastPos.Remove(player.userID);
            _lastInArtifact.Remove(player.userID);
            _lastStormwallDamage.Remove(player.userID);
            _lastWarningMessage.Remove(player.userID);
            _lastBlockNotice.Remove(player.userID);
            // Ensure any open UIs are closed cleanly
            try { CuiHelper.DestroyUi(player, PanelName); } catch {}
            try { CuiHelper.DestroyUi(player, AdminPanelName); } catch {}
            try { CuiHelper.DestroyUi(player, HUDPanelName); } catch {}
            
            if (_data.PlayerStats.TryGetValue(player.userID, out var playerInfo) && playerInfo.IsCurrentlyOnIsland)
            {
                playerInfo.IsCurrentlyOnIsland = false;
                playerInfo.TotalTimeOnIsland += (float)(DateTime.Now - playerInfo.CurrentEntryTime).TotalSeconds;
                _dataChanged = true; // Optimiert: Batch Save
            }
            // Do not send chat/UI on disconnect to avoid noise
            
            if (_config.LogIslandActivity)
            {
                LogLocalizedMessage("artifactisland.message", null);
            }
        }

        private void Tick()
        {
            if (!_config.Enabled) return;
            var list = BasePlayer.activePlayerList;
            if (list == null) return;

            foreach (var player in list)
            {
                if (player == null || player.IsDead() || player.IsSleeping()) continue;

                Vector3 pos = player.transform.position;
                bool inArtifact = InZone(pos, _config.IslandZoneId);
                bool wasInArtifact = _lastInArtifact.TryGetValue(player.userID, out var prev) && prev;

                _lastPos[player.userID] = pos;
                _lastInArtifact[player.userID] = inArtifact;

                if (!wasInArtifact && inArtifact)
                {
                    bool inCorridor = InZone(pos, _config.CorridorZoneId1) || InZone(pos, _config.CorridorZoneId2);
                    bool gatesOpen = AreGatesOpen();
                    
                    if (!(gatesOpen && inCorridor))
                    {
                        Vector3 dest = GetBounceDestination(player, pos);
                        SafeTeleport(player, dest);
                        
                        var playerInfo = GetPlayerInfo(player);
                        playerInfo.TimesBlocked++;
                        _data.TotalEntriesBlocked++;
                        _dataChanged = true; // Optimiert: Batch Save
                        
                        if (_config.NotifyOnBlock)
                        {
                            var now = DateTime.Now;
                            if (!_lastBlockNotice.TryGetValue(player.userID, out var last) || (now - last).TotalSeconds >= 5f)
                            {
                                var msg = GetLocalizedMessage("artifact.block", player) ?? "Access to Artifact Island only through bridge corridors when gates are open.";
                                SendReply(player, $"{_config.ChatPrefix} {msg}");
                                _lastBlockNotice[player.userID] = now;
                            }
                        }
                        
                        if (_config.LogIslandActivity)
                        {
                            LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["gatesOpen"] = gatesOpen.ToString(), ["inCorridor"] = inCorridor.ToString() });
                        }
                    }
                    else
                    {
                        // Enforce MaxPlayersOnIsland
                        if (Eldrun_GetPlayersOnIsland() >= _config.MaxPlayersOnIsland)
                        {
                            Vector3 dest = GetBounceDestination(player, pos);
                            SafeTeleport(player, dest);
                            if (_config.NotifyOnBlock)
                            {
                                var fullMsg = GetLocalizedMessage("artifactisland.full", player) ?? "Island is full. Please try again later.";
                                SendReply(player, $"{_config.ChatPrefix} {fullMsg}");
                            }
                            continue;
                        }
                        var playerInfo = GetPlayerInfo(player);
                        playerInfo.TimesEntered++;
                        playerInfo.LastEntry = DateTime.Now;
                        playerInfo.IsCurrentlyOnIsland = true;
                        playerInfo.CurrentEntryTime = DateTime.Now;
                        
                        if (_config.ShowStormwallWarning)
                        {
                            var enterMsg = GetLocalizedMessage("artifactisland.stormwall.enter", player) ?? "You are entering the dangerous Stormwall Zone!";
                            SendReply(player, $"{_config.ChatPrefix} {enterMsg}");
                        }
                        
                        if (_config.LogIslandActivity)
                        {
                            LogLocalizedMessage("artifactisland.message", null);
                        }
                        
                        _dataChanged = true; // Optimiert: Batch Save
                    }
                }
                
                if (wasInArtifact && !inArtifact)
                {
                    var playerInfo = GetPlayerInfo(player);
                    if (playerInfo.IsCurrentlyOnIsland)
                    {
                        playerInfo.IsCurrentlyOnIsland = false;
                        playerInfo.TotalTimeOnIsland += (float)(DateTime.Now - playerInfo.CurrentEntryTime).TotalSeconds;
                        _dataChanged = true; // Optimiert: Batch Save
                    }
                    if (_config.ShowStormwallWarning)
                    {
                        var exitMsg2 = GetLocalizedMessage("artifactisland.stormwall.exit", player) ?? "✅ You left the Stormwall Zone - you are safe!";
                        SendReply(player, $"{_config.ChatPrefix} {exitMsg2}");
                    }
                        
                    if (_config.LogIslandActivity)
                    {
                        LogLocalizedMessage("artifactisland.message", null);
                    }
                }

                // Track event participants live
                if (_islandEventActive)
                {
                    if (inArtifact) _playersInEvent.Add(player.userID);
                    else _playersInEvent.Remove(player.userID);
                }
            }
        }
        
        private void StormwallDamageTick()
        {
            if (!_config.Enabled || !_config.EnableStormwallDamage) return;
            
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (player == null || player.IsDead() || player.IsSleeping()) continue;
                
                Vector3 pos = player.transform.position;
                bool inArtifact = InZone(pos, _config.IslandZoneId);
                
                if (inArtifact)
                {
                    float damage = _config.StormwallDamagePerSecond * _config.StormwallTickRate;
                    
                    try
                    {
                        player.Hurt(damage, Rust.DamageType.Radiation, null, false);
                        
                        var playerInfo = GetPlayerInfo(player);
                        playerInfo.TotalDamageTaken += damage;
                        _data.TotalDamageDealt += (int)damage;
                        
                        if (_config.ShowStormwallWarning)
                        {
                            var now = DateTime.Now;
                            if (!_lastWarningMessage.TryGetValue(player.userID, out var lastWarning) || 
                                (now - lastWarning).TotalSeconds >= 5f)
                            {
                                var warningMsg = GetLocalizedMessage("artifactisland.stormwall.warning", player) ?? "The Artifact Island Stormwall is damaging you! 1 HP/second!";
                                SendReply(player, $"{_config.ChatPrefix} {warningMsg}");
                                _lastWarningMessage[player.userID] = now;
                            }
                        }
                        
                        if (player.IsDead())
                        {
                            _data.TotalPlayersKilled++;
                            if (_config.LogIslandActivity)
                            {
                                LogLocalizedMessage("artifactisland.message", null);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["ex"] = ex.ToString() });
                    }
                }
            }
            
            _dataChanged = true;
        }
        
        private PlayerIslandInfo GetPlayerInfo(BasePlayer player)
        {
            if (!_data.PlayerStats.TryGetValue(player.userID, out var info))
            {
                info = new PlayerIslandInfo
                {
                    UserId = player.userID,
                    PlayerName = player.displayName,
                    FirstEntry = DateTime.Now
                };
                _data.PlayerStats[player.userID] = info;
            }
            
            info.PlayerName = player.displayName;
            return info;
        }

        [ChatCommand("artifactisland")]
        private void CmdIslandLegacy(BasePlayer player, string command, string[] args) => CmdIsland(player, command, args);
        
        [ChatCommand("insel")]
        private void CmdInselDE(BasePlayer player, string command, string[] args) => CmdIsland(player, command, args);
        
        [ChatCommand("island")]  
        private void CmdIsland(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;

            if (!permission.UserHasPermission(player.UserIDString, UsePerm))
            {
                var noPermMsg = GetLocalizedMessage("core.no_permission", player) ?? "You do not have permission to use this.";
                SendReply(player, noPermMsg);
                return;
            }

            if (args == null || args.Length == 0)
            {
                OpenIslandUI(player);
                return;
            }
            
            var sub = args[0].ToLowerInvariant();
            switch (sub)
            {
                case "stats":
                    ShowIslandStats(player);
                    break;
                case "damage":
                    if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) 
                    { 
                        var noPermMsg = GetLocalizedMessage("core.no_permission", player) ?? "You do not have permission to use this.";
                        SendReply(player, noPermMsg); 
                        return; 
                    }
                    if (args.Length < 2 || !bool.TryParse(args[1], out var on)) 
                    { 
                        SendReply(player, $"{_config.ChatPrefix} Usage: /island damage <true|false>"); 
                        return; 
                    }
                    _config.EnableStormwallDamage = on; 
                    if (on && _stormwallTick == null)
                    {
                        _stormwallTick = timer.Every(Mathf.Max(0.1f, _config.StormwallTickRate), StormwallDamageTick);
                    }
                    else if (!on && _stormwallTick != null)
                    {
                        _stormwallTick.Destroy();
                        _stormwallTick = null;
                    }
                    SaveConfig();
                    SendReply(player, $"{_config.ChatPrefix} Stormwall Damage: {(on ? "✅ Active (1 HP/s)" : "❌ Inactive")}");
                    break;
                default:
                    ShowIslandHelp(player);
                    break;
            }
        }
        private void OpenIslandUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, PanelName);
            
            if (!_playerCurrentTab.ContainsKey(player.userID))
                _playerCurrentTab[player.userID] = UITab.Info;
            
            var theme = GetThemeColors();
            var container = new CuiElementContainer();
            
            container.Add(new CuiPanel
            {
                Image = { Color = theme["Background"] },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" },
                CursorEnabled = true
            }, "Overlay", PanelName);
            
            BuildIslandHeader(ref container, player, theme);
            BuildIslandFooter(ref container, player, theme);
            BuildIslandSidebar(ref container, player, theme);
            BuildIslandContent(ref container, player, theme);
            
            CuiHelper.AddUi(player, container);
        }

        // Track time on island on death and respawn to ensure clean session end
        private void OnPlayerDeath(BasePlayer player, HitInfo info)
        {
            if (player == null) return;
            if (_data.PlayerStats.TryGetValue(player.userID, out var playerInfo) && playerInfo.IsCurrentlyOnIsland)
            {
                playerInfo.IsCurrentlyOnIsland = false;
                playerInfo.TotalTimeOnIsland += (float)(DateTime.Now - playerInfo.CurrentEntryTime).TotalSeconds;
                _dataChanged = true;
            }
        }

        private void OnPlayerRespawned(BasePlayer player)
        {
            if (player == null) return;
            // nothing specific; session closed on death
        }
        
        private void BuildIslandHeader(ref CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            int playersOnIsland = 0;
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (p != null && !p.IsDead() && InZone(p.transform.position, _config.IslandZoneId))
                    playersOnIsland++;
            }
            var gatesOpen = AreGatesOpen();
            
            container.Add(new CuiPanel
            {
                Image = { Color = theme["Panel"] },
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.81 0.99" }
            }, PanelName, "HeaderPanel");
            
            // Vollflächiger blauer Header-Balken wie bei Kits
            container.Add(new CuiPanel
            {
                Image = { Color = theme["HeaderFooter"] },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "HeaderPanel");
            
            // Globaler Eldrun-Header-Text für ArtifactIsland System
            var gatesStatus = gatesOpen ? "OPEN" : "CLOSED";
            var stormStatus = _config.EnableStormwallDamage ? "ON" : "OFF";
            var headerText = $"⚔ EldrunRust BETA  | 📦 ArtifactIsland System | 👤 Players: {playersOnIsland} | ⚔ Gates: {gatesStatus} | 💀 Stormwall: {stormStatus} | 🏝 Island";

            container.Add(new CuiLabel
            {
                Text = { Text = headerText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = theme["TextPrimary"] },
                RectTransform = { AnchorMin = "0.03 0.15", AnchorMax = "0.96 0.85" }
            }, "HeaderPanel");

            // Header-Actions oben rechts: Refresh (links), Close (rechts) – EldrunKits-Style (Neon Green / Neon Red)
            container.Add(new CuiButton
            {
                Button = { Color = "0 0.4 0.2 0.9", Command = "artifactisland.ui.refresh", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.84 0.91", AnchorMax = "0.91 0.99" },
                Text = { Text = "🔄 REFRESH", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" }
            }, PanelName);

            container.Add(new CuiButton
            {
                Button = { Color = "0.4 0 0 0.9", Command = "artifactisland.ui.close", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.92 0.91", AnchorMax = "0.99 0.99" },
                Text = { Text = "❌ CLOSE", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 0.3 0.3 1" }
            }, PanelName);
        }
        
        private void BuildIslandFooter(ref CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            container.Add(new CuiPanel
            {
                Image = { Color = theme["Panel"] },
                RectTransform = { AnchorMin = "0.02 0.02", AnchorMax = "0.81 0.10" }
            }, PanelName, "FooterPanel");
            
            container.Add(new CuiPanel
            {
                Image = { Color = theme["HeaderFooter"] },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "FooterPanel");
            
            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            container.Add(new CuiLabel
            {
                Text = { Text = footerText, FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.02 0.1", AnchorMax = "0.98 0.9" }
            }, "FooterPanel");
        }
        
        private void BuildIslandSidebar(ref CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            container.Add(new CuiPanel
            {
                Image = { Color = theme["Panel"] },
                RectTransform = { AnchorMin = "0.82 0.15", AnchorMax = "0.97 0.87" }
            }, PanelName, "SidebarPanel");
            
            var currentTab = _playerCurrentTab[player.userID];
            float yPos = 0.82f;
            float btnHeight = 0.10f;
            float spacing = 0.015f;
            
            AddTabButton(ref container, "SidebarPanel", "📋\nINFO", UITab.Info, currentTab == UITab.Info, yPos, theme);
            yPos -= btnHeight + spacing;
            
            AddTabButton(ref container, "SidebarPanel", "📊\nSTATS", UITab.Stats, currentTab == UITab.Stats, yPos, theme);
            yPos -= btnHeight + spacing;
            
            AddTabButton(ref container, "SidebarPanel", "👥\nPLAYERS", UITab.Players, currentTab == UITab.Players, yPos, theme);
            yPos -= btnHeight + spacing;
            
            AddTabButton(ref container, "SidebarPanel", "🎮\nEVENTS", UITab.Events, currentTab == UITab.Events, yPos, theme);
            yPos -= btnHeight + spacing;

            // Utility-Bereich unten rechts: Help / Settings / Close, keine Doppel-Buttons im Header
        }
        
        private void AddTabButton(ref CuiElementContainer container, string parent, string text, UITab tab, bool isActive, float yPos, Dictionary<string, string> theme)
        {
            var color = isActive ? theme["ButtonActive"] : theme["Button"];
            var textColor = isActive ? "0 0 0 1" : theme["TextPrimary"];
            
            container.Add(new CuiButton
            {
                Button = { Color = color, Command = $"artifactisland.ui.tab {tab}" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.10f}", AnchorMax = $"0.95 {yPos}" },
                Text = { Text = text, FontSize = 11, Align = TextAnchor.MiddleCenter, Color = textColor }
            }, parent);
        }
        
        private void BuildIslandContent(ref CuiElementContainer container, BasePlayer player, Dictionary<string, string> theme)
        {
            container.Add(new CuiPanel
            {
                Image = { Color = theme["Panel"] },
                RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.81 0.89" }
            }, PanelName, "ContentPanel");
            
            var currentTab = _playerCurrentTab[player.userID];
            
            switch (currentTab)
            {
                case UITab.Info:
                    BuildInfoTab(ref container, player);
                    break;
                case UITab.Stats:
                    BuildStatsTab(ref container, player);
                    break;
                case UITab.Players:
                    BuildPlayersTab(ref container, player);
                    break;
                case UITab.Events:
                    BuildEventsTab(ref container, player);
                    break;
                case UITab.Admin:
                    if (permission.UserHasPermission(player.UserIDString, AdminPerm))
                        BuildAdminTab(ref container, player);
                    break;
            }
        }
        
        private void BuildInfoTab(ref CuiElementContainer container, BasePlayer player)
        {
            int playersOnIsland = 0;
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (p != null && !p.IsDead() && InZone(p.transform.position, _config.IslandZoneId))
                    playersOnIsland++;
            }
            var gatesOpen = AreGatesOpen();
            var playerInfo = GetPlayerInfo(player);
            
            var yPos = 0.88f;
            var lineHeight = 0.10f;
            
            // Gates Status - LARGE
            var gateColor = gatesOpen ? "0.28 0.88 0.38 1" : "0.88 0.28 0.28 1";
            var gateStatusText = gatesOpen ? (GetLocalizedMessage("artifactisland.ui.gates_open", player) ?? "🟢 GATES OPEN") : (GetLocalizedMessage("artifactisland.ui.gates_closed", player) ?? "🔴 GATES CLOSED");
            container.Add(new CuiLabel
            {
                Text = { Text = $"🚧 {gateStatusText}", FontSize = 20, Align = TextAnchor.MiddleCenter, Color = gateColor },
                RectTransform = { AnchorMin = $"0.05 {yPos - lineHeight}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= lineHeight + 0.04f;
            
            // Players on Island
            var playersLabel = GetLocalizedMessage("artifactisland.ui.players_on_island", player) ?? "👥 Players on Island: {count}";
            playersLabel = playersLabel.Replace("{count}", playersOnIsland.ToString());
            container.Add(new CuiLabel
            {
                Text = { Text = playersLabel, FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.06f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.10f;
            
            // Stormwall Status
            var stormColor = _config.EnableStormwallDamage ? "0.92 0.68 0.28 1" : "0.6 0.6 0.6 1";
            var stormStatusText = _config.EnableStormwallDamage ? (GetLocalizedMessage("artifactisland.ui.stormwall_on", player) ?? "⚡ STORMWALL ACTIVE (1 HP/s)") : (GetLocalizedMessage("artifactisland.ui.stormwall_off", player) ?? "⚡ STORMWALL INACTIVE");
            container.Add(new CuiLabel
            {
                Text = { Text = stormStatusText, FontSize = 14, Align = TextAnchor.MiddleLeft, Color = stormColor },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.06f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            // STATISTIKEN TITEL
            var statsTitle = GetLocalizedMessage("artifactisland.ui.stats_title", player) ?? "📊 YOUR STATISTICS:";
            container.Add(new CuiLabel
            {
                Text = { Text = statsTitle, FontSize = 16, Align = TextAnchor.MiddleLeft, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.06f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.10f;
            
            // Detaillierte Stats - 2 Spalten
            var visitsLabel = GetLocalizedMessage("artifactisland.ui.visits", player) ?? "🏝️ Visits: {count}";
            visitsLabel = visitsLabel.Replace("{count}", playerInfo.TimesEntered.ToString());
            container.Add(new CuiLabel
            {
                Text = { Text = visitsLabel, FontSize = 13, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.48 {yPos}" }
            }, "ContentPanel");
            
            var blockedLabel = GetLocalizedMessage("artifactisland.ui.blocked", player) ?? "⛔ Blocked: {count}";
            blockedLabel = blockedLabel.Replace("{count}", playerInfo.TimesBlocked.ToString());
            container.Add(new CuiLabel
            {
                Text = { Text = blockedLabel, FontSize = 13, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.52 {yPos - 0.05f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.08f;
            
            var damageLabel = GetLocalizedMessage("artifactisland.ui.damage", player) ?? "💔 Damage: {hp} HP";
            damageLabel = damageLabel.Replace("{hp}", playerInfo.TotalDamageTaken.ToString("0.1"));
            container.Add(new CuiLabel
            {
                Text = { Text = damageLabel, FontSize = 13, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.48 {yPos}" }
            }, "ContentPanel");
            
            var timeLabel = GetLocalizedMessage("artifactisland.ui.time", player) ?? "⏱️ Time: {seconds}s";
            timeLabel = timeLabel.Replace("{seconds}", playerInfo.TotalTimeOnIsland.ToString("0.1"));
            container.Add(new CuiLabel
            {
                Text = { Text = timeLabel, FontSize = 13, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.52 {yPos - 0.05f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
        }
        
        private void BuildStatsTab(ref CuiElementContainer container, BasePlayer player)
        {
            var yPos = 0.85f;
            container.Add(new CuiLabel
            {
                Text = { Text = "📊 ISLAND STATISTICS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.08f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            container.Add(new CuiLabel
            {
                Text = { Text = $"🚫 Total Blocked: {_data.TotalEntriesBlocked}\n💀 Total Kills: {_data.TotalPlayersKilled}\n💔 Total Damage: {_data.TotalDamageDealt} HP\n📅 Last Reset: {_data.LastReset:dd.MM.yyyy HH:mm}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.20f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
        }
        
        private void BuildPlayersTab(ref CuiElementContainer container, BasePlayer player)
        {
            var yPos = 0.85f;
            container.Add(new CuiLabel
            {
                Text = { Text = "👥 PLAYERS ON ISLAND", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.08f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            int shown = 0;
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (p != null && !p.IsDead() && InZone(p.transform.position, _config.IslandZoneId))
                {
                    container.Add(new CuiLabel
                    {
                        Text = { Text = $"👤 {p.displayName}", FontSize = 13, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                        RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.95 {yPos}" }
                    }, "ContentPanel");
                    yPos -= 0.06f;
                    shown++;
                    if (shown >= 15) break;
                }
            }
            if (shown == 0)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = "No players on the island", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.6 0.6 0.6 1" },
                    RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.50" }
                }, "ContentPanel");
            }
        }
        
        private void BuildEventsTab(ref CuiElementContainer container, BasePlayer player)
        {
            var yPos = 0.85f;
            container.Add(new CuiLabel
            {
                Text = { Text = "🎮 ISLAND EVENTS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.08f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            var eventStatus = _islandEventActive ? "🟢 EVENT ACTIVE" : "🔴 NO EVENT";
            var eventColor = _islandEventActive ? "0.28 0.88 0.38 1" : "0.88 0.28 0.28 1";
            container.Add(new CuiLabel
            {
                Text = { Text = eventStatus, FontSize = 16, Align = TextAnchor.MiddleCenter, Color = eventColor },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.08f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            if (_islandEventActive)
            {
                var remaining = GetEventRemainingSeconds();
                var mm = (int)(remaining / 60);
                var ss = (int)(remaining % 60);
                var countdown = $"⌛ {mm:00}:{ss:00}";
                container.Add(new CuiLabel
                {
                    Text = { Text = $"⚔️ PvP Event Running!\n💰 Loot Multiplier: {_config.LootMultiplier}x\n👥 Participants: {_playersInEvent.Count}\n{countdown}", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.96 0.96 0.99 1" },
                    RectTransform = { AnchorMin = $"0.05 {yPos - 0.15f}", AnchorMax = $"0.95 {yPos}" }
                }, "ContentPanel");
            }
        }
        
        private void BuildAdminTab(ref CuiElementContainer container, BasePlayer player)
        {
            var yPos = 0.85f;
            container.Add(new CuiLabel
            {
                Text = { Text = "🛠️ ADMIN CONTROLS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.08f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.12f;
            
            // Toggle Buttons (using unified AddToggleButton; yPos indicates top anchor, so pass bottom=yPos-0.08)
            float itemHeight = 0.08f;
            AddToggleButton(container, "ContentPanel", "🏝️ Plugin Enabled", _config.Enabled, "enabled", yPos - itemHeight);
            yPos -= itemHeight;
            AddToggleButton(container, "ContentPanel", "⚡ Stormwall Damage", _config.EnableStormwallDamage, "stormwall", yPos - itemHeight);
            yPos -= itemHeight;
            AddToggleButton(container, "ContentPanel", "🎮 Auto Events", _config.EnableAutoEvents, "events", yPos - itemHeight);
            yPos -= itemHeight;
            AddToggleButton(container, "ContentPanel", "✈️ Teleport System", _config.EnableTeleportCommands, "teleport", yPos - itemHeight);
            yPos -= itemHeight;
            AddToggleButton(container, "ContentPanel", "⚔️ PvP Events", _config.EnablePvPEvents, "pvp", yPos - itemHeight);
            yPos -= 0.12f;
            
            // Event Controls
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.8 0.2 0.9", Command = "island.event start" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.06f}", AnchorMax = $"0.47 {yPos}" },
                Text = { Text = "🎮 START EVENT", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            
            container.Add(new CuiButton
            {
                Button = { Color = "0.8 0.2 0.2 0.9", Command = "island.event stop" },
                RectTransform = { AnchorMin = $"0.53 {yPos - 0.06f}", AnchorMax = $"0.95 {yPos}" },
                Text = { Text = "⏹️ STOP EVENT", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");

            // Zone Configuration Section
            yPos -= 0.14f;
            container.Add(new CuiLabel
            {
                Text = { Text = "🔧 ZONE CONFIGURATION", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = "1 0.88 0.42 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.06f}", AnchorMax = $"0.95 {yPos}" }
            }, "ContentPanel");
            yPos -= 0.08f;

            // Island Zone Row
            container.Add(new CuiLabel
            {
                Text = { Text = $"Island Zone ID: {_config.IslandZoneId}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.60 {yPos}" }
            }, "ContentPanel");
            container.Add(new CuiElement
            {
                Name = "IslandZoneInput",
                Parent = "ContentPanel",
                Components =
                {
                    new CuiInputFieldComponent { Command = "island.setzone island", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1", Text = _config.IslandZoneId },
                    new CuiRectTransformComponent { AnchorMin = $"0.62 {yPos - 0.05f}", AnchorMax = $"0.83 {yPos}" }
                }
            });
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.2 0.2 0.9", Command = "island.setzone.reset island" },
                RectTransform = { AnchorMin = $"0.85 {yPos - 0.05f}", AnchorMax = $"0.91 {yPos}" },
                Text = { Text = "Reset", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.5 0.8 0.9", Command = "island.setzone.frompos island" },
                RectTransform = { AnchorMin = $"0.92 {yPos - 0.05f}", AnchorMax = $"0.98 {yPos}" },
                Text = { Text = "Use Pos", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            yPos -= 0.08f;

            // Corridor 1 Row
            container.Add(new CuiLabel
            {
                Text = { Text = $"Corridor #1 ID: {_config.CorridorZoneId1}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.60 {yPos}" }
            }, "ContentPanel");
            container.Add(new CuiElement
            {
                Name = "Corridor1Input",
                Parent = "ContentPanel",
                Components =
                {
                    new CuiInputFieldComponent { Command = "island.setzone corr1", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1", Text = _config.CorridorZoneId1 },
                    new CuiRectTransformComponent { AnchorMin = $"0.62 {yPos - 0.05f}", AnchorMax = $"0.83 {yPos}" }
                }
            });
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.2 0.2 0.9", Command = "island.setzone.reset corr1" },
                RectTransform = { AnchorMin = $"0.85 {yPos - 0.05f}", AnchorMax = $"0.91 {yPos}" },
                Text = { Text = "Reset", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.5 0.8 0.9", Command = "island.setzone.frompos corr1" },
                RectTransform = { AnchorMin = $"0.92 {yPos - 0.05f}", AnchorMax = $"0.98 {yPos}" },
                Text = { Text = "Use Pos", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            yPos -= 0.08f;

            // Corridor 2 Row
            container.Add(new CuiLabel
            {
                Text = { Text = $"Corridor #2 ID: {_config.CorridorZoneId2}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.96 0.96 0.99 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.60 {yPos}" }
            }, "ContentPanel");
            container.Add(new CuiElement
            {
                Name = "Corridor2Input",
                Parent = "ContentPanel",
                Components =
                {
                    new CuiInputFieldComponent { Command = "island.setzone corr2", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1", Text = _config.CorridorZoneId2 },
                    new CuiRectTransformComponent { AnchorMin = $"0.62 {yPos - 0.05f}", AnchorMax = $"0.83 {yPos}" }
                }
            });
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.2 0.2 0.9", Command = "island.setzone.reset corr2" },
                RectTransform = { AnchorMin = $"0.85 {yPos - 0.05f}", AnchorMax = $"0.91 {yPos}" },
                Text = { Text = "Reset", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.5 0.8 0.9", Command = "island.setzone.frompos corr2" },
                RectTransform = { AnchorMin = $"0.92 {yPos - 0.05f}", AnchorMax = $"0.98 {yPos}" },
                Text = { Text = "Use Pos", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "ContentPanel");
        }

        private void ShowIslandEffects()
        {
            if (!_config.ShowIslandEffects) return;
            
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (player == null || player.IsDead()) continue;
                
                if (InZone(player.transform.position, _config.IslandZoneId))
                {
                    // Danger zone effect (localized)
                    var tip = GetLocalizedMessage("artifactisland.ui.danger_tip", player) ?? "⚡ DANGER ZONE ⚡";
                    if (_islandEventActive)
                    {
                        var remaining = GetEventRemainingSeconds();
                        var mm = (int)(remaining / 60);
                        var ss = (int)(remaining % 60);
                        tip = $"{tip}\n⌛ {mm:00}:{ss:00}";
                    }
                    player.SendConsoleCommand("gametip.showgametip", tip);
                }
            }
        }

        private void CreateBackup()
        {
            if (!_config.EnableAutoBackup) return;
            
            try
            {
                string timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
                string backupName = $"eldrun_artifactisland_backup_{timestamp}";
                Interface.Oxide.DataFileSystem.WriteObject(backupName, _data);
                
                // Track backups and rotate
                if (!_data.Backups.Contains(backupName))
                    _data.Backups.Add(backupName);
                _dataChanged = true;
                
                // Cleanup old backups by count; attempt to remove datafiles if API supports
                while (_data.Backups.Count > _config.MaxBackups)
                {
                    var toRemove = _data.Backups[0];
                    _data.Backups.RemoveAt(0);
                    _dataChanged = true;
                    try
                    {
                        // Some Oxide environments provide Remove for data files; if unavailable, ignore
                        var dfs = Interface.Oxide.DataFileSystem;
                        var mi = dfs.GetType().GetMethod("Remove", new Type[] { typeof(string) });
                        if (mi != null)
                        {
                            mi.Invoke(dfs, new object[] { toRemove });
                        }
                    }
                    catch { }
                }

                if (_config.LogIslandActivity)
                {
                    LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["backupName"] = backupName.ToString() });
                }
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["ex"] = ex.ToString() });
            }
        }
        
        private void ToggleStormwallDamage(bool enabled)
        {
            if (enabled && _stormwallTick == null)
            {
                _stormwallTick = timer.Every(Mathf.Max(0.1f, _config.StormwallTickRate), StormwallDamageTick);
            }
            else if (!enabled && _stormwallTick != null)
            {
                _stormwallTick.Destroy();
                _stormwallTick = null;
            }
            _dataChanged = true;
        }
        
        private void ToggleAutoEvents(bool enabled)
        {
            if (enabled && _eventTimer == null)
            {
                _eventTimer = timer.Every(_config.EventInterval, TriggerAutoEvent);
            }
            else if (!enabled && _eventTimer != null)
            {
                _eventTimer.Destroy();
                _eventTimer = null;
            }
            _dataChanged = true;
        }
        
        private void ToggleEffects(bool enabled)
        {
            if (enabled && _effectTimer == null)
            {
                _effectTimer = timer.Every(_config.EffectInterval, ShowIslandEffects);
            }
            else if (!enabled && _effectTimer != null)
            {
                _effectTimer.Destroy();
                _effectTimer = null;
            }
            _dataChanged = true;
        }
        
        private void OpenAdminUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, AdminPanelName);
            
            var container = new CuiElementContainer();
            
            // Main Panel
            container.Add(new CuiPanel
            {
                Image = { Color = "0.08 0.08 0.12 0.96" },
                RectTransform = { AnchorMin = "0.1 0.1", AnchorMax = "0.9 0.9" },
                CursorEnabled = true
            }, "Overlay", AdminPanelName);
            
            // Header
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.25 0.45 0.95" },
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.98 0.98" }
            }, AdminPanelName);
            
            container.Add(new CuiLabel
            {
                Text = { Text = "👑 ARTIFACT ISLAND ADMIN PANEL", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.98 0.98" }
            }, AdminPanelName);
            
            // Toggle Buttons
            var yPos = 0.80f;
            var buttonHeight = 0.08f;
            var spacing = 0.02f;
            
            AddToggleButton(container, AdminPanelName, "🏝️ Plugin Enabled", _config.Enabled, "enabled", yPos);
            yPos -= buttonHeight + spacing;
            
            AddToggleButton(container, AdminPanelName, "⚡ Stormwall Damage", _config.EnableStormwallDamage, "stormwall", yPos);
            yPos -= buttonHeight + spacing;
            
            AddToggleButton(container, AdminPanelName, "🎮 Auto Events", _config.EnableAutoEvents, "events", yPos);
            yPos -= buttonHeight + spacing;
            
            AddToggleButton(container, AdminPanelName, "✈️ Teleport System", _config.EnableTeleportCommands, "teleport", yPos);
            yPos -= buttonHeight + spacing;
            
            AddToggleButton(container, AdminPanelName, "⚔️ PvP Events", _config.EnablePvPEvents, "pvp", yPos);
            yPos -= buttonHeight + spacing;
            
            AddToggleButton(container, AdminPanelName, "🎨 Visual Effects", _config.ShowIslandEffects, "effects", yPos);
            yPos -= buttonHeight + spacing * 2;
            
            // Event Controls
            container.Add(new CuiButton
            {
                Button = { Color = "0.2 0.8 0.2 0.9", Command = "island.event start" },
                RectTransform = { AnchorMin = $"0.05 {yPos}", AnchorMax = $"0.47 {yPos + buttonHeight}" },
                Text = { Text = "🎮 START EVENT", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, AdminPanelName);
            
            container.Add(new CuiButton
            {
                Button = { Color = "0.8 0.2 0.2 0.9", Command = "island.event stop" },
                RectTransform = { AnchorMin = $"0.53 {yPos}", AnchorMax = $"0.95 {yPos + buttonHeight}" },
                Text = { Text = "⏹️ STOP EVENT", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, AdminPanelName);
            
            // Close Button
            container.Add(new CuiButton
            {
                Button = { Color = "0.8 0.2 0.2 0.9", Command = "island.admin close" },
                RectTransform = { AnchorMin = "0.05 0.05", AnchorMax = "0.25 0.12" },
                Text = { Text = "✖ CLOSE", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, AdminPanelName);
            
            CuiHelper.AddUi(player, container);
        }
        
        private void AddToggleButton(CuiElementContainer container, string parent, string label, bool currentState, string feature, float yPos)
        {
            var buttonHeight = 0.08f;
            var color = currentState ? "0.2 0.8 0.2 0.9" : "0.8 0.2 0.2 0.9";
            var stateText = currentState ? "✓ ON" : "✖ OFF";
            
            container.Add(new CuiLabel
            {
                Text = { Text = label, FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = $"0.05 {yPos}", AnchorMax = $"0.70 {yPos + buttonHeight}" }
            }, parent);
            
            container.Add(new CuiButton
            {
                Button = { Color = color, Command = $"island.toggle {feature} {!currentState}" },
                RectTransform = { AnchorMin = $"0.75 {yPos}", AnchorMax = $"0.95 {yPos + buttonHeight}" },
                Text = { Text = stateText, FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, parent);
        }
        
        private bool InZone(Vector3 pos, string zoneId)
        {
            if (EldrunCore == null) return false;
            try
            {
                object result = EldrunCore.Call("Eldrun_IsPointInZone", pos, zoneId);
                if (result is bool b) return b;
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["ex"] = ex.ToString() });
            }
            return false;
        }

        private bool AreGatesOpen()
        {
            if (EldrunBridgeGates == null) return false;
            try
            {
                var res = EldrunBridgeGates.Call("Eldrun_GatesAreOpen");
                if (res is bool b) return b;
            }
            catch {}
            return false;
        }

        private string GetZoneIdAt(Vector3 pos)
        {
            if (EldrunCore == null) return null;
            string[] methods = new string[]
            {
                "Eldrun_GetZoneIdAtPoint",
                "Eldrun_GetZoneAtPoint",
                "Eldrun_GetZonesAtPoint",
                "Eldrun_GetZoneIdByPosition",
                "GetZoneIdAtPosition",
                "GetZoneAtPosition"
            };
            foreach (var m in methods)
            {
                try
                {
                    var res = EldrunCore.Call(m, pos);
                    if (res == null) continue;
                    if (res is string s && !string.IsNullOrEmpty(s)) return s;
                    var arr = res as object[];
                    if (arr != null && arr.Length > 0 && arr[0] is string s1 && !string.IsNullOrEmpty(s1)) return s1;
                    var list = res as List<object>;
                    if (list != null && list.Count > 0 && list[0] is string s2 && !string.IsNullOrEmpty(s2)) return s2;
                    var dict = res as Dictionary<string, object>;
                    if (dict != null)
                    {
                        if (dict.TryGetValue("ZoneID", out var z1) && z1 is string zs1 && !string.IsNullOrEmpty(zs1)) return zs1;
                        if (dict.TryGetValue("ZoneId", out var z2) && z2 is string zs2 && !string.IsNullOrEmpty(zs2)) return zs2;
                        if (dict.TryGetValue("zoneid", out var z3) && z3 is string zs3 && !string.IsNullOrEmpty(zs3)) return zs3;
                        if (dict.TryGetValue("id", out var z4) && z4 is string zs4 && !string.IsNullOrEmpty(zs4)) return zs4;
                    }
                    var idict = res as System.Collections.IDictionary;
                    if (idict != null)
                    {
                        foreach (var key in new object[] { "ZoneID", "ZoneId", "zoneid", "id" })
                        {
                            if (idict.Contains(key))
                            {
                                var v = idict[key];
                                if (v is string zs && !string.IsNullOrEmpty(zs)) return zs;
                            }
                        }
                    }
                }
                catch { }
            }
            return null;
        }

        private Vector3 GetBounceDestination(BasePlayer player, Vector3 current)
        {
            Vector3 center = Vector3.zero;
            Vector3 dirOut = (current - center);
            dirOut.y = 0f;
            if (dirOut.sqrMagnitude < 0.0001f)
            {
                dirOut = new Vector3(1f, 0f, 0f);
            }
            dirOut.Normalize();
            return current + (dirOut) * Mathf.Abs(_config.BounceBackMeters);
        }

        private void SafeTeleport(BasePlayer player, Vector3 dest)
        {
            try
            {
                player.Teleport(dest);
                player.SendNetworkUpdateImmediate();
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("artifactisland.message", new Dictionary<string, string> { ["ex"] = ex.ToString() });
            }
        }
        [ChatCommand("islandtp")]
        private void CmdIslandTeleport(BasePlayer player, string command, string[] args)
        {
            if (!permission.UserHasPermission(player.UserIDString, TeleportPerm))
            {
                var noPermMsg = GetLocalizedMessage("core.no_permission", player) ?? "You do not have permission to use this.";
                SendReply(player, noPermMsg);
                return;
            }
            if (!_config.EnableTeleportCommands)
            {
                var msg = GetLocalizedMessage("artifactisland.teleport.disabled", player) ?? "Teleport system is disabled!";
                SendReply(player, $"{_config.ChatPrefix} {msg}");
                return;
            }
            if (_teleportCooldowns.TryGetValue(player.userID, out var lastTp))
            {
                var remaining = _config.TeleportCooldown - (DateTime.Now - lastTp).TotalSeconds;
                if (remaining > 0)
                {
                    var seconds = Math.Max(0, Math.Floor(remaining)).ToString();
                    var cooldownMsg = GetLocalizedMessage("artifactisland.teleport.cooldown", player) ?? "Cooldown: {seconds}s remaining!";
                    cooldownMsg = cooldownMsg.Replace("{seconds}", seconds);
                    SendReply(player, $"{_config.ChatPrefix} {cooldownMsg}");
                    return;
                }
            }
            SafeTeleport(player, _config.IslandSpawnPoint);
            _teleportCooldowns[player.userID] = DateTime.Now;
            var successMsg = GetLocalizedMessage("artifactisland.teleport.success", player) ?? "Teleported to Artifact Island!";
            SendReply(player, $"{_config.ChatPrefix} {successMsg}");
        }

        [ChatCommand("islandadmin")]
        private void CmdIslandAdmin(BasePlayer player, string command, string[] args)
        {
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm))
            {
                var noPermMsg = GetLocalizedMessage("core.no_permission", player) ?? "You do not have permission to use this.";
                SendReply(player, noPermMsg);
                return;
            }
            OpenAdminUI(player);
        }
        [ConsoleCommand("artifactisland.ui.close")]
        private void CCUIClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            CuiHelper.DestroyUi(player, PanelName);
            _playerCurrentTab.Remove(player.userID);
        }

        [ConsoleCommand("artifactisland.ui.help")]
        private void CCUIHelp(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowIslandHelp(player);
        }

        [ConsoleCommand("artifactisland.ui.settings")]
        private void CCUISettings(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (permission.UserHasPermission(player.UserIDString, AdminPerm))
            {
                OpenAdminUI(player);
                return;
            }
            var noPermMsg = GetLocalizedMessage("core.no_permission", player) ?? "You do not have permission to use this.";
            SendReply(player, noPermMsg);
        }

        [ConsoleCommand("artifactisland.ui.tab")]
        private void CCUITab(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            var tabName = arg.GetString(0, "Info");
            if (Enum.TryParse<UITab>(tabName, true, out var tab))
            {
                _playerCurrentTab[player.userID] = tab;
                OpenIslandUI(player);
            }
        }

        [ConsoleCommand("artifactisland.ui.refresh")]
        private void CCUIRefresh(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            OpenIslandUI(player);
        }

        [ConsoleCommand("island")]
        private void CCIsland(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            var sub = arg.GetString(0, "");
            switch (sub.ToLowerInvariant())
            {
                case "close":
                    CuiHelper.DestroyUi(player, PanelName);
                    _playerCurrentTab.Remove(player.userID);
                    break;
                case "stats":
                    _playerCurrentTab[player.userID] = UITab.Stats;
                    OpenIslandUI(player);
                    break;
                case "refresh":
                    OpenIslandUI(player);
                    break;
            }
        }
        private void ShowIslandStatus(BasePlayer player)
        {
            int playersOnIsland = Eldrun_GetPlayersOnIsland();
            var gatesOpen = AreGatesOpen();
            var playerInfo = GetPlayerInfo(player);
            var headerMsg = GetLocalizedMessage("artifactisland.status.header", player) ?? "🏝️ ARTIFACT ISLAND STATUS:";
            SendReply(player, $"{_config.ChatPrefix} {headerMsg}");
            var gateStatusText = gatesOpen ? (GetLocalizedMessage("artifactisland.ui.gates_open", player) ?? "🟢 OPEN") : (GetLocalizedMessage("artifactisland.ui.gates_closed", player) ?? "🔴 CLOSED");
            var gatesMsg = (GetLocalizedMessage("artifactisland.ui.gates", player) ?? "🚺 Bridge Gates: {status}").Replace("{status}", gateStatusText);
            SendReply(player, gatesMsg);
            var playersMsg = (GetLocalizedMessage("artifactisland.ui.players_on_island", player) ?? "👥 Players on Island: {count}").Replace("{count}", playersOnIsland.ToString());
            SendReply(player, playersMsg);
            var stormStatusText = _config.EnableStormwallDamage ? (GetLocalizedMessage("artifactisland.ui.stormwall_on", player) ?? "🟢 ACTIVE (1 HP/s)") : (GetLocalizedMessage("artifactisland.ui.stormwall_off", player) ?? "🔴 INACTIVE");
            var stormMsg = (GetLocalizedMessage("artifactisland.ui.stormwall", player) ?? "⚡ Stormwall Damage: {status}").Replace("{status}", stormStatusText);
            SendReply(player, stormMsg);
            var visitsMsg = (GetLocalizedMessage("artifactisland.ui.visits", player) ?? "🏝️ Visits: {count}").Replace("{count}", playerInfo.TimesEntered.ToString());
            SendReply(player, visitsMsg);
            var damageMsg = (GetLocalizedMessage("artifactisland.ui.damage", player) ?? "💔 Damage: {hp} HP").Replace("{hp}", playerInfo.TotalDamageTaken.ToString("0.1"));
            SendReply(player, damageMsg);
        }

        private void ShowIslandStats(BasePlayer player)
        {
            var statsHeader = GetLocalizedMessage("artifactisland.stats.header", player) ?? "📊 ISLAND STATISTICS:";
            SendReply(player, $"{_config.ChatPrefix} {statsHeader}");
            var blockedMsg = (GetLocalizedMessage("artifactisland.stats.blocked", player) ?? "⛔ Blocked Entries: {count}").Replace("{count}", _data.TotalEntriesBlocked.ToString());
            SendReply(player, blockedMsg);
            var killedMsg = (GetLocalizedMessage("artifactisland.stats.killed", player) ?? "💀 Deaths by Stormwall: {count}").Replace("{count}", _data.TotalPlayersKilled.ToString());
            SendReply(player, killedMsg);
            var damageStatsMsg = (GetLocalizedMessage("artifactisland.stats.damage", player) ?? "💔 Total Damage: {hp} HP").Replace("{hp}", _data.TotalDamageDealt.ToString());
            SendReply(player, damageStatsMsg);
            var trackedMsg = (GetLocalizedMessage("artifactisland.stats.tracked_players", player) ?? "👥 Tracked Players: {count}").Replace("{count}", _data.PlayerStats.Count.ToString());
            SendReply(player, trackedMsg);
            var resetMsg = (GetLocalizedMessage("artifactisland.stats.last_reset", player) ?? "📅 Last Reset: {date}").Replace("{date}", _data.LastReset.ToString("dd.MM.yyyy HH:mm"));
            SendReply(player, resetMsg);
        }

        private void ShowIslandHelp(BasePlayer player)
        {
            var helpHeader = GetLocalizedMessage("artifactisland.help.header", player) ?? "🏝️ ARTIFACT ISLAND COMMANDS:";
            SendReply(player, $"{_config.ChatPrefix} {helpHeader}");
            var cmdStatus = GetLocalizedMessage("artifactisland.help.cmd.status", player) ?? "/island - Show island status";
            SendReply(player, cmdStatus);
            var cmdStats = GetLocalizedMessage("artifactisland.help.cmd.stats", player) ?? "/island stats - Show statistics";
            SendReply(player, cmdStats);
            if (permission.UserHasPermission(player.UserIDString, TeleportPerm))
            {
                var cmdTp = GetLocalizedMessage("artifactisland.help.cmd.teleport", player) ?? "/islandtp - Teleport to island (if allowed)";
                SendReply(player, cmdTp);
            }
            if (permission.UserHasPermission(player.UserIDString, AdminPerm))
            {
                var cmdAdmin = GetLocalizedMessage("artifactisland.help.cmd.admin", player) ?? "/islandadmin - Open Admin Panel";
                SendReply(player, cmdAdmin);
            }
        }
        [ConsoleCommand("island.admin")]
        private void CCIslandAdmin(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var action = arg.GetString(0, "");
            switch (action.ToLowerInvariant())
            {
                case "main":
                    CuiHelper.DestroyUi(player, AdminPanelName);
                    OpenAdminUI(player);
                    break;
                case "close":
                    CuiHelper.DestroyUi(player, AdminPanelName);
                    break;
            }
        }

        [ConsoleCommand("island.toggle")]
        private void CCToggleFeature(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var feature = arg.GetString(0, "");
            var enabled = arg.GetBool(1, false);
            switch (feature.ToLowerInvariant())
            {
                case "enabled":
                    _config.Enabled = enabled;
                    if (enabled && _tick == null) _tick = timer.Every(Mathf.Max(0.1f, _config.TickSeconds), Tick);
                    if (!enabled && _tick != null) { _tick.Destroy(); _tick = null; }
                    break;
                case "stormwall":
                    _config.EnableStormwallDamage = enabled;
                    ToggleStormwallDamage(enabled);
                    break;
                case "events":
                    _config.EnableAutoEvents = enabled;
                    ToggleAutoEvents(enabled);
                    break;
                case "teleport":
                    _config.EnableTeleportCommands = enabled;
                    break;
                case "pvp":
                    _config.EnablePvPEvents = enabled;
                    break;
                case "effects":
                    _config.ShowIslandEffects = enabled;
                    ToggleEffects(enabled);
                    break;
                case "hud":
                    _config.EnableHudOverlay = enabled;
                    if (enabled && _hudTimer == null) _hudTimer = timer.Every(Mathf.Max(0.5f, _config.HudUpdateInterval), UpdateHUDForAll);
                    if (!enabled && _hudTimer != null) { _hudTimer.Destroy(); _hudTimer = null; }
                    break;
            }
            SaveConfig();
            NextTick(() => OpenAdminUI(player));
        }

        [ConsoleCommand("island.event")]
        private void CCIslandEvent(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var action = arg.GetString(0, "");
            switch (action.ToLowerInvariant())
            {
                case "start":
                    StartIslandEvent();
                    SendReply(player, $"{_config.ChatPrefix} ✅ Island Event has been started!");
                    break;
                case "stop":
                    StopIslandEvent();
                    SendReply(player, $"{_config.ChatPrefix} ❌ Island Event has been stopped!");
                    break;
            }
            NextTick(() => OpenAdminUI(player));
        }

        [ConsoleCommand("island.setzone")]
        private void CCIslandSetZone(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var target = arg.GetString(0, "").ToLowerInvariant();
            var newId = arg.GetString(1, "");
            if (string.IsNullOrEmpty(target) || string.IsNullOrEmpty(newId))
            {
                SendReply(player, $"{_config.ChatPrefix} Usage: enter the new ID in the input field and press Enter.");
                return;
            }
            switch (target)
            {
                case "island":
                    _config.IslandZoneId = newId;
                    break;
                case "corr1":
                    _config.CorridorZoneId1 = newId;
                    break;
                case "corr2":
                    _config.CorridorZoneId2 = newId;
                    break;
                default:
                    SendReply(player, $"{_config.ChatPrefix} Invalid target: {target}");
                    return;
            }
            SaveConfig();
            SendReply(player, $"{_config.ChatPrefix} Zone updated: {target} = {newId}");
            NextTick(() =>
            {
                if (_playerCurrentTab.TryGetValue(player.userID, out var tab) && tab == UITab.Admin)
                    OpenIslandUI(player);
                OpenAdminUI(player);
            });
        }

        [ConsoleCommand("island.setzone.reset")]
        private void CCIslandSetZoneReset(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var target = arg.GetString(0, "").ToLowerInvariant();
            switch (target)
            {
                case "island":
                    _config.IslandZoneId = "artifact_island";
                    break;
                case "corr1":
                    _config.CorridorZoneId1 = "artifact_corridor_team1";
                    break;
                case "corr2":
                    _config.CorridorZoneId2 = "artifact_corridor_team2";
                    break;
                default:
                    SendReply(player, $"{_config.ChatPrefix} Invalid target: {target}");
                    return;
            }
            SaveConfig();
            SendReply(player, $"{_config.ChatPrefix} Zone reset: {target}");
            NextTick(() =>
            {
                if (_playerCurrentTab.TryGetValue(player.userID, out var tab) && tab == UITab.Admin)
                    OpenIslandUI(player);
                OpenAdminUI(player);
            });
        }

        [ConsoleCommand("island.setzone.frompos")]
        private void CCIslandSetZoneFromPos(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var target = arg.GetString(0, "").ToLowerInvariant();
            var pos = player.transform.position;
            var zoneId = GetZoneIdAt(pos);
            if (string.IsNullOrEmpty(zoneId))
            {
                SendReply(player, $"{_config.ChatPrefix} No zone detected at your position.");
                return;
            }
            switch (target)
            {
                case "island":
                    _config.IslandZoneId = zoneId;
                    break;
                case "corr1":
                    _config.CorridorZoneId1 = zoneId;
                    break;
                case "corr2":
                    _config.CorridorZoneId2 = zoneId;
                    break;
                default:
                    SendReply(player, $"{_config.ChatPrefix} Invalid target: {target}");
                    return;
            }
            SaveConfig();
            SendReply(player, $"{_config.ChatPrefix} Zone updated from position: {target} = {zoneId}");
            NextTick(() =>
            {
                if (_playerCurrentTab.TryGetValue(player.userID, out var tab) && tab == UITab.Admin)
                    OpenIslandUI(player);
                OpenAdminUI(player);
            });
        }
        private void TriggerAutoEvent()
        {
            if (!_config.EnableAutoEvents || _islandEventActive) return;
            int playersOnline = BasePlayer.activePlayerList.Count;
            if (playersOnline < _config.MinPlayersForEvent) return;
            StartIslandEvent();
        }

        private void StartIslandEvent()
        {
            if (_islandEventActive) return;
            _islandEventActive = true;
            _playersInEvent.Clear();
            _eventEndTime = DateTime.Now.AddMinutes(10);
            var startMsg = _config.PvPEventMessage ?? "Artifact Island Event started!";
            Server.Broadcast($"{_config.ChatPrefix} {startMsg}");
            // Auto-stop after 10 minutes (600s) to align with countdown
            timer.Once(600f, StopIslandEvent);
        }

        private void StopIslandEvent()
        {
            if (!_islandEventActive) return;
            _islandEventActive = false;
            _playersInEvent.Clear();
            _eventEndTime = null;
            var endMsg = "⏰ Island Event ended!";
            Server.Broadcast($"{_config.ChatPrefix} {endMsg}");
        }

        private double GetEventRemainingSeconds()
        {
            if (!_islandEventActive || _eventEndTime == null) return 0;
            var remaining = (_eventEndTime.Value - DateTime.Now).TotalSeconds;
            if (remaining < 0) remaining = 0;
            return remaining;
        }
        private void UpdateHUDForAll()
        {
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (p == null || p.IsDead()) continue;
                BuildHUDOverlay(p);
            }
        }

        private void BuildHUDOverlay(BasePlayer player)
        {
            // HUD oben im Radarbereich vollständig deaktiviert:
            // vorhandenes HUD-Panel entfernen, aber kein neues mehr zeichnen.
            try { CuiHelper.DestroyUi(player, HUDPanelName); } catch {}
        }
        
        public bool Eldrun_IsEventActive() => _islandEventActive;
        public float Eldrun_GetLootMultiplier() => _islandEventActive && _config.EnableLootBoost ? _config.LootMultiplier : 1.0f;
        public int Eldrun_GetPlayersOnIsland()
        {
            int count = 0;
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (player != null && !player.IsDead() && InZone(player.transform.position, _config.IslandZoneId))
                    count++;
            }
            return count;
        }
        
        public Dictionary<string, object> Eldrun_GetIslandStats()
        {
            return new Dictionary<string, object>
            {
                ["enabled"] = _config.Enabled,
                ["playersOnIsland"] = Eldrun_GetPlayersOnIsland(),
                ["eventActive"] = _islandEventActive,
                ["totalBlocked"] = _data.TotalEntriesBlocked,
                ["totalKilled"] = _data.TotalPlayersKilled,
                ["totalDamage"] = _data.TotalDamageDealt
            };
        }
    }
}
