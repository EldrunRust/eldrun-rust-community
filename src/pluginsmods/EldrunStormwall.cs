using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using System.Globalization;
using Oxide.Game.Rust.Cui;

namespace Oxide.Plugins
{
    [Info("EldrunStormwall", "SirEldrun", "36187")]
    [Description("StormWall System - BETA")]
    public class EldrunStormwall : RustPlugin
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
        
        // UI localization helper with fallback
        private string UIL(string key, string fallback, BasePlayer player = null)
        {
            var s = GetLocalizedMessage(key, player);
            if (!string.IsNullOrEmpty(s) && s != $"[{key}]") return s;
            return fallback;
        }
        [PluginReference]
        private Plugin EldrunCore;
        [PluginReference]
        private Plugin EldrunBridgeGates;
        [PluginReference]
        private Plugin EldrunFraktion;

        private const string PanelName = "EldrunStormwallUI";
        private const string PermUse = "eldrunstormwall.use";
        private const string PermAdmin = "eldrunstormwall.admin";
        
        // 👑 SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        
        private StormwallConfig _config;
        private StormwallData _data;
        private Dictionary<ulong, Vector3> _lastPos = new Dictionary<ulong, Vector3>();
        private Dictionary<ulong, PlayerStormwallStats> _playerStats = new Dictionary<ulong, PlayerStormwallStats>();
        private Dictionary<ulong, DateTime> _lastWarning = new Dictionary<ulong, DateTime>();
        private float _tick = 0.5f;
        private Timer _handle;
        private Timer _previewHandle;
        private bool _previewEnabled = false;
        private Timer _fxHandle;
        private List<Vector3> _fxPoints;
        private int _fxSeed = 0;
        private Dictionary<string,string> _theme; // from EldrunFraktion
        private List<StormwallInstance> _walls = new List<StormwallInstance>(); // faer UI Anzeige
        private Dictionary<ulong, bool> _hasEntryWarning = new Dictionary<ulong, bool>();
        private Dictionary<ulong, string> _uiActiveTab = new Dictionary<ulong, string>();
        
        // --- Runtime crossing state & performance caches ---
        private Dictionary<ulong, bool> _wasInside = new Dictionary<ulong, bool>();
        private Dictionary<ulong, int> _insideTicks = new Dictionary<ulong, int>();
        private Dictionary<ulong, int> _entrySign = new Dictionary<ulong, int>();
        private int _graceTicks = 2; // computed from _tick in Init
        private Dictionary<ulong, DateTime> _lastStormwallDeath = new Dictionary<ulong, DateTime>();
        
        // Precomputed path segments for fast distance queries
        private List<SegmentInfo> _segments = new List<SegmentInfo>();
        private float _wallMinX = 0f, _wallMaxX = 0f, _wallMinZ = 0f, _wallMaxZ = 0f;
        
        private class StormwallData
        {
            public Dictionary<ulong, PlayerStormwallStats> PlayerStats = new Dictionary<ulong, PlayerStormwallStats>();
            public int TotalCrossings = 0;
            public int TotalDeaths = 0;
            public int TotalDamageDealt = 0;
            public DateTime LastReset = DateTime.Now;
        }
        
        private class PlayerStormwallStats
        {
            public ulong UserId;
            public string PlayerName;
            public int CrossingAttempts = 0;
            public int SuccessfulCrossings = 0;
            public int StormwallDeaths = 0;
            public float TotalDamageTaken = 0f;
            public DateTime FirstCrossing = DateTime.MinValue;
            public DateTime LastCrossing = DateTime.MinValue;
            public bool IsLegendaryCrosser = false; // 10+ successful crossings
        }

        private class StormwallInstance
        {
            public bool IsActive;
            public string Name;
            public List<V2> Path;
            public float Thickness;
        }

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

        private class StormwallConfig
        {
            public bool Enabled = true;
            public string ChatPrefix = "⚡ <color=#4B0082><b>[STORMWALL]</b></color>";
            
            // === CORE STORMWALL MECHANICS ===
            public float TickRate = 0.5f; // seconds
            public float WallThickness = 20f; // meters across; player inside if distance to wall <= thickness/2
            public float CrossingTargetLossMin = 0.80f; // 80-95% HP loss beim Durchschwimmen
            public float CrossingTargetLossMax = 0.95f;
            public float MinSpeedForCrossing = 1.2f; // m/s minimal speed considered "straight crossing"
            public float CrossingAlignmentThreshold = 0.7f; // |dot(velocity, wall_normal)| in 2D XZ
            
            // === DEATH MECHANICS ===
            public bool KillOnBadMovement = true; // standing or lateral movement inside wall
            public float BadMovementKillDamage = 10000f; // applied instantly
            public bool ShowDeathMessages = true;
            public bool LogStormwallDeaths = true;
            
            // === BRIDGE SAFE ZONES ===
            public float BridgeDrainPerSec = 1f; // safe drain on bridges (wie auf Artifact Island!)
            public bool RequireGatesOpenForBridgeSafe = false; // if true, safe drain only when gates open via EldrunBridgeGates
            public bool ShowBridgeWarnings = true;
            
            // === VISUAL & AUDIO EFFECTS ===
            public bool EnableVisuals = true; // preview ddraw lines
            public float PreviewSeconds = 6f; // duration of debug draw lines
            public bool EnableEpicEffects = true; // Epic stormwall effects
            public bool PlayStormSounds = true;
            public bool ShowWarningMessages = true;
            public float WarningCooldown = 10f; // seconds between warnings
            
            // === STORMWALL PATH ===
            public List<V2> WallPath = new List<V2>(); // polyline points (x,z)
            public RectXZ BridgeRectTeam1 = new RectXZ();
            public RectXZ BridgeRectTeam2 = new RectXZ();
            
            // === PERMISSIONS ===
            public bool AdminImmunity = true; // Admins are immune
            
            // === STATISTICS & TRACKING ===
            public bool TrackPlayerStats = true;
            public bool BroadcastLegendaryCrossings = true;
            public int LegendaryCrossingThreshold = 10; // 10+ successful crossings = legendary
            
            // === AMBIENT FX SYSTEM ===
            public bool EnableFX = true; // Epic stormwall atmosphere
            public float FXTickSeconds = 3f; // how often to pulse FX
            public int FXPointsPerKm = 25; // sampling density along path
            public float FXCloudHeight = 30f; // meters above terrain
            public float FXSpawnChance = 0.4f; // chance per sample per tick
            public string FXStormPrefab = "assets/bundled/prefabs/fx/smoke_signal_full.prefab";
            // 🔧 FIX: Deaktiviert wegen StringPool Spam - diese Prefabs sind nicht im Pool registriert
            public string FXLightningPrefab = ""; // "assets/bundled/prefabs/fx/weaponfx/lightningbolt.prefab";
            public string FXRainPrefab = ""; // "assets/bundled/prefabs/fx/ambience/rain.prefab";
            public string FXSound = ""; // "assets/bundled/prefabs/fx/ambience/thunder.prefab";
            
            // === SOUND SYSTEM ===
            public bool EnableSounds = true;
            // 🔧 FIX: Deaktiviert wegen StringPool Spam
            public string EnterSound = ""; // "assets/bundled/prefabs/fx/ambience/thunderstorm.prefab";
            public string DeathSound = "assets/bundled/prefabs/fx/player/beartrap_scream.prefab";
            public string SuccessSound = "assets/bundled/prefabs/fx/notice/item.select.fx.prefab";
            public string WarningSound = "assets/bundled/prefabs/fx/notice/notice.mention.fx.prefab";
            public float SoundVolume = 0.8f;
            
            // === WARNING MESSAGES ===
            public Dictionary<string, string> WarningMessages = new Dictionary<string, string>
            {
                ["enter"] = "⚠️ You are entering the LEGENDARY STORMWALL! Swim straight through quickly or DIE!",
                ["slow"] = "⚡ MOVE FASTER! The Stormwall kills slow souls!",
                ["bridge"] = "🌉 You are on a safe bridge  {drain} HP/second damage",
                ["death"] = "was consumed by the STORMWALL!",
                ["successful"] = "successfully crossed the STORMWALL!"
            };
        }
        private class V2 { public float X; public float Z; }
        private class RectXZ { public float MinX; public float MinZ; public float MaxX; public float MaxZ; }
        private class SegmentInfo
        {
            public Vector2 A;
            public Vector2 B;
            public Vector2 Normal;
            public float MinX;
            public float MaxX;
            public float MinZ;
            public float MaxZ;
        }
        // === Utility: rebuild geometry caches for fast queries ===
        private void RebuildSegments()
        {
            _segments.Clear();
            _wallMinX = _wallMaxX = _wallMinZ = _wallMaxZ = 0f;
            if (_config?.WallPath == null || _config.WallPath.Count < 2) return;
            bool first = true;
            for (int i = 0; i < _config.WallPath.Count - 1; i++)
            {
                var va = _config.WallPath[i]; var vb = _config.WallPath[i + 1];
                Vector2 A = new Vector2(va.X, va.Z);
                Vector2 B = new Vector2(vb.X, vb.Z);
                Vector2 t = B - A;
                if (t.sqrMagnitude < 0.0001f) continue;
                Vector2 n = new Vector2(-t.y, t.x);
                if (n.sqrMagnitude > 0.0001f) n = n.normalized; else n = Vector2.right;
                var s = new SegmentInfo
                {
                    A = A,
                    B = B,
                    Normal = n,
                    MinX = Mathf.Min(A.x, B.x),
                    MaxX = Mathf.Max(A.x, B.x),
                    MinZ = Mathf.Min(A.y, B.y),
                    MaxZ = Mathf.Max(A.y, B.y)
                };
                _segments.Add(s);
                if (first)
                {
                    _wallMinX = s.MinX; _wallMaxX = s.MaxX; _wallMinZ = s.MinZ; _wallMaxZ = s.MaxZ; first = false;
                }
                else
                {
                    _wallMinX = Mathf.Min(_wallMinX, s.MinX);
                    _wallMaxX = Mathf.Max(_wallMaxX, s.MaxX);
                    _wallMinZ = Mathf.Min(_wallMinZ, s.MinZ);
                    _wallMaxZ = Mathf.Max(_wallMaxZ, s.MaxZ);
                }
            }
        }

        // === Utility: format warning messages with live values ===
        private string FormatWarningMessage(string type, string template)
        {
            try
            {
                string msg = template ?? string.Empty;
                msg = msg.Replace("{drain}", _config.BridgeDrainPerSec.ToString("0.#", CultureInfo.InvariantCulture));
                msg = msg.Replace("{thickness}", _config.WallThickness.ToString("0.#", CultureInfo.InvariantCulture));
                return msg;
            }
            catch { return template; }
        }

        private void OnEntityDeath(BaseCombatEntity entity, HitInfo info)
        {
            var player = entity as BasePlayer; if (player == null) return;
            if (_config == null || !_config.Enabled) return;
            // Admin immunity should not count
            if (_config.AdminImmunity && (permission.UserHasPermission(player.UserIDString, PermAdmin) || IsServerAdmin(player))) return;
            // Inside wall check
            Vector2 n1, s1, s2, sn1; float d = DistanceToWallXZ(player.transform.position, out n1, out s1, out s2, out sn1);
            if (d > Mathf.Max(0.1f, _config.WallThickness) * 0.5f) return;
            // Damage type: prefer Cold to attribute to Stormwall
            if (info != null)
            {
                float total = info.damageTypes.Total();
                if (total > 0f)
                {
                    float cold = info.damageTypes.Get(Rust.DamageType.Cold);
                    if (cold / total < 0.5f) return; // not mainly stormwall
                }
            }
            if (!_config.TrackPlayerStats) return;
            if (!_data.PlayerStats.ContainsKey(player.userID))
            {
                _data.PlayerStats[player.userID] = new PlayerStormwallStats
                {
                    UserId = player.userID,
                    PlayerName = player.displayName,
                    FirstCrossing = DateTime.Now
                };
            }
            var stats = _data.PlayerStats[player.userID];
            DateTime last;
            if (!_lastStormwallDeath.TryGetValue(player.userID, out last) || (DateTime.Now - last).TotalSeconds > 2)
            {
                _lastStormwallDeath[player.userID] = DateTime.Now;
                stats.StormwallDeaths++;
                _data.TotalDeaths++;
                if (_config.ShowDeathMessages)
                {
                    var deathMsg = GetLocalizedMessage("stormwall.warning.death", null);
                    if (!string.IsNullOrEmpty(deathMsg) && deathMsg != "[stormwall.warning.death]")
                        Server.Broadcast($"{_config.ChatPrefix} {player.displayName} {deathMsg}");
                    else
                        Server.Broadcast($"{_config.ChatPrefix} {player.displayName} {_config.WarningMessages["death"]}");
                }
                if (_config.LogStormwallDeaths)
                {
                    Puts($"[EldrunStormwall] {player.displayName} died in the Stormwall (OnEntityDeath).");
                }
            }
        }

        protected override void LoadDefaultConfig()
        {
            _config = new StormwallConfig()
            {
                WallPath = new List<V2>
                {
                    new V2{ X = -1000f, Z = 0f },
                    new V2{ X = 0f, Z = 0f },
                    new V2{ X = 1000f, Z = 0f },
                },
                BridgeRectTeam1 = new RectXZ{ MinX = -50f, MinZ = -60f, MaxX = 50f, MaxZ = -20f },
                BridgeRectTeam2 = new RectXZ{ MinX = -50f, MinZ = 20f, MaxX = 50f, MaxZ = 60f },
            };
            Puts("[EldrunStormwall] Created default configuration.");
        }

        private void LoadConfigValues()
        {
            try
            {
                _config = Config.ReadObject<StormwallConfig>();
                if (_config == null) throw new Exception("Config null");
            }
            catch
            {
                Puts("[EldrunStormwall] Invalid config, creating defaults.");
                // Ensure we always have a valid configuration
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);
        
        private void LoadData()
        {
            try { _data = Interface.Oxide.DataFileSystem.ReadObject<StormwallData>("eldrun_stormwall_data") ?? new StormwallData(); }
            catch { _data = new StormwallData(); }
        }

        private void SaveData() => Interface.Oxide.DataFileSystem.WriteObject("eldrun_stormwall_data", _data);

        private void Init()
        {
            LoadConfigValues();
            LoadData();
            _tick = Mathf.Clamp(_config.TickRate, 0.1f, 2.0f);
            _graceTicks = Mathf.Max(1, Mathf.CeilToInt(1.0f / Mathf.Max(_tick, 0.001f))); // ~1s grace by default
            permission.RegisterPermission(PermUse, this);
            permission.RegisterPermission(PermAdmin, this);
            
            // Initialize walls list for UI
            _walls.Clear();
            _walls.Add(new StormwallInstance
            {
                IsActive = _config.Enabled,
                Name = "Main Stormwall",
                Path = _config.WallPath,
                Thickness = _config.WallThickness
            });
            // Precompute segment data for fast geometry
            RebuildSegments();
            
            Puts("[EldrunStormwall] Plugin initialized.");
        }

        private void OnServerInitialized()
        {
            if (_config != null && _config.Enabled)
            {
                _handle = timer.Every(_tick, TickStormwall);
                // Start with preview disabled; admins can enable via /stormwall preview on
                _previewEnabled = false;
                _previewHandle = null;
                if (_config.EnableFX)
                {
                    StartFX();
                }
                
                // Auto-save data every 5 minutes
                timer.Every(300f, () => SaveData());
                
                Puts("[EldrunStormwall] Plugin initialized.");
            }
        }

        private void Unload()
        {
            _lastPos.Clear();
            _playerStats.Clear();
            _lastWarning.Clear();
            try { _handle?.Destroy(); } catch { }
            _handle = null;
            try { _previewHandle?.Destroy(); } catch { }
            _previewHandle = null;
            try { _fxHandle?.Destroy(); } catch { }
            _fxHandle = null;
        }

        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            _lastPos.Remove(player.userID);
            _hasEntryWarning.Remove(player.userID);
            _wasInside.Remove(player.userID);
            _insideTicks.Remove(player.userID);
            _entrySign.Remove(player.userID);
        }

        private void TickStormwall()
        {
            if (!_config.Enabled) return;

            var list = BasePlayer.activePlayerList; // online, active players
            if (list == null) return;

            foreach (var player in list)
            {
                if (player == null || player.IsDead() || player.IsSleeping()) continue;

                // Admin immunity (keep Steam ID logic)
                if (_config.AdminImmunity && (permission.UserHasPermission(player.UserIDString, PermAdmin) || IsServerAdmin(player)))
                {
                    continue;
                }

                Vector3 pos = player.transform.position;
                Vector3 last;
                _lastPos.TryGetValue(player.userID, out last);
                Vector3 delta = (last == default(Vector3)) ? Vector3.zero : (pos - last);
                _lastPos[player.userID] = pos;

                // Bridge rectangles safe drain (1 HP/s default)
                if (IsInBridgeRect(pos, out var whichBridge))
                {
                    if (!_config.RequireGatesOpenForBridgeSafe || GateIsOpen(whichBridge))
                    {
                        ApplyStormwallDamage(player, _config.BridgeDrainPerSec * _tick, "bridge_safe");
                        ShowBridgeWarning(player);
                        // Reset crossing state if we are on a bridge
                        _wasInside[player.userID] = false;
                        _insideTicks[player.userID] = 0;
                        _entrySign.Remove(player.userID);
                        continue;
                    }
                }

                // Inside stormwall volume?
                Vector2 nearest, segA, segB, segNormal;
                float dist = DistanceToWallXZ(pos, out nearest, out segA, out segB, out segNormal);
                bool insideWall = dist <= Mathf.Max(0.1f, _config.WallThickness) * 0.5f;

                bool wasInside = _wasInside.ContainsKey(player.userID) && _wasInside[player.userID];

                // Transition: outside -> inside
                if (insideWall && !wasInside)
                {
                    _wasInside[player.userID] = true;
                    _insideTicks[player.userID] = 0;
                    int sign = GetSignedSide(new Vector2(pos.x, pos.z), nearest, segNormal);
                    _entrySign[player.userID] = sign;
                    ShowStormwallEntryWarning(player);
                    UpdateCrossingAttempt(player);
                }

                // Transition: inside -> outside (evaluate success)
                if (!insideWall && wasInside)
                {
                    int enterSign;
                    _entrySign.TryGetValue(player.userID, out enterSign);
                    int exitSign = GetSignedSide(new Vector2(pos.x, pos.z), nearest, segNormal);
                    if (enterSign != 0 && exitSign != 0 && enterSign != exitSign)
                    {
                        // Successful crossing
                        if (_config.TrackPlayerStats)
                        {
                            if (!_data.PlayerStats.ContainsKey(player.userID))
                            {
                                _data.PlayerStats[player.userID] = new PlayerStormwallStats
                                {
                                    UserId = player.userID,
                                    PlayerName = player.displayName,
                                    FirstCrossing = DateTime.Now
                                };
                            }
                            var stats = _data.PlayerStats[player.userID];
                            stats.SuccessfulCrossings++;
                            _data.TotalCrossings++;

                            // Legendary check
                            if (stats.SuccessfulCrossings >= _config.LegendaryCrossingThreshold && !stats.IsLegendaryCrosser)
                            {
                                stats.IsLegendaryCrosser = true;
                                if (_config.BroadcastLegendaryCrossings)
                                {
                                    Server.Broadcast($"{_config.ChatPrefix} ⚡ {player.displayName} is a LEGENDARY STORMWALL CROSSER! ({stats.SuccessfulCrossings} successful crossings)");
                                    PlaySoundToPlayer(player, "successful");
                                }
                            }
                            else
                            {
                                var successMsg = GetLocalizedMessage("stormwall.warning.successful", player);
                                if (!string.IsNullOrEmpty(successMsg) && successMsg != "[stormwall.warning.successful]")
                                    SendReply(player, $"{_config.ChatPrefix} {player.displayName} {successMsg}");
                                else if (_config.WarningMessages.ContainsKey("successful"))
                                    SendReply(player, $"{_config.ChatPrefix} {player.displayName} {_config.WarningMessages["successful"]}");
                                PlaySoundToPlayer(player, "successful");
                            }
                        }
                    }
                    // Clear crossing state
                    _wasInside[player.userID] = false;
                    _insideTicks[player.userID] = 0;
                    _entrySign.Remove(player.userID);
                    _hasEntryWarning.Remove(player.userID);
                    continue;
                }

                if (!insideWall)
                {
                    // Not in wall, nothing to do
                    continue;
                }

                // Inside wall behavior
                int ticksInside = 0;
                _insideTicks.TryGetValue(player.userID, out ticksInside);
                ticksInside++;
                _insideTicks[player.userID] = ticksInside;

                float speed = delta.magnitude / Mathf.Max(_tick, 0.001f);
                Vector2 vel2 = new Vector2(delta.x, delta.z);

                if (vel2.sqrMagnitude <= 0.000001f)
                {
                    // Standing still
                    ShowSlowMovementWarning(player);
                    if (ticksInside <= _graceTicks)
                    {
                        // Grace period: warn only
                    }
                    else if (_config.KillOnBadMovement)
                    {
                        ApplyStormwallDamage(player, Mathf.Max(_config.BadMovementKillDamage, player.health + 5f), "stormwall_death");
                    }
                    else
                    {
                        ApplyStormwallDamage(player, 100f * _tick, "stormwall_slow");
                    }
                    continue;
                }

                Vector2 velN = vel2.normalized;
                Vector2 n = segNormal.sqrMagnitude > 0.0001f ? segNormal.normalized : new Vector2(1f, 0f);
                float alignment = Mathf.Abs(Vector2.Dot(velN, n));

                if (speed >= _config.MinSpeedForCrossing && alignment >= _config.CrossingAlignmentThreshold)
                {
                    // Straight crossing DPS scaled by speed and thickness
                    float maxHp = GetMaxHealth(player);
                    float thickness = Mathf.Max(1f, _config.WallThickness);
                    float frac = Mathf.Clamp(UnityEngine.Random.Range(_config.CrossingTargetLossMin, _config.CrossingTargetLossMax), 0.50f, 0.999f);
                    float dps = Mathf.Clamp(frac * maxHp * (speed / thickness), 1f, 2000f);
                    float dmgTick = dps * _tick;
                    ApplyStormwallDamage(player, dmgTick, "stormwall_crossing");
                }
                else
                {
                    // Bad movement - lateral or too slow
                    ShowSlowMovementWarning(player);
                    if (ticksInside <= _graceTicks)
                    {
                        // Grace period: warn only
                    }
                    else if (_config.KillOnBadMovement)
                    {
                        ApplyStormwallDamage(player, Mathf.Max(_config.BadMovementKillDamage, player.health + 5f), "stormwall_death");
                    }
                    else
                    {
                        ApplyStormwallDamage(player, 200f * _tick, "stormwall_bad_movement");
                    }
                }
            }
        }
        
        // === ENHANCED METHODS ===
        private void ApplyStormwallDamage(BasePlayer player, float damage, string type)
        {
            player.Hurt(damage, Rust.DamageType.Cold, null, false);
            
            // Update statistics
            if (_config.TrackPlayerStats)
            {
                if (!_data.PlayerStats.ContainsKey(player.userID))
                {
                    _data.PlayerStats[player.userID] = new PlayerStormwallStats
                    {
                        UserId = player.userID,
                        PlayerName = player.displayName
                    };
                }
                var stats = _data.PlayerStats[player.userID];
                stats.TotalDamageTaken += damage;
                
                // Check if player died
                if (player.health <= 0 && type.Contains("death"))
                {
                    // Throttle duplicate death tracking within 2 sec
                    DateTime last;
                    if (!_lastStormwallDeath.TryGetValue(player.userID, out last) || (DateTime.Now - last).TotalSeconds > 2)
                    {
                        _lastStormwallDeath[player.userID] = DateTime.Now;
                        stats.StormwallDeaths++;
                        _data.TotalDeaths++;
                        if (_config.ShowDeathMessages)
                        {
                            var deathMsg = GetLocalizedMessage("stormwall.warning.death", null);
                            if (!string.IsNullOrEmpty(deathMsg) && deathMsg != "[stormwall.warning.death]")
                                Server.Broadcast($"{_config.ChatPrefix} {player.displayName} {deathMsg}");
                            else
                                Server.Broadcast($"{_config.ChatPrefix} {player.displayName} {_config.WarningMessages["death"]}");
                        }
                        if (_config.LogStormwallDeaths)
                        {
                            Puts($"[EldrunStormwall] {player.displayName} died in the Stormwall.");
                        }
                    }
                }
            }
        }
        
        private void UpdateCrossingAttempt(BasePlayer player)
        {
            if (!_config.TrackPlayerStats) return;
            if (!_data.PlayerStats.ContainsKey(player.userID))
            {
                _data.PlayerStats[player.userID] = new PlayerStormwallStats
                {
                    UserId = player.userID,
                    PlayerName = player.displayName,
                    FirstCrossing = DateTime.Now
                };
            }
            var stats = _data.PlayerStats[player.userID];
            stats.CrossingAttempts++;
            stats.LastCrossing = DateTime.Now;
            // Mark that we've warned this entry (used for throttling)
            _hasEntryWarning[player.userID] = true;
        }
        
        private void ShowBridgeWarning(BasePlayer player)
        {
            if (!_config.ShowBridgeWarnings) return;
            ShowPlayerWarning(player, "bridge");
        }
        
        private void ShowStormwallEntryWarning(BasePlayer player)
        {
            if (!_config.ShowWarningMessages) return;
            ShowPlayerWarning(player, "enter");
        }
        
        private void ShowSlowMovementWarning(BasePlayer player)
        {
            if (!_config.ShowWarningMessages) return;
            ShowPlayerWarning(player, "slow");
        }
        
        private void ShowPlayerWarning(BasePlayer player, string type)
        {
            if (!_lastWarning.ContainsKey(player.userID) || 
                (DateTime.Now - _lastWarning[player.userID]).TotalSeconds >= _config.WarningCooldown)
            {
                _lastWarning[player.userID] = DateTime.Now;
                string locKey = $"stormwall.warning.{type}";
                var localized = GetLocalizedMessage(locKey, player);
                if (!string.IsNullOrEmpty(localized) && localized != $"[{locKey}]")
                {
                    SendReply(player, $"{_config.ChatPrefix} {localized}");
                    PlaySoundToPlayer(player, type);
                }
                else if (_config.WarningMessages.ContainsKey(type))
                {
                    var formatted = FormatWarningMessage(type, _config.WarningMessages[type]);
                    SendReply(player, $"{_config.ChatPrefix} {formatted}");
                    PlaySoundToPlayer(player, type);
                }
            }
        }
        
        private void PlaySoundToPlayer(BasePlayer player, string type)
        {
            if (!_config.EnableSounds) return;
            try
            {
                string soundPath = null;
                switch (type)
                {
                    case "enter": soundPath = _config.EnterSound; break;
                    case "slow": soundPath = _config.WarningSound; break;
                    case "bridge": soundPath = _config.WarningSound; break;
                    case "death": soundPath = _config.DeathSound; break;
                    case "successful": soundPath = _config.SuccessSound; break;
                }
                
                if (!string.IsNullOrEmpty(soundPath))
                {
                    Effect.server.Run(soundPath, player.transform.position);
                }
            }
            catch (Exception ex)
            {
                Puts($"[EldrunStormwall] Error playing sound: {ex.Message}");
            }
        }
        
        // --- Geometry helpers ---
        private float DistanceToWallXZ(Vector3 pos, out Vector2 nearest, out Vector2 segA, out Vector2 segB, out Vector2 segNormal)
        {
            nearest = Vector2.zero; segA = Vector2.zero; segB = Vector2.zero; segNormal = Vector2.right;
            if (_config.WallPath == null || _config.WallPath.Count < 2) return float.MaxValue;
            Vector2 p = new Vector2(pos.x, pos.z);
            float bestDist = float.MaxValue; Vector2 bestN = Vector2.right; Vector2 bestA = Vector2.zero; Vector2 bestB = Vector2.zero; Vector2 bestQ = p;
            float margin = Mathf.Max(30f, _config.WallThickness);
            if (_segments != null && _segments.Count > 0)
            {
                for (int i = 0; i < _segments.Count; i++)
                {
                    var s = _segments[i];
                    if (p.x < s.MinX - margin || p.x > s.MaxX + margin || p.y < s.MinZ - margin || p.y > s.MaxZ + margin) continue;
                    Vector2 q = ClosestPointOnSeg(s.A, s.B, p);
                    float d = Vector2.Distance(p, q);
                    if (d < bestDist)
                    {
                        bestDist = d; bestQ = q; bestA = s.A; bestB = s.B; bestN = s.Normal;
                    }
                }
            }
            else
            {
                for (int i = 0; i < _config.WallPath.Count - 1; i++)
                {
                    Vector2 a = new Vector2(_config.WallPath[i].X, _config.WallPath[i].Z);
                    Vector2 b = new Vector2(_config.WallPath[i + 1].X, _config.WallPath[i + 1].Z);
                    Vector2 q = ClosestPointOnSeg(a, b, p);
                    float d = Vector2.Distance(p, q);
                    if (d < bestDist)
                    {
                        bestDist = d; bestQ = q; bestA = a; bestB = b;
                        Vector2 t = (b - a); if (t.sqrMagnitude < 0.0001f) t = new Vector2(1, 0);
                        Vector2 normal = new Vector2(-t.y, t.x).normalized; // 2D perpendicular
                        bestN = normal;
                    }
                }
            }
            nearest = bestQ; segA = bestA; segB = bestB; segNormal = bestN;
            return bestDist;
        }

        private Vector2 ClosestPointOnSeg(Vector2 a, Vector2 b, Vector2 p)
        {
            Vector2 ab = b - a; float ab2 = Vector2.Dot(ab, ab); if (ab2 <= 0.000001f) return a;
            float t = Vector2.Dot(p - a, ab) / ab2; t = Mathf.Clamp01(t);
            return a + ab * t;
        }

        private int GetSignedSide(Vector2 pos, Vector2 nearest, Vector2 normal)
        {
            if (normal.sqrMagnitude <= 0.0001f) return 0;
            Vector2 d = pos - nearest;
            float dot = Vector2.Dot(d, normal.normalized);
            if (dot > 0.01f) return 1;
            if (dot < -0.01f) return -1;
            return 0;
        }

        private bool IsInBridgeRect(Vector3 pos, out string which)
        {
            which = null;
            if (IsInsideRectXZ(pos, _config.BridgeRectTeam1)) { which = "team1"; return true; }
            if (IsInsideRectXZ(pos, _config.BridgeRectTeam2)) { which = "team2"; return true; }
            return false;
        }

        private bool IsInsideRectXZ(Vector3 pos, RectXZ r)
        {
            if (r == null) return false;
            float x = pos.x, z = pos.z;
            float minX = Mathf.Min(r.MinX, r.MaxX), maxX = Mathf.Max(r.MinX, r.MaxX);
            float minZ = Mathf.Min(r.MinZ, r.MaxZ), maxZ = Mathf.Max(r.MinZ, r.MaxZ);
            return (x >= minX && x <= maxX && z >= minZ && z <= maxZ);
        }

        private float GetMaxHealth(BasePlayer player)
        {
            // Rust default is 100f; if ever changed, try to infer
            return 100f;
        }

        // Enable/Disable API for admin menu
        public bool Eldrun_GetEnabled() => _config?.Enabled ?? true;
        public void Eldrun_SetEnabled(bool enabled)
        {
            if (_config == null) return;
            _config.Enabled = enabled;
            // Reconfigure ticking
            try { _handle?.Destroy(); } catch { }
            _handle = null;
            if (enabled)
            {
                _handle = timer.Every(_tick, TickStormwall);
                if (_config.EnableVisuals && _previewEnabled && _previewHandle == null)
                {
                    _previewHandle = timer.Every(Mathf.Max(2f, _config.PreviewSeconds * 0.8f), DrawPreviewAll);
                }
                // FX start
                try { _fxHandle?.Destroy(); } catch { }
                _fxHandle = null;
                if (_config.EnableFX)
                {
                    StartFX();
                }
                // Rebuild geometry caches on enable
                RebuildSegments();
            }
            else
            {
                try { _previewHandle?.Destroy(); } catch { }
                _previewHandle = null;
                try { _fxHandle?.Destroy(); } catch { }
                _fxHandle = null;
            }
        }

        private bool AreGatesOpen()
        {
            if (EldrunBridgeGates == null) return false;
            try
            {
                var res = EldrunBridgeGates.Call("Eldrun_GatesAreOpen");
                if (res is bool b) return b;
            }
            catch { }
            return false;
        }

        private bool GateIsOpen(string which)
        {
            if (EldrunBridgeGates == null) return false;
            try
            {
                var res = EldrunBridgeGates.Call("Eldrun_GateIsOpen", which);
                if (res is bool b) return b;
            }
            catch { }
            return false;
        }

        // ============ Preview Drawing & Commands ============
        private void DrawPreviewAll()
        {
            if (!_previewEnabled || !_config.EnableVisuals) return;
            var list = BasePlayer.activePlayerList; if (list == null) return;
            foreach (var p in list)
            {
                if (p == null) continue;
                DrawPreviewFor(p);
            }
        }

        private void DrawPreviewFor(BasePlayer p)
        {
            try
            {
                float dur = Mathf.Max(2f, _config.PreviewSeconds);
                // Wall polyline
                if (_config.WallPath != null && _config.WallPath.Count >= 2)
                {
                    for (int i = 0; i < _config.WallPath.Count - 1; i++)
                    {
                        var a = _config.WallPath[i]; var b = _config.WallPath[i + 1];
                        var A = new Vector3(a.X, p.transform.position.y + 2f, a.Z);
                        var B = new Vector3(b.X, p.transform.position.y + 2f, b.Z);
                        p.SendConsoleCommand("ddraw.line", dur, 0.6f, 0.8f, 1f, A.x, A.y, A.z, B.x, B.y, B.z);
                    }
                }
                // Bridge rects
                DrawRect(p, _config.BridgeRectTeam1, dur, 0.2f, 1f, 0.2f);
                DrawRect(p, _config.BridgeRectTeam2, dur, 1f, 0.2f, 0.2f);
            }
            catch { }
        }

        private void DrawRect(BasePlayer p, RectXZ r, float dur, float cr, float cg, float cb)
        {
            if (r == null) return;
            float y = p.transform.position.y + 1.5f;
            var A = new Vector3(r.MinX, y, r.MinZ);
            var B = new Vector3(r.MaxX, y, r.MinZ);
            var C = new Vector3(r.MaxX, y, r.MaxZ);
            var D = new Vector3(r.MinX, y, r.MaxZ);
            p.SendConsoleCommand("ddraw.line", dur, cr, cg, cb, A.x, A.y, A.z, B.x, B.y, B.z);
            p.SendConsoleCommand("ddraw.line", dur, cr, cg, cb, B.x, B.y, B.z, C.x, C.y, C.z);
            p.SendConsoleCommand("ddraw.line", dur, cr, cg, cb, C.x, C.y, C.z, D.x, D.y, D.z);
            p.SendConsoleCommand("ddraw.line", dur, cr, cg, cb, D.x, D.y, D.z, A.x, A.y, A.z);
        }


        [ChatCommand("stormwall")]
        private void CmdStormwall(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            
            // Basic permission for all players
            if (!permission.UserHasPermission(player.UserIDString, PermUse) && 
                !permission.UserHasPermission(player.UserIDString, PermAdmin)) 
            { 
                SendReply(player, $"{_config.ChatPrefix} You don't have permission to use this command."); 
                return; 
            }
            
            if (args == null || args.Length == 0 || (args[0] ?? string.Empty).Equals("ui", StringComparison.OrdinalIgnoreCase))
            {
                OpenUI(player);
                return;
            }
            var sub = (args[0] ?? string.Empty).ToLowerInvariant();
            
            // Admin commands require admin permission
            if (sub == "preview" || sub == "status" || sub == "toggle")
            {
                if (!permission.UserHasPermission(player.UserIDString, PermAdmin)) 
                { 
                    SendReply(player, $"{_config.ChatPrefix} Admin permission required."); 
                    return; 
                }
            }
            
            if (sub == "preview")
            {
                if (args.Length < 2) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall preview <on|off>"); return; }
                bool on = args[1].Equals("on", StringComparison.OrdinalIgnoreCase);
                _previewEnabled = on && _config.EnableVisuals;
                try { _previewHandle?.Destroy(); } catch { }
                _previewHandle = null;
                if (_previewEnabled)
                {
                    _previewHandle = timer.Every(Mathf.Max(2f, _config.PreviewSeconds * 0.8f), DrawPreviewAll);
                    DrawPreviewFor(player);
                }
                SendReply(player, "[Eldrun] Preview: " + (_previewEnabled ? "on" : "off"));
                return;
            }
            if (sub == "status")
            {
                int n = _config.WallPath?.Count ?? 0;
                string info = $"[Eldrun] Stormwall: enabled={_config.Enabled}, tick={_tick:0.###}s, thickness={_config.WallThickness:0.#}m, minspd={_config.MinSpeedForCrossing:0.##}m/s, align={_config.CrossingAlignmentThreshold:0.##}, points={n}, gatesafe={_config.RequireGatesOpenForBridgeSafe}, fx={_config.EnableFX}";
                SendReply(player, info);
                if (n >= 1)
                {
                    var a = _config.WallPath[0]; var b = _config.WallPath[Mathf.Max(0, n-1)];
                    SendReply(player, $"[Eldrun] Path: start=({a.X:0.#},{a.Z:0.#}) end=({b.X:0.#},{b.Z:0.#})");
                }
                SendReply(player, $"[Eldrun] Rect team1: ({_config.BridgeRectTeam1.MinX:0.#},{_config.BridgeRectTeam1.MinZ:0.#})({_config.BridgeRectTeam1.MaxX:0.#},{_config.BridgeRectTeam1.MaxZ:0.#})");
                SendReply(player, $"[Eldrun] Rect team2: ({_config.BridgeRectTeam2.MinX:0.#},{_config.BridgeRectTeam2.MinZ:0.#})({_config.BridgeRectTeam2.MaxX:0.#},{_config.BridgeRectTeam2.MaxZ:0.#})");
                return;
            }
            
            // Basic information for all players
            if (sub == "info" || sub == "help")
            {
                SendReply(player, $"{_config.ChatPrefix} <color=#ffd700>ELDRUN STORMWALL</color> - Deadly barrier between worlds");
                SendReply(player, $"{_config.ChatPrefix} The Stormwall is active and protects the bridges to the artifact island.");
                SendReply(player, $"{_config.ChatPrefix} Wait for the bridge gates or use /travel for safe crossing.");
                SendReply(player, $"{_config.ChatPrefix} Crossing attempts are extremely dangerous - only the strongest survive!");
                if (_data != null)
                {
                    SendReply(player, $"{_config.ChatPrefix} Statistics: {_data.TotalCrossings} Crossings, {_data.TotalDeaths} Deaths");
                }
                return;
            }
            if (sub == "reload")
            {
                _tick = Mathf.Clamp(_config.TickRate, 0.1f, 2.0f);
                try { _handle?.Destroy(); } catch { }
                _handle = null;
                if (_config.Enabled)
                {
                    _handle = timer.Every(_tick, TickStormwall);
                }
                // restart FX timer per new config
                try { _fxHandle?.Destroy(); } catch { }
                _fxHandle = null;
                if (_config.EnableFX && _config.Enabled)
                {
                    StartFX();
                }
                // Rebuild geometry caches in case path/thickness changed via config
                RebuildSegments();
                SendReply(player, $"{_config.ChatPrefix} Stormwall config reloaded.");
                return;
            }
            if (sub == "enable")
            {
                if (args.Length < 2 || !bool.TryParse(args[1], out var en)) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall enable <true|false>"); return; }
                Eldrun_SetEnabled(en);
                SendReply(player, "[Eldrun] Stormwall: " + (en ? "active" : "inactive"));
                return;
            }
            if (sub == "addpt")
            {
                if (_config.WallPath == null) _config.WallPath = new List<V2>();
                var p = player.transform.position; _config.WallPath.Add(new V2{ X = p.x, Z = p.z });
                SaveConfig(); DrawPreviewFor(player); InvalidateFXCache(); RebuildSegments();
                SendReply(player, $"[Eldrun] Point added: ({p.x:0.#}, {p.z:0.#}). Total: {_config.WallPath.Count}.");
                return;
            }
            if (sub == "clear")
            {
                _config.WallPath = new List<V2>(); SaveConfig(); InvalidateFXCache(); RebuildSegments();
                SendReply(player, $"{_config.ChatPrefix} Wall path cleared.");
                return;
            }
            if (sub == "path")
            {
                int n = _config.WallPath?.Count ?? 0;
                SendReply(player, $"[Eldrun] Points: {n}. Thickness: {_config.WallThickness:0.#}m");
                if (n >= 1)
                {
                    var a = _config.WallPath[0]; SendReply(player, $"- Start: ({a.X:0.#}, {a.Z:0.#})");
                }
                if (n >= 2)
                {
                    var b = _config.WallPath[n-1]; SendReply(player, $"- End: ({b.X:0.#}, {b.Z:0.#})");
                }
                DrawPreviewFor(player);
                return;
            }
            if (sub == "import")
            {
                if (args.Length < 2) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall import path <x1,z1; x2,z2; ...> OR import rect <team1|team2> <minx,minz,maxx,maxz>"); return; }
                var what = args[1].ToLowerInvariant();
                if (what == "path")
                {
                    if (args.Length < 3) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall import path <x1,z1; x2,z2; ...>"); return; }
                    string csv = string.Join(" ", args, 2, args.Length - 2);
                    var list = new List<V2>();
                    foreach (var entry in csv.Split(new[]{';','|','\n'}, StringSplitOptions.RemoveEmptyEntries))
                    {
                        var token = entry.Trim();
                        var parts = token.Split(new[]{',',' '}, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length < 2) continue;
                        if (float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var x) && float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var z))
                        {
                            list.Add(new V2{ X = x, Z = z });
                        }
                    }
                    if (list.Count < 2) { SendReply(player, $"{_config.ChatPrefix} At least 2 points required."); return; }
                    _config.WallPath = list; SaveConfig(); DrawPreviewFor(player); InvalidateFXCache(); RebuildSegments();
                    SendReply(player, $"[Eldrun] Import OK. Points: {list.Count}");
                    return;
                }
                if (what == "rect")
                {
                    if (args.Length < 4) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall import rect <team1|team2> <minx,minz,maxx,maxz>"); return; }
                    var which = args[2].ToLowerInvariant();
                    var r = which == "team1" ? _config.BridgeRectTeam1 : (which == "team2" ? _config.BridgeRectTeam2 : null);
                    if (r == null) { SendReply(player, $"{_config.ChatPrefix} Unknown bridge (team1|team2)"); return; }
                    var coords = args[3];
                    var p = coords.Split(new[]{',',' '}, StringSplitOptions.RemoveEmptyEntries);
                    if (p.Length < 4)
                    {
                        SendReply(player, $"{_config.ChatPrefix} Expected 4 values: minx,minz,maxx,maxz"); return;
                    }
                    if (!float.TryParse(p[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var minx) ||
                        !float.TryParse(p[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var minz) ||
                        !float.TryParse(p[2], NumberStyles.Float, CultureInfo.InvariantCulture, out var maxx) ||
                        !float.TryParse(p[3], NumberStyles.Float, CultureInfo.InvariantCulture, out var maxz))
                    {
                        SendReply(player, $"{_config.ChatPrefix} Could not parse coordinates."); return;
                    }
                    r.MinX = minx; r.MinZ = minz; r.MaxX = maxx; r.MaxZ = maxz; SaveConfig(); DrawPreviewFor(player);
                    SendReply(player, $"[Eldrun] Rect {which} imported: ({minx:0.#},{minz:0.#})({maxx:0.#},{maxz:0.#})");
                    return;
                }
                SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall import path <x1,z1; x2,z2; ...> OR import rect <team1|team2> <minx,minz,maxx,maxz>");
                return;
            }
            if (sub == "export")
            {
                var pts = _config.WallPath ?? new List<V2>();
                if (pts.Count == 0) { SendReply(player, $"{_config.ChatPrefix} No points available."); return; }
                SendReply(player, $"{_config.ChatPrefix} Export (X, Z):");
                int perLine = 6; int i = 0; System.Text.StringBuilder sb = new System.Text.StringBuilder();
                foreach (var pt in pts)
                {
                    if (i > 0) sb.Append("; ");
                    sb.AppendFormat(System.Globalization.CultureInfo.InvariantCulture, "{0:0.###},{1:0.###}", pt.X, pt.Z);
                    i++;
                    if (i % perLine == 0)
                    {
                        SendReply(player, sb.ToString()); sb.Length = 0;
                    }
                }
                if (sb.Length > 0) SendReply(player, sb.ToString());
                return;
            }
            if (sub == "setrect")
            {
                if (args.Length < 3) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall setrect <team1|team2> <min|max>"); return; }
                var which = args[1].ToLowerInvariant(); var corner = args[2].ToLowerInvariant();
                RectXZ r = which == "team1" ? _config.BridgeRectTeam1 : (which == "team2" ? _config.BridgeRectTeam2 : null);
                if (r == null) { SendReply(player, $"{_config.ChatPrefix} Unknown bridge (team1|team2)"); return; }
                var p = player.transform.position;
                if (corner == "min") { r.MinX = p.x; r.MinZ = p.z; }
                else if (corner == "max") { r.MaxX = p.x; r.MaxZ = p.z; }
                else { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall setrect <team1|team2> <min|max>"); return; }
                SaveConfig(); DrawPreviewFor(player);
                SendReply(player, $"[Eldrun] Rect {which} {corner} set: ({p.x:0.#}, {p.z:0.#})");
                return;
            }
            if (sub == "thickness")
            {
                if (args.Length < 2 || !float.TryParse(args[1], out var t)) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall thickness <meters>"); return; }
                _config.WallThickness = Mathf.Clamp(t, 5f, 200f); SaveConfig(); RebuildSegments();
                SendReply(player, $"[Eldrun] Thickness: {_config.WallThickness:0.#}m");
                return;
            }
            if (sub == "gatesafe")
            {
                if (args.Length < 2 || !bool.TryParse(args[1], out var v)) { SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall gatesafe <true|false>"); return; }
                _config.RequireGatesOpenForBridgeSafe = v; SaveConfig();
                SendReply(player, "[Eldrun] Bridge safe requires gates open: " + (_config.RequireGatesOpenForBridgeSafe?"true":"false"));
                return;
            }
            if (sub == "save")
            {
                SaveConfig(); SendReply(player, $"{_config.ChatPrefix} Stormwall config saved."); return;
            }
            SendReply(player, $"{_config.ChatPrefix} Usage: /stormwall <ui|info|status|preview|reload|enable>");
        }

        [ConsoleCommand("eldrunstorm.ui.reload")]
        private void UIS_Reload(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            _tick = Mathf.Clamp(_config.TickRate, 0.1f, 2.0f);
            try { _handle?.Destroy(); } catch { }
            _handle = null;
            if (_config.Enabled) _handle = timer.Every(_tick, TickStormwall);
            RebuildSegments();
            SendReply(p, $"{_config.ChatPrefix} Config reloaded.");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.fx")]
        private void UIS_FX(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            _config.EnableFX = !_config.EnableFX;
            try { _fxHandle?.Destroy(); } catch { }
            _fxHandle = null;
            if (_config.EnableFX && _config.Enabled) StartFX();
            SendReply(p, $"{_config.ChatPrefix} FX: {(_config.EnableFX ? "Enabled" : "Disabled")}");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.stats")]
        private void UIS_Stats(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            SendReply(p, $"{_config.ChatPrefix} Global Statistics:");
            SendReply(p, $"- Total Crossings: {_data.TotalCrossings}");
            SendReply(p, $"- Total Deaths: {_data.TotalDeaths}");
            SendReply(p, $"- Registered Players: {_data.PlayerStats.Count}");
            var legendary = 0;
            foreach (var stats in _data.PlayerStats.Values)
            {
                if (stats.IsLegendaryCrosser)
                    legendary++;
            }
            SendReply(p, $"- Legendary Crossers: {legendary}");
        }

        [ConsoleCommand("eldrunstorm.ui.addpoint")]
        private void UIS_AddPoint(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            if (_config.WallPath == null) _config.WallPath = new List<V2>();
            var pos = p.transform.position;
            _config.WallPath.Add(new V2{ X = pos.x, Z = pos.z });
            InvalidateFXCache();
            RebuildSegments();
            SendReply(p, $"{_config.ChatPrefix} Point added: ({pos.x:0.1f}, {pos.z:0.1f}). Total: {_config.WallPath.Count}");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.clearpath")]
        private void UIS_ClearPath(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            _config.WallPath = new List<V2>();
            InvalidateFXCache();
            RebuildSegments();
            SendReply(p, $"{_config.ChatPrefix} Stormwall path cleared.");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.saveconfig")]
        private void UIS_SaveConfig(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            SaveConfig();
            SaveData();
            SendReply(p, $"{_config.ChatPrefix} Configuration and data saved.");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.sounds")]
        private void UIS_Sounds(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            _config.EnableSounds = !_config.EnableSounds;
            SendReply(p, $"{_config.ChatPrefix} Sounds: {(_config.EnableSounds ? "Enabled" : "Disabled")}");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.thickness.delta")]
        private void UIS_ThicknessDelta(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            float delta = arg.GetFloat(0, 0f);
            float t = Mathf.Clamp(_config.WallThickness + delta, 5f, 200f);
            _config.WallThickness = t;
            RebuildSegments();
            SaveConfig();
            SendReply(p, $"{_config.ChatPrefix} Thickness: {_config.WallThickness:0.#}m");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.tick.delta")]
        private void UIS_TickDelta(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            float delta = arg.GetFloat(0, 0f);
            _config.TickRate = Mathf.Clamp(_config.TickRate + delta, 0.1f, 2.0f);
            _tick = Mathf.Clamp(_config.TickRate, 0.1f, 2.0f);
            _graceTicks = Mathf.Max(1, Mathf.CeilToInt(1.0f / Mathf.Max(_tick, 0.001f)));
            try { _handle?.Destroy(); } catch { }
            _handle = null;
            if (_config.Enabled)
            {
                _handle = timer.Every(_tick, TickStormwall);
            }
            SaveConfig();
            SendReply(p, $"{_config.ChatPrefix} Tick Rate: {_config.TickRate:0.##}s");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.minspeed.delta")]
        private void UIS_MinSpeedDelta(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            float delta = arg.GetFloat(0, 0f);
            _config.MinSpeedForCrossing = Mathf.Clamp(_config.MinSpeedForCrossing + delta, 0.2f, 10f);
            SaveConfig();
            SendReply(p, $"{_config.ChatPrefix} Min Speed: {_config.MinSpeedForCrossing:0.##} m/s");
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.align.delta")]
        private void UIS_AlignDelta(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return;
            if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            float delta = arg.GetFloat(0, 0f);
            _config.CrossingAlignmentThreshold = Mathf.Clamp01(_config.CrossingAlignmentThreshold + delta);
            SaveConfig();
            SendReply(p, $"{_config.ChatPrefix} Alignment Threshold: {_config.CrossingAlignmentThreshold:0.##}");
            OpenUI(p);
        }

        // =================== UI (CUI) ===================
        [ConsoleCommand("eldrunstorm.ui.close")]
        private void UIS_Close(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; try { CuiHelper.DestroyUi(p, PanelName); } catch { }
        }

        [ConsoleCommand("eldrunstorm.ui.refresh")]
        private void UIS_Refresh(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return; OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.preview")]
        private void UIS_Preview(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            bool on = arg.GetBool(0, _previewEnabled);
            _previewEnabled = on && (_config?.EnableVisuals ?? false);
            try { _previewHandle?.Destroy(); } catch { }
            _previewHandle = null;
            if (_previewEnabled)
            {
                _previewHandle = timer.Every(Mathf.Max(2f, _config.PreviewSeconds * 0.8f), DrawPreviewAll);
                DrawPreviewFor(p);
            }
            OpenUI(p);
        }

        [ConsoleCommand("eldrunstorm.ui.enable")]
        private void UIS_Enable(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; if (!permission.UserHasPermission(p.UserIDString, PermAdmin)) return;
            bool en = arg.GetBool(0, _config.Enabled);
            Eldrun_SetEnabled(en);
            OpenUI(p);
        }
        
        [ConsoleCommand("eldrunstorm.ui.tab")]
        private void UIS_Tab(ConsoleSystem.Arg arg)
        {
            var p = arg.Player();
            if (p == null) return;
            string tab = arg.GetString(0, "overview");
            // sanitize
            if (tab != "overview" && tab != "player" && tab != "admin" && tab != "help")
            {
                tab = "overview";
            }
            if (_uiActiveTab.ContainsKey(p.userID))
            {
                _uiActiveTab[p.userID] = tab;
            }
            else
            {
                _uiActiveTab.Add(p.userID, tab);
            }
            OpenUI(p);
        }

        private void OpenUI(BasePlayer player)
        {
            if (player == null) return;
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            var c = new CuiElementContainer();
            var themeColors = GetPlayerThemeColors(player);
            // Ensure theme overrides are available
            LoadTheme();
            bool isAdmin = permission.UserHasPermission(player.UserIDString, PermAdmin);
            string activeTab = "overview";
            if (_uiActiveTab != null && _uiActiveTab.TryGetValue(player.userID, out var tabVal) && !string.IsNullOrEmpty(tabVal))
            {
                activeTab = tabVal;
            }

            // Main Background Panel - fullscreen unified Eldrun UI
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.3f }, 
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }, 
                CursorEnabled = true 
            }, "Overlay", PanelName);
            
            // Dark overlay for readability
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0.08 0.12 0.18 0.4", FadeIn = 0.4f }, 
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" } 
            }, PanelName, "UIOverlay");
            
            // Manual count instead of LINQ.Count()
            int activeWalls = 0;
            if (_walls != null)
            {
                foreach (var wall in _walls)
                {
                    if (wall.IsActive) activeWalls++;
                }
            }
            var totalWalls = _walls?.Count ?? 0;
            var totalCrossings = _data?.TotalCrossings ?? 0;
            var totalDeaths = _data?.TotalDeaths ?? 0;
            var legendaryCount = 0;
            if (_data?.PlayerStats != null)
            {
                foreach (var stats in _data.PlayerStats.Values)
                {
                    if (stats.IsLegendaryCrosser) legendaryCount++;
                }
            }
            
            var bannerText = GetLocalizedMessage("stormwall.ui.banner", player);
            if (string.IsNullOrEmpty(bannerText) || bannerText.StartsWith("[")) bannerText = "⚡ ELDRUN STORMWALL";
            
            // Header Panel - unified Eldrun style
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f }, 
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.81 0.99" } 
            }, "UIOverlay", "HeaderPanel");
            
            // Cyan Border oben (wie Kits)
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0 1 1 0.6" }, 
                RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } 
            }, "HeaderPanel");
            
            // Cyan Border unten (wie Kits)
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0 1 1 0.6" }, 
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" } 
            }, "HeaderPanel");

            // Header left tabs (Overview, Player Stats, Admin, Help)
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0" },
                RectTransform = { AnchorMin = "0.02 0.15", AnchorMax = "0.40 0.88" }
            }, "HeaderPanel", "HeaderTabs");

            var _tabs = new List<string>();
            _tabs.Add("overview");
            _tabs.Add("player");
            // Admin-Tab aus dem Header entfernt, Navigation fuer Admin erfolgt spaeter ueber Sidebar
            _tabs.Add("help");
            float _tabWidth = 0.18f; // 4 tabs fit in 0.40 width
            float _tabSpacing = 0.01f;
            float _startX = 0.00f;
            for (int i = 0; i < _tabs.Count; i++)
            {
                string tName = _tabs[i];
                string tLabel = tName == "overview" ? UIL("stormwall.ui.tab.overview","Overview", player)
                    : (tName == "player" ? UIL("stormwall.ui.tab.player","Player Stats", player)
                    : (tName == "admin" ? UIL("stormwall.ui.tab.admin","Admin", player)
                    : UIL("stormwall.ui.tab.help","Help", player)));
                bool isActiveTab = activeTab == tName;
                string btnColor = isActiveTab ? themeColors["AccentColor"] : "0.20 0.20 0.24 0.85";
                string txtColor = isActiveTab ? "1 1 1 1" : themeColors["CategoryGold"];
                float minX = _startX + i * (_tabWidth + _tabSpacing);
                float maxX = minX + _tabWidth;
                c.Add(new CuiButton
                {
                    Button = { Command = $"eldrunstorm.ui.tab {tName}", Color = btnColor, FadeIn = 0.3f + (i * 0.03f) },
                    RectTransform = { AnchorMin = $"{minX} 0.05", AnchorMax = $"{maxX} 0.95" },
                    Text = { Text = tLabel, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = txtColor }
                }, "HeaderTabs");
            }

            // Globaler Eldrun-Header-Text für Stormwall System
            var headerText = $"⚔ EldrunRust BETA  | 📦 Stormwall System | 👤 Walls: {activeWalls}/{totalWalls} | ⚔ Crossings: {totalCrossings} | 💀 Deaths: {totalDeaths} | ⭐ Legendary: {legendaryCount}";
            c.Add(new CuiLabel 
            { 
                Text = { Text = headerText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] }, 
                RectTransform = { AnchorMin = "0.03 0.15", AnchorMax = "0.96 0.88" } 
            }, "HeaderPanel");
            
            // ═══ RECHTE SIDEBAR MIT FUNKTIONEN - unified anchors ═══
            if (isAdmin)
            {
                // Sidebar Background Panel
                c.Add(new CuiPanel 
                { 
                    Image = { Color = "0 0 0 0.8", FadeIn = 0.4f }, 
                    RectTransform = { AnchorMin = "0.82 0.12", AnchorMax = "0.97 0.89" } 
                }, "UIOverlay", "ControlSidebar");
                
                // Sidebar Title
                c.Add(new CuiLabel 
                { 
                    Text = { Text = UIL("stormwall.ui.admin.title","⚙ Admin Controls", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] }, 
                    RectTransform = { AnchorMin = "0 0.94", AnchorMax = "1 0.99" } 
                }, "ControlSidebar");
                
                var buttonHeight = 0.07f;
                var spacing = 0.01f;
                var yStart = 0.88f;
                
                // 1. Enable/Disable Toggle
                var enableColor = _config.Enabled ? TV("close_btn", "0.45 0.10 0.10 0.90") : TV("random_btn", "0.18 0.55 0.20 0.90");
                var enableText = _config.Enabled ? UIL("stormwall.ui.btn.disable_stormwall","Disable Stormwall", player) : UIL("stormwall.ui.btn.enable_stormwall","Enable Stormwall", player);
                c.Add(new CuiButton 
                { 
                    Button = { Color = enableColor, Command = _config.Enabled ? "eldrunstorm.ui.enable false" : "eldrunstorm.ui.enable true", FadeIn = 0.3f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = enableText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 2. Preview Toggle
                var previewColor = _previewEnabled ? TV("team1_join", "0.60 0.50 0.20 0.90") : TV("tab_inactive", "0.25 0.25 0.30 0.85");
                var previewText = _previewEnabled ? UIL("stormwall.ui.btn.preview.disable","Disable Preview", player) : UIL("stormwall.ui.btn.preview.enable","Enable Preview", player);
                c.Add(new CuiButton 
                { 
                    Button = { Color = previewColor, Command = _previewEnabled ? "eldrunstorm.ui.preview false" : "eldrunstorm.ui.preview true", FadeIn = 0.35f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = previewText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 3. FX Toggle
                var fxColor = _config.EnableFX ? TV("team1_join", "0.60 0.50 0.20 0.90") : TV("tab_inactive", "0.25 0.25 0.30 0.85");
                var fxText = _config.EnableFX ? UIL("stormwall.ui.btn.fx.disable","Disable Effects", player) : UIL("stormwall.ui.btn.fx.enable","Enable Effects", player);
                c.Add(new CuiButton 
                { 
                    Button = { Color = fxColor, Command = "eldrunstorm.ui.fx", FadeIn = 0.4f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = fxText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 4. Sounds Toggle
                var soundColor = _config.EnableSounds ? TV("team1_join", "0.60 0.50 0.20 0.90") : TV("tab_inactive", "0.25 0.25 0.30 0.85");
                var soundText = _config.EnableSounds ? UIL("stormwall.ui.btn.sound.disable","Disable Sound", player) : UIL("stormwall.ui.btn.sound.enable","Enable Sound", player);
                c.Add(new CuiButton 
                { 
                    Button = { Color = soundColor, Command = "eldrunstorm.ui.sounds", FadeIn = 0.45f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = soundText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 5. Reload Config
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("info_btn", "0.25 0.45 0.65 0.90"), Command = "eldrunstorm.ui.reload", FadeIn = 0.5f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = UIL("stormwall.ui.btn.reload","Reload Configuration", player), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 6. Show Stats
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("success_btn", "0.25 0.65 0.35 0.90"), Command = "eldrunstorm.ui.stats", FadeIn = 0.55f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = UIL("stormwall.ui.btn.stats","Show Global Statistics", player), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 11. Tick Rate +/-
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.tick.delta -0.1", FadeIn = 0.8f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.49 {yStart}" }, 
                    Text = { Text = "Tick -0.1s", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.tick.delta 0.1", FadeIn = 0.8f }, 
                    RectTransform = { AnchorMin = $"0.51 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = "Tick +0.1s", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);

                // 12. Min Speed +/-
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.minspeed.delta -0.2", FadeIn = 0.85f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.49 {yStart}" }, 
                    Text = { Text = "MinSpeed -0.2", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.minspeed.delta 0.2", FadeIn = 0.85f }, 
                    RectTransform = { AnchorMin = $"0.51 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = "MinSpeed +0.2", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);

                // 13. Alignment +/-
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.align.delta -0.05", FadeIn = 0.9f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.49 {yStart}" }, 
                    Text = { Text = "Align -0.05", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("neutral_btn", "0.35 0.35 0.45 0.90"), Command = "eldrunstorm.ui.align.delta 0.05", FadeIn = 0.9f }, 
                    RectTransform = { AnchorMin = $"0.51 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = "Align +0.05", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
                yStart -= (buttonHeight + spacing);
                
                // 9. Save Config
                c.Add(new CuiButton 
                { 
                    Button = { Color = TV("info_btn", "0.25 0.45 0.65 0.90"), Command = "eldrunstorm.ui.saveconfig", FadeIn = 0.7f }, 
                    RectTransform = { AnchorMin = $"0.03 {yStart - buttonHeight}", AnchorMax = $"0.97 {yStart}" }, 
                    Text = { Text = UIL("stormwall.ui.btn.save","Save Data", player), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
                }, "ControlSidebar");
            }
            
            // Close & Refresh Buttons (top right) – EldrunKits-Style (Neon Green / Neon Red)
            c.Add(new CuiButton 
            { 
                Button = { Command = "eldrunstorm.ui.refresh", Color = "0 0.4 0.2 0.9", FadeIn = 0.3f }, 
                RectTransform = { AnchorMin = "0.84 0.93", AnchorMax = "0.90 0.97" }, 
                Text = { Text = UIL("stormwall.ui.btn.refresh","🔄 REFRESH", player), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" } 
            }, "UIOverlay");

            c.Add(new CuiButton 
            { 
                Button = { Command = "eldrunstorm.ui.close", Color = "0.4 0 0 0.9", FadeIn = 0.3f, Close = PanelName }, 
                RectTransform = { AnchorMin = "0.91 0.93", AnchorMax = "0.98 0.97" }, 
                Text = { Text = UIL("stormwall.ui.btn.close","❌ CLOSE", player), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 0.3 0.3 1" } 
            }, "UIOverlay");

            // ═══ FOOTER MIT KONSISTENTEN PLUGIN-INFOS (ohne Datum/Uhrzeit) ═══
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f }, 
                RectTransform = { AnchorMin = "0.02 0.02", AnchorMax = "0.81 0.10" } 
            }, "UIOverlay", "FooterPanel");
            
            // Cyan Border oben
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0 1 1 0.6" }, 
                RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } 
            }, "FooterPanel");
            
            // Cyan Border unten
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0 1 1 0.6" }, 
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" } 
            }, "FooterPanel");
            
            // Einheitlicher globaler Eldrun-Footer
            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            c.Add(new CuiLabel 
            { 
                Text = { Text = footerText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" }, 
                RectTransform = { AnchorMin = "0.02 0.2", AnchorMax = "0.98 0.8" } 
            }, "FooterPanel");
            
            // ═══ CONTENT AREA - unified anchors ═══
            c.Add(new CuiPanel 
            { 
                Image = { Color = "0 0 0 0.6", FadeIn = 0.4f }, 
                RectTransform = { AnchorMin = "0.02 0.16", AnchorMax = "0.81 0.87" } 
            }, "UIOverlay", "ContentPanel");

            // Content by active tab
            if (activeTab == "overview")
            {
                var statusTitle = _config.Enabled ? UIL("stormwall.ui.status.active","✅ Stormwall Active", player) : UIL("stormwall.ui.status.inactive","❌ Stormwall Inactive", player);
                var statusColor = _config.Enabled ? themeColors["SuccessColor"] : themeColors["ErrorColor"];
                c.Add(new CuiLabel 
                { 
                    Text = { Text = statusTitle, FontSize = 18, Align = TextAnchor.MiddleCenter, Color = statusColor }, 
                    RectTransform = { AnchorMin = "0.1 0.85", AnchorMax = "0.9 0.95" } 
                }, "ContentPanel");

                int n = _config.WallPath?.Count ?? 0;
                var infoLines = new List<string>();
                infoLines.Add($"⚡ Wall Thickness: {_config.WallThickness:0.#} meters");
                infoLines.Add($"📍 Path Points: {n}");
                infoLines.Add($"⏱ Tick Rate: {_config.TickRate:0.##} seconds");
                infoLines.Add($"🏊 Min Crossing Speed: {_config.MinSpeedForCrossing:0.##} m/s");
                infoLines.Add($"↕ Alignment Threshold: {_config.CrossingAlignmentThreshold:0.##}");
                infoLines.Add($"🌉 Bridge Safe Drain: {_config.BridgeDrainPerSec:0.#} HP/sec");
                infoLines.Add($"🎯 Crossing Target Loss: {(_config.CrossingTargetLossMin * 100):0}%-{(_config.CrossingTargetLossMax * 100):0}%");
                infoLines.Add($"🎬 Effects: {(_config.EnableFX ? "Enabled" : "Disabled")}");
                infoLines.Add($"🔊 Sound: {(_config.EnableSounds ? "Enabled" : "Disabled")}");
                infoLines.Add($"👁 Preview: {(_previewEnabled ? "Enabled" : "Disabled")}");
                infoLines.Add($"📊 Stats Tracking: {(_config.TrackPlayerStats ? "Enabled" : "Disabled")}");

                var yPos = 0.75f;
                var lineHeight = 0.07f;
                for (int i = 0; i < infoLines.Count; i++)
                {
                    var line = infoLines[i];
                    c.Add(new CuiLabel 
                    { 
                        Text = { Text = line, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = themeColors["TextColor"] }, 
                        RectTransform = { AnchorMin = $"0.05 {yPos - lineHeight}", AnchorMax = $"0.95 {yPos}" } 
                    }, "ContentPanel");
                    yPos -= lineHeight;
                }

                // Crossing Progress Bar (if currently inside)
                Vector2 uiNearest, uiSegA, uiSegB, uiSegN; 
                float uiDist = DistanceToWallXZ(player.transform.position, out uiNearest, out uiSegA, out uiSegB, out uiSegN);
                bool uiInside = uiDist <= Mathf.Max(0.1f, _config.WallThickness) * 0.5f;
                if (uiInside)
                {
                    int esign = 0; _entrySign.TryGetValue(player.userID, out esign);
                    if (esign == 0) esign = 1;
                    float sd = Vector2.Dot(new Vector2(player.transform.position.x, player.transform.position.z) - uiNearest, uiSegN.sqrMagnitude > 0.0001f ? uiSegN.normalized : Vector2.right);
                    float progress = Mathf.InverseLerp(-_config.WallThickness * 0.5f, _config.WallThickness * 0.5f, sd * esign);
                    progress = Mathf.Clamp01(progress);
                    string progressText = null;
                    var progressLoc = GetLocalizedMessage("stormwall.ui.progress.label", player, new Dictionary<string,string>{{"progress", ($"{(progress * 100f):0}")}});
                    if (!string.IsNullOrEmpty(progressLoc) && progressLoc != "[stormwall.ui.progress.label]")
                        progressText = progressLoc;
                    else
                        progressText = $"Crossing Progress: {(progress * 100f):0}%";
                    c.Add(new CuiLabel 
                    { 
                        Text = { Text = progressText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] }, 
                        RectTransform = { AnchorMin = "0.05 0.16", AnchorMax = "0.95 0.22" } 
                    }, "ContentPanel");
                    // Bar background
                    c.Add(new CuiPanel { Image = { Color = themeColors["SecondaryColor"] }, RectTransform = { AnchorMin = "0.05 0.12", AnchorMax = "0.95 0.16" } }, "ContentPanel", "ProgressBG");
                    float fillMaxX = 0.05f + 0.90f * progress;
                    c.Add(new CuiPanel { Image = { Color = themeColors["SuccessColor"] }, RectTransform = { AnchorMin = "0.05 0.12", AnchorMax = $"{fillMaxX} 0.16" } }, "ContentPanel");
                }
            }
            else if (activeTab == "player")
            {
                c.Add(new CuiLabel 
                { 
                    Text = { Text = UIL("stormwall.ui.player.header","——— Your Stormwall Statistics ———", player), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] }, 
                    RectTransform = { AnchorMin = "0.1 0.82", AnchorMax = "0.9 0.90" } 
                }, "ContentPanel");

                if (_data?.PlayerStats != null && _data.PlayerStats.ContainsKey(player.userID))
                {
                    var ps = _data.PlayerStats[player.userID];
                    var lines = new List<string>();
                    lines.Add($"✅ Successful Crossings: {ps.SuccessfulCrossings}");
                    lines.Add($"⚠ Crossing Attempts: {ps.CrossingAttempts}");
                    lines.Add($"☠ Deaths: {ps.StormwallDeaths}");
                    lines.Add($"🩸 Damage Taken: {ps.TotalDamageTaken:0.#} HP");
                    if (ps.IsLegendaryCrosser)
                    {
                        var legendaryLabel = UIL("stormwall.ui.player.legendary","⭐ Legendary Crosser!", player);
                        lines.Add(legendaryLabel);
                    }

                    float y = 0.70f;
                    for (int i = 0; i < lines.Count; i++)
                    {
                        var line = lines[i];
                        c.Add(new CuiLabel 
                        { 
                            Text = { Text = line, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] }, 
                            RectTransform = { AnchorMin = $"0.08 {y - 0.05f}", AnchorMax = $"0.92 {y}" } 
                        }, "ContentPanel");
                        y -= 0.07f;
                    }
                }
                else
                {
                    c.Add(new CuiLabel 
                    { 
                        Text = { Text = UIL("stormwall.ui.player.no_stats","No statistics available yet. Enter the Stormwall to begin tracking.", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = themeColors["SubTextColor"] }, 
                        RectTransform = { AnchorMin = "0.1 0.45", AnchorMax = "0.9 0.55" } 
                    }, "ContentPanel");
                }
                // Leaderboard Top 10 by Successful Crossings
                if (_data?.PlayerStats != null && _data.PlayerStats.Count > 0)
                {
                    var listStats = new List<PlayerStormwallStats>(_data.PlayerStats.Values);
                    listStats.Sort((a, b) => b.SuccessfulCrossings.CompareTo(a.SuccessfulCrossings));
                    int top = Mathf.Min(10, listStats.Count);
                    c.Add(new CuiLabel { Text = { Text = UIL("stormwall.ui.top_crossers.header","——— Global Top Crossers ———", player), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] }, RectTransform = { AnchorMin = "0.1 0.50", AnchorMax = "0.9 0.58" } }, "ContentPanel");
                    float yL = 0.46f;
                    for (int i = 0; i < top; i++)
                    {
                        var s = listStats[i];
                        string line = $"#{i+1} {s.PlayerName}  |  ✅ {s.SuccessfulCrossings}  |  ☠ {s.StormwallDeaths}";
                        c.Add(new CuiLabel { Text = { Text = line, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] }, RectTransform = { AnchorMin = $"0.08 {yL - 0.05f}", AnchorMax = $"0.92 {yL}" } }, "ContentPanel");
                        yL -= 0.06f;
                    }
                }
            }
            else if (activeTab == "admin")
            {
                // Admin-Status-Header
                c.Add(new CuiLabel 
                { 
                    Text = { Text = UIL("stormwall.ui.admin.status.header","——— Current Stormwall Status ———", player), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] }, 
                    RectTransform = { AnchorMin = "0.1 0.80", AnchorMax = "0.9 0.88" } 
                }, "ContentPanel");

                // Enabled / disabled
                string enabledLabel = _config.Enabled 
                    ? GetLocalizedMessage("stormwall.ui.admin.status.enabled.on", player) 
                    : GetLocalizedMessage("stormwall.ui.admin.status.enabled.off", player);
                string enabledLine = GetLocalizedMessage("stormwall.ui.admin.status.enabled", player, new Dictionary<string,string>{{"value", enabledLabel}});

                // Tickrate / MinSpeed / Alignment
                string tickLine = GetLocalizedMessage("stormwall.ui.admin.status.tickrate", player, new Dictionary<string,string>{{"value", _config.TickRate.ToString("0.##", CultureInfo.InvariantCulture)}});
                string speedLine = GetLocalizedMessage("stormwall.ui.admin.status.minspeed", player, new Dictionary<string,string>{{"value", _config.MinSpeedForCrossing.ToString("0.##", CultureInfo.InvariantCulture)}});
                string alignLine = GetLocalizedMessage("stormwall.ui.admin.status.align", player, new Dictionary<string,string>{{"value", _config.CrossingAlignmentThreshold.ToString("0.##", CultureInfo.InvariantCulture)}});

                // FX / Sound / Preview / Stats flags
                Func<bool, string> flagToText = on => GetLocalizedMessage(on ? "stormwall.ui.admin.status.on" : "stormwall.ui.admin.status.off", player);
                string fxLine = GetLocalizedMessage("stormwall.ui.admin.status.fx", player, new Dictionary<string,string>{{"value", flagToText(_config.EnableFX)}});
                string soundLine = GetLocalizedMessage("stormwall.ui.admin.status.sound", player, new Dictionary<string,string>{{"value", flagToText(_config.EnableSounds)}});
                string previewLine = GetLocalizedMessage("stormwall.ui.admin.status.preview", player, new Dictionary<string,string>{{"value", flagToText(_previewEnabled)}});
                string statsLine = GetLocalizedMessage("stormwall.ui.admin.status.stats", player, new Dictionary<string,string>{{"value", flagToText(_config.TrackPlayerStats)}});

                var adminInfoLines = new List<string> { enabledLine, tickLine, speedLine, alignLine, fxLine, soundLine, previewLine, statsLine };
                float ay = 0.72f;
                float aStep = 0.06f;
                for (int i = 0; i < adminInfoLines.Count; i++)
                {
                    var line = adminInfoLines[i];
                    if (string.IsNullOrEmpty(line) || line.StartsWith("[")) continue;
                    c.Add(new CuiLabel 
                    { 
                        Text = { Text = line, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = themeColors["TextColor"] }, 
                        RectTransform = { AnchorMin = $"0.08 {ay - aStep}", AnchorMax = $"0.92 {ay}" } 
                    }, "ContentPanel");
                    ay -= aStep;
                }

                // Hinweis-Text unten
                c.Add(new CuiLabel 
                { 
                    Text = { Text = UIL("stormwall.ui.admin.help","Use the Admin Controls on the right to manage the Stormwall.", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = themeColors["SubTextColor"] }, 
                    RectTransform = { AnchorMin = "0.1 0.12", AnchorMax = "0.9 0.20" } 
                }, "ContentPanel");
            }
            else if (activeTab == "help")
            {
                c.Add(new CuiLabel 
                { 
                    Text = { Text = UIL("stormwall.ui.help.header","——— How to Cross the Stormwall ———", player), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] }, 
                    RectTransform = { AnchorMin = "0.1 0.82", AnchorMax = "0.9 0.90" } 
                }, "ContentPanel");

                var helpLines = new List<string>();
                helpLines.Add(UIL("stormwall.ui.help.line1","Swim straight and fast across the wall — do not stop.", player));
                helpLines.Add(UIL("stormwall.ui.help.line2","Keep your movement aligned with the wall's normal direction.", player));
                helpLines.Add(UIL("stormwall.ui.help.line3","Using bridges is safer but drains 1 HP/second by default.", player));
                helpLines.Add(UIL("stormwall.ui.help.line4","If effects or preview distract you, ask an admin to disable them.", player));

                float yH = 0.70f;
                for (int i = 0; i < helpLines.Count; i++)
                {
                    var line = helpLines[i];
                    c.Add(new CuiLabel 
                    { 
                        Text = { Text = line, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] }, 
                        RectTransform = { AnchorMin = $"0.08 {yH - 0.05f}", AnchorMax = $"0.92 {yH}" } 
                    }, "ContentPanel");
                    yH -= 0.07f;
                }
            }
            
            // Accent and decorations – Gold auf Cyan/Blau umgestellt
            c.Add(new CuiPanel { Image = { Color = TV("accent_primary", "0 1 1 0.20") }, RectTransform = { AnchorMin = "0.02 0.92", AnchorMax = "0.98 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("accent_line", "0 1 1 0.35") }, RectTransform = { AnchorMin = "0.02 0.915", AnchorMax = "0.98 0.918" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("gloss", "1.0 1.0 1.0 0.02") }, RectTransform = { AnchorMin = "0.02 0.90", AnchorMax = "0.98 0.93" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_left", "0 0.6 0.8 0.25") }, RectTransform = { AnchorMin = "0.01 0.10", AnchorMax = "0.03 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_right", "0 0.6 0.8 0.25") }, RectTransform = { AnchorMin = "0.97 0.10", AnchorMax = "0.99 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0 1 1 0.20") }, RectTransform = { AnchorMin = "0.015 0.11", AnchorMax = "0.985 0.12" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0 1 1 0.20") }, RectTransform = { AnchorMin = "0.015 0.88", AnchorMax = "0.985 0.89" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0 1 1 0.20") }, RectTransform = { AnchorMin = "0.015 0.12", AnchorMax = "0.02 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0 1 1 0.20") }, RectTransform = { AnchorMin = "0.98 0.12", AnchorMax = "0.985 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") }, RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.98 0.89" } }, PanelName);

            // Optional watermark
            var wmUrl = TV("watermark_url", null);
            if (!string.IsNullOrEmpty(wmUrl)) 
            {
                c.Add(new CuiElement 
                { 
                    Parent = PanelName, 
                    Components = 
                    { 
                        new CuiRawImageComponent { Color = TV("watermark_color", "1 1 1 0.02"), Url = wmUrl }, 
                        new CuiRectTransformComponent { AnchorMin = TV("watermark_min", "0.38 0.30"), AnchorMax = TV("watermark_max", "0.62 0.58") } 
                    } 
                });
            }
            
            // Optional attribution
            if (TV("show_attribution", "false") == "true") 
            {
                c.Add(new CuiLabel 
                { 
                    Text = { Text = "Icons: game-icons.net (CC BY 3.0)", FontSize = 10, Align = TextAnchor.MiddleRight, Color = themeColors["SubTextColor"] }, 
                    RectTransform = { AnchorMin = "0.70 0.122", AnchorMax = "0.96 0.135" } 
                }, PanelName);
            }

            CuiHelper.AddUi(player, c);
        }


        // ============ FX System ============
        private void StartFX()
        {
            try { _fxHandle?.Destroy(); } catch { }
            _fxHandle = timer.Every(Mathf.Clamp(_config.FXTickSeconds, 1f, 30f), FXPulse);
        }

        private void InvalidateFXCache()
        {
            _fxPoints = null; _fxSeed++;
        }

        private void EnsureFXPoints()
        {
            if (_fxPoints != null && _fxPoints.Count > 0) return;
            _fxPoints = BuildFXPoints();
        }

        private List<Vector3> BuildFXPoints()
        {
            var pts = new List<Vector3>();
            if (_config.WallPath == null || _config.WallPath.Count < 2) return pts;
            // Compute spacing by density per km
            float perKm = Mathf.Max(1, _config.FXPointsPerKm);
            float spacing = 1000f / perKm; // meters per sample
            float yOffset = Mathf.Clamp(_config.FXCloudHeight, 5f, 200f);
            for (int i = 0; i < _config.WallPath.Count - 1; i++)
            {
                var a = _config.WallPath[i]; var b = _config.WallPath[i + 1];
                Vector2 A = new Vector2(a.X, a.Z); Vector2 B = new Vector2(b.X, b.Z);
                float len = Vector2.Distance(A, B);
                if (len <= 0.01f) continue;
                Vector2 dir = (B - A).normalized;
                int steps = Mathf.Max(1, Mathf.FloorToInt(len / spacing));
                for (int s = 0; s <= steps; s++)
                {
                    float dist = Mathf.Min(len, s * spacing);
                    Vector2 p2 = A + dir * dist;
                    float y = GetTerrainHeight(p2.x, p2.y) + yOffset;
                    pts.Add(new Vector3(p2.x, y, p2.y));
                }
            }
            return pts;
        }

        private float GetTerrainHeight(float x, float z)
        {
            try { return TerrainMeta.HeightMap.GetHeight(x, z); } catch { return 5f; }
        }

        private void FXPulse()
        {
            if (!_config.EnableFX || !_config.Enabled) return;
            // Skip if no prefabs set
            bool anyPrefab = !string.IsNullOrEmpty(_config.FXStormPrefab) || !string.IsNullOrEmpty(_config.FXLightningPrefab) || !string.IsNullOrEmpty(_config.FXRainPrefab) || !string.IsNullOrEmpty(_config.FXSound);
            if (!anyPrefab) return;
            EnsureFXPoints(); if (_fxPoints == null || _fxPoints.Count == 0) return;
            var players = BasePlayer.activePlayerList; if (players == null || players.Count == 0) return;
            float chance = Mathf.Clamp01(_config.FXSpawnChance);
            float radius = 200f; float r2 = radius * radius;
            int spawned = 0; int maxSpawn = 40; // limit per tick
            foreach (var p in _fxPoints)
            {
                bool near = false;
                foreach (var pl in players)
                {
                    if (pl == null) continue;
                    var d2 = (pl.transform.position - p).sqrMagnitude;
                    if (d2 <= r2) { near = true; break; }
                }
                if (!near) continue;
                if (UnityEngine.Random.value > chance) continue;
                int pick = UnityEngine.Random.Range(0, 4);
                string prefab = null;
                if (pick == 0) prefab = _config.FXStormPrefab;
                else if (pick == 1) prefab = _config.FXRainPrefab;
                else if (pick == 2) prefab = _config.FXLightningPrefab;
                else prefab = _config.FXSound;
                if (!string.IsNullOrEmpty(prefab))
                {
                    var pos = p + new Vector3(UnityEngine.Random.Range(-2f, 2f), UnityEngine.Random.Range(-3f, 3f), UnityEngine.Random.Range(-2f, 2f));
                    try { Effect.server.Run(prefab, pos); } catch { }
                    spawned++;
                    if (spawned >= maxSpawn) break;
                }
            }
        }

        private Dictionary<string, string> GetPlayerThemeColors(BasePlayer player)
        {
            return new Dictionary<string, string>
            {
                ["PrimaryColor"] = "0.06 0.06 0.10 0.98", ["SecondaryColor"] = "0.10 0.10 0.16 0.95", ["BackgroundColor"] = "0.08 0.08 0.12 0.96",
                ["HeaderColor"] = "1 0.88 0.42 1", ["CategoryGold"] = "0.95 0.75 0.35 1", ["AccentColor"] = "0.78 0.58 0.28 1",
                ["HoverColor"] = "0.85 0.65 0.32 0.9", ["BorderColor"] = "0.42 0.32 0.18 0.8",
                ["TextColor"] = "0.96 0.96 0.99 1", ["SubTextColor"] = "0.85 0.85 0.90 1", ["LabelColor"] = "0.75 0.75 0.82 1",
                ["SuccessColor"] = "0.28 0.88 0.38 1", ["WarningColor"] = "0.92 0.68 0.28 1", ["ErrorColor"] = "0.88 0.28 0.28 1", ["InfoColor"] = "0.38 0.68 0.92 1",
                ["RarityBasic"] = "0.6 0.6 0.6 1", ["RarityAdvanced"] = "0.4 0.8 0.4 1", ["RarityElite"] = "0.4 0.6 0.9 1",
                ["RarityLegendary"] = "0.8 0.4 0.8 1", ["RarityMythic"] = "0.9 0.6 0.2 1", ["RarityGodlike"] = "1 0.8 0.2 1"
            };
        }
    }
}

