using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using System.Globalization;

namespace Oxide.Plugins
{
    [Info("EldrunBridgeGates", "SirEldrun", "36187")]
    [Description("BrigeGates System - BETA")]
    public class EldrunBridgeGates : RustPlugin
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
        [PluginReference]
        private Plugin EldrunCore;
        [PluginReference]
        private Plugin EldrunFraktion;

        private const string AdminPerm = "eldrunbridgegates.admin";
        private const string UsePerm = "eldrunbridgegates.use";
        
        // 👑 SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        private const string DataFileName = "eldrun_bridgegates";

        private class GateConfig
        {
            public bool Enabled = true;
            public string ChatPrefix = "[BRIDGE GATES]";
            
            // === GATE TIMING SYSTEM ===
            public float MinOpenMinutes = 15f; // Minimum gate open time
            public float MaxOpenMinutes = 45f; // Maximum gate open time  
            public float MinIntervalHours = 1f; // Minimum time between openings
            public float MaxIntervalHours = 3f; // Maximum time between openings
            public float TickRate = 0.5f;
            
            // === GATE DANGER SYSTEM ===
            public bool KillOnClosedGate = true; // Kill players when gates are closed
            public float ClosedGateKillDamage = 10000f; // Instant death damage
            public bool ShowDeathMessages = true;
            public bool LogGateDeaths = true;
            
            // === ANNOUNCEMENTS ===
            public bool AnnounceToChat = true;
            public bool AnnounceOpenings = true;
            public bool AnnounceClosings = true;
            public bool AnnounceWarnings = true;
            public float WarningMinutesBefore = 5f; // Warn 5 minutes before closing
            
            // === VISUAL EFFECTS ===
            public bool EnableVisuals = true;
            public bool ShowGateEffects = true;
            public bool PlayGateSounds = true;
            
            // === GATE RECTANGLES ===
            public RectXZ GateRectTeam1 = new RectXZ
            {
                MinX = -50f, MinZ = -100f, MaxX = 50f, MaxZ = -50f
            };
            public RectXZ GateRectTeam2 = new RectXZ
            {
                MinX = -50f, MinZ = 50f, MaxX = 50f, MaxZ = 100f
            };
            
            // === BRIDGE CHECKPOINT RECTANGLES ===
            public RectXZ CheckpointRectTeam1 = new RectXZ
            {
                MinX = -60f, MinZ = -110f, MaxX = 60f, MaxZ = -40f
            };
            public RectXZ CheckpointRectTeam2 = new RectXZ
            {
                MinX = -60f, MinZ = 40f, MaxX = 60f, MaxZ = 110f
            };
            
            // === STATISTICS ===
            public bool TrackGateStats = true;
            public bool LogGateActivity = true;
            
            // === INTEGRATION ===
            public bool IntegrateWithCastles = true; // Integration with EldrunCastles
            public bool SyncWithFactionWars = true; // Close gates during wars
            
            // === ADVANCED FEATURES ===
            public bool EnableBridgeAnimations = true; // Animate bridge opening/closing
            public bool EnableParticleEffects = true; // Particle effects on gates
            public bool EnableSoundEffects = true; // Sound effects for gate events
            public bool EnableHUD = false; // UI removed
            public bool RequirePermissionToPass = false; // Require permission to pass through
            public bool LogPlayerPassage = false; // Log all players passing through
            public float GateOpenDistance = 200f; // Distance at which gate effects are visible
            
            // === EVENT SYSTEM ===
            public bool EnableEventSchedule = false; // Scheduled events (wars, sieges)
            public bool AutoCloseOnRaid = true; // Auto close gates during raid events
            public bool EmergencyMode = false; // Emergency lockdown capability
            
            // === ANTI-EXPLOIT ===
            public bool PreventTeleportThrough = true; // Block teleports through closed gates
            public bool PreventHorseThrough = true; // Prevent horses from passing closed gates
            public bool BlockVehicles = true; // Block all vehicles through closed gates
            public float VehicleKickForce = 1000f; // Force to push back vehicles
            
            // === CUSTOM MESSAGES ===
            public Dictionary<string, string> GateMessages = new Dictionary<string, string>
            {
                ["team1_open"] = "The North Bridge is now OPEN! Team1 can pass!",
                ["team1_close"] = "The North Bridge is CLOSING! Leave the bridge immediately!",
                ["team1_warning"] = "WARNING: The North Bridge closes in {minutes} minutes!",
                ["team2_open"] = "The South Bridge is now OPEN! Team2 can pass!",
                ["team2_close"] = "The South Bridge is CLOSING! Leave the bridge immediately!",
                ["team2_warning"] = "WARNING: The South Bridge closes in {minutes} minutes!",
                ["death"] = "was crushed by the bridge gates!",
                ["passage_allowed"] = "Bridge crossed - {player} passed through {team} gate.",
                ["passage_blocked"] = "Access denied - The gate is CLOSED!",
                ["emergency_lockdown"] = "EMERGENCY LOCKDOWN: All bridge gates are sealed!",
                ["emergency_release"] = "Emergency lockdown released. Normal operation restored.",
                ["raid_detected"] = "RAID detected! Bridge gates automatically closed.",
                ["event_start"] = "Event started: {event} - Gates reacting accordingly."
            };
        }

        private GateConfig _config;
        private GateData _data;
        // Legacy combined flags (derived)
        private bool _isOpen; // true if any team gate open
        private float _nextOpenEpoch; // next combined event (min of teams)
        private float _nextCloseEpoch; // next combined close (min of teams still open)
        // Team 1
        private bool _openTeam1;
        private float _openDuration1; // seconds
        private float _intervalDelay1; // seconds
        private float _nextOpenEpoch1;
        private float _nextCloseEpoch1;
        private Timer _tOpen1;
        private Timer _tClose1;
        // Team 2
        private bool _openTeam2;
        private float _openDuration2; // seconds
        private float _intervalDelay2; // seconds
        private float _nextOpenEpoch2;
        private float _nextCloseEpoch2;
        private Timer _tOpen2;
        private Timer _tClose2;
        private Timer _tTick;
        private Timer _tPreview;
        private bool _previewEnabled = false;
        
        // Emergency system
        private bool _emergencyLockdown = false;
        private Timer _emergencyTimer;
        
        // Event integration
        private bool _raidMode = false;
        private Dictionary<string, DateTime> _activeEvents = new Dictionary<string, DateTime>();

        private Dictionary<string,string> _theme; // from EldrunFraktion
        private Timer _saveTimer; // Batch Save System
        private bool _dataChanged = false;
        // Vehicle check throttling
        private float _nextVehicleCheck = 0f;

        private void LoadTheme()
        {
            _theme = null;
            try
            {
                if (EldrunFraktion != null)
                {
                    var r = EldrunFraktion.Call("Eldrun_GetTheme") as Dictionary<string,string>;
                    if (r != null) _theme = r;
                }
            }
            catch { }
            if (_theme == null) _theme = new Dictionary<string, string>();
        }

        private string TV(string key, string fallback)
        {
            try { if (_theme != null && _theme.TryGetValue(key, out var v) && !string.IsNullOrEmpty(v)) return v; } catch { }
            return fallback;
        }

        private class GateData
        {
            // === TEAM 1 GATE STATUS ===
            public bool IsOpen1 = false;
            public long NextOpenUnix1 = 0;
            public long NextCloseUnix1 = 0;
            
            // === TEAM 2 GATE STATUS ===
            public bool IsOpen2 = false;
            public long NextOpenUnix2 = 0;
            public long NextCloseUnix2 = 0;
            
            // === GATE STATISTICS ===
            public GateStatistics Stats = new GateStatistics();
        }
        
        private class GateStatistics
        {
            public int TotalOpenings1 = 0;
            public int TotalOpenings2 = 0;
            public int TotalDeathsGate1 = 0;
            public int TotalDeathsGate2 = 0;
            public float TotalOpenTime1 = 0f; // in seconds
            public float TotalOpenTime2 = 0f; // in seconds
            public DateTime LastOpened1 = DateTime.MinValue;
            public DateTime LastOpened2 = DateTime.MinValue;
            public DateTime LastActivity = DateTime.Now;
            public Dictionary<ulong, int> PlayerDeaths = new Dictionary<ulong, int>(); // Player death count
            public Dictionary<ulong, int> PlayerPassages = new Dictionary<ulong, int>(); // Player passage count
            public int TotalPassagesTeam1 = 0;
            public int TotalPassagesTeam2 = 0;
            public int TotalVehiclesBlocked = 0;
            public int TotalTeleportsBlocked = 0;
            public DateTime LastEmergencyLockdown = DateTime.MinValue;
            public int EmergencyLockdownCount = 0;
        }

        private class RectXZ { public float MinX; public float MinZ; public float MaxX; public float MaxZ; }

        protected override void LoadDefaultConfig()
        {
            _config = new GateConfig();
            Puts("[ELDRUN BRIDGE GATES] Default configuration created.");
        }

        private void LoadConfigValues()
        {
            try
            {
                _config = Config.ReadObject<GateConfig>();
                if (_config == null) throw new Exception("Config null");
                ValidateConfig();
            }
            catch
            {
                Puts("[ELDRUN BRIDGE GATES] Invalid config detected, creating defaults.");
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void LoadData()
        {
            try 
            { 
                _data = Interface.Oxide.DataFileSystem.ReadObject<GateData>(DataFileName) ?? new GateData();
                Puts("[ELDRUN BRIDGE GATES] Gate data loaded successfully.");
            }
            catch (Exception ex) 
            { 
                _data = new GateData(); 
                Puts($"[ELDRUN BRIDGE GATES] Failed to load data: {ex.Message}. Creating new data file.");
            }
        }

        private void SaveData()
        {
            try
            {
                Interface.Oxide.DataFileSystem.WriteObject(DataFileName, _data);
            }
            catch (Exception ex)
            {
                Puts($"[ELDRUN BRIDGE GATES] ERROR: Failed to save data: {ex.Message}");
            }
        }

        private void Init()
        {
            LoadConfigValues(); // Load config FIRST!
            LoadData();
            permission.RegisterPermission(AdminPerm, this);
            permission.RegisterPermission(UsePerm, this);
            
            // Chat Commands
            cmd.AddChatCommand("gates", this, "GatesCommand");
            
            // Subscribe to hooks
            Subscribe(nameof(OnPlayerRespawned));
            Subscribe(nameof(CanBuild));
            Subscribe(nameof(CanMoveItem));
            Subscribe(nameof(CanTeleport));
            
            Puts("[ELDRUN BRIDGE GATES] Plugin initialized successfully.");
        }

        private void OnServerInitialized()
        {
            if (_config == null)
            {
                Puts("[ELDRUN BRIDGE GATES] ERROR: Config is null in OnServerInitialized()");
                return;
            }
            
            if (!_config.Enabled) return;
            StartTicking();
            // Recover any existing schedule or create a new one
            RecoverOrSchedule();
            
            // Optimiert: Batch Save Timer - alle 30 Sekunden
            _saveTimer = timer.Every(30f, () => {
                if (_dataChanged)
                {
                    try { SaveData(); } catch { }
                    _dataChanged = false;
                    try { CleanupOldData(); } catch { }
                }
            });
            
            if (_config.EnableVisuals)
            {
                _previewEnabled = false;
                _tPreview = null;
            }
        }

        private void Unload()
        {
            try
            {
                _isOpen = false;
                _emergencyLockdown = false;
                _emergencyTimer?.Destroy();
                _saveTimer?.Destroy();
                
                // CRITICAL: Save data before unload to prevent data loss
                SaveData();
                
                Puts("[ELDRUN BRIDGE GATES] Plugin unloaded successfully.");
            }
            catch { }
        }
        
        // =================== RUST HOOKS ===================
        
        // Hook called when player spawns - check if they're in a gate area
        private void OnPlayerRespawned(BasePlayer player)
        {
            if (player == null || _config == null) return;
            
            NextTick(() =>
            {
                var pos = player.transform.position;

                if ((!_openTeam1 || _emergencyLockdown) && PointInRect(pos, _config.GateRectTeam1))
                {
                    // Teleport player to safety
                    var safePos = new Vector3(pos.x, pos.y + 10f, _config.GateRectTeam1.MinZ - 20f);
                    player.Teleport(safePos);
                    SendReply(player, $"{_config.ChatPrefix} You were moved out of the closed gate area.");
                }
                else if ((!_openTeam2 || _emergencyLockdown) && PointInRect(pos, _config.GateRectTeam2))
                {
                    var safePos = new Vector3(pos.x, pos.y + 10f, _config.GateRectTeam2.MaxZ + 20f);
                    player.Teleport(safePos);
                    SendReply(player, $"{_config.ChatPrefix} You were moved out of the closed gate area.");
                }
            });
        }
        
        // Hook for building system - prevent building in gate areas
        private object CanBuild(Planner planner, Construction prefab, Construction.Target target)
        {
            var player = planner?.GetOwnerPlayer();
            if (player == null) return null;
            
            var pos = target.position;
            if (PointInRect(pos, _config.GateRectTeam1) || PointInRect(pos, _config.GateRectTeam2))
            {
                SendReply(player, $"{_config.ChatPrefix} You cannot build in gate areas.");
                return false;
            }
            
            return null;
        }
        
        // Hook for preventing deployables in gate areas
        private object CanMoveItem(Item item, PlayerInventory playerLoot, uint targetContainer, int targetSlot, int amount)
        {
            var player = playerLoot?.GetComponent<BasePlayer>();
            if (player == null) return null;
            
            // Check if player is trying to deploy something in a gate area
            var pos = player.transform.position;
            if (item?.info?.shortname?.Contains("deployable") == true)
            {
                if (PointInRect(pos, _config.GateRectTeam1) || PointInRect(pos, _config.GateRectTeam2))
                {
                    SendReply(player, $"{_config.ChatPrefix} You cannot place items in gate areas.");
                    return false;
                }
            }
            
            return null;
        }

        private float RandRange(float min, float max)
        {
            return UnityEngine.Random.Range(min, max);
        }

        private void ScheduleNextOpen()
        {
            ScheduleNextOpenTeam(1);
            ScheduleNextOpenTeam(2);
        }

        private void OpenGates()
        {
            // Admin shortcut: open both immediately for a full random window
            OpenGateTeam(1, immediate:true);
            OpenGateTeam(2, immediate:true);
        }

        private void CloseGates()
        {
            // Admin shortcut: close both and reschedule
            CloseGateTeam(1, reschedule:true);
            CloseGateTeam(2, reschedule:true);
        }

        // =================== EXTENDED API FOR OTHER PLUGINS ===================
        public bool Eldrun_GatesAreOpen() => _isOpen && !_emergencyLockdown;
        public bool Eldrun_GateIsOpen(string which)
        {
            which = (which ?? string.Empty).ToLowerInvariant();
            if (_emergencyLockdown) return false;
            if (which == "team1") return _openTeam1;
            if (which == "team2") return _openTeam2;
            return _isOpen;
        }
        public bool Eldrun_GetEnabled() => _config?.Enabled ?? true;
        public void Eldrun_SetEnabled(bool enabled)
        {
            if (_config == null) return;
            _config.Enabled = enabled;
            CancelTimers();
            if (enabled)
            {
                StartTicking();
            }
            else
            {
                if (_isOpen)
                {
                    _isOpen = false;
                    _nextCloseEpoch = 0f;
                    if (_config.AnnounceToChat)
                    {
                        PrintToChatSafe($"{_config.ChatPrefix} The bridge gates are now closed (disabled).");
                    }
                    Puts("[ELDRUN BRIDGE GATES] Gates closed (plugin disabled).");
                    TryEmitCore("gates.close", null);
                }
            }
        }
        
        // Emergency System API
        public void Eldrun_EmergencyLockdown(float durationMinutes = 0f)
        {
            _emergencyLockdown = true;
            _data.Stats.EmergencyLockdownCount++;
            _data.Stats.LastEmergencyLockdown = DateTime.Now;
            _dataChanged = true;
            
            if (_config.AnnounceToChat)
            {
                PrintToChatSafe($"{_config.ChatPrefix} {_config.GateMessages["emergency_lockdown"]}");
            }
            Puts("[ELDRUN BRIDGE GATES] Emergency lockdown activated.");
            TryEmitCore("gates.emergency.lockdown", null);
            
            if (durationMinutes > 0)
            {
                _emergencyTimer?.Destroy();
                _emergencyTimer = timer.Once(durationMinutes * 60f, () => Eldrun_EmergencyRelease());
            }
        }
        
        public void Eldrun_EmergencyRelease()
        {
            _emergencyLockdown = false;
            _emergencyTimer?.Destroy();
            _emergencyTimer = null;
            
            if (_config.AnnounceToChat)
            {
                PrintToChatSafe($"{_config.ChatPrefix} {_config.GateMessages["emergency_release"]}");
            }
            Puts("[ELDRUN BRIDGE GATES] Emergency lockdown released.");
            TryEmitCore("gates.emergency.release", null);
        }
        
        public bool Eldrun_IsEmergencyMode() => _emergencyLockdown;
        
        // Event Integration API
        public void Eldrun_OnRaidStarted(string eventName = "Raid")
        {
            if (!_config.AutoCloseOnRaid) return;
            _raidMode = true;
            _activeEvents[eventName] = DateTime.Now;
            
            if (_config.AnnounceToChat)
            {
                var msg = _config.GateMessages["raid_detected"];
                PrintToChatSafe($"{_config.ChatPrefix} {msg}");
            }
            TryEmitCore("gates.raid.started", eventName);
            // Immediately secure gates during raid
            Eldrun_EmergencyLockdown();
        }
        
        public void Eldrun_OnRaidEnded(string eventName = "Raid")
        {
            _raidMode = false;
            _activeEvents.Remove(eventName);
            TryEmitCore("gates.raid.ended", eventName);
            if (_emergencyLockdown && _activeEvents.Count == 0)
            {
                Eldrun_EmergencyRelease();
            }
        }
        
        // Statistics API
        public object Eldrun_GetStatistics()
        {
            return new Dictionary<string, object>
            {
                ["totalOpenings1"] = _data.Stats.TotalOpenings1,
                ["totalOpenings2"] = _data.Stats.TotalOpenings2,
                ["totalDeaths1"] = _data.Stats.TotalDeathsGate1,
                ["totalDeaths2"] = _data.Stats.TotalDeathsGate2,
                ["totalPassages1"] = _data.Stats.TotalPassagesTeam1,
                ["totalPassages2"] = _data.Stats.TotalPassagesTeam2,
                ["vehiclesBlocked"] = _data.Stats.TotalVehiclesBlocked,
                ["teleportsBlocked"] = _data.Stats.TotalTeleportsBlocked,
                ["emergencyCount"] = _data.Stats.EmergencyLockdownCount,
                ["lastActivity"] = _data.Stats.LastActivity,
                ["isEmergency"] = _emergencyLockdown,
                ["isRaidMode"] = _raidMode
            };
        }
        
        // Player Passage Check API
        public bool Eldrun_CanPlayerPass(BasePlayer player, string gate = "")
        {
            if (_emergencyLockdown) return false;
            if (_config.RequirePermissionToPass && player != null && !HasPermission(player, UsePerm)) return false;
            
            gate = gate.ToLowerInvariant();
            if (gate == "team1") return _openTeam1;
            if (gate == "team2") return _openTeam2;
            
            return _isOpen;
        }

        // Permission Helper
        private bool HasPermission(BasePlayer player, string perm)
        {
            try { return IsServerAdmin(player) || permission.UserHasPermission(player.UserIDString, perm) || permission.UserHasPermission(player.UserIDString, AdminPerm); }
            catch { return false; }
        }
        
        // Chat command for users/admins
        [ChatCommand("gates")]
        private void GatesCommand(BasePlayer player, string command, string[] args)
        {
            if (player == null || !HasPermission(player, UsePerm)) return;
            if (args == null || args.Length == 0) { ShowGateStatus(player); return; }
            if (args[0].Equals("open", StringComparison.OrdinalIgnoreCase) && HasPermission(player, AdminPerm))
            {
                OpenGates();
                SendReply(player, $"{_config.ChatPrefix} All gates have been opened.");
                return;
            }
            if (args[0].Equals("close", StringComparison.OrdinalIgnoreCase) && HasPermission(player, AdminPerm))
            {
                CloseGates();
                SendReply(player, $"{_config.ChatPrefix} All gates have been closed.");
                return;
            }
            if (args[0].Equals("emergency", StringComparison.OrdinalIgnoreCase) && HasPermission(player, AdminPerm))
            {
                if (_emergencyLockdown) Eldrun_EmergencyRelease(); else Eldrun_EmergencyLockdown();
                SendReply(player, $"{_config.ChatPrefix} Emergency lockdown is now {(_emergencyLockdown ? "ACTIVE" : "INACTIVE")}.");
                return;
            }
            if (args[0].Equals("export", StringComparison.OrdinalIgnoreCase))
            {
                var a = _config.GateRectTeam1; var b = _config.GateRectTeam2;
                SendReply(player, $"[Eldrun] Gate team1: {a.MinX:0.###},{a.MinZ:0.###},{a.MaxX:0.###},{a.MaxZ:0.###}");
                SendReply(player, $"[Eldrun] Gate team2: {b.MinX:0.###},{b.MinZ:0.###},{b.MaxX:0.###},{b.MaxZ:0.###}");
                return;
            }
            // status handled below via ShowGateStatus
            if ((args[0].Equals("teamopen", StringComparison.OrdinalIgnoreCase) || args[0].Equals("teamclose", StringComparison.OrdinalIgnoreCase)) && HasPermission(player, AdminPerm))
            {
                if (args.Length < 2) { SendReply(player, $"{_config.ChatPrefix} Usage: /gates teamopen|teamclose <team1|team2>"); return; }
                var which = args[1].ToLowerInvariant();
                if (args[0].Equals("teamopen", StringComparison.OrdinalIgnoreCase))
                {
                    if (which == "team1") { CancelTeamTimers(1); OpenGateTeam(1, immediate: true); }
                    else if (which == "team2") { CancelTeamTimers(2); OpenGateTeam(2, immediate: true); }
                    else { SendReply(player, $"{_config.ChatPrefix} Use team1 or team2"); return; }
                    SendReply(player, $"{_config.ChatPrefix} Gate {which} opened.");
                }
                else
                {
                    if (which == "team1") { CancelTeamTimers(1); CloseGateTeam(1, reschedule: true); }
                    else if (which == "team2") { CancelTeamTimers(2); CloseGateTeam(2, reschedule: true); }
                    else { SendReply(player, $"{_config.ChatPrefix} Use team1 or team2"); return; }
                    SendReply(player, $"{_config.ChatPrefix} Gate {which} closed.");
                }
                return;
            }
            if (args[0].Equals("status", StringComparison.OrdinalIgnoreCase))
            {
                ShowGateStatus(player);
                return;
            }
            if (args[0].Equals("stats", StringComparison.OrdinalIgnoreCase))
            {
                ShowGateStats(player);
                return;
            }
            if (args[0].Equals("help", StringComparison.OrdinalIgnoreCase))
            {
                ShowGateHelp(player);
                return;
            }
            // Fallback help
            ShowGateHelp(player);
        }
        
        // Helper method for time formatting
        private string FormatTime(float seconds)
        {
            if (seconds <= 0) return "---";
            
            int hours = Mathf.FloorToInt(seconds / 3600f);
            int minutes = Mathf.FloorToInt((seconds % 3600f) / 60f);
            int secs = Mathf.FloorToInt(seconds % 60f);
            
            if (hours > 0) return $"{hours}h {minutes}m";
            if (minutes > 0) return $"{minutes}m {secs}s";
            return $"{secs}s";
        }
        
        private string GetStatusString()
        {
            string s1 = _openTeam1
                ? $"Team1 open for approx. {Mathf.CeilToInt(Mathf.Max(0f, _nextCloseEpoch1 - Time.realtimeSinceStartup)/60f)} min."
                : $"Team1 opens in approx. {Mathf.CeilToInt(Mathf.Max(0f, _nextOpenEpoch1 - Time.realtimeSinceStartup)/60f)} min.";
            string s2 = _openTeam2
                ? $"Team2 open for approx. {Mathf.CeilToInt(Mathf.Max(0f, _nextCloseEpoch2 - Time.realtimeSinceStartup)/60f)} min."
                : $"Team2 opens in approx. {Mathf.CeilToInt(Mathf.Max(0f, _nextOpenEpoch2 - Time.realtimeSinceStartup)/60f)} min.";
            return $"[Gates] {s1} | {s2}";
        }

        private void PrintToChatSafe(string message)
        {
            try { PrintToChat(message); } catch { Puts(message); }
        }

        private void TryEmitCore(string evt, string payload)
        {
            if (EldrunCore == null) return;
            try { EldrunCore.Call("Eldrun_CoreEmit", evt, payload); } catch { }
        }

        // Validate and normalize configuration ranges
        private void ValidateConfig()
        {
            if (_config == null) return;
            _config.MinOpenMinutes = Mathf.Max(1f, _config.MinOpenMinutes);
            _config.MaxOpenMinutes = Mathf.Max(_config.MinOpenMinutes, _config.MaxOpenMinutes);
            _config.MinIntervalHours = Mathf.Max(0.1f, _config.MinIntervalHours);
            _config.MaxIntervalHours = Mathf.Max(_config.MinIntervalHours, _config.MaxIntervalHours);
            _config.WarningMinutesBefore = Mathf.Clamp(_config.WarningMinutesBefore, 0f, Mathf.Min(_config.MaxOpenMinutes, 60f));
            // Additional clamps for extended settings
            _config.TickRate = Mathf.Clamp(_config.TickRate, 0.1f, 2.0f);
            _config.GateOpenDistance = Mathf.Clamp(_config.GateOpenDistance, 25f, 2000f);
            _config.ClosedGateKillDamage = Mathf.Max(0f, _config.ClosedGateKillDamage);
            _config.VehicleKickForce = Mathf.Clamp(_config.VehicleKickForce, 0f, 5000f);
        }

        private string T(string key, Dictionary<string,string> vars, string fallback)
        {
            try
            {
                if (EldrunLocale != null)
                {
                    var res = EldrunLocale.Call("Eldrun_Translate", key, null, vars) as string;
                    if (!string.IsNullOrEmpty(res) && !string.Equals(res, key, StringComparison.Ordinal)) return res;
                }
            }
            catch { }
            if (vars != null)
            {
                string s = fallback;
                foreach (var kv in vars)
                {
                    s = s.Replace("{" + kv.Key + "}", kv.Value ?? string.Empty);
                }
                return s;
            }
            return fallback;
        }

        // Duplicate LoadData and SaveData methods removed

        private void EnsureData()
        {
            if (_data == null) _data = new GateData();
        }

        private long NowUnix() => (long)(DateTime.UtcNow - new DateTime(1970,1,1)).TotalSeconds;

        private void RecoverOrSchedule()
        {
            EnsureData();
            var now = NowUnix();
            RecoverTeam(1, now);
            RecoverTeam(2, now);
            // If neither had valid schedule, create new schedules
            if (_tOpen1 == null && !_openTeam1 && _data.NextOpenUnix1 <= now) ScheduleNextOpenTeam(1);
            if (_tOpen2 == null && !_openTeam2 && _data.NextOpenUnix2 <= now) ScheduleNextOpenTeam(2);
        }

        private void CancelTimers()
        {
            try { _tOpen1?.Destroy(); } catch { }
            _tOpen1 = null;
            try { _tOpen2?.Destroy(); } catch { }
            _tOpen2 = null;
            try { _tClose1?.Destroy(); } catch { }
            _tClose1 = null;
            try { _tClose2?.Destroy(); } catch { }
            _tClose2 = null;
            try { _tTick?.Destroy(); } catch { }
            _tTick = null;
            try { _tPreview?.Destroy(); } catch { }
            _tPreview = null;
            UpdateCombinedFlags();
        }

        private void CancelTeamTimers(int team)
        {
            if (team == 1)
            {
                try { _tOpen1?.Destroy(); } catch { }
                _tOpen1 = null;
                try { _tClose1?.Destroy(); } catch { }
                _tClose1 = null;
            }
            else if (team == 2)
            {
                try { _tOpen2?.Destroy(); } catch { }
                _tOpen2 = null;
                try { _tClose2?.Destroy(); } catch { }
                _tClose2 = null;
            }
        }

        private void ScheduleNextOpenTeam(int team)
        {
            float delay = Mathf.Clamp(RandRange(_config.MinIntervalHours * 3600f, _config.MaxIntervalHours * 3600f), 1f, 86400f);
            long openAtUnix = NowUnix() + (long)Mathf.RoundToInt(delay);
            if (team == 1)
            {
                _openTeam1 = false;
                _intervalDelay1 = delay;
                _nextOpenEpoch1 = Time.realtimeSinceStartup + delay;
                EnsureData(); _data.NextOpenUnix1 = openAtUnix; _data.NextCloseUnix1 = 0; _data.IsOpen1 = false; _dataChanged = true;
                try { _tOpen1?.Destroy(); } catch { }
                _tOpen1 = timer.Once(delay, () => OpenGateTeam(1, immediate: false));
            }
            else if (team == 2)
            {
                _openTeam2 = false;
                _intervalDelay2 = delay;
                _nextOpenEpoch2 = Time.realtimeSinceStartup + delay;
                EnsureData(); _data.NextOpenUnix2 = openAtUnix; _data.NextCloseUnix2 = 0; _data.IsOpen2 = false; _dataChanged = true;
                try { _tOpen2?.Destroy(); } catch { }
                _tOpen2 = timer.Once(delay, () => OpenGateTeam(2, immediate: false));
            }
            UpdateCombinedFlags();
        }

        private void OpenGateTeam(int team, bool immediate)
        {
            float dur = Mathf.Clamp(RandRange(_config.MinOpenMinutes * 60f, _config.MaxOpenMinutes * 60f), 10f, 6f * 3600f);
            long closeAtUnix = NowUnix() + (long)Mathf.RoundToInt(dur);
            if (team == 1)
            {
                CancelTeamTimers(1);
                _openTeam1 = true;
                _openDuration1 = dur;
                _nextCloseEpoch1 = Time.realtimeSinceStartup + dur;
                EnsureData(); _data.IsOpen1 = true; _data.NextCloseUnix1 = closeAtUnix; _data.NextOpenUnix1 = 0; _dataChanged = true;
                _tClose1 = timer.Once(dur, () => CloseGateTeam(1, reschedule: true));
                if (_config.AnnounceToChat)
                {
                    var mins = Mathf.CeilToInt(dur/60f).ToString();
                    PrintToChatSafe($"{_config.ChatPrefix} Team1 gate is now OPEN for {mins} minutes.");
                }
                TryEmitCore("gates.team1.open", null);
                // Update statistics
                _data.Stats.TotalOpenings1++;
                _data.Stats.LastOpened1 = DateTime.Now;
                _data.Stats.LastActivity = DateTime.Now;
                // Schedule warning before closing
                ScheduleWarning(1, _config.WarningMinutesBefore);
            }
            else if (team == 2)
            {
                CancelTeamTimers(2);
                _openTeam2 = true;
                _openDuration2 = dur;
                _nextCloseEpoch2 = Time.realtimeSinceStartup + dur;
                EnsureData(); _data.IsOpen2 = true; _data.NextCloseUnix2 = closeAtUnix; _data.NextOpenUnix2 = 0; _dataChanged = true;
                _tClose2 = timer.Once(dur, () => CloseGateTeam(2, reschedule: true));
                if (_config.AnnounceToChat)
                {
                    var mins = Mathf.CeilToInt(dur/60f).ToString();
                    PrintToChatSafe($"{_config.ChatPrefix} Team2 gate is now OPEN for {mins} minutes.");
                }
                TryEmitCore("gates.team2.open", null);
                // Update statistics
                _data.Stats.TotalOpenings2++;
                _data.Stats.LastOpened2 = DateTime.Now;
                _data.Stats.LastActivity = DateTime.Now;
                // Schedule warning before closing
                ScheduleWarning(2, _config.WarningMinutesBefore);
            }
            UpdateCombinedFlags();
        }

        private void CloseGateTeam(int team, bool reschedule)
        {
            if (team == 1)
            {
                try { _tClose1?.Destroy(); } catch { }
                _tClose1 = null;
                _openTeam1 = false;
                _nextCloseEpoch1 = 0f;
                EnsureData(); _data.IsOpen1 = false; _data.NextCloseUnix1 = 0; _dataChanged = true;
                if (_config.AnnounceToChat)
                {
                    PrintToChatSafe($"{_config.ChatPrefix} Team1 gate is now CLOSED.");
                }
                TryEmitCore("gates.team1.close", null);
                if (reschedule) ScheduleNextOpenTeam(1);
            }
            else if (team == 2)
            {
                try { _tClose2?.Destroy(); } catch { }
                _tClose2 = null;
                _openTeam2 = false;
                _nextCloseEpoch2 = 0f;
                EnsureData(); _data.IsOpen2 = false; _data.NextCloseUnix2 = 0; _dataChanged = true;
                if (_config.AnnounceToChat)
                {
                    PrintToChatSafe($"{_config.ChatPrefix} Team2 gate is now CLOSED.");
                }
                TryEmitCore("gates.team2.close", null);
                if (reschedule) ScheduleNextOpenTeam(2);
            }
            UpdateCombinedFlags();
        }

        private void RecoverTeam(int team, long now)
        {
            if (_data == null) { EnsureData(); }
            if (team == 1)
            {
                CancelTeamTimers(1);
                if (_data.IsOpen1 && _data.NextCloseUnix1 > now)
                {
                    float left = Mathf.Max(1f, _data.NextCloseUnix1 - now);
                    _openTeam1 = true;
                    _nextCloseEpoch1 = Time.realtimeSinceStartup + left;
                    _tClose1 = timer.Once(left, () => CloseGateTeam(1, reschedule: true));
                }
                else if (_data.NextOpenUnix1 > now)
                {
                    float inSec = Mathf.Max(1f, _data.NextOpenUnix1 - now);
                    _openTeam1 = false;
                    _nextOpenEpoch1 = Time.realtimeSinceStartup + inSec;
                    _tOpen1 = timer.Once(inSec, () => OpenGateTeam(1, immediate: false));
                }
                else
                {
                    _openTeam1 = false; _nextOpenEpoch1 = 0f; _nextCloseEpoch1 = 0f;
                }
            }
            else if (team == 2)
            {
                CancelTeamTimers(2);
                if (_data.IsOpen2 && _data.NextCloseUnix2 > now)
                {
                    float left = Mathf.Max(1f, _data.NextCloseUnix2 - now);
                    _openTeam2 = true;
                    _nextCloseEpoch2 = Time.realtimeSinceStartup + left;
                    _tClose2 = timer.Once(left, () => CloseGateTeam(2, reschedule: true));
                }
                else if (_data.NextOpenUnix2 > now)
                {
                    float inSec = Mathf.Max(1f, _data.NextOpenUnix2 - now);
                    _openTeam2 = false;
                    _nextOpenEpoch2 = Time.realtimeSinceStartup + inSec;
                    _tOpen2 = timer.Once(inSec, () => OpenGateTeam(2, immediate: false));
                }
                else
                {
                    _openTeam2 = false; _nextOpenEpoch2 = 0f; _nextCloseEpoch2 = 0f;
                }
            }
            UpdateCombinedFlags();
        }

        private void UpdateCombinedFlags()
        {
            _isOpen = _openTeam1 || _openTeam2;
            if (_isOpen)
            {
                float nc1 = _openTeam1 ? _nextCloseEpoch1 : float.MaxValue;
                float nc2 = _openTeam2 ? _nextCloseEpoch2 : float.MaxValue;
                _nextCloseEpoch = Mathf.Min(nc1, nc2);
                _nextOpenEpoch = 0f;
            }
            else
            {
                float no1 = (!_openTeam1 && _tOpen1 != null) ? _nextOpenEpoch1 : float.MaxValue;
                float no2 = (!_openTeam2 && _tOpen2 != null) ? _nextOpenEpoch2 : float.MaxValue;
                float next = Mathf.Min(no1, no2);
                _nextOpenEpoch = (next == float.MaxValue) ? 0f : next;
                _nextCloseEpoch = 0f;
            }
        }

        private void StartTicking()
        {
            try { _tTick?.Destroy(); } catch { }
            _tTick = timer.Every(Mathf.Clamp((_config?.TickRate ?? 0.5f), 0.1f, 2.0f), TickGatesHazard);
        }

        private void TickGatesHazard()
        {
            if (_config == null || !_config.Enabled) return;
            var list = BasePlayer.activePlayerList; if (list == null) return;
            UpdateCombinedFlags();
            
            // Check for vehicles in gate areas
            if (_config.BlockVehicles)
            {
                float now = Time.realtimeSinceStartup;
                if (now >= _nextVehicleCheck)
                {
                    _nextVehicleCheck = now + 5f; // run at most every 5 seconds
                    CheckVehicleBlocking();
                }
            }
            
            foreach (var p in list)
            {
                if (p == null || p.IsDead() || p.IsSleeping()) continue;
                var pos = p.transform.position;
                
                // Track player passage through checkpoints
                CheckPlayerPassage(p, pos);
                if (!_openTeam1 && PointInRect(pos, _config.GateRectTeam1))
                {
                    if (_config.KillOnClosedGate)
                    {
                        p.Hurt(Mathf.Max(_config.ClosedGateKillDamage, p.health + 5f), Rust.DamageType.Generic, null, false);
                        // Track death statistics
                        _data.Stats.TotalDeathsGate1++;
                        if (!_data.Stats.PlayerDeaths.ContainsKey(p.userID)) _data.Stats.PlayerDeaths[p.userID] = 0;
                        _data.Stats.PlayerDeaths[p.userID]++;
                        _dataChanged = true;
                        if (_config.ShowDeathMessages && _config.AnnounceToChat)
                        {
                            var deathMsg = _config.GateMessages["death"];
                            PrintToChatSafe($"{_config.ChatPrefix} {p.displayName} {deathMsg}");
                        }
                        if (_config.LogGateDeaths)
                        {
                            Puts($"[ELDRUN BRIDGE GATES] Player {p.displayName} ({p.UserIDString}) killed by Team1 gate.");
                        }
                    }
                    else
                    {
                        p.Hurt(50f, Rust.DamageType.Generic, null, false);
                    }
                }
                if (!_openTeam2 && PointInRect(pos, _config.GateRectTeam2))
                {
                    if (_config.KillOnClosedGate)
                    {
                        p.Hurt(Mathf.Max(_config.ClosedGateKillDamage, p.health + 5f), Rust.DamageType.Generic, null, false);
                        // Track death statistics
                        _data.Stats.TotalDeathsGate2++;
                        if (!_data.Stats.PlayerDeaths.ContainsKey(p.userID)) _data.Stats.PlayerDeaths[p.userID] = 0;
                        _data.Stats.PlayerDeaths[p.userID]++;
                        _dataChanged = true;
                        if (_config.ShowDeathMessages && _config.AnnounceToChat)
                        {
                            var deathMsg = _config.GateMessages["death"];
                            PrintToChatSafe($"{_config.ChatPrefix} {p.displayName} {deathMsg}");
                        }
                        if (_config.LogGateDeaths)
                        {
                            Puts($"[ELDRUN BRIDGE GATES] Player {p.displayName} ({p.UserIDString}) killed by Team2 gate.");
                        }
                    }
                    else
                    {
                        p.Hurt(50f, Rust.DamageType.Generic, null, false);
                    }
                }
            }
        }

        private bool PointInRect(Vector3 pos, RectXZ r)
        {
            if (r == null) return false;
            float x = pos.x, z = pos.z;
            float minX = Mathf.Min(r.MinX, r.MaxX), maxX = Mathf.Max(r.MinX, r.MaxX);
            float minZ = Mathf.Min(r.MinZ, r.MaxZ), maxZ = Mathf.Max(r.MinZ, r.MaxZ);
            // Treat degenerate rectangles as inactive (not configured yet)
            if (Mathf.Abs(maxX - minX) < 0.01f || Mathf.Abs(maxZ - minZ) < 0.01f) return false;
            return (x >= minX && x <= maxX && z >= minZ && z <= maxZ);
        }

        
        // =================== VEHICLE & TELEPORT BLOCKING ===================
        private void CheckVehicleBlocking()
        {
            try
            {
                var vehicles = UnityEngine.Object.FindObjectsOfType<BaseVehicle>();
                foreach (var vehicle in vehicles)
                {
                    if (vehicle == null) continue;
                    var pos = vehicle.transform.position;
                    
                    if ((!_openTeam1 || _emergencyLockdown) && PointInRect(pos, _config.GateRectTeam1))
                    {
                        PushVehicleAway(vehicle, pos, 1);
                    }
                    else if ((!_openTeam2 || _emergencyLockdown) && PointInRect(pos, _config.GateRectTeam2))
                    {
                        PushVehicleAway(vehicle, pos, 2);
                    }
                }
            }
            catch { }
        }
        
        private void PushVehicleAway(BaseVehicle vehicle, Vector3 pos, int gateTeam)
        {
            try
            {
                _data.Stats.TotalVehiclesBlocked++;
                _dataChanged = true;
                
                // Calculate push direction (away from gate center)
                var gateRect = gateTeam == 1 ? _config.GateRectTeam1 : _config.GateRectTeam2;
                var gateCenter = new Vector3((gateRect.MinX + gateRect.MaxX) / 2f, pos.y, (gateRect.MinZ + gateRect.MaxZ) / 2f);
                var pushDir = (pos - gateCenter).normalized;
                pushDir.y = 0; // Keep horizontal
                
                var rb = vehicle.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.AddForce(pushDir * _config.VehicleKickForce, ForceMode.Impulse);
                }
                
                // Notify nearby players
                foreach (var player in BasePlayer.activePlayerList)
                {
                    if (Vector3.Distance(player.transform.position, pos) <= 50f)
                    {
                        SendReply(player, $"{_config.ChatPrefix} A vehicle was pushed back from a closed gate.");
                    }
                }
            }
            catch { }
        }
        
        // Hook for teleport plugins
        private object CanTeleport(BasePlayer player, Vector3 targetPos)
        {
            if (!_config.PreventTeleportThrough) return null;
            
            if ((!_openTeam1 || _emergencyLockdown) && PointInRect(targetPos, _config.GateRectTeam1))
            {
                _data.Stats.TotalTeleportsBlocked++;
                _dataChanged = true;
                SendReply(player, $"{_config.ChatPrefix} {_config.GateMessages["passage_blocked"]}");
                return "Gate is closed";
            }
            
            if ((!_openTeam2 || _emergencyLockdown) && PointInRect(targetPos, _config.GateRectTeam2))
            {
                _data.Stats.TotalTeleportsBlocked++;
                _dataChanged = true;
                SendReply(player, $"{_config.ChatPrefix} {_config.GateMessages["passage_blocked"]}");
                return "Gate is closed";
            }
            
            return null;
        }
        
        // =================== PLAYER PASSAGE TRACKING ===================
        private void CheckPlayerPassage(BasePlayer player, Vector3 pos)
        {
            if (!_config.LogPlayerPassage) return;
            
            // Check if player is in checkpoint areas (extended gate areas)
            bool inCheckpoint1 = PointInRect(pos, _config.CheckpointRectTeam1);
            bool inCheckpoint2 = PointInRect(pos, _config.CheckpointRectTeam2);
            
            if (!inCheckpoint1 && !inCheckpoint2) return;
            
            // Only log if gate is open and player can pass
            if (inCheckpoint1 && _openTeam1 && !_emergencyLockdown)
            {
                LogPlayerPassage(player, "Team1");
            }
            else if (inCheckpoint2 && _openTeam2 && !_emergencyLockdown)
            {
                LogPlayerPassage(player, "Team2");
            }
        }
        
        private Dictionary<ulong, DateTime> _lastPassageLog = new Dictionary<ulong, DateTime>();
        private void LogPlayerPassage(BasePlayer player, string team)
        {
            // Prevent spam - only log once per minute per player
            if (_lastPassageLog.ContainsKey(player.userID))
            {
                if ((DateTime.Now - _lastPassageLog[player.userID]).TotalSeconds < 60) return;
            }
            
            _lastPassageLog[player.userID] = DateTime.Now;
            
            // Update statistics
            if (team == "Team1") _data.Stats.TotalPassagesTeam1++;
            else _data.Stats.TotalPassagesTeam2++;
            
            if (!_data.Stats.PlayerPassages.ContainsKey(player.userID))
                _data.Stats.PlayerPassages[player.userID] = 0;
            _data.Stats.PlayerPassages[player.userID]++;
            
            _dataChanged = true;
            
            if (_config.AnnounceToChat)
            {
                var msg = _config.GateMessages["passage_allowed"];
                msg = msg.Replace("{player}", player.displayName).Replace("{team}", team);
                PrintToChatSafe($"{_config.ChatPrefix} {msg}");
            }
            
            if (_config.LogGateActivity)
            {
                Puts($"[ELDRUN BRIDGE GATES] Player {player.displayName} ({player.UserIDString}) passed through {team} gate.");
            }
        }
        
        // =================== GATE WARNING SYSTEM ===================
        private void ScheduleWarning(int team, float minutesBefore)
        {
            if (!_config.AnnounceWarnings || minutesBefore <= 0) return;
            var warningDelay = (_openTeam1 && team == 1 ? _nextCloseEpoch1 - Time.realtimeSinceStartup - (minutesBefore * 60f) : 0f);
            if (team == 2) warningDelay = (_openTeam2 ? _nextCloseEpoch2 - Time.realtimeSinceStartup - (minutesBefore * 60f) : 0f);
            if (warningDelay > 0)
            {
                timer.Once(warningDelay, () => {
                    var msg = team == 1 ? _config.GateMessages["team1_warning"] : _config.GateMessages["team2_warning"];
                    msg = msg.Replace("{minutes}", minutesBefore.ToString("0"));
                    if (_config.AnnounceToChat) PrintToChatSafe($"{_config.ChatPrefix} {msg}");
                });
            }
        }
        
        private void ShowGateStatus(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} Bridge Gates Status:");
            
            var team1Status = _data.IsOpen1 ? "OPEN" : "CLOSED";
            var team2Status = _data.IsOpen2 ? "OPEN" : "CLOSED";
            
            SendReply(player, $"North Bridge (Team 1): {team1Status}");
            SendReply(player, $"South Bridge (Team 2): {team2Status}");
            SendReply(player, "Use /gates stats to view detailed statistics.");
        }
        
        private void ShowGateStats(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} Bridge Gates Statistics:");
            SendReply(player, $"Team 1 - Openings: {_data.Stats.TotalOpenings1} | Passages: {_data.Stats.TotalPassagesTeam1}");
            SendReply(player, $"Team 2 - Openings: {_data.Stats.TotalOpenings2} | Passages: {_data.Stats.TotalPassagesTeam2}");
            SendReply(player, $"Deaths - Team 1: {_data.Stats.TotalDeathsGate1} | Team 2: {_data.Stats.TotalDeathsGate2}");
            SendReply(player, $"Blocked - Vehicles: {_data.Stats.TotalVehiclesBlocked} | Teleports: {_data.Stats.TotalTeleportsBlocked}");
            SendReply(player, $"Emergency lockdowns: {_data.Stats.EmergencyLockdownCount}");
            
            // Player-specific stats
            var playerDeaths = _data.Stats.PlayerDeaths.ContainsKey(player.userID) ? _data.Stats.PlayerDeaths[player.userID] : 0;
            var playerPassages = _data.Stats.PlayerPassages.ContainsKey(player.userID) ? _data.Stats.PlayerPassages[player.userID] : 0;
            SendReply(player, $"Your stats - Deaths: {playerDeaths} | Passages: {playerPassages}");
        }
        
        private void ShowGateHelp(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} === Bridge Gates Commands ===");
            SendReply(player, "/gates - Show gate status");
            SendReply(player, "/gates stats - Show statistics");
            SendReply(player, "/gates help - Show this help");
            
            if (HasPermission(player, AdminPerm))
            {
                SendReply(player, "\n=== ADMIN COMMANDS ===");
                SendReply(player, "/gates open|close - Open/close all gates");
                SendReply(player, "/gates teamopen|teamclose <team1|team2> - Control specific gate");
                SendReply(player, "/gates emergency - Toggle emergency lockdown");
                SendReply(player, "/gates export - Export coordinates");
                SendReply(player, "Console: eldrungates.cfg.set <key> <value> | eldrungates.cfg.toggle <key>");
            }
        }
        
        // =================== INTEGRATION HOOKS FOR OTHER PLUGINS ===================
        
        // Called by raid plugins
        private void OnRaidableBaseStarted(Vector3 raidPos)
        {
            if (!_config.AutoCloseOnRaid) return;
            
            // Check if raid is near gate areas
            float distance1 = Vector3.Distance(raidPos, GetGateCenter(_config.GateRectTeam1));
            float distance2 = Vector3.Distance(raidPos, GetGateCenter(_config.GateRectTeam2));
            
            if (distance1 <= 500f || distance2 <= 500f)
            {
                Eldrun_OnRaidStarted("RaidableBase");
            }
        }
        
        private void OnRaidableBaseEnded(Vector3 raidPos)
        {
            Eldrun_OnRaidEnded("RaidableBase");
        }
        
        // Called by faction war plugins
        private void OnFactionWarStarted(string faction1, string faction2)
        {
            if (_config.SyncWithFactionWars)
            {
                Eldrun_EmergencyLockdown(30f); // 30 minute emergency during wars
            }
        }
        
        private void OnFactionWarEnded(string faction1, string faction2)
        {
            if (_emergencyLockdown)
            {
                Eldrun_EmergencyRelease();
            }
        }
        
        // Integration with EldrunCore events
        private void OnEldrunEvent(string eventType, object data)
        {
            switch (eventType?.ToLowerInvariant())
            {
                case "siege_start":
                case "castle_siege":
                    if (_config.AutoCloseOnRaid)
                    {
                        Eldrun_OnRaidStarted(eventType);
                    }
                    break;
                    
                case "siege_end":
                case "castle_siege_end":
                    Eldrun_OnRaidEnded(eventType);
                    break;
                    
                case "server_restart_warning":
                    // Emergency lockdown before restart
                    Eldrun_EmergencyLockdown(10f);
                    break;
            }
        }
        
        private Vector3 GetGateCenter(RectXZ rect)
        {
            return new Vector3((rect.MinX + rect.MaxX) / 2f, 0f, (rect.MinZ + rect.MaxZ) / 2f);
        }
        
        // =================== CLEANUP & MAINTENANCE ===================
        
        // Clean up old statistics data
        private void CleanupOldData()
        {
            if (_data?.Stats?.PlayerDeaths != null && _data.Stats.PlayerDeaths.Count > 1000)
            {
                // Keep only the top 500 players by death count
                var deathList = new List<KeyValuePair<ulong, int>>();
                foreach (var kvp in _data.Stats.PlayerDeaths)
                {
                    deathList.Add(kvp);
                }
                deathList.Sort((a, b) => b.Value.CompareTo(a.Value));
                
                var newDeaths = new Dictionary<ulong, int>();
                var count = Math.Min(500, deathList.Count);
                for (int i = 0; i < count; i++)
                {
                    newDeaths[deathList[i].Key] = deathList[i].Value;
                }
                _data.Stats.PlayerDeaths = newDeaths;
                _dataChanged = true;
            }
            
            if (_data?.Stats?.PlayerPassages != null && _data.Stats.PlayerPassages.Count > 1000)
            {
                var passageList = new List<KeyValuePair<ulong, int>>();
                foreach (var kvp in _data.Stats.PlayerPassages)
                {
                    passageList.Add(kvp);
                }
                passageList.Sort((a, b) => b.Value.CompareTo(a.Value));
                
                var newPassages = new Dictionary<ulong, int>();
                var count = Math.Min(500, passageList.Count);
                for (int i = 0; i < count; i++)
                {
                    newPassages[passageList[i].Key] = passageList[i].Value;
                }
                _data.Stats.PlayerPassages = newPassages;
                _dataChanged = true;
            }
            
            // Clean up old passage logs
            if (_lastPassageLog.Count > 200)
            {
                var cutoff = DateTime.Now.AddHours(-1);
                var toRemove = new List<ulong>();
                foreach (var kvp in _lastPassageLog)
                {
                    if (kvp.Value < cutoff)
                        toRemove.Add(kvp.Key);
                }
                foreach (var key in toRemove)
                {
                    _lastPassageLog.Remove(key);
                }
            }
        }
        
        // Performance monitoring
        private void OnServerSave()
        {
            if (DateTime.Now.Hour == 4 && DateTime.Now.Minute < 5) // Daily at 4 AM
            {
                if (_config.LogGateActivity)
                {
                    Puts($"[ELDRUN BRIDGE GATES] Daily Summary: Team1 Opens={_data.Stats.TotalOpenings1}, Team2 Opens={_data.Stats.TotalOpenings2}, Total Deaths={_data.Stats.TotalDeathsGate1 + _data.Stats.TotalDeathsGate2}");
                }
            }
        }

        // Apply side-effects after config changes (restart timers, HUD/preview adjustments)
        private void ApplyConfigSideEffects(BasePlayer player)
        {
            ValidateConfig();
            SaveConfig();

            // Retick main loop with new tick rate if enabled
            if (_config.Enabled)
            {
                StartTicking();
            }

            // Preview/UI removed
            try { _tPreview?.Destroy(); } catch { }
            _tPreview = null;
            _previewEnabled = false;
        }

        // =================== CONFIG CONSOLE COMMANDS ===================
        [ConsoleCommand("eldrungates.cfg.set")]
        private void CfgSet(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null || !HasPermission(player, AdminPerm)) return;
            string key = arg.GetString(0, string.Empty);
            string value = arg.GetString(1, string.Empty);
            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(value)) { SendReply(player, $"{_config.ChatPrefix} Usage: eldrungates.cfg.set <key> <value>"); return; }
            bool boolVal;
            float floatVal;
            switch (key.ToLowerInvariant())
            {
                case "announcewarnings":
                    if (bool.TryParse(value, out boolVal)) _config.AnnounceWarnings = boolVal; break;
                case "warningminutesbefore":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.WarningMinutesBefore = Mathf.Max(0f, floatVal); break;
                case "killonclosedgate":
                    if (bool.TryParse(value, out boolVal)) _config.KillOnClosedGate = boolVal; break;
                case "minopenminutes":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.MinOpenMinutes = Mathf.Max(1f, floatVal); break;
                case "maxopenminutes":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.MaxOpenMinutes = Mathf.Max(1f, floatVal); break;
                case "minintervalhours":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.MinIntervalHours = Mathf.Max(0.1f, floatVal); break;
                case "maxintervalhours":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.MaxIntervalHours = Mathf.Max(0.1f, floatVal); break;
                case "enablevisuals":
                    if (bool.TryParse(value, out boolVal)) _config.EnableVisuals = boolVal; break;
                case "tickrate":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.TickRate = floatVal; break;
                case "closedgatekilldamage":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.ClosedGateKillDamage = Mathf.Max(0f, floatVal); break;
                case "announcetochat":
                    if (bool.TryParse(value, out boolVal)) _config.AnnounceToChat = boolVal; break;
                case "announceopenings":
                    if (bool.TryParse(value, out boolVal)) _config.AnnounceOpenings = boolVal; break;
                case "announceclosings":
                    if (bool.TryParse(value, out boolVal)) _config.AnnounceClosings = boolVal; break;
                case "requirepermissiontopass":
                    if (bool.TryParse(value, out boolVal)) _config.RequirePermissionToPass = boolVal; break;
                case "blockvehicles":
                    if (bool.TryParse(value, out boolVal)) _config.BlockVehicles = boolVal; break;
                case "preventteleportthrough":
                    if (bool.TryParse(value, out boolVal)) _config.PreventTeleportThrough = boolVal; break;
                case "preventhorsethrough":
                    if (bool.TryParse(value, out boolVal)) _config.PreventHorseThrough = boolVal; break;
                case "vehiclekickforce":
                    if (float.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out floatVal)) _config.VehicleKickForce = Mathf.Clamp(floatVal, 0f, 5000f); break;
                default:
                    SendReply(player, $"{_config.ChatPrefix} Unknown key: {key}"); return;
            }
            ApplyConfigSideEffects(player);
            SendReply(player, $"{_config.ChatPrefix} Set {key} = {value}");
        }

        [ConsoleCommand("eldrungates.cfg.toggle")]
        private void CfgToggle(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null || !HasPermission(player, AdminPerm)) return;
            string key = arg.GetString(0, string.Empty);
            if (string.IsNullOrEmpty(key)) { SendReply(player, $"{_config.ChatPrefix} Usage: eldrungates.cfg.toggle <key>"); return; }
            switch (key.ToLowerInvariant())
            {
                case "announcewarnings": _config.AnnounceWarnings = !_config.AnnounceWarnings; break;
                case "killonclosedgate": _config.KillOnClosedGate = !_config.KillOnClosedGate; break;
                case "enablevisuals": _config.EnableVisuals = !_config.EnableVisuals; break;
                case "announcetochat": _config.AnnounceToChat = !_config.AnnounceToChat; break;
                case "announceopenings": _config.AnnounceOpenings = !_config.AnnounceOpenings; break;
                case "announceclosings": _config.AnnounceClosings = !_config.AnnounceClosings; break;
                case "requirepermissiontopass": _config.RequirePermissionToPass = !_config.RequirePermissionToPass; break;
                case "blockvehicles": _config.BlockVehicles = !_config.BlockVehicles; break;
                case "preventteleportthrough": _config.PreventTeleportThrough = !_config.PreventTeleportThrough; break;
                case "preventhorsethrough": _config.PreventHorseThrough = !_config.PreventHorseThrough; break;
                default: SendReply(player, $"{_config.ChatPrefix} Unknown key: {key}"); return;
            }
            ApplyConfigSideEffects(player);
            var f = typeof(GateConfig).GetField(key, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            bool newVal = false; if (f != null && f.FieldType == typeof(bool)) { try { newVal = (bool)f.GetValue(_config); } catch { } }
            SendReply(player, $"{_config.ChatPrefix} Toggled {key} = {newVal.ToString().ToLowerInvariant()}");
        }
    }
}

