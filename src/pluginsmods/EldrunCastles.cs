using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("EldrunCastles", "SirEldrun", "36187")]
    [Description("Castle System - BETA")]
    public class EldrunCastles : RustPlugin
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
        
        private bool HasPermission(BasePlayer player, string perm)
        {
            if (player == null) return false;
            // Admin: erlauben, wenn SteamID-Admin ODER Admin-Permission ODER Rust-Admin
            if (perm == AdminPerm)
            {
                return IsServerAdmin(player) || permission.UserHasPermission(player.UserIDString, AdminPerm) || player.IsAdmin;
            }

            // Use-Permission: optional je nach Config, Admins dürfen immer
            if (perm == UsePerm)
            {
                if (_config != null && _config.RequireUsePermission)
                {
                    return permission.UserHasPermission(player.UserIDString, UsePerm) || IsServerAdmin(player) || player.IsAdmin;
                }
                // Standard: jeder darf benutzen
                return true;
            }

            // Sonstige Permissions (Fallback)
            return permission.UserHasPermission(player.UserIDString, perm) || IsServerAdmin(player) || player.IsAdmin;
        }
        [PluginReference] private Plugin EldrunCore;
        [PluginReference] private Plugin EldrunFraktion;
        [PluginReference] private Plugin EldrunXP;

        private const string DataFileName = "eldrun_castles";
        private const string AdminPerm = "eldruncastles.admin";
        private const string UsePerm = "eldruncastles.use";
        private const string PluginName = "EldrunCastles";
        private const string PluginAuthor = "SirEldrun";
        private const string PluginVersion = "36187";
        
        // SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        
        // === AAA CASTLE SYSTEM ENUMS ===
        public enum CastleUpgradeType
        {
            MainHall = 1,
            Walls = 2,
            Towers = 3,
            Gates = 4,
            Barracks = 5,
            Armory = 6,
            Treasury = 7,
            Stables = 8,
            Workshop = 9,
            Library = 10,
            Temple = 11,
            Market = 12
        }
        
        public enum DefenseType
        {
            AutoTurret = 1,
            Ballista = 2,
            Catapult = 3,
            ArrowTrap = 4,
            SpikeTrap = 5,
            FireTrap = 6,
            Guards = 7,
            Walls = 8,
            Moat = 9,
            Drawbridge = 10
        }
        
        public enum SiegeWeaponType
        {
            BatteringRam = 1,
            SiegeTower = 2,
            Trebuchet = 3,
            Catapult = 4,
            SiegeLadder = 5,
            SapperTunnel = 6
        }
        
        public enum TroopType
        {
            Infantry = 1,
            Archers = 2,
            Cavalry = 3,
            Engineers = 4,
            Guards = 5,
            Scouts = 6,
            Siege_Operators = 7,
            Elite_Guards = 8
        }
        
        public class CastleUpgrade
        {
            public CastleUpgradeType Type { get; set; }
            public int Level { get; set; } = 0;
            public int MaxLevel { get; set; } = 10;
            public Dictionary<string, int> Requirements { get; set; } = new Dictionary<string, int>();
            public Dictionary<string, object> Benefits { get; set; } = new Dictionary<string, object>();
            public bool IsUnlocked { get; set; } = false;
            public DateTime LastUpgraded { get; set; }
        }
        
        public class DefenseStructure
        {
            public string Id { get; set; }
            public DefenseType Type { get; set; }
            public Vector3 Position { get; set; }
            public int Level { get; set; } = 1;
            public int Health { get; set; } = 100;
            public int MaxHealth { get; set; } = 100;
            public bool IsActive { get; set; } = true;
            public DateTime LastMaintenance { get; set; }
            public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        }
        
        public class SiegeWeapon
        {
            public string Id { get; set; }
            public SiegeWeaponType Type { get; set; }
            public Vector3 Position { get; set; }
            public int Health { get; set; } = 100;
            public int MaxHealth { get; set; } = 100;
            public ulong OwnerId { get; set; }
            public string TargetFaction { get; set; }
            public bool IsDeployed { get; set; } = false;
            public DateTime DeployedAt { get; set; }
        }
        
        public class CastleTroop
        {
            public string Id { get; set; }
            public TroopType Type { get; set; }
            public int Count { get; set; } = 0;
            public int Level { get; set; } = 1;
            public int Experience { get; set; } = 0;
            public Dictionary<string, int> Equipment { get; set; } = new Dictionary<string, int>();
            public bool IsTraining { get; set; } = false;
            public DateTime TrainingCompletes { get; set; }
        }
        
        public class SiegeBattle
        {
            public string Id { get; set; }
            public string AttackingFaction { get; set; }
            public string DefendingFaction { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public bool IsActive { get; set; } = false;
            public Dictionary<string, int> AttackerForces { get; set; } = new Dictionary<string, int>();
            public Dictionary<string, int> DefenderForces { get; set; } = new Dictionary<string, int>();
            public List<string> BattleLog { get; set; } = new List<string>();
            public string Winner { get; set; } = "";
            public Dictionary<string, object> Rewards { get; set; } = new Dictionary<string, object>();
            public List<ulong> AttackingPlayers { get; set; } = new List<ulong>();
            public List<ulong> DefendingPlayers { get; set; } = new List<ulong>();
        }
        
        // === PLAYER STATS FÜR SIEGE ===
        public class SiegePlayerStats
        {
            public string PlayerName { get; set; } = "";
            public int Kills { get; set; } = 0;
            public int Deaths { get; set; } = 0;
            public int DamageDealt { get; set; } = 0;
            public int StructuresDestroyed { get; set; } = 0;
            public int SiegeWeaponsUsed { get; set; } = 0;
            public int TimeInSiegeSeconds { get; set; } = 0;
            public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        }
        
        // === CASTLE HEALTH TRACKING ===
        public class CastleHealth
        {
            public int MaxHealth { get; set; } = 10000;
            public int CurrentHealth { get; set; } = 10000;
            public Dictionary<CastleUpgradeType, int> StructureHealth { get; set; } = new Dictionary<CastleUpgradeType, int>();
            public DateTime LastDamaged { get; set; } = DateTime.MinValue;
            public DateTime LastRepaired { get; set; } = DateTime.MinValue;
        }
        
        // === ACTIVE SIEGE WEAPON TRACKING ===
        public class ActiveSiegeWeapon
        {
            public string Id { get; set; } = Guid.NewGuid().ToString();
            public SiegeWeaponType Type { get; set; }
            public ulong OwnerId { get; set; }
            public string OwnerName { get; set; } = "";
            public Vector3 Position { get; set; }
            public DateTime DeployedAt { get; set; } = DateTime.UtcNow;
            public int AmmoRemaining { get; set; } = 100;
            public int DamageDealt { get; set; } = 0;
            public bool IsActive { get; set; } = true;
        }

        private class CastleConfig
        {
            public int MaxLevel = 25; // Increased for AAA system
            public string ChatPrefix = "[CASTLES]";
            public bool Enabled = true;
            public float TickSeconds = 5f;
            public float RegenPerLevelPerTick = 0.2f;
            // Require players to have UsePerm to open/use the UI (security-first default)
            public bool RequireUsePermission = true;
            
            // === AAA CASTLE FEATURES ===
            public bool EnableSiegeWarfare = true;
            public bool EnableDefenseStructures = true;
            public bool EnableTroopManagement = true;
            public bool EnableCastleUpgrades = true;
            public bool EnableAutomatedDefenses = true;
            public bool EnableSiegeWeapons = true;
            public bool EnableBattleReports = true;
            public bool EnableCastleEconomy = true;
            
            // Siege Settings
            public int SiegeDurationMinutes = 60;
            public int SiegePreparationMinutes = 30;
            public int MinPlayersForSiege = 5;
            public int SiegeCooldownHours = 24;
            public float SiegeDamageMultiplier = 2.0f;
            
            // === AAA SIEGE WARFARE SETTINGS ===
            public bool EnablePlayerJoinSiege = true;
            public bool EnableSiegeKillTracking = true;
            public bool EnableCastleDamage = true;
            public bool EnableAutoRepair = true;
            public int AutoRepairCooldownMinutes = 60;
            public int RepairCostMultiplier = 2;
            
            // Castle Health Settings
            public int BaseCastleHealth = 10000;
            public int HealthPerLevel = 500;
            public float CastleDamageMultiplier = 1.0f;
            
            // Siege Weapon Settings
            public int MaxSiegeWeaponsPerFaction = 5;
            public Dictionary<SiegeWeaponType, int> SiegeWeaponDamage = new Dictionary<SiegeWeaponType, int>
            {
                [SiegeWeaponType.BatteringRam] = 500,
                [SiegeWeaponType.SiegeTower] = 200,
                [SiegeWeaponType.Trebuchet] = 800,
                [SiegeWeaponType.Catapult] = 600,
                [SiegeWeaponType.SiegeLadder] = 100,
                [SiegeWeaponType.SapperTunnel] = 400
            };
            
            public Dictionary<SiegeWeaponType, int> SiegeWeaponAmmo = new Dictionary<SiegeWeaponType, int>
            {
                [SiegeWeaponType.BatteringRam] = 50,
                [SiegeWeaponType.SiegeTower] = 1,
                [SiegeWeaponType.Trebuchet] = 20,
                [SiegeWeaponType.Catapult] = 30,
                [SiegeWeaponType.SiegeLadder] = 10,
                [SiegeWeaponType.SapperTunnel] = 5
            };
            
            // Player Participation Rewards
            public int SiegeKillXP = 50;
            public int SiegeDeathXP = -10;
            public int SiegeWinnerXP = 500;
            public int SiegeWinnerScrap = 1000;
            public int SiegeParticipantXP = 100;
            public int SiegeParticipantScrap = 200;
            
            // Troop Settings
            public int MaxTroopsPerType = 100;
            public int TroopTrainingTimeMinutes = 30;
            public Dictionary<TroopType, Dictionary<string, int>> TroopCosts = new Dictionary<TroopType, Dictionary<string, int>>
            {
                [TroopType.Infantry] = new Dictionary<string, int> { ["scrap"] = 50, ["metal.fragments"] = 100 },
                [TroopType.Archers] = new Dictionary<string, int> { ["scrap"] = 75, ["wood"] = 200 },
                [TroopType.Cavalry] = new Dictionary<string, int> { ["scrap"] = 150, ["leather"] = 50 }
            };
            
            // Defense Structure Settings
            public Dictionary<DefenseType, Dictionary<string, int>> DefenseCosts = new Dictionary<DefenseType, Dictionary<string, int>>
            {
                [DefenseType.AutoTurret] = new Dictionary<string, int> { ["scrap"] = 500, ["metal.fragments"] = 1000 },
                [DefenseType.Ballista] = new Dictionary<string, int> { ["scrap"] = 300, ["wood"] = 500 },
                [DefenseType.ArrowTrap] = new Dictionary<string, int> { ["scrap"] = 100, ["wood"] = 200 }
            };
            
            // Upgrade Requirements
            public Dictionary<CastleUpgradeType, Dictionary<int, Dictionary<string, int>>> UpgradeRequirements = 
                new Dictionary<CastleUpgradeType, Dictionary<int, Dictionary<string, int>>>
            {
                [CastleUpgradeType.MainHall] = new Dictionary<int, Dictionary<string, int>>
                {
                    [2] = new Dictionary<string, int> { ["scrap"] = 1000, ["stone"] = 2000, ["wood"] = 1500 },
                    [3] = new Dictionary<string, int> { ["scrap"] = 2000, ["stone"] = 4000, ["wood"] = 3000 },
                    [5] = new Dictionary<string, int> { ["scrap"] = 5000, ["stone"] = 10000, ["metal.fragments"] = 2000 }
                }
            };
            
            // Legacy buffs (enhanced)
            public bool CraftBuffEnabled = true;
            public float CraftTimeReductionPerLevel = 0.02f;
            public float CraftTimeReductionMax = 0.60f; // Increased
            public bool HungerThirstBuffEnabled = true;
            public float CaloriesPerLevelPerTick = 2f;
            public float HydrationPerLevelPerTick = 2f;
            public bool SmeltBuffEnabled = true;
            public float SmeltYieldBonusPerLevel = 0.03f;
            public float SmeltYieldBonusMax = 0.75f; // Increased
            public bool MerchantDiscountEnabled = true;
            public float MerchantDiscountPerLevel = 0.02f;
            public float MerchantDiscountMax = 0.50f; // Increased
            public bool FastTravelCostReductionEnabled = true;
            public float FastTravelCostReductionPerLevel = 0.02f;
            public float FastTravelCostReductionMax = 0.60f; // Increased
        }

        private class CastleData
        {
            public int Team1Level = 1;
            public int Team2Level = 1;
            public double LastUpdate = 0d;
            
            // === AAA CASTLE DATA ===
            public Dictionary<string, Dictionary<CastleUpgradeType, CastleUpgrade>> FactionUpgrades = 
                new Dictionary<string, Dictionary<CastleUpgradeType, CastleUpgrade>>
            {
                ["Team1"] = new Dictionary<CastleUpgradeType, CastleUpgrade>(),
                ["Team2"] = new Dictionary<CastleUpgradeType, CastleUpgrade>()
            };
            
            public Dictionary<string, List<DefenseStructure>> FactionDefenses = 
                new Dictionary<string, List<DefenseStructure>>
            {
                ["Team1"] = new List<DefenseStructure>(),
                ["Team2"] = new List<DefenseStructure>()
            };
            
            public Dictionary<string, Dictionary<TroopType, CastleTroop>> FactionTroops = 
                new Dictionary<string, Dictionary<TroopType, CastleTroop>>
            {
                ["Team1"] = new Dictionary<TroopType, CastleTroop>(),
                ["Team2"] = new Dictionary<TroopType, CastleTroop>()
            };
            
            public List<SiegeBattle> ActiveSieges = new List<SiegeBattle>();
            public List<SiegeBattle> SiegeHistory = new List<SiegeBattle>();
            public List<SiegeWeapon> DeployedSiegeWeapons = new List<SiegeWeapon>();
            
            public Dictionary<string, Dictionary<string, int>> FactionResources = 
                new Dictionary<string, Dictionary<string, int>>
            {
                ["Team1"] = new Dictionary<string, int>(),
                ["Team2"] = new Dictionary<string, int>()
            };
            
            public Dictionary<string, DateTime> LastSiegeTime = new Dictionary<string, DateTime>
            {
                ["Team1"] = DateTime.MinValue,
                ["Team2"] = DateTime.MinValue
            };
            
            public Dictionary<string, int> FactionVictories = new Dictionary<string, int>
            {
                ["Team1"] = 0,
                ["Team2"] = 0
            };
            
            public Dictionary<string, int> FactionDefeats = new Dictionary<string, int>
            {
                ["Team1"] = 0,
                ["Team2"] = 0
            };
            
            // === PLAYER PARTICIPATION TRACKING ===
            public Dictionary<string, List<ulong>> SiegeParticipants = new Dictionary<string, List<ulong>>();
            public Dictionary<ulong, SiegePlayerStats> PlayerSiegeStats = new Dictionary<ulong, SiegePlayerStats>();
            
            // === CASTLE DAMAGE & HEALTH ===
            public Dictionary<string, CastleHealth> CastleHealthData = new Dictionary<string, CastleHealth>
            {
                ["Team1"] = new CastleHealth { MaxHealth = 10000, CurrentHealth = 10000 },
                ["Team2"] = new CastleHealth { MaxHealth = 10000, CurrentHealth = 10000 }
            };
            
            // === SIEGE WEAPON TRACKING ===
            public Dictionary<string, List<ActiveSiegeWeapon>> FactionSiegeWeapons = new Dictionary<string, List<ActiveSiegeWeapon>>
            {
                ["Team1"] = new List<ActiveSiegeWeapon>(),
                ["Team2"] = new List<ActiveSiegeWeapon>()
            };
        }

        private CastleConfig _config;
        private CastleData _data;
        private Timer _siegeTimer;
        private Dictionary<string,string> _theme; // from EldrunFraktion
        private Timer _saveTimer; // Batch Save System
        private bool _dataChanged = false;
        private string ChatPrefix => _config?.ChatPrefix ?? "[CASTLES]";

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

        protected override void LoadDefaultConfig()
        {
            _config = new CastleConfig();
            LogLocalizedMessage("castles._eldruncastles__created_default_config_");
        }

        private void LoadConfigValues()
        {
            try { _config = Config.ReadObject<CastleConfig>(); if (_config == null) throw new Exception(); }
            catch { _config = new CastleConfig(); SaveConfig(); }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void LoadData()
        {
            try 
            { 
                _data = Interface.Oxide.DataFileSystem.ReadObject<CastleData>(DataFileName) ?? new CastleData();
                Puts("[EldrunCastles] Data loaded successfully.");
            }
            catch (Exception ex) 
            { 
                _data = new CastleData(); 
                Puts($"[EldrunCastles] Failed to load data: {ex.Message}\n{ex}");
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
                Puts($"[EldrunCastles] Failed to save data: {ex.Message}\n{ex}");
            }
        }

        private void Init()
        {
            LoadConfigValues(); // Load config FIRST!
            permission.RegisterPermission(AdminPerm, this);
            permission.RegisterPermission(UsePerm, this);
            LoadData();
        }

        private void OnServerInitialized()
        {
            if (_config.Enabled)
            {
                // Load theme from EldrunFraktion, if available
                LoadTheme();
                // Batch Save Timer - alle 30 Sekunden
                _saveTimer = timer.Every(30f, () => {
                    if (_dataChanged)
                    {
                        SaveData();
                        _dataChanged = false;
                    }
                });
            }
        }

        private void Unload()
        {
            try
            {
                _saveTimer?.Destroy();
                _siegeTimer?.Destroy();
                
                // CRITICAL: Save data before unload to prevent data loss
                SaveData();
            }
            catch { }
        }
        
        // === SIEGE KILL TRACKING HOOK ===
        
        void OnEntityDeath(BaseCombatEntity entity, HitInfo info)
        {
            if (!_config.EnableSiegeKillTracking) return;
            if (entity == null || info == null) return;
            
            var victim = entity as BasePlayer;
            if (victim == null) return;
            
            var attacker = info.InitiatorPlayer;
            if (attacker == null || attacker == victim) return;
            
            // Check if both players are in active siege
            var attackerFaction = GetPlayerTeam(attacker);
            var victimFaction = GetPlayerTeam(victim);
            
            if (string.IsNullOrEmpty(attackerFaction) || string.IsNullOrEmpty(victimFaction)) return;
            if (attackerFaction == victimFaction) return; // No friendly fire tracking
            
            // Find active siege involving both factions
            SiegeBattle activeSiege = null;
            foreach (var siege in _data.ActiveSieges)
            {
                if (!siege.IsActive) continue;
                
                bool bothInvolved = (siege.AttackingFaction == attackerFaction && siege.DefendingFaction == victimFaction) ||
                                   (siege.DefendingFaction == attackerFaction && siege.AttackingFaction == victimFaction);
                
                if (bothInvolved)
                {
                    activeSiege = siege;
                    break;
                }
            }
            
            if (activeSiege == null) return;
            
            // Track kill stats
            if (!_data.PlayerSiegeStats.ContainsKey(attacker.userID))
            {
                _data.PlayerSiegeStats[attacker.userID] = new SiegePlayerStats
                {
                    PlayerName = attacker.displayName,
                    JoinedAt = DateTime.UtcNow
                };
            }
            
            if (!_data.PlayerSiegeStats.ContainsKey(victim.userID))
            {
                _data.PlayerSiegeStats[victim.userID] = new SiegePlayerStats
                {
                    PlayerName = victim.displayName,
                    JoinedAt = DateTime.UtcNow
                };
            }
            
            _data.PlayerSiegeStats[attacker.userID].Kills++;
            _data.PlayerSiegeStats[victim.userID].Deaths++;
            
            _dataChanged = true;
            
            // Award XP if configured
            if (_config.SiegeKillXP > 0 && EldrunXP != null)
            {
                EldrunXP.Call("Eldrun_AddXP", attacker.userID, _config.SiegeKillXP, "Siege Kill");
            }
            
            if (_config.SiegeDeathXP < 0 && EldrunXP != null)
            {
                EldrunXP.Call("Eldrun_AddXP", victim.userID, _config.SiegeDeathXP, "Siege Death");
            }
            
            // Broadcast kill to both teams
            string attackerTeam = GetPlayerTeam(attacker);
            string victimTeam = GetPlayerTeam(victim);
            if (!string.IsNullOrEmpty(attackerTeam)) NotifyTeam(attackerTeam, $"⚔️ {attacker.displayName} killed {victim.displayName}! (+{_config.SiegeKillXP} XP)");
            if (!string.IsNullOrEmpty(victimTeam) && victimTeam != attackerTeam) NotifyTeam(victimTeam, $"💀 {victim.displayName} was killed by {attacker.displayName}!");
        }

        // API
        public object Eldrun_GetCastleLevel(string team)
        {
            team = NormalizeTeam(team);
            if (team == "Team1") return _data.Team1Level;
            if (team == "Team2") return _data.Team2Level;
            return null;
        }

        // Perk API for external modules (Shop, FastTravel, etc.)
        public object Eldrun_GetPerkMultiplier(string perk, string userIdStr)
        {
            try
            {
                if (_config == null || !_config.Enabled) return 1f;
                if (string.IsNullOrEmpty(perk) || string.IsNullOrEmpty(userIdStr)) return 1f;
                string team = GetTeamByUserIdStr(userIdStr);
                if (string.IsNullOrEmpty(team)) return 1f;
                int lvl = team == "Team1" ? _data.Team1Level : _data.Team2Level;
                lvl = Mathf.Clamp(lvl, 1, _config.MaxLevel);

                bool inZone = false;
                if (ulong.TryParse(userIdStr, out var uid))
                {
                    var p = FindOnline(uid);
                    if (p != null)
                    {
                        string zone = team == "Team1" ? "castle_pve_team1" : "castle_pve_team2";
                        inZone = InZone(p.transform.position, zone);
                    }
                }

                switch (perk.ToLowerInvariant())
                {
                    case "merchant_discount":
                        if (!_config.MerchantDiscountEnabled || !inZone) return 1f;
                        return Mathf.Clamp01(1f - Mathf.Clamp(_config.MerchantDiscountPerLevel * lvl, 0f, _config.MerchantDiscountMax));
                    case "fasttravel_cost":
                        if (!_config.FastTravelCostReductionEnabled || !inZone) return 1f;
                        return Mathf.Clamp01(1f - Mathf.Clamp(_config.FastTravelCostReductionPerLevel * lvl, 0f, _config.FastTravelCostReductionMax));
                    case "craft_time":
                        if (!_config.CraftBuffEnabled || !inZone) return 1f;
                        return Mathf.Clamp01(1f - Mathf.Clamp(_config.CraftTimeReductionPerLevel * lvl, 0f, _config.CraftTimeReductionMax));
                    case "smelt_yield":
                        if (!_config.SmeltBuffEnabled || !inZone) return 1f;
                        return Mathf.Clamp(1f + Mathf.Clamp(_config.SmeltYieldBonusPerLevel * lvl, 0f, _config.SmeltYieldBonusMax), 1f, 2f);
                }
            }
            catch { }
            return 1f;
        }

        public object Eldrun_GetPerkInfo(string userIdStr)
        {
            var dict = new Dictionary<string, object>();
            try
            {
                if (_config == null || !_config.Enabled || string.IsNullOrEmpty(userIdStr)) return dict;
                string team = GetTeamByUserIdStr(userIdStr);
                if (string.IsNullOrEmpty(team)) return dict;
                int lvl = team == "Team1" ? _data.Team1Level : _data.Team2Level;
                lvl = Mathf.Clamp(lvl, 1, _config.MaxLevel);

                bool inZone = false;
                if (ulong.TryParse(userIdStr, out var uid))
                {
                    var p = FindOnline(uid);
                    if (p != null)
                    {
                        string zone = team == "Team1" ? "castle_pve_team1" : "castle_pve_team2";
                        inZone = InZone(p.transform.position, zone);
                    }
                }

                float craft = (_config.CraftBuffEnabled && inZone) ? Mathf.Clamp01(1f - Mathf.Clamp(_config.CraftTimeReductionPerLevel * lvl, 0f, _config.CraftTimeReductionMax)) : 1f;
                float smelt = (_config.SmeltBuffEnabled && inZone) ? Mathf.Clamp(1f + Mathf.Clamp(_config.SmeltYieldBonusPerLevel * lvl, 0f, _config.SmeltYieldBonusMax), 1f, 2f) : 1f;
                float merchant = (_config.MerchantDiscountEnabled && inZone) ? Mathf.Clamp01(1f - Mathf.Clamp(_config.MerchantDiscountPerLevel * lvl, 0f, _config.MerchantDiscountMax)) : 1f;
                float ft = (_config.FastTravelCostReductionEnabled && inZone) ? Mathf.Clamp01(1f - Mathf.Clamp(_config.FastTravelCostReductionPerLevel * lvl, 0f, _config.FastTravelCostReductionMax)) : 1f;

                dict["inZone"] = inZone;
                dict["level"] = lvl;
                dict["craft_time_multiplier"] = craft;
                dict["smelt_yield_multiplier"] = smelt;
                dict["merchant_price_multiplier"] = merchant;
                dict["fasttravel_cost_multiplier"] = ft;
            }
            catch { }
            return dict;
        }

        private string GetTeamByUserIdStr(string userIdStr)
        {
            if (string.IsNullOrEmpty(userIdStr) || EldrunFraktion == null) return null;
            try { return EldrunFraktion.Call("Eldrun_GetPlayerFaction", userIdStr) as string; } catch { return null; }
        }

        private BasePlayer FindOnline(ulong userId)
        {
            var list = BasePlayer.activePlayerList;
            if (list == null) return null;
            foreach (var p in list) if (p != null && p.userID == userId) return p;
            return null;
        }

        
        [ChatCommand("castle")]
        private void CastleCommand(BasePlayer player, string command, string[] args)
        {
            if (player == null || !HasPermission(player, UsePerm)) return;
            if (_config == null || !_config.Enabled)
            {
                SendReply(player, $"{ChatPrefix} Castles system is currently disabled.");
                return;
            }
            if (!EnsureFaction(player)) return;

            if (args == null || args.Length == 0)
            {
                ShowCastleStatus(player);
                ShowCastleHelp(player, isAdmin: HasPermission(player, AdminPerm));
                return;
            }

            var sub = args[0].ToLowerInvariant();
            if (sub == "help")
            {
                ShowCastleHelp(player, isAdmin: HasPermission(player, AdminPerm));
                return;
            }

            if (sub == "status")
            {
                ShowCastleStatus(player);
                return;
            }

            if (sub == "perks")
            {
                ShowPerksStatus(player);
                return;
            }

            if (sub == "upgrade")
            {
                if (args.Length < 2)
                {
                    SendReply(player, $"{ChatPrefix} Usage: /castle upgrade <upgradeType>");
                    return;
                }

                if (!Enum.TryParse<CastleUpgradeType>(args[1], true, out var type))
                {
                    SendReply(player, $"{ChatPrefix} Invalid upgrade type.");
                    return;
                }

                ProcessUpgrade(player, type);
                return;
            }

            if (sub == "troops")
            {
                HandleTroopsChatCommand(player, args);
                return;
            }

            if (args[0].Equals("setlevel", StringComparison.OrdinalIgnoreCase))
            {
                if (!HasPermission(player, AdminPerm)) { SendReply(player, $"{ChatPrefix} No permission."); return; }
                if (args.Length < 3)
                {
                    var maxLvl = _config != null ? _config.MaxLevel : 10;
                    SendReply(player, $"{ChatPrefix} Usage: /castle setlevel <team1|team2> <1-{maxLvl}>");
                    return;
                }
                var teamArg = NormalizeTeam(args[1]);
                if (teamArg == null) { SendReply(player, $"{ChatPrefix} Invalid team. Use team1 or team2."); return; }
                if (!int.TryParse(args[2], out var lvl)) { SendReply(player, $"{ChatPrefix} Invalid level."); return; }
                lvl = Mathf.Clamp(lvl, 1, _config.MaxLevel);
                SetCastleLevel(teamArg, lvl);
                SendReply(player, $"{ChatPrefix} Castle level updated: {teamArg} -> {lvl}.");
                return;
            }
            ShowCastleHelp(player, isAdmin: HasPermission(player, AdminPerm));
        }

        private void ShowCastleHelp(BasePlayer player, bool isAdmin)
        {
            SendReply(player, $"{ChatPrefix} Commands:");
            SendReply(player, $"{ChatPrefix} /castle status - Show your castle status");
            SendReply(player, $"{ChatPrefix} /castle perks - Show your perk multipliers");
            SendReply(player, $"{ChatPrefix} /castle upgrade <upgradeType> - Upgrade a specific category");
            SendReply(player, $"{ChatPrefix} /castle troops - Show troop info and usage");
            if (isAdmin)
            {
                var maxLvl = _config != null ? _config.MaxLevel : 10;
                SendReply(player, $"{ChatPrefix} /castle setlevel <team1|team2> <1-{maxLvl}> - Admin");
            }
        }

        private void ShowCastleStatus(BasePlayer player)
        {
            var team = GetPlayerTeam(player);
            var team1Lvl = _data != null ? _data.Team1Level : 1;
            var team2Lvl = _data != null ? _data.Team2Level : 1;
            var myLvl = team == "Team1" ? team1Lvl : team == "Team2" ? team2Lvl : 0;

            SendReply(player, $"{ChatPrefix} Castle Levels - Team1: {team1Lvl} | Team2: {team2Lvl}");
            SendReply(player, $"{ChatPrefix} Your faction: {(string.IsNullOrEmpty(team) ? "None" : team)}{(myLvl > 0 ? $" (Level {myLvl})" : "")}");

            try
            {
                if (!string.IsNullOrEmpty(team) && _data?.CastleHealthData != null && _data.CastleHealthData.TryGetValue(team, out var health) && health != null)
                {
                    SendReply(player, $"{ChatPrefix} Castle Health: {health.CurrentHealth}/{health.MaxHealth}");
                }
            }
            catch { }
        }

        private void ShowPerksStatus(BasePlayer player)
        {
            Dictionary<string, object> info = null;
            try { info = Eldrun_GetPerkInfo(player.UserIDString) as Dictionary<string, object>; } catch { info = null; }
            if (info == null)
            {
                SendReply(player, $"{ChatPrefix} No perk data available.");
                return;
            }

            bool inZone = false;
            try { if (info.TryGetValue("inZone", out var v) && v is bool b) inZone = b; } catch { }

            float craft = GetFloat(info, "craft_time_multiplier", 1f);
            float smelt = GetFloat(info, "smelt_yield_multiplier", 1f);
            float merch = GetFloat(info, "merchant_price_multiplier", 1f);
            float ft = GetFloat(info, "fasttravel_cost_multiplier", 1f);

            SendReply(player, $"{ChatPrefix} In castle zone: {(inZone ? "Yes" : "No")}");
            SendReply(player, $"{ChatPrefix} Craft time multiplier: x{craft:0.##}");
            SendReply(player, $"{ChatPrefix} Smelt yield multiplier: x{smelt:0.##}");
            SendReply(player, $"{ChatPrefix} Merchant price multiplier: x{merch:0.##}");
            SendReply(player, $"{ChatPrefix} FastTravel cost multiplier: x{ft:0.##}");
        }

        private void HandleTroopsChatCommand(BasePlayer player, string[] args)
        {
            var team = GetPlayerTeam(player);
            if (string.IsNullOrEmpty(team))
            {
                SendReply(player, $"{ChatPrefix} You must be in a faction to manage troops.");
                return;
            }

            if (args.Length == 1)
            {
                int total = 0;
                if (_data?.FactionTroops != null && _data.FactionTroops.TryGetValue(team, out var troops) && troops != null)
                {
                    foreach (var kv in troops) if (kv.Value != null) total += kv.Value.Count;
                }

                SendReply(player, $"{ChatPrefix} Total troops: {total}");
                SendReply(player, $"{ChatPrefix} Usage: /castle troops recruit <type> [amount]");
                SendReply(player, $"{ChatPrefix} Usage: /castle troops disband <type> [amount]");
                return;
            }

            var action = args[1].ToLowerInvariant();
            if (action != "recruit" && action != "disband")
            {
                SendReply(player, $"{ChatPrefix} Usage: /castle troops recruit|disband <type> [amount]");
                return;
            }

            if (args.Length < 3)
            {
                SendReply(player, $"{ChatPrefix} Usage: /castle troops {action} <type> [amount]");
                return;
            }

            if (!Enum.TryParse<TroopType>(args[2], true, out var troopType))
            {
                SendReply(player, $"{ChatPrefix} Invalid troop type.");
                return;
            }

            int amount = 1;
            if (args.Length >= 4 && !int.TryParse(args[3], out amount))
            {
                SendReply(player, $"{ChatPrefix} Invalid amount.");
                return;
            }
            amount = Mathf.Clamp(amount, 1, 1000);

            if (action == "recruit") TrainTroops(player, troopType, amount);
            else DisbandTroops(player, troopType, amount);
        }
        
        // Defense & Troop Management
        private void TrainTroops(BasePlayer player, TroopType type, int amount)
        {
            var team = GetPlayerTeam(player);
            if (string.IsNullOrEmpty(team)) { SendReply(player, $"{ChatPrefix} You must be in a faction."); return; }
            
            if (_config.TroopCosts == null || !_config.TroopCosts.ContainsKey(type))
            {
                SendReply(player, $"{ChatPrefix} This troop type is not available.");
                return;
            }
            
            var costs = _config.TroopCosts[type];
            if (!HasResources(player, costs))
            {
                SendReply(player, $"{ChatPrefix} Not enough resources.");
                return;
            }
            
            if (!TakeResources(player, costs))
            {
                SendReply(player, $"{ChatPrefix} Failed to take resources.");
                return;
            }
            
            if (!_data.FactionTroops.ContainsKey(team))
                _data.FactionTroops[team] = new Dictionary<TroopType, CastleTroop>();
            
            if (!_data.FactionTroops[team].ContainsKey(type))
                _data.FactionTroops[team][type] = new CastleTroop { Type = type, Count = 0 };
            
            _data.FactionTroops[team][type].Count += amount;
            _dataChanged = true;
            
            SendReply(player, $"{ChatPrefix} Recruited {amount}x {type}.");
            NotifyTeam(team, $"{ChatPrefix} {player.displayName} recruited {amount}x {type}.");
        }
        
        private void DisbandTroops(BasePlayer player, TroopType type, int amount)
        {
            var team = GetPlayerTeam(player);
            if (string.IsNullOrEmpty(team)) { SendReply(player, $"{ChatPrefix} You must be in a faction."); return; }
            
            if (!_data.FactionTroops.ContainsKey(team) || !_data.FactionTroops[team].ContainsKey(type))
            {
                SendReply(player, $"{ChatPrefix} You have no troops of this type.");
                return;
            }
            
            var currentCount = _data.FactionTroops[team][type].Count;
            if (currentCount < amount)
            {
                SendReply(player, $"{ChatPrefix} Only {currentCount}x {type} available.");
                return;
            }
            
            _data.FactionTroops[team][type].Count -= amount;
            _dataChanged = true;
            
            SendReply(player, $"{ChatPrefix} Disbanded {amount}x {type}.");
        }
        
        private void BuildDefenseStructure(BasePlayer player, DefenseType type)
        {
            // 🚧 FEATURE: Defense Building System - Planned for future release
            // Will allow construction of walls, towers, and defensive structures
            SendReply(player, $"{ChatPrefix} Defense building is not implemented yet.");
            SendReply(player, $"{ChatPrefix} Requested defense type: {type}");
        }
        
        private void RepairDefenseStructure(BasePlayer player, string defenseId)
        {
            // 🚧 FEATURE: Defense Repair System - Planned for future release
            // Will allow repairs using resources with durability mechanics
            SendReply(player, $"{ChatPrefix} Repair system is not implemented yet.");
            SendReply(player, $"{ChatPrefix} Requested target: {defenseId}");
        }

        private void DeclareSiege(BasePlayer player, string targetFaction)
        {
            // 🚧 FEATURE: Siege Declaration System - Planned for future release
            // Will integrate with EldrunFraktion for faction-based castle sieges
            SendReply(player, $"[CASTLES] ⚔️ Siege System: Target {targetFaction}");
            SendReply(player, $"[CASTLES] 💡 Full siege mechanics coming in next major update!");
        }

        private void DeploySiegeWeapon(BasePlayer player, SiegeWeaponType type)
        {
            // 🚧 FEATURE: Siege Weapon Deployment - Planned for future release
            // Will allow deployment of catapults, trebuchets, and battering rams
            SendReply(player, $"[CASTLES] 🎯 Siege Weapon: {type}");
            SendReply(player, $"[CASTLES] 💡 Deployment system coming in next major update!");
        }

        private float GetFloat(Dictionary<string, object> d, string key, float defV)
        {
            try { if (d.TryGetValue(key, out var v)) return Convert.ToSingle(v, System.Globalization.CultureInfo.InvariantCulture); } catch { }
            return defV;
        }

        private string NormalizeTeam(string s)
        {
            if (string.IsNullOrEmpty(s)) return null;
            s = s.Trim().ToLowerInvariant();
            if (s == "team1" || s == "t1" || s == "1") return "Team1";
            if (s == "team2" || s == "t2" || s == "2") return "Team2";
            return null;
        }

        private string GetPlayerTeam(BasePlayer player)
        {
            if (EldrunFraktion == null || player == null) return null;
            try 
            { 
                var faction = EldrunFraktion.Call("Eldrun_GetPlayerFaction", player.UserIDString);
                if (faction != null)
                {
                    return faction as string;
                }
                return null;
            } 
            catch (Exception ex) 
            { 
                Puts($"[EldrunCastles] GetPlayerTeam ERROR: {ex.Message}");
                return null; 
            }
        }

        private bool HasFaction(BasePlayer player)
        {
            try
            {
                if (player == null) return false;
                var fac = EldrunFraktion?.Call("Eldrun_GetPlayerFaction", player.UserIDString) as string;
                return !string.IsNullOrEmpty(fac);
            }
            catch { return false; }
        }

        private bool EnsureFaction(BasePlayer player)
        {
            return true;
        }

        private void SetCastleLevel(string team, int lvl)
        {
            if (team == "Team1") _data.Team1Level = lvl;
            else if (team == "Team2") _data.Team2Level = lvl;

            // Scale castle health based on level
            if (_data.CastleHealthData == null) _data.CastleHealthData = new Dictionary<string, CastleHealth>();
            if (!_data.CastleHealthData.ContainsKey(team))
            {
                _data.CastleHealthData[team] = new CastleHealth
                {
                    MaxHealth = _config.BaseCastleHealth,
                    CurrentHealth = _config.BaseCastleHealth
                };
            }
            var ch = _data.CastleHealthData[team];
            int oldMax = Mathf.Max(1, ch.MaxHealth);
            int oldCur = Mathf.Clamp(ch.CurrentHealth, 0, oldMax);
            float percent = (float)oldCur / oldMax;
            int newMax = Mathf.Max(1, _config.BaseCastleHealth + _config.HealthPerLevel * lvl);
            int newCur = Mathf.Clamp(Mathf.FloorToInt(newMax * percent), 0, newMax);
            ch.MaxHealth = newMax;
            ch.CurrentHealth = newCur;

            _dataChanged = true;
        }

        private void OnItemCraft(ItemCraftTask task, BasePlayer crafter)
        {
            try
            {
                if (_config == null || !_config.Enabled || !_config.CraftBuffEnabled) return;
                if (task == null || crafter == null) return;
                var team = GetPlayerTeam(crafter);
                if (string.IsNullOrEmpty(team)) return;
                string zone = team == "Team1" ? "castle_pve_team1" : "castle_pve_team2";
                if (!InZone(crafter.transform.position, zone)) return;

                int lvl = team == "Team1" ? _data.Team1Level : _data.Team2Level;
                lvl = Mathf.Clamp(lvl, 1, _config.MaxLevel);
                float totalReduction = Mathf.Clamp(_config.CraftTimeReductionPerLevel * lvl, 0f, _config.CraftTimeReductionMax);
                if (totalReduction <= 0f) return;

                float now = Time.realtimeSinceStartup;
                float remaining = Mathf.Max(0f, task.endTime - now);
                if (remaining <= 0f) return;
                float newRemaining = remaining * (1f - totalReduction);
                task.endTime = now + newRemaining;
            }
            catch { }
        }

        // Smelting perk: increase yield when an oven cooks items inside own castle PvE zone
        private void OnItemCooked(BaseOven oven, Item item)
        {
            try
            {
                if (_config == null || !_config.Enabled || !_config.SmeltBuffEnabled) return;
                if (oven == null || item == null) return;
                var pos = oven.transform?.position ?? Vector3.zero;
                bool inT1 = InZone(pos, "castle_pve_team1");
                bool inT2 = !inT1 && InZone(pos, "castle_pve_team2");
                if (!inT1 && !inT2) return;

                int lvl = inT1 ? _data.Team1Level : _data.Team2Level;
                lvl = Mathf.Clamp(lvl, 1, _config.MaxLevel);
                float bonus = Mathf.Clamp(_config.SmeltYieldBonusPerLevel * lvl, 0f, _config.SmeltYieldBonusMax);
                if (bonus <= 0f) return;

                int baseAmt = Mathf.Max(0, item.amount);
                if (baseAmt <= 0) return;
                int extra = Mathf.FloorToInt(baseAmt * bonus);
                if (extra <= 0 && bonus >= 0.01f) extra = 1;
                int maxStack = 0;
                try { maxStack = item.info?.stackable ?? 0; } catch { maxStack = 0; }
                if (maxStack > 0)
                {
                    int allowed = Mathf.Max(0, maxStack - baseAmt);
                    if (extra > allowed) extra = allowed;
                }
                if (extra > 0)
                {
                    item.amount = baseAmt + extra;
                }
            }
            catch { }
        }

        private bool InZone(Vector3 pos, string zoneId)
        {
            if (EldrunCore == null) return false;
            try { var res = EldrunCore.Call("Eldrun_IsPointInZone", pos, zoneId); if (res is bool b) return b; } catch { }
            return false;
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
            return fallback ?? key;
        }

        // CASTLE UPGRADE SYSTEM - CORE LOGIC
        // === CASTLE UPGRADE SYSTEM - CORE LOGIC ===

        private void ProcessUpgrade(BasePlayer player, CastleUpgradeType upgradeType)
        {
            var team = GetPlayerTeam(player);
            if (string.IsNullOrEmpty(team))
            {
                SendReply(player, $"{ChatPrefix} You must be in a faction to upgrade your castle.");
                return;
            }

            int currentLevel = team == "Team1" ? _data.Team1Level : _data.Team2Level;
            int targetLevel = currentLevel + 1;

            if (targetLevel > _config.MaxLevel)
            {
                SendReply(player, $"{ChatPrefix} Maximum level reached.");
                return;
            }

            // Check if upgrade requirements exist for this level
            if (!_config.UpgradeRequirements.ContainsKey(upgradeType) || 
                !_config.UpgradeRequirements[upgradeType].ContainsKey(targetLevel))
            {
                SendReply(player, $"{ChatPrefix} This upgrade is not available for the next level.");
                return;
            }

            var costs = _config.UpgradeRequirements[upgradeType][targetLevel];
            
            // Check if player has resources
            if (!HasResources(player, costs))
            {
                var missing = GetMissingResourcesText(player, costs);
                SendReply(player, $"{ChatPrefix} Not enough resources.");
                if (!string.IsNullOrEmpty(missing)) SendReply(player, $"{ChatPrefix} Missing: {missing}");
                return;
            }

            // Take resources
            if (!TakeResources(player, costs))
            {
                SendReply(player, $"{ChatPrefix} Failed to take resources.");
                return;
            }

            // Apply upgrade
            SetCastleLevel(team, targetLevel);
            
            // Track upgrade in data
            if (!_data.FactionUpgrades.ContainsKey(team))
                _data.FactionUpgrades[team] = new Dictionary<CastleUpgradeType, CastleUpgrade>();
            
            _data.FactionUpgrades[team][upgradeType] = new CastleUpgrade
            {
                Type = upgradeType,
                Level = targetLevel,
                IsUnlocked = true,
                LastUpgraded = DateTime.UtcNow
            };

            _dataChanged = true;
            SendReply(player, $"{ChatPrefix} {upgradeType} upgraded to level {targetLevel}.");
            
            // Notify all team members
            NotifyTeam(team, $"{ChatPrefix} {player.displayName} upgraded {upgradeType} to level {targetLevel}.");
        }

        private bool HasResources(BasePlayer player, Dictionary<string, int> costs)
        {
            foreach (var cost in costs)
            {
                var itemDef = ItemManager.FindItemDefinition(cost.Key);
                if (itemDef == null) continue;
                
                int playerAmount = player.inventory.GetAmount(itemDef.itemid);
                if (playerAmount < cost.Value) return false;
            }
            return true;
        }

        private bool TakeResources(BasePlayer player, Dictionary<string, int> costs)
        {
            foreach (var cost in costs)
            {
                var itemDef = ItemManager.FindItemDefinition(cost.Key);
                if (itemDef == null) continue;
                
                int taken = player.inventory.Take(null, itemDef.itemid, cost.Value);
                if (taken < cost.Value)
                {
                    SendReply(player, $"{ChatPrefix} Failed to take {cost.Value}x {itemDef.displayName.english}.");
                    return false;
                }
            }
            return true;
        }

        // Builds a comma-separated string of missing resources "<amt>x <name>, ..."
        private string GetMissingResourcesText(BasePlayer player, Dictionary<string, int> costs)
        {
            try
            {
                var parts = new List<string>();
                foreach (var cost in costs)
                {
                    var itemDef = ItemManager.FindItemDefinition(cost.Key);
                    if (itemDef == null) continue;
                    int have = player.inventory.GetAmount(itemDef.itemid);
                    int need = cost.Value - have;
                    if (need > 0)
                    {
                        // Use the key (shortname) to match config labels; avoid localization issues here
                        parts.Add($"{need}x {cost.Key}");
                    }
                }
                // Join manually to avoid LINQ
                string res = "";
                for (int i = 0; i < parts.Count; i++)
                {
                    res += parts[i];
                    if (i < parts.Count - 1) res += ", ";
                }
                return res;
            }
            catch { return string.Empty; }
        }

        private void NotifyTeam(string team, string message)
        {
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (GetPlayerTeam(p) == team)
                {
                    SendReply(p, message);
                }
            }
        }
    }
}
