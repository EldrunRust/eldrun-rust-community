using System;
using System.Collections.Generic;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using Oxide.Game.Rust.Cui;
using System.Globalization;

namespace Oxide.Plugins
{
    [Info("EldrunArtifactItem", "SirEldrun", "36187")]
    [Description("Artifact System - BETA")]
    public class EldrunArtifactItem : RustPlugin
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
        
        [PluginReference] private Plugin EldrunCore;
        [PluginReference] private Plugin EldrunFraktion;
        [PluginReference] private Plugin EldrunXP;

        private const string DataFileName = "eldrun_artifact_item";
        private const string AdminPerm = "eldrunartifactitem.admin";
        private const string UsePerm = "eldrunartifactitem.use";
        
        // 👑 SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        private const string PanelName = "EldrunArtifactUI";
        private const string HudPanelName = "EldrunArtifactHUD";
        
        private class ArtifactData
        {
            public ulong OwnerUserId = 0; // The Chosen One
            public string OwnerName = ""; // Name of the Current Lord/Lady
            public bool Dropped = false;
            public Vector3 DroppedPos = Vector3.zero;
            public DateTime LastPickup = DateTime.MinValue;
            public DateTime CreationTime = DateTime.Now;
            public string ArtifactName = "Crown of Eternal Dominion";
            public int PowerLevel = 1; // Grows with time
            public float TotalTimeHeld = 0f; // Total seconds held by all players
            public Dictionary<ulong, PlayerArtifactHistory> PlayerHistory = new Dictionary<ulong, PlayerArtifactHistory>();
            public int TimesStolen = 0;
            public int KillsWhileHolding = 0;
            public ulong MostPowerfulOwner = 0; // Player who held it longest
            public float LongestHoldTime = 0f;
            public List<LegendaryEvent> LegendaryEvents = new List<LegendaryEvent>();
        }
        
        private class PlayerArtifactHistory
        {
            public ulong UserId;
            public string PlayerName;
            public int TimesOwned = 0;
            public float TotalTimeHeld = 0f;
            public DateTime FirstPickup = DateTime.MinValue;
            public DateTime LastPickup = DateTime.MinValue;
            public int KillsWhileHolding = 0;
            public int DeathsWhileHolding = 0;
            public bool IsLegendaryOwner = false; // Held for >1 hour
        }
        
        private class LegendaryEvent
        {
            public DateTime Timestamp;
            public string EventType; // "FIRST_PICKUP", "LEGENDARY_HOLD", "EPIC_KILL", "FACTION_VICTORY"
            public ulong PlayerId;
            public string PlayerName;
            public string Description;
            public bool Broadcasted = false;
        }

        private class ArtifactConfig
        {
            public string ChatPrefix = "<color=#FFD700><b>[CROWN OF DOMINION]</b></color>";
            public bool Enabled = true;
            
            public string ArtifactDisplayName = "Crown of Eternal Dominion";
            public string ArtifactDescription = "An artifact of unimaginable power. Only one can possess it at a time.";
            public float PickupRadius = 3f;
            public bool ShowPickupEffects = true;
            public bool PlaySounds = true;
            
            public float PowerAuraRadius = 50f; // Massive aura
            public float TickSeconds = 5f;
            public bool ShowAuraEffects = true;
            public string AuraColor = "1.0 0.8 0.2 0.3"; // Golden aura
            
            public float OwnerHealthRegenPerTick = 5f; // 5 HP every 5s
            public float OwnerHealthBonus = 50f; // +50 max HP
            public float OwnerDamageMultiplier = 1.2f; // +20% damage
            public float OwnerSpeedMultiplier = 1.15f; // +15% speed
            public float OwnerXPMultiplier = 2f; // 2x XP gain
            public bool OwnerGlowEffect = true;
            
            public float FactionMemberRegenPerTick = 2f; // 2 HP for faction members
            public float FactionDamageBonus = 1.1f; // +10% damage for faction
            public bool FactionGlowEffect = true;
            
            public bool EnablePowerScaling = true;
            public float PowerGrowthPerHour = 0.5f; // Power level grows over time
            public int MaxPowerLevel = 10;
            public Dictionary<int, PowerTier> PowerTiers = new Dictionary<int, PowerTier>
            {
                [1] = new PowerTier { Name = "Awakening", Multiplier = 1.0f, Color = "0.8 0.8 0.8 1" },
                [3] = new PowerTier { Name = "Mighty", Multiplier = 1.2f, Color = "0.2 0.8 0.2 1" },
                [5] = new PowerTier { Name = "Legendary", Multiplier = 1.5f, Color = "0.8 0.2 0.8 1" },
                [7] = new PowerTier { Name = "Mythical", Multiplier = 2.0f, Color = "1.0 0.5 0.0 1" },
                [10] = new PowerTier { Name = "Divine", Multiplier = 3.0f, Color = "1.0 1.0 0.2 1" }
            };
            
            public bool EnableLegendaryEvents = true;
            public float LegendaryHoldTime = 3600f; // 1 hour for legendary status
            public int EpicKillThreshold = 5; // 5 kills while holding = epic
            public bool BroadcastLegendaryEvents = true;
            
            public bool ShowPowerEffects = true;
            public float EffectIntensity = 1f;
            public Dictionary<string, string> PowerEffectColors = new Dictionary<string, string>
            {
                ["pickup"] = "1.0 1.0 0.2 1", // Bright gold
                ["aura"] = "1.0 0.8 0.2 0.3", // Soft gold
                ["power"] = "1.0 0.5 0.0 1", // Orange power
                ["legendary"] = "0.8 0.2 0.8 1" // Purple legendary
            };
            
            public bool LogLegendaryEvents = true;
            public bool AdminNotifications = true;
            
            public bool EnablePlayerHistory = true;
            public bool EnableLeaderboard = true;
            public bool EnableDetailedStatistics = true;
            public bool EnableAutoSave = true;
            public bool EnablePerformanceOptimizations = true;
            
            public bool DropOnLogout = true;
            public bool EnableExperimentalSpeedBuff = false;
            
            public bool ShowPowerTierColors = true;
            public bool ShowPlayerRanks = true;
            public bool ShowTimeDetails = true;
            
            public int MaxHistoryEvents = 100; // Limit stored events for performance
            public int PlayerCacheRefreshSeconds = 10;
            public int AutoSaveIntervalTicks = 12; // Every 60 seconds at 5s tick
        }
        
        public class PowerTier
        {
            public string Name;
            public float Multiplier;
            public string Color;
        }

        private ArtifactData _data;
        private ArtifactConfig _config;
        private Timer _tick;

        private Dictionary<string,string> _theme; // from EldrunFraktion

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
            _config = new ArtifactConfig();
            LogLocalizedMessage("artifactitem._eldrunartifactitem__created_default_config_");
        }

        private void LoadConfigValues()
        {
            try { _config = Config.ReadObject<ArtifactConfig>(); if (_config == null) throw new Exception(); }
            catch { _config = new ArtifactConfig(); SaveConfig(); }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void LoadData()
        {
            try { _data = Interface.Oxide.DataFileSystem.ReadObject<ArtifactData>(DataFileName) ?? new ArtifactData(); }
            catch { _data = new ArtifactData(); }
        }

        private void SaveData() => Interface.Oxide.DataFileSystem.WriteObject(DataFileName, _data);

        private void Init()
        {
            LoadConfigValues(); // Load config FIRST!
            permission.RegisterPermission(AdminPerm, this);
            permission.RegisterPermission(UsePerm, this);
            LoadData();
            LoadTheme();
            
            // Chat Commands
            cmd.AddChatCommand("artifact", this, "ArtifactCommand");
            cmd.AddChatCommand("artifakt", this, "ArtifactCommandDe");
            cmd.AddChatCommand("crown", this, "ArtifactCommand"); // English alias
        }

        private void OnServerInitialized()
        {
            if (_config.Enabled)
            {
                _tick = timer.Every(Mathf.Max(1f, _config.TickSeconds), LegendaryTick);
                // Initialize artifact if not exists
                if (_data.CreationTime == DateTime.MinValue)
                {
                    _data.CreationTime = DateTime.Now;
                    _data.ArtifactName = _config.ArtifactDisplayName;
                    LogLocalizedMessage("artifactitem.message", null);
                }
                
                // Schedule cleanup for inactive data every hour
                if (_config.EnablePerformanceOptimizations)
                {
                    timer.Every(3600f, CleanupInactivePlayerData); // Every hour
                }
                
                // Prime player cache once on init
                RefreshPlayerCache();

                LogLocalizedMessage("artifactitem.message", null);
            }
        }

        private void Unload()
        {
            try { _tick?.Destroy(); } catch { }
            _tick = null;
            
            // CRITICAL: Save data before unload to prevent data loss
            SaveData();
            
            // Optimiert: Cache cleanup
            _playerCache.Clear();
        }

        private void OnEntityDeath(BaseCombatEntity entity, HitInfo info)
        {
            try
            {
                if (_config == null || !_config.Enabled) return;
                var player = entity as BasePlayer;
                if (player == null) return;
                
                // Check if the Crown holder died
                if (_data.OwnerUserId != 0 && player.userID == _data.OwnerUserId)
                {
                    // Record death in history
                    if (_data.PlayerHistory.TryGetValue(player.userID, out var history))
                    {
                        history.DeathsWhileHolding++;
                    }
                    
                    // Drop the Crown with epic effects
                    DropCrownWithEffects(player.ServerPosition, "The Crown bearer has fallen!");
                    
                    // Create legendary event
                    CreateLegendaryEvent("CROWN_DROPPED", player.userID, player.displayName, 
                        $"⚔️ {player.displayName} has fallen and the Crown of Eternal Dominion was dropped!");
                }
                
                // Check if Crown holder killed someone (for kill tracking)
                var attacker = info?.InitiatorPlayer;
                if (attacker != null && _data.OwnerUserId != 0 && attacker.userID == _data.OwnerUserId)
                {
                    _data.KillsWhileHolding++;
                    
                    if (_data.PlayerHistory.TryGetValue(attacker.userID, out var attackerHistory))
                    {
                        attackerHistory.KillsWhileHolding++;
                        
                        // Check for epic kill milestone
                        if (attackerHistory.KillsWhileHolding >= _config.EpicKillThreshold)
                        {
                            CreateLegendaryEvent("EPIC_WARRIOR", attacker.userID, attacker.displayName,
                                $"⚔️ {attacker.displayName} has slain {attackerHistory.KillsWhileHolding} enemies while wielding the Crown!");
                        }
                    }
                }
            }
            catch (Exception ex) { LogLocalizedMessage("artifactitem.message", new Dictionary<string, string> { ["ex"] = ex.ToString() }); }
        }
        
        // Optionally drop the crown when the owner disconnects
        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            try
            {
                if (_config == null || !_config.Enabled || !_config.DropOnLogout) return;
                if (player != null && _data.OwnerUserId != 0 && player.userID == _data.OwnerUserId)
                {
                    DropCrownWithEffects(player.ServerPosition, "The Crown bearer has left the realm!");
                }
            }
            catch { }
        }
        
        // Damage and survivability bonuses integration
        private void OnEntityTakeDamage(BaseCombatEntity entity, HitInfo info)
        {
            try
            {
                if (_config == null || !_config.Enabled || info == null) return;

                var attacker = info.InitiatorPlayer;
                var victimPlayer = entity as BasePlayer;

                // Owner outgoing damage bonus (scaled by power tier)
                if (attacker != null && _data.OwnerUserId != 0 && attacker.userID == _data.OwnerUserId)
                {
                    var tier = GetPowerTier(_data.PowerLevel);
                    var mult = Mathf.Max(0f, _config.OwnerDamageMultiplier * (tier?.Multiplier ?? 1f));
                    info.damageTypes.ScaleAll(mult);
                }
                else if (attacker != null && _data.OwnerUserId != 0)
                {
                    // Faction damage bonus if in same faction as the owner and within aura radius
                    var owner = FindOnline(_data.OwnerUserId);
                    if (owner != null && Vector3.Distance(attacker.transform.position, owner.transform.position) <= _config.PowerAuraRadius)
                    {
                        if (IsSameFaction(attacker.userID, _data.OwnerUserId))
                        {
                            var fmult = Mathf.Max(0f, _config.FactionDamageBonus);
                            info.damageTypes.ScaleAll(fmult);
                        }
                    }
                }

                // Owner effective HP bonus modeled as incoming damage reduction
                if (victimPlayer != null && _data.OwnerUserId != 0 && victimPlayer.userID == _data.OwnerUserId && _config.OwnerHealthBonus > 0f)
                {
                    var reduction = 100f / (100f + _config.OwnerHealthBonus);
                    info.damageTypes.ScaleAll(reduction);
                }
            }
            catch { }
        }
        
        // === OPTIMIERTES UNIFIED TICK SYSTEM ===
        private void LegendaryTick()
        {
            if (!_config.Enabled) return;
            
            try
            {
                // Crown Power & Effects System
                if (_config.EnablePowerScaling) UpdateCrownPower();
                if (_config.EnableLegendaryEvents) CheckLegendaryEvents();
                // Apply full crown effects each tick for the owner
                if (_data.OwnerUserId != 0)
                {
                    // Heal, XP multiplier, faction aura, history tracking
                    ApplyCrownEffects();

                    // Subtle aura notifications (reduced frequency)
                    var owner = FindOnlineOptimized(_data.OwnerUserId);
                    if (owner != null && UnityEngine.Random.Range(0f, 1f) < 0.1f) // 10% chance per tick
                    {
                        NotifyNearbyPlayers(owner);
                    }

                    // Update Mini-HUD periodically
                    UpdateOwnerHud();
                }

                // If the crown is dropped, guide nearby players
                if (_data.Dropped)
                {
                    ProcessNearbyPlayers();
                }
                
                // Optimiert: Konfigurierbare SaveData() Haeufigkeit
                if (_config.EnableAutoSave && UnityEngine.Random.Range(0, _config.AutoSaveIntervalTicks) == 0)
                {
                    SaveData();
                }
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("artifactitem.message", new Dictionary<string, string> { ["ex"] = ex.ToString() });
            }
        }
        
        private void UpdateCrownPower()
        {
            if (!_config.EnablePowerScaling || _data.OwnerUserId == 0) return;
            
            var timeHeld = (DateTime.Now - _data.LastPickup).TotalHours;
            var newPowerLevel = Mathf.Min(_config.MaxPowerLevel, 
                1 + Mathf.FloorToInt((float)(timeHeld * _config.PowerGrowthPerHour)));
            
            if (newPowerLevel > _data.PowerLevel)
            {
                _data.PowerLevel = newPowerLevel;
                var owner = FindOnline(_data.OwnerUserId);
                if (owner != null)
                {
                    var tier = GetPowerTier(_data.PowerLevel);
                    SendReply(owner, $"{_config.ChatPrefix} ⚡ The Crown reaches Power Level {_data.PowerLevel}: {tier.Name}!");
                    
                    // Broadcast legendary power levels
                    if (_data.PowerLevel >= 5)
                    {
                        CreateLegendaryEvent("POWER_ASCENSION", owner.userID, owner.displayName,
                            $"{owner.displayName}'s Crown reaches the {tier.Name} tier (Level {_data.PowerLevel})!");
                    }
                }
            }
        }
        
        // === LEGENDARY CROWN EFFECTS SYSTEM ===
        private void ApplyCrownEffects()
        {
            if (_data.OwnerUserId == 0) return;
            
            var owner = FindOnline(_data.OwnerUserId);
            if (owner == null) return;
            
            var tier = GetPowerTier(_data.PowerLevel);
            var multiplier = tier.Multiplier;
            
            // === LEGENDARY HEALTH REGENERATION ===
            var healthRegen = _config.OwnerHealthRegenPerTick * multiplier;
            if (owner.health < owner.MaxHealth())
            {
                owner.Heal(healthRegen);
                
                // Show healing effect
                if (_config.ShowPowerEffects)
                {
                    ShowHealingEffect(owner);
                }
            }
            else if (_config.OwnerGlowEffect && _config.ShowPowerEffects)
            {
                // Subtle owner glow even when at full HP (throttled)
                if (UnityEngine.Random.Range(0f, 1f) < 0.25f)
                {
                    ShowOwnerGlow(owner);
                }
            }
            
            // === BOOST XP GAIN ===
            if (EldrunXP != null && _config.OwnerXPMultiplier > 1f)
            {
                try 
                {
                    EldrunXP?.Call("Eldrun_ApplyXPMultiplier", owner.userID, _config.OwnerXPMultiplier * multiplier);
                }
                catch { /* Silent fail if EldrunXP API changes */ }
            }
            
            // === EXPERIMENTAL SPEED BUFF (Owner only, via EldrunCore) ===
            if (_config.EnableExperimentalSpeedBuff && EldrunCore != null && _config.OwnerSpeedMultiplier > 1f)
            {
                try
                {
                    EldrunCore?.Call("Eldrun_ApplySpeedMultiplier", owner.userID, _config.OwnerSpeedMultiplier * multiplier);
                }
                catch { /* Gracefully ignore if API not available */ }
            }
            
            // === FACTION AURA EFFECTS ===
            ApplyFactionAura(owner);
            
            // Update hold time
            if (_data.PlayerHistory.TryGetValue(_data.OwnerUserId, out var history))
            {
                history.TotalTimeHeld += _config.TickSeconds;
                _data.TotalTimeHeld += _config.TickSeconds;
                
                // Check for longest hold record
                if (history.TotalTimeHeld > _data.LongestHoldTime)
                {
                    _data.LongestHoldTime = history.TotalTimeHeld;
                    _data.MostPowerfulOwner = _data.OwnerUserId;
                }
            }
        }
        
        private void ApplyFactionAura(BasePlayer owner)
        {
            if (EldrunFraktion == null) return;
            
            var ownerFaction = EldrunFraktion.Call("Eldrun_GetPlayerFaction", owner.userID) as string;
            if (string.IsNullOrEmpty(ownerFaction)) return;
            
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (player == null || player == owner) continue;
                if (Vector3.Distance(player.transform.position, owner.transform.position) > _config.PowerAuraRadius) continue;
                
                var playerFaction = EldrunFraktion.Call("Eldrun_GetPlayerFaction", player.userID) as string;
                if (playerFaction == ownerFaction)
                {
                    // Heal faction members
                    if (player.health < player.MaxHealth())
                    {
                        player.Heal(_config.FactionMemberRegenPerTick);
                        if (_config.ShowAuraEffects)
                        {
                            ShowAuraEffect(player);
                        }
                    }
                    else if (_config.FactionGlowEffect && _config.ShowAuraEffects && UnityEngine.Random.Range(0f, 1f) < 0.2f)
                    {
                        // Light aura even when full HP
                        ShowAuraEffect(player);
                    }
                }
            }
        }
        
        private void CheckLegendaryEvents()
        {
            if (!_config.EnableLegendaryEvents || _data.OwnerUserId == 0) return;
            
            var owner = FindOnline(_data.OwnerUserId);
            if (owner == null) return;
            
            if (!_data.PlayerHistory.TryGetValue(_data.OwnerUserId, out var history)) return;
            
            // Check for legendary hold time (1 hour)
            var currentHoldTime = (DateTime.Now - _data.LastPickup).TotalSeconds;
            if (currentHoldTime >= _config.LegendaryHoldTime && !history.IsLegendaryOwner)
            {
                history.IsLegendaryOwner = true;
                CreateLegendaryEvent("LEGENDARY_RULER", owner.userID, owner.displayName,
                    $"👑✨ {owner.displayName} has ascended to LEGENDARY RULER status! (1+ hour reign)");
            }
        }
        
        private void ProcessNearbyPlayers()
        {
            if (!_data.Dropped) return;
            
            foreach (var player in BasePlayer.activePlayerList)
            {
                if (player == null || player.IsDead()) continue;
                if (Vector3.Distance(player.transform.position, _data.DroppedPos) <= _config.PickupRadius)
                {
                    ShowPickupHint(player);
                }
            }
        }
        
        private void ShowPickupHint(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} 👑 The Crown of Eternal Dominion lies before you! Use /artifact pickup");
        }
        
        private void ShowHealingEffect(BasePlayer player)
        {
            // Optimiert: Epic Healing Effects implementiert
            if (_config.ShowPowerEffects)
            {
                try
                {
                    Effect.server.Run("assets/prefabs/misc/halloween/lootbag/effects/gold_sparkle.prefab", player.transform.position);
                    
                    if (_config.PlaySounds)
                    {
                        Effect.server.Run("assets/bundled/prefabs/fx/item_break.prefab", player.transform.position);
                    }
                }
                catch { /* Silent fail - effects are cosmetic */ }
            }
        }
        
        private void ShowAuraEffect(BasePlayer player)
        {
            // Optimiert: Faction Aura Effects implementiert
            if (_config.ShowAuraEffects)
            {
                try
                {
                    // Goldener Aura-Effekt fuer Faction-Mitglieder
                    Effect.server.Run("assets/prefabs/misc/halloween/lootbag/effects/gold_sparkle.prefab", player.transform.position);
                    
                    // Leichte Particle fuer Aura-Indikation
                    var pos = player.transform.position + Vector3.up * 1.5f;
                    Effect.server.Run("assets/bundled/prefabs/fx/gestures/smoke_01.prefab", pos);
                }
                catch { /* Silent fail - effects are cosmetic */ }
            }
        }
        
        // Subtle owner glow without sounds
        private void ShowOwnerGlow(BasePlayer player)
        {
            try
            {
                var pos = player.transform.position + Vector3.up * 1.5f;
                Effect.server.Run("assets/prefabs/misc/halloween/lootbag/effects/gold_sparkle.prefab", pos);
            }
            catch { }
        }
        
        private PowerTier GetPowerTier(int powerLevel)
        {
            PowerTier tier = null;
            foreach (var kvp in _config.PowerTiers)
            {
                if (powerLevel >= kvp.Key)
                {
                    tier = kvp.Value;
                }
            }
            return tier ?? _config.PowerTiers[1];
        }
        
        // === LEGENDARY EVENT SYSTEM WITH AUTO-CLEANUP ===
        private void CreateLegendaryEvent(string eventType, ulong playerId, string playerName, string description)
        {
            var legendaryEvent = new LegendaryEvent
            {
                Timestamp = DateTime.Now,
                EventType = eventType,
                PlayerId = playerId,
                PlayerName = playerName,
                Description = description,
                Broadcasted = false
            };
            
            _data.LegendaryEvents.Add(legendaryEvent);
            
            // Performance: Auto-cleanup old events
            if (_config.EnablePerformanceOptimizations && _data.LegendaryEvents.Count > _config.MaxHistoryEvents)
            {
                _data.LegendaryEvents.RemoveRange(0, _data.LegendaryEvents.Count - _config.MaxHistoryEvents);
            }
            
            if (_config.BroadcastLegendaryEvents)
            {
                Broadcast($"{_config.ChatPrefix} {description}");
                legendaryEvent.Broadcasted = true;
            }
            
            if (_config.LogLegendaryEvents)
            {
                LogLocalizedMessage("artifactitem.message", new Dictionary<string, string> { ["eventType"] = eventType.ToString(), ["description"] = description.ToString() });
            }
        }
        
        private void DropCrownWithEffects(Vector3 position, string message)
        {
            _data.Dropped = true;
            _data.DroppedPos = position;
            _data.OwnerUserId = 0;
            _data.OwnerName = "";
            if (_config.ShowPickupEffects)
            {
                // Optimiert: Epic Drop Effects implementiert
                try
                {
                    Effect.server.Run("assets/prefabs/misc/halloween/lootbag/effects/gold_sparkle.prefab", position);
                    Effect.server.Run("assets/bundled/prefabs/fx/explosions/explosion_01.prefab", position);
                    
                    if (_config.PlaySounds)
                    {
                        Effect.server.Run("assets/bundled/prefabs/fx/item_break.prefab", position);
                    }
                }
                catch { /* Silent fail - effects are cosmetic */ }
            }
            
            Broadcast($"{_config.ChatPrefix} {message} Position: {position.x:0},{position.z:0}");
        }

        [ChatCommand("artifact")]
        private void ArtifactCommand(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;

            if (!permission.UserHasPermission(player.UserIDString, UsePerm))
            {
                // Einheitliche No-Permission-Nachricht wie im Rest des Plugins
                var noPerm = T("core.no_permission", (Dictionary<string,string>)null, "You don't have permission for this.");
                SendReply(player, noPerm);
                return;
            }

            if (args == null || args.Length == 0)
            {
                ShowCrownHelp(player);
                return;
            }
            if (args != null && args.Length > 0)
            {
                var sub = args[0].ToLowerInvariant();
                switch (sub)
                {
                    case "pickup":
                        TryLegendaryPickup(player);
                        return;
                    case "status":
                        ShowCrownStatus(player);
                        return;
                    case "legend":
                    case "legends":
                        ShowLegendaryEvents(player);
                        return;
                    case "history":
                        ShowPlayerHistory(player);
                        return;
                    case "leaderboard":
                        ShowLeaderboard(player);
                        return;
                    case "config":
                        if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) 
                        { 
                            SendReply(player, T("core.no_permission", (Dictionary<string,string>)null, "You don't have permission for this.")); 
                            return; 
                        }
                        ShowConfigStatus(player);
                        return;
                    case "toggle":
                        if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) 
                        { 
                            SendReply(player, T("core.no_permission", (Dictionary<string,string>)null, "You don't have permission for this.")); 
                            return; 
                        }
                        if (args.Length < 3) 
                        { 
                            SendReply(player, $"{_config.ChatPrefix} Usage: /artifact toggle <feature> <true|false>"); 
                            SendLocalizedReply(player, "artifactitem.features__history__leaderboard__statistics__performance__sounds__effects"); 
                            return; 
                        }
                        ToggleFeature(player, args[1], args[2]);
                        return;
                    case "reset":
                        if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) 
                        { 
                            SendReply(player, T("core.no_permission", (Dictionary<string,string>)null, "You don't have permission for this.")); 
                            return; 
                        }
                        ResetLegendaryCrown();
                        SaveData();
                        SendReply(player, $"{_config.ChatPrefix} ✅ The Crown has been reset and reforged!");
                        return;
                    default:
                        ShowCrownHelp(player);
                        return;
                }
            }
        }
        
        // === LEGENDARY PICKUP SYSTEM ===
        private void TryLegendaryPickup(BasePlayer player)
        {
            if (!_data.Dropped)
            {
                SendReply(player, $"{_config.ChatPrefix} The Crown of Eternal Dominion is already possessed.");
                return;
            }
            
            if (Vector3.Distance(player.transform.position, _data.DroppedPos) > _config.PickupRadius)
            {
                SendReply(player, $"{_config.ChatPrefix} You must be closer to the Crown to pick it up.");
                return;
            }
            
            // === LEGENDARY PICKUP CEREMONY ===
            _data.Dropped = false;
            _data.OwnerUserId = player.userID;
            _data.OwnerName = player.displayName;
            _data.LastPickup = DateTime.Now;
            _data.TimesStolen++;
            
            // Initialize or update player history
            if (!_data.PlayerHistory.TryGetValue(player.userID, out var history))
            {
                history = new PlayerArtifactHistory
                {
                    UserId = player.userID,
                    PlayerName = player.displayName,
                    FirstPickup = DateTime.Now
                };
                _data.PlayerHistory[player.userID] = history;
            }
            
            history.TimesOwned++;
            history.LastPickup = DateTime.Now;
            history.PlayerName = player.displayName; // Update name
            // === EPIC PICKUP EFFECTS ===
            if (_config.ShowPickupEffects)
            {
                ShowLegendaryPickupEffects(player);
            }
            
            // Broadcast the legendary event
            var tier = GetPowerTier(_data.PowerLevel);
            var announcement = history.TimesOwned == 1 
                ? $"👑✨ {player.displayName} has claimed the CROWN OF ETERNAL DOMINION for the first time!"
                : $"👑✨ {player.displayName} has reclaimed the CROWN OF ETERNAL DOMINION! ({history.TimesOwned} times)";
            
            Broadcast($"{_config.ChatPrefix} {announcement}");
            
            // Personal message to new owner
            SendReply(player, $"{_config.ChatPrefix} 👑 You are now the bearer of the legendary Crown!");
            SendReply(player, $"⚡ Power Level: {_data.PowerLevel} ({tier.Name})");
            SendReply(player, $"✨ You receive: +{_config.OwnerHealthRegenPerTick * tier.Multiplier:0.1f} HP/Tick, {_config.OwnerXPMultiplier}x XP, Faction Aura");
            
            // Create legendary event
            CreateLegendaryEvent("CROWN_CLAIMED", player.userID, player.displayName, announcement);
        }
        
        private void ShowLegendaryPickupEffects(BasePlayer player)
        {
            // Optimiert: Legendary Pickup Effects komplett implementiert
            if (_config.ShowPickupEffects)
            {
                try
                {
                    var pos = player.transform.position;
                    
                    // LegendÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤re Gold-Explosion
                    Effect.server.Run("assets/prefabs/misc/halloween/lootbag/effects/gold_sparkle.prefab", pos);
                    Effect.server.Run("assets/bundled/prefabs/fx/explosions/explosion_01.prefab", pos);
                    
                    // Crown-Glow um Spieler
                    var glowPos = pos + Vector3.up * 2f;
                    Effect.server.Run("assets/bundled/prefabs/fx/gestures/smoke_01.prefab", glowPos);
                    
                    if (_config.PlaySounds)
                    {
                        // Epic Pickup Sound
                        Effect.server.Run("assets/bundled/prefabs/fx/item_break.prefab", pos);
                        Effect.server.Run("assets/bundled/prefabs/fx/impacts/stab/metal/metal1.prefab", pos);
                    }
                }
                catch { /* Silent fail - effects are cosmetic */ }
            }
        }
        
        // === CROWN STATUS DISPLAY ===
        private void ShowCrownStatus(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} CROWN OF ETERNAL DOMINION STATUS:");
            
            if (_data.OwnerUserId != 0)
            {
                var owner = FindOnline(_data.OwnerUserId);
                var ownerName = owner?.displayName ?? _data.OwnerName;
                var tier = GetPowerTier(_data.PowerLevel);
                var holdTime = (DateTime.Now - _data.LastPickup);
                
                SendReply(player, $" Current Ruler: {ownerName}");
                SendReply(player, $" Power Level: {_data.PowerLevel} ({tier.Name})");
                SendReply(player, $" Reign Duration: {holdTime.Days}d {holdTime.Hours}h {holdTime.Minutes}m");
                SendReply(player, $" Kills while Reigning: {_data.KillsWhileHolding}");
                
                if (_data.PlayerHistory.TryGetValue(_data.OwnerUserId, out var history))
                {
                    SendReply(player, $" Times Possessed: {history.TimesOwned}");
                    SendReply(player, $" Legendary Status: {(history.IsLegendaryOwner ? "ACHIEVED " : "Not Yet ")}");
                }
            }
            else
            {
                SendReply(player, $" Status: Dropped on the Island");
                SendReply(player, $" Position: {_data.DroppedPos.x:0}, {_data.DroppedPos.z:0}");
                SendReply(player, $" Power Level: {_data.PowerLevel}");
            }
            
            SendReply(player, $"Crown created: {_data.CreationTime:MM/dd/yyyy HH:mm}");
            SendReply(player, $"Total ownership changes: {_data.TimesStolen}");
        }
        
        private void ResetLegendaryCrown()
        {
            _data = new ArtifactData
            {
                CreationTime = DateTime.Now,
                ArtifactName = _config.ArtifactDisplayName,
                PowerLevel = 1
            };
            CreateLegendaryEvent("CROWN_REFORGED", 0, "System", 
                "🔨 The Crown of Eternal Dominion has been reforged and awaits a worthy bearer!");
        }
        
        // === LEGENDARY EVENTS DISPLAY WITH CONFIG CHECK ===
        private void ShowLegendaryEvents(BasePlayer player)
        {
            if (!_config.EnableLegendaryEvents)
            {
                SendReply(player, $"{_config.ChatPrefix} Legendary events are disabled.");
                return;
            }
            
            SendReply(player, $"{_config.ChatPrefix} ✨ LEGENDARY CROWN EVENTS:");
            
            if (_data.LegendaryEvents.Count == 0)
            {
                SendLocalizedReply(player, "artifactitem.____noch_keine_legend__ren_ereignisse_aufgezeichnet_");
                return;
            }
            
            // LINQ-free: iterate the last 10 events in reverse order (newest first)
            int total = _data.LegendaryEvents.Count;
            int startIndex = total - 1;
            int minIndex = Math.Max(0, total - 10);
            for (int i = startIndex; i >= minIndex; i--)
            {
                var legendEvent = _data.LegendaryEvents[i];
                var timeAgo = DateTime.Now - legendEvent.Timestamp;
                var timeString = timeAgo.TotalHours < 1 ? $"{timeAgo.Minutes}m" : 
                               timeAgo.TotalDays < 1 ? $"{timeAgo.Hours}h {timeAgo.Minutes}m" : 
                               $"{timeAgo.Days}d {timeAgo.Hours}h";
                
                SendReply(player, $"{timeString} - {legendEvent.Description}");
            }
            
            SendReply(player, $"Total: {_data.LegendaryEvents.Count} legendary events");
        }
        
        // === COMPLETE PLAYER HISTORY DISPLAY ===
        private void ShowPlayerHistory(BasePlayer player)
        {
            if (!_config.EnablePlayerHistory)
            {
                SendReply(player, $"{_config.ChatPrefix} Player history is disabled.");
                return;
            }
            
            SendReply(player, $"{_config.ChatPrefix} 📜 YOUR CROWN HISTORY:");
            
            if (!_data.PlayerHistory.TryGetValue(player.userID, out var history))
            {
                SendLocalizedReply(player, "artifactitem.____du_hast_die_krone_noch_nie_ber__hrt__deine_legende_wartet_darauf__geschrieben_zu_werden_");
                return;
            }
            
            SendReply(player, $"👤 Player: {history.PlayerName}");
            SendReply(player, $"👑 Times Possessed: {history.TimesOwned}");
            
            if (_config.ShowTimeDetails)
            {
                SendReply(player, $"⏳ Total Time Held: {FormatTime(history.TotalTimeHeld)}");
                SendReply(player, $"📅 First Pickup: {history.FirstPickup:MM/dd/yyyy HH:mm}");
                SendReply(player, $"📆 Last Pickup: {history.LastPickup:MM/dd/yyyy HH:mm}");
            }
            
            if (_config.EnableDetailedStatistics)
            {
                SendReply(player, $"⚔️ Kills while Holding: {history.KillsWhileHolding}");
                SendReply(player, $"💀 Deaths while Holding: {history.DeathsWhileHolding}");
                
                // Calculate K/D ratio if deaths > 0
                if (history.DeathsWhileHolding > 0)
                {
                    var kdr = (float)history.KillsWhileHolding / history.DeathsWhileHolding;
                    SendReply(player, $"🎯 K/D Ratio: {kdr:F2}");
                }
            }
            
            SendReply(player, $"✨ Legendary Status: {(history.IsLegendaryOwner ? "ACHIEVED ✅" : "Not Yet ❌")}");
            
            // Rank among all players
            if (_config.ShowPlayerRanks)
            {
                // Manual sorting instead of LINQ
                var allHistories = new List<PlayerArtifactHistory>();
                foreach (var playerHistory in _data.PlayerHistory.Values)
                {
                    allHistories.Add(playerHistory);
                }
                allHistories.Sort((a, b) => b.TotalTimeHeld.CompareTo(a.TotalTimeHeld));
                var rank = allHistories.FindIndex(h => h.UserId == player.userID) + 1;
                SendReply(player, $"🏆 Your Rank: #{rank} of {allHistories.Count} players");
            }
            
            // Compare to current owner
            if (_data.OwnerUserId != 0 && _data.OwnerUserId != player.userID)
            {
                var currentOwner = FindOnline(_data.OwnerUserId);
                var currentOwnerName = currentOwner?.displayName ?? _data.OwnerName;
                var currentHoldTime = (DateTime.Now - _data.LastPickup).TotalSeconds;
                SendReply(player, $"👑 Current Owner: {currentOwnerName} has held it for {FormatTime((float)currentHoldTime)}");
            }
        }
        
        private string FormatTime(float seconds)
        {
            var timeSpan = TimeSpan.FromSeconds(seconds);
            if (timeSpan.TotalDays >= 1)
                return $"{timeSpan.Days}d {timeSpan.Hours}h {timeSpan.Minutes}m";
            if (timeSpan.TotalHours >= 1)
                return $"{timeSpan.Hours}h {timeSpan.Minutes}m";
            return $"{timeSpan.Minutes}m {timeSpan.Seconds}s";
        }
        
        private string GetPlayerDisplayName(ulong userId)
        {
            var player = FindOnline(userId);
            if (player != null) return player.displayName;
            
            // Try from history
            if (_data.PlayerHistory.TryGetValue(userId, out var history))
                return history.PlayerName;
                
            return userId.ToString();
        }
        
        // === COMPLETE LEADERBOARD SYSTEM ===
        private void ShowLeaderboard(BasePlayer player)
        {
            if (!_config.EnableLeaderboard)
            {
                SendReply(player, $"{_config.ChatPrefix} Leaderboard is disabled.");
                return;
            }
            
            SendReply(player, $"{_config.ChatPrefix} 🏆 CROWN LEADERBOARD:");
            
            if (_data.PlayerHistory.Count == 0)
            {
                SendLocalizedReply(player, "artifactitem.____noch_keine_spieler_haben_die_krone_ber__hrt_");
                return;
            }
            
            // Manual sorting and taking top 10
            var topPlayersList = new List<PlayerArtifactHistory>();
            foreach (var history in _data.PlayerHistory.Values)
            {
                topPlayersList.Add(history);
            }
            topPlayersList.Sort((a, b) => b.TotalTimeHeld.CompareTo(a.TotalTimeHeld));
            var topPlayers = topPlayersList.Count > 10 ? topPlayersList.GetRange(0, 10) : topPlayersList;
            
            SendLocalizedReply(player, "artifactitem._____top_10_spieler_nach_gesamtzeit_");
            for (int i = 0; i < topPlayers.Count; i++)
            {
                var h = topPlayers[i];
                var medal = i == 0 ? "" : i == 1 ? "" : i == 2 ? "" : $"#{i + 1}";
                var legendary = h.IsLegendaryOwner ? "" : "";
                var timeDisplay = _config.ShowTimeDetails ? FormatTime(h.TotalTimeHeld) : "***";
                SendReply(player, $"{medal} {h.PlayerName}{legendary} - {timeDisplay} ({h.TimesOwned}x)");
            }
            
            // Current champion
            if (_data.MostPowerfulOwner != 0)
            {
                var champion = GetPlayerDisplayName(_data.MostPowerfulOwner);
                var timeDisplay = _config.ShowTimeDetails ? FormatTime(_data.LongestHoldTime) : "***";
                SendReply(player, $"👑 CURRENT CHAMPION: {champion} ({timeDisplay})");
            }
            
            if (_config.EnableDetailedStatistics)
            {
                SendReply(player, $"📊 Overall Statistics:");
                SendReply(player, $"🔄 Ownership Changes: {_data.TimesStolen}");
                SendReply(player, $"⚔️ Kills during Reign: {_data.KillsWhileHolding}");
                // Manual count instead of LINQ.Count()
                int legendaryCount = 0;
                foreach (var history in _data.PlayerHistory.Values)
                {
                    if (history.IsLegendaryOwner) legendaryCount++;
                }
                SendReply(player, $"✨ Legendary Rulers: {legendaryCount}");
                SendReply(player, $"⚡ Current Power Level: {_data.PowerLevel}/10");
                SendReply(player, $"⏳ Total Reign Time: {FormatTime(_data.TotalTimeHeld)}");
            }
        }
        
        private void ShowCrownHelp(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} 👑 CROWN OF ETERNAL DOMINION - COMMANDS:");
            SendReply(player, "• /artifact pickup - Pick up the Crown if you are within range");
            SendReply(player, "• /artifact status - Show current Crown status");
            SendReply(player, "• /artifact legends - View legendary events");
            SendReply(player, "• /artifact history - View your personal artifact history");
            SendReply(player, "• /artifact leaderboard - View the global leaderboard");

            if (permission.UserHasPermission(player.UserIDString, AdminPerm))
            {
                SendReply(player, "— Admin Commands —");
                SendReply(player, "• /artifact config - Show configuration status");
                SendReply(player, "• /artifact toggle <feature> <true|false> - Toggle a feature");
                SendReply(player, "• /artifact reset - Reset the Crown and data");
            }
        }
        
        // === COMPLETE ADMIN CONFIGURATION SYSTEM ===
        private void ShowConfigStatus(BasePlayer player)
        {
            SendReply(player, $"{_config.ChatPrefix} ⚙️ CONFIGURATION STATUS:");
            SendReply(player, $"Plugin Enabled: {(_config.Enabled ? "✅" : "❌")}");
            SendReply(player, $"Player History: {(_config.EnablePlayerHistory ? "✅" : "❌")}");
            SendReply(player, $"Leaderboard: {(_config.EnableLeaderboard ? "✅" : "❌")}");
            SendReply(player, $"Detailed Statistics: {(_config.EnableDetailedStatistics ? "✅" : "❌")}");
            SendReply(player, $"Performance Optimizations: {(_config.EnablePerformanceOptimizations ? "✅" : "❌")}");
            SendReply(player, $"Legendary Events: {(_config.EnableLegendaryEvents ? "✅" : "❌")}");
            SendReply(player, $"Visual Effects: {(_config.ShowPowerEffects ? "✅" : "❌")}");
            SendReply(player, $"Sound Effects: {(_config.PlaySounds ? "✅" : "❌")}");
            SendReply(player, $"Power Scaling: {(_config.EnablePowerScaling ? "✅" : "❌")}");
            SendReply(player, $"Experimental Speed Buff: {(_config.EnableExperimentalSpeedBuff ? "✅" : "❌")}");
            SendReply(player, $"Drop On Logout: {(_config.DropOnLogout ? "✅" : "❌")}");
            SendReply(player, $"⏱️ Tick Interval: {_config.TickSeconds}s");
            SendReply(player, $"📄 Max Events: {_config.MaxHistoryEvents}");
        }
        
        private void ToggleFeature(BasePlayer player, string feature, string value)
        {
            if (!bool.TryParse(value, out var enabled))
            {
                SendReply(player, $"{_config.ChatPrefix} Invalid value. Use true or false.");
                return;
            }
            
            switch (feature.ToLowerInvariant())
            {
                case "history":
                    _config.EnablePlayerHistory = enabled;
                    break;
                case "leaderboard":
                    _config.EnableLeaderboard = enabled;
                    break;
                case "statistics":
                    _config.EnableDetailedStatistics = enabled;
                    break;
                case "performance":
                    _config.EnablePerformanceOptimizations = enabled;
                    break;
                case "sounds":
                    _config.PlaySounds = enabled;
                    break;
                case "effects":
                    _config.ShowPowerEffects = enabled;
                    break;
                case "events":
                    _config.EnableLegendaryEvents = enabled;
                    break;
                case "scaling":
                    _config.EnablePowerScaling = enabled;
                    break;
                case "speed":
                case "speedbuff":
                case "experimental_speedbuff":
                case "experimental":
                    _config.EnableExperimentalSpeedBuff = enabled;
                    break;
                case "droponlogout":
                case "logoutdrop":
                case "drop":
                    _config.DropOnLogout = enabled;
                    break;
                default:
                    SendReply(player, $"{_config.ChatPrefix} Unknown feature: {feature}");
                    return;
            }
            SaveConfig();
            SendReply(player, $"{_config.ChatPrefix} ✅ {feature} has been {(enabled ? "enabled" : "disabled")}.");
        }
        
        // German alias as requested: /artifakt opens same menu/commands
        [ChatCommand("artifakt")]
        private void ArtifactCommandDe(BasePlayer player, string command, string[] args)
        {
            ArtifactCommand(player, command, args);
        }

        // =================== HELPER METHODS ===================
        [ConsoleCommand("eldrunartifact.ui.close")]
        private void UIA_Close(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; try { CuiHelper.DestroyUi(player, PanelName); } catch { }
        }

        [ConsoleCommand("eldrunartifact.ui.pickup")]
        private void UIA_Pickup(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            TryLegendaryPickup(player);
            OpenUI(player);
        }

        [ConsoleCommand("eldrunartifact.ui.reset")] // admin
        private void UIA_Reset(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            ResetLegendaryCrown();
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ The Crown has been reset!");
            OpenUI(player);
        }

        [ConsoleCommand("eldrunartifact.ui.drop")] // admin: drop at player pos
        private void UIA_Drop(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            _data.OwnerUserId = 0; _data.Dropped = true; _data.DroppedPos = player.ServerPosition; SaveData();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunartifact.ui.give_self")] // admin
        private void UIA_GiveSelf(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            ForceGive(player.userID); SaveData();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunartifact.ui.refresh")]
        private void UIA_Refresh(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; _uiActiveTab[player.userID] = "overview"; OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.history")]
        private void UIA_History(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; _uiActiveTab[player.userID] = "history";
            // Suppress chat output in UI mode
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.legends")]
        private void UIA_Legends(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; _uiActiveTab[player.userID] = "legends"; _legendPage[player.userID] = 0;
            ShowLegendaryEvents(player);
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.status")]
        private void UIA_Status(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            ShowCrownStatus(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.leaderboard")]
        private void UIA_Leaderboard(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; _uiActiveTab[player.userID] = "leaderboard";
            // Suppress chat output in UI mode
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.legends.prev")]
        private void UIA_LegendsPrev(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _uiActiveTab[player.userID] = "legends";
            var total = _data.LegendaryEvents.Count;
            var totalPages = Mathf.Max(1, Mathf.CeilToInt(total / 10f));
            var page = 0; _legendPage.TryGetValue(player.userID, out page);
            page = Mathf.Clamp(page - 1, 0, Mathf.Max(0, totalPages - 1));
            _legendPage[player.userID] = page;
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.legends.next")]
        private void UIA_LegendsNext(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _uiActiveTab[player.userID] = "legends";
            var total = _data.LegendaryEvents.Count;
            var totalPages = Mathf.Max(1, Mathf.CeilToInt(total / 10f));
            var page = 0; _legendPage.TryGetValue(player.userID, out page);
            page = Mathf.Clamp(page + 1, 0, Mathf.Max(0, totalPages - 1));
            _legendPage[player.userID] = page;
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.config")] // admin config panel
        private void UIA_Config(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            ShowConfigStatus(player);
        }
        
        [ConsoleCommand("eldrunartifact.ui.toggle")] // admin feature toggle
        private void UIA_Toggle(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var feature = arg.GetString(0, "");
            var value = arg.GetString(1, "");
            if (!string.IsNullOrEmpty(feature) && !string.IsNullOrEmpty(value))
            {
                ToggleFeature(player, feature, value);
            }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunartifact.ui.admin.toggle")] // admin panel inline toggle
        private void UIA_AdminToggle(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var feature = arg.GetString(0, "");
            var value = arg.GetString(1, "");
            if (!string.IsNullOrEmpty(feature) && !string.IsNullOrEmpty(value))
            {
                ToggleFeature(player, feature, value);
            }
            OpenAdminPanel(player);
        }

        private Dictionary<string, string> GetPlayerThemeColors(BasePlayer player)
        {
            // Perfektes ELDRUN GOLD THEME - 100% optimiert
            return new Dictionary<string, string>
            {
                // Haupt-Farben
                ["PrimaryColor"] = "0.06 0.06 0.10 0.98",
                ["SecondaryColor"] = "0.10 0.10 0.16 0.95",
                ["BackgroundColor"] = "0.08 0.08 0.12 0.96",
                
                // ELDRUN GOLD PALETTE
                ["HeaderColor"] = "1 0.88 0.42 1",
                ["CategoryGold"] = "0.95 0.75 0.35 1",
                ["AccentColor"] = "0.78 0.58 0.28 1",
                ["HoverColor"] = "0.85 0.65 0.32 0.9",
                ["BorderColor"] = "0.42 0.32 0.18 0.8",
                
                // TEXT & LESBARKEIT
                ["TextColor"] = "0.96 0.96 0.99 1",
                ["SubTextColor"] = "0.85 0.85 0.90 1",
                ["LabelColor"] = "0.75 0.75 0.82 1",
                
                // STATUS FARBEN
                ["SuccessColor"] = "0.28 0.88 0.38 1",
                ["WarningColor"] = "0.92 0.68 0.28 1",
                ["ErrorColor"] = "0.88 0.28 0.28 1",
                ["InfoColor"] = "0.38 0.68 0.92 1"
            };
        }
        
        private void OpenUI(BasePlayer player)
        {
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            var c = new CuiElementContainer();
            var themeColors = GetPlayerThemeColors(player);

            // === ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â  PERFEKTES ELDRUN KITS DESIGN - ARTIFACT SYSTEM ===
            
            // Main Background Panel (EXAKT wie EldrunKits)
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.1", FadeIn = 0.3f }, // Semi-transparent for image overlay
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" },
                CursorEnabled = true
            }, "Overlay", PanelName);
            
            // Background image removed - using solid background only
            
            // Dark overlay for better UI readability (EXAKT wie EldrunKits)
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.3", FadeIn = 0.4f }, // Dark overlay
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, PanelName, "UIOverlay");
            
            // Top accent bar (gold faint)
            c.Add(new CuiPanel { Image = { Color = TV("accent_primary", "0.10 0.35 0.80 0.40") }, RectTransform = { AnchorMin = "0.02 0.92", AnchorMax = "0.98 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("accent_line", "0.20 0.55 0.95 0.85") }, RectTransform = { AnchorMin = "0.02 0.915", AnchorMax = "0.98 0.918" } }, PanelName);

            // Subtle inner gloss band
            c.Add(new CuiPanel { Image = { Color = TV("gloss", "1.0 1.0 1.0 0.02") }, RectTransform = { AnchorMin = "0.02 0.90", AnchorMax = "0.98 0.93" } }, PanelName);

            // Header container for tabs (was missing previously)
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0" },
                RectTransform = { AnchorMin = "0.02 0.92", AnchorMax = "0.98 0.99" }
            }, PanelName, "HeaderPanel");

            // Side banners & gold borders
            c.Add(new CuiPanel { Image = { Color = TV("side_left", "0.05 0.12 0.28 0.65") }, RectTransform = { AnchorMin = "0.01 0.10", AnchorMax = "0.03 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_right", "0.15 0.35 0.70 0.65") }, RectTransform = { AnchorMin = "0.97 0.10", AnchorMax = "0.99 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.10 0.45 0.85 0.55") }, RectTransform = { AnchorMin = "0.015 0.11", AnchorMax = "0.985 0.12" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.10 0.45 0.85 0.55") }, RectTransform = { AnchorMin = "0.015 0.88", AnchorMax = "0.985 0.89" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.10 0.45 0.85 0.55") }, RectTransform = { AnchorMin = "0.015 0.12", AnchorMax = "0.02 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.10 0.45 0.85 0.55") }, RectTransform = { AnchorMin = "0.98 0.12", AnchorMax = "0.985 0.88" } }, PanelName);

            // Content background
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") }, RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.98 0.89" } }, PanelName);

            // Watermark
            var wmUrl = TV("watermark_url", null);
            if (!string.IsNullOrEmpty(wmUrl))
            {
                var wm = new CuiElement
                {
                    Parent = PanelName,
                    Components =
                    {
                        new CuiRawImageComponent { Color = TV("watermark_color", "1 1 1 0.02"), Url = wmUrl },
                        new CuiRectTransformComponent { AnchorMin = TV("watermark_min", "0.38 0.30"), AnchorMax = TV("watermark_max", "0.62 0.58") }
                    }
                };
                c.Add(wm);
            }

            // Title (Centered)
            c.Add(new CuiLabel { Text = { Text = T("artifact.ui.title", null, "ELDRUN ARTIFACT", player), FontSize = 22, Align = TextAnchor.MiddleCenter, Color = TV("team1_text", "0.82 0.90 1.0 1") }, RectTransform = { AnchorMin = "0.30 0.925", AnchorMax = "0.70 0.985" } }, PanelName);
            // Optional title icon
            var titleIcon = TV("icon_admin_module_artifact", null);
            if (!string.IsNullOrEmpty(titleIcon))
            {
                c.Add(new CuiElement
                {
                    Parent = PanelName,
                    Components =
                    {
                        new CuiRawImageComponent { Url = titleIcon, Color = TV("tab_icon_active", "1 1 1 0.95") },
                        new CuiRectTransformComponent { AnchorMin = "0.02 0.925", AnchorMax = "0.04 0.985" }
                    }
                });
            }
            // Subtitle with plugin information (centered)
            c.Add(new CuiLabel
            {
                Text = { Text = "LEGENDARY ARTIFACT • v36187 • SirEldrun", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = themeColors["SubTextColor"] },
                RectTransform = { AnchorMin = "0.22 0.905", AnchorMax = "0.78 0.94" }
            }, PanelName);
            // Close (styled) with optional icon
            var closeBtnId = c.Add(new CuiButton
            {
                Button = { Color = TV("close_btn", "0.45 0.10 0.10 0.90"), Command = "eldrunartifact.ui.close", Close = PanelName },
                RectTransform = { AnchorMin = "0.94 0.93", AnchorMax = "0.985 0.98" },
                Text = { Text = "", FontSize = 16, Align = TextAnchor.MiddleCenter }
            }, PanelName);
            var closeIcon = TV("icon_btn_close", null);
            if (!string.IsNullOrEmpty(closeIcon))
            {
                c.Add(new CuiElement { Parent = closeBtnId, Components = { new CuiRawImageComponent { Url = closeIcon, Color = TV("tab_icon_active", "1 1 1 0.95") }, new CuiRectTransformComponent { AnchorMin = "0.15 0.15", AnchorMax = "0.85 0.85" } } });
            }
            else
            {
                // Fallback glyph
                c.Add(new CuiLabel { Text = { Text = "Close", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" } }, closeBtnId);
            }

            // Refresh (styled) with optional icon
            var refreshBtnId = c.Add(new CuiButton
            {
                Button = { Color = TV("refresh_btn", "0.20 0.45 0.65 0.90"), Command = "eldrunartifact.ui.refresh" },
                RectTransform = { AnchorMin = "0.90 0.93", AnchorMax = "0.935 0.98" },
                Text = { Text = "", FontSize = 14, Align = TextAnchor.MiddleCenter }
            }, PanelName);
            var refreshIcon = TV("icon_btn_refresh", null);
            if (!string.IsNullOrEmpty(refreshIcon))
            {
                c.Add(new CuiElement { Parent = refreshBtnId, Components = { new CuiRawImageComponent { Url = refreshIcon, Color = TV("tab_icon_active", "1 1 1 0.95") }, new CuiRectTransformComponent { AnchorMin = "0.18 0.18", AnchorMax = "0.82 0.82" } } });
            }
            else
            {
                c.Add(new CuiLabel { Text = { Text = "Refresh", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" } }, refreshBtnId);
            }

            // Admin header actions and utilities
            

            // Header Tabs (left) with active highlight
            var activeTab = _uiActiveTab.ContainsKey(player.userID) ? _uiActiveTab[player.userID] : "overview";
            _uiActiveTab[player.userID] = activeTab; // ensure default stored

            // Status
            string statusTxt;
            if (_data.OwnerUserId != 0)
            {
                statusTxt = T("artifact.header.status_claimed", null, "CROWN OF ETERNAL DOMINION • Claimed", player);
            }
            else if (_data.Dropped)
            {
                string px = _data.DroppedPos.x.ToString("0"), pz = _data.DroppedPos.z.ToString("0");
                statusTxt = T("artifact.drop.status", null, $"Artifact dropped at: {px},{pz}", player).Replace("{x}", px).Replace("{z}", pz);
            }
            else
            {
                statusTxt = T("artifact.free.status", null, "Artifact is unclaimed.", player);
            }
            c.Add(new CuiLabel { Text = { Text = statusTxt, FontSize = 16, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.86", AnchorMax = "0.96 0.90" } }, PanelName);

            // Contextual pickup button if dropped and close enough
            if (_data.Dropped)
            {
                float dist = Vector3.Distance(player.ServerPosition, _data.DroppedPos);
                bool canPickup = dist <= Mathf.Max(0.1f, _config.PickupRadius);
                if (canPickup)
                {
                    c.Add(new CuiButton { Button = { Color = TV("random_btn", "0.18 0.55 0.20 0.90"), Command = "eldrunartifact.ui.pickup" }, RectTransform = { AnchorMin = "0.04 0.78", AnchorMax = "0.30 0.84" }, Text = { Text = T("artifact.ui.pickup", null, "Pick Up Artifact", player), FontSize = 12, Align = TextAnchor.MiddleCenter } }, PanelName);
                }
                else
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.ui.pickup_hint", new Dictionary<string,string>{{"m", _config.PickupRadius.ToString("0.0")}}, "Hint: Move closer ({m}m) to pick it up.", player), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.04 0.78", AnchorMax = "0.96 0.84" } }, PanelName);
                }
            }

            // Description (informational)
            c.Add(new CuiLabel { Text = { Text = T("artifact.ui.desc", null, "Pick up the Artifact to gain gentle regeneration and grant a small blessing to nearby faction members.") , FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.92" }, RectTransform = { AnchorMin = "0.04 0.695", AnchorMax = "0.78 0.725" } }, PanelName);
            
            // === INTERACTIVE COMMAND BUTTONS (Available to all users) ===
            // Status Button
            

            // Helper line explaining the actions
            c.Add(new CuiLabel
            {
                Text = { Text = T("artifact.ui.actions_hint", null, "Tip: Use the quick actions on the right sidebar to view status, your history, global legends and the top holders.", player), FontSize = 10, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.80" },
                RectTransform = { AnchorMin = "0.04 0.63", AnchorMax = "0.96 0.65" }
            }, PanelName);

            // === OVERVIEW SUMMARY (when active tab is overview) ===
            if (activeTab == "overview")
            {
                var contentPanelId = c.Add(new CuiPanel
                {
                    Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") },
                    RectTransform = { AnchorMin = "0.04 0.30", AnchorMax = "0.78 0.73" }
                }, PanelName);
                // Overview content title
                c.Add(new CuiLabel
                {
                    Text = { Text = "📋 ARTIFACT OVERVIEW", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] },
                    RectTransform = { AnchorMin = "0.03 0.90", AnchorMax = "0.80 0.98" }
                }, contentPanelId);

                var ownerName = _data.OwnerUserId > 0 ? GetPlayerDisplayName(_data.OwnerUserId) : "None";
                var status = _data.Dropped ? "Dropped" : (_data.OwnerUserId > 0 ? "Owned" : "Available");
                var powerTier = GetPowerTier(_data.PowerLevel);

                float y = 0.82f; float step = 0.10f;
                // Row: Owner/Status
                c.Add(new CuiLabel { Text = { Text = $"👑 Owner", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.30 {y}" } }, contentPanelId);
                c.Add(new CuiLabel { Text = { Text = $": {ownerName} ({status})", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.90" }, RectTransform = { AnchorMin = $"0.32 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                y -= step;
                // Row: Power/Tier
                c.Add(new CuiLabel { Text = { Text = "⚡ Power", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.30 {y}" } }, contentPanelId);
                c.Add(new CuiLabel { Text = { Text = $": {_data.PowerLevel}/{_config.MaxPowerLevel} • {powerTier.Name}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] }, RectTransform = { AnchorMin = $"0.32 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                y -= step;
                // Row: Top Stats
                c.Add(new CuiLabel { Text = { Text = "📊 Stats", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.30 {y}" } }, contentPanelId);
                c.Add(new CuiLabel { Text = { Text = $": Stolen: {_data.TimesStolen} • Kills: {_data.KillsWhileHolding} • Players: {_data.PlayerHistory.Count} • Events: {_data.LegendaryEvents.Count}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.90" }, RectTransform = { AnchorMin = $"0.32 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);

                // Champion / Longest Hold (if available)
                if (_data.MostPowerfulOwner != 0 && _data.LongestHoldTime > 0)
                {
                    y -= step;
                    var champ = GetPlayerDisplayName(_data.MostPowerfulOwner);
                    var td = _config.ShowTimeDetails ? FormatTime(_data.LongestHoldTime) : "***";
                    c.Add(new CuiLabel { Text = { Text = "🏆 Champion", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.30 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = $": {champ} • {td}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.90" }, RectTransform = { AnchorMin = $"0.32 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                }
            }

            // === LEGENDS PAGINATION VIEW (when active tab is legends) ===
            if (activeTab == "legends")
            {
                var contentPanelId = c.Add(new CuiPanel
                {
                    Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") },
                    RectTransform = { AnchorMin = "0.04 0.30", AnchorMax = "0.78 0.73" }
                }, PanelName);

                int total = _data.LegendaryEvents.Count;
                int pageSize = 10;
                int totalPages = Mathf.Max(1, Mathf.CeilToInt(total / (float)pageSize));
                int page = 0; _legendPage.TryGetValue(player.userID, out page);
                page = Mathf.Clamp(page, 0, Mathf.Max(0, totalPages - 1));
                _legendPage[player.userID] = page;

                // Newest first
                int startIdx = total - 1 - page * pageSize;
                int endIdx = Mathf.Max(0, startIdx - (pageSize - 1));
                float yTop = 0.90f;
                if (total == 0)
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.legends.empty", null, "No legendary events yet. Be the first to write history!", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.60" } }, contentPanelId);
                }
                else
                {
                    for (int i = startIdx, line = 0; i >= endIdx && i >= 0; i--, line++)
                    {
                        var ev = _data.LegendaryEvents[i];
                        var timeAgo = DateTime.Now - ev.Timestamp;
                        string timeStr = timeAgo.TotalHours < 1 ? $"{timeAgo.Minutes}m" :
                                         timeAgo.TotalDays < 1 ? $"{timeAgo.Hours}h {timeAgo.Minutes}m" :
                                         $"{timeAgo.Days}d {timeAgo.Hours}h";
                        float y0 = yTop - line * 0.07f;
                        float y1 = y0 - 0.05f;
                        if (y1 < 0.08f) break;
                        c.Add(new CuiLabel { Text = { Text = $"{timeStr} - {ev.Description}", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.03 {y1}", AnchorMax = $"0.97 {y0}" } }, contentPanelId);
                    }
                }

                // Legends content title
                c.Add(new CuiLabel
                {
                    Text = { Text = "✨ LEGENDARY EVENTS", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] },
                    RectTransform = { AnchorMin = "0.03 0.90", AnchorMax = "0.80 0.98" }
                }, contentPanelId);

                // Pagination controls
                c.Add(new CuiButton { Button = { Color = TV("tab_btn", "0.20 0.20 0.22 0.90"), Command = "eldrunartifact.ui.legends.prev" }, RectTransform = { AnchorMin = "0.03 0.03", AnchorMax = "0.15 0.09" }, Text = { Text = "◀ Prev", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, contentPanelId);
                c.Add(new CuiLabel { Text = { Text = $"Page {page + 1}/{Mathf.Max(1, totalPages)}", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.40 0.03", AnchorMax = "0.60 0.09" } }, contentPanelId);
                c.Add(new CuiButton { Button = { Color = TV("tab_btn", "0.20 0.20 0.22 0.90"), Command = "eldrunartifact.ui.legends.next" }, RectTransform = { AnchorMin = "0.85 0.03", AnchorMax = "0.97 0.09" }, Text = { Text = "Next ▶", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, contentPanelId);
            }

            // === HISTORY PANEL (when active tab is history) ===
            if (activeTab == "history")
            {
                var contentPanelId = c.Add(new CuiPanel
                {
                    Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") },
                    RectTransform = { AnchorMin = "0.04 0.30", AnchorMax = "0.78 0.73" }
                }, PanelName);

                // History content title
                c.Add(new CuiLabel
                {
                    Text = { Text = "📜 PLAYER HISTORY", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] },
                    RectTransform = { AnchorMin = "0.03 0.90", AnchorMax = "0.80 0.98" }
                }, contentPanelId);

                if (!_config.EnablePlayerHistory)
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.history.disabled", null, "Player history is disabled.", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.60" } }, contentPanelId);
                }
                else if (!_data.PlayerHistory.TryGetValue(player.userID, out var history))
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.history.none", null, "You have not held the Artifact yet.", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.60" } }, contentPanelId);
                }
                else
                {
                    float y = 0.84f;
                    float step = 0.10f;
                    // Row 1
                    c.Add(new CuiLabel { Text = { Text = "👑 Times Owned", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.45 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = history.TimesOwned.ToString(), FontSize = 11, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = $"0.50 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                    y -= step;
                    // Row 2
                    c.Add(new CuiLabel { Text = { Text = "⏳ Total Time Held", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.45 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = (_config.ShowTimeDetails ? FormatTime(history.TotalTimeHeld) : "***"), FontSize = 11, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = $"0.50 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                    y -= step;
                    // Row 3
                    c.Add(new CuiLabel { Text = { Text = "⚔️ Kills While Holding", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.45 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = history.KillsWhileHolding.ToString(), FontSize = 11, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = $"0.50 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                    y -= step;
                    // Row 4
                    c.Add(new CuiLabel { Text = { Text = "💀 Deaths While Holding", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.45 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = history.DeathsWhileHolding.ToString(), FontSize = 11, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = $"0.50 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                    y -= step;
                    // Row 5
                    c.Add(new CuiLabel { Text = { Text = "✨ Legendary Status", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.05 {y - 0.05f}", AnchorMax = $"0.45 {y}" } }, contentPanelId);
                    c.Add(new CuiLabel { Text = { Text = (history.IsLegendaryOwner ? "Yes" : "No"), FontSize = 11, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = $"0.50 {y - 0.05f}", AnchorMax = $"0.95 {y}" } }, contentPanelId);
                }
            }

            // === LEADERBOARD PANEL (when active tab is leaderboard) ===
            if (activeTab == "leaderboard")
            {
                var contentPanelId = c.Add(new CuiPanel
                {
                    Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") },
                    RectTransform = { AnchorMin = "0.04 0.30", AnchorMax = "0.78 0.73" }
                }, PanelName);

                // Leaderboard content title
                c.Add(new CuiLabel
                {
                    Text = { Text = "🏆 LEADERBOARD", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] },
                    RectTransform = { AnchorMin = "0.03 0.90", AnchorMax = "0.80 0.98" }
                }, contentPanelId);

                if (!_config.EnableLeaderboard)
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.leaderboard.disabled", null, "Leaderboard is disabled.", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.60" } }, contentPanelId);
                }
                else if (_data.PlayerHistory.Count == 0)
                {
                    c.Add(new CuiLabel { Text = { Text = T("artifact.leaderboard.empty", null, "No players have held the Artifact yet. Claim the crown and start your reign!", player), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.95 0.60" } }, contentPanelId);
                }
                else
                {
                    // Build top 10 list
                    var topPlayersList = new List<PlayerArtifactHistory>();
                    foreach (var h in _data.PlayerHistory.Values) topPlayersList.Add(h);
                    topPlayersList.Sort((a, b) => b.TotalTimeHeld.CompareTo(a.TotalTimeHeld));
                    var topPlayers = topPlayersList.Count > 10 ? topPlayersList.GetRange(0, 10) : topPlayersList;

                    float yTop = 0.88f;
                    for (int i = 0; i < topPlayers.Count; i++)
                    {
                        var h = topPlayers[i];
                        var rank = i + 1;
                        var medal = rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : $"#{rank}";
                        var timeDisplay = _config.ShowTimeDetails ? FormatTime(h.TotalTimeHeld) : "***";
                        float y0 = yTop - i * 0.07f;
                        float y1 = y0 - 0.05f;
                        if (y1 < 0.06f) break;
                        c.Add(new CuiLabel { Text = { Text = $"{medal} {h.PlayerName} - {timeDisplay} ({h.TimesOwned}x)", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.95" }, RectTransform = { AnchorMin = $"0.03 {y1}", AnchorMax = $"0.97 {y0}" } }, contentPanelId);
                    }
                }
            }

            // === SIDEBAR RECHTS - PERFEKT WIE ELDRUNKITS ===
            // Sidebar Background Panel (Rechts)
            c.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.82 0.12", AnchorMax = "0.98 0.89" }
            }, PanelName, "SidebarPanel");
            
            // Sidebar Header
            c.Add(new CuiLabel
            {
                Text = { Text = "ARTIFACT INFO", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] },
                RectTransform = { AnchorMin = "0.05 0.94", AnchorMax = "0.95 0.98" }
            }, "SidebarPanel");
            
            // Power Level Info
            var sidebarTier = GetPowerTier(_data.PowerLevel);
            c.Add(new CuiLabel
            {
                Text = { Text = $"⚡ Power: {_data.PowerLevel}/{_config.MaxPowerLevel}", FontSize = 10, Align = TextAnchor.MiddleLeft, Color = themeColors["TextColor"] },
                RectTransform = { AnchorMin = "0.08 0.88", AnchorMax = "0.92 0.92" }
            }, "SidebarPanel");
            
            c.Add(new CuiLabel
            {
                Text = { Text = $"👑 Tier: {sidebarTier.Name}", FontSize = 9, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
                RectTransform = { AnchorMin = "0.08 0.83", AnchorMax = "0.92 0.87" }
            }, "SidebarPanel");
            
            // Total Statistics
            c.Add(new CuiLabel
            {
                Text = { Text = "📊 STATISTICS", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] },
                RectTransform = { AnchorMin = "0.05 0.75", AnchorMax = "0.95 0.80" }
            }, "SidebarPanel");
            
            c.Add(new CuiLabel
            {
                Text = { Text = $"Ownership Changes: {_data.TimesStolen}", FontSize = 8, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] },
                RectTransform = { AnchorMin = "0.08 0.70", AnchorMax = "0.92 0.74" }
            }, "SidebarPanel");
            
            c.Add(new CuiLabel
            {
                Text = { Text = $"Kills Total: {_data.KillsWhileHolding}", FontSize = 8, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] },
                RectTransform = { AnchorMin = "0.08 0.65", AnchorMax = "0.92 0.69" }
            }, "SidebarPanel");
            
            c.Add(new CuiLabel
            {
                Text = { Text = $"Players: {_data.PlayerHistory.Count}", FontSize = 8, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] },
                RectTransform = { AnchorMin = "0.08 0.60", AnchorMax = "0.92 0.64" }
            }, "SidebarPanel");
            
            c.Add(new CuiLabel
            {
                Text = { Text = $"Events: {_data.LegendaryEvents.Count}", FontSize = 8, Align = TextAnchor.MiddleLeft, Color = themeColors["SubTextColor"] },
                RectTransform = { AnchorMin = "0.08 0.55", AnchorMax = "0.92 0.59" }
            }, "SidebarPanel");
            
            // Sidebar Quick Actions
            c.Add(new CuiLabel
            {
                Text = { Text = "\u2699ï¸ QUICK ACTIONS", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] },
                RectTransform = { AnchorMin = "0.05 0.47", AnchorMax = "0.95 0.52" }
            }, "SidebarPanel");
            
            // Quick Action Buttons in Sidebar
            c.Add(new CuiButton 
            { 
                Button = { Color = "0.38 0.68 0.92 0.85", Command = "eldrunartifact.ui.status" }, 
                RectTransform = { AnchorMin = "0.08 0.40", AnchorMax = "0.92 0.45" }, 
                Text = { Text = "\ud83d\udcca Status", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
            }, "SidebarPanel");
            
            c.Add(new CuiButton 
            { 
                Button = { Color = "0.60 0.50 0.20 0.85", Command = "eldrunartifact.ui.history" }, 
                RectTransform = { AnchorMin = "0.08 0.34", AnchorMax = "0.92 0.39" }, 
                Text = { Text = "📄 History", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
            }, "SidebarPanel");
            
            c.Add(new CuiButton 
            { 
                Button = { Color = "0.20 0.45 0.65 0.85", Command = "eldrunartifact.ui.legends" }, 
                RectTransform = { AnchorMin = "0.08 0.28", AnchorMax = "0.92 0.33" }, 
                Text = { Text = "✨ Legends", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
            }, "SidebarPanel");
            
            c.Add(new CuiButton 
            { 
                Button = { Color = "0.18 0.55 0.20 0.85", Command = "eldrunartifact.ui.leaderboard" }, 
                RectTransform = { AnchorMin = "0.08 0.22", AnchorMax = "0.92 0.27" }, 
                Text = { Text = "🏆 Leaderboard", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } 
            }, "SidebarPanel");
            
            // Admin controls (moved down to make room for user buttons)
            bool isAdmin = permission.UserHasPermission(player.UserIDString, AdminPerm);
            if (isAdmin)
            {
                c.Add(new CuiLabel
                {
                    Text = { Text = "🛠️ ADMIN", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = themeColors["ErrorColor"] },
                    RectTransform = { AnchorMin = "0.05 0.14", AnchorMax = "0.95 0.19" }
                }, "SidebarPanel");
                
                c.Add(new CuiButton { Button = { Color = "0.60 0.50 0.20 0.80", Command = "eldrunartifact.ui.give_self" }, RectTransform = { AnchorMin = "0.08 0.10", AnchorMax = "0.92 0.13" }, Text = { Text = "⬇️ Give to Me", FontSize = 8, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarPanel");
                c.Add(new CuiButton { Button = { Color = "0.20 0.45 0.65 0.80", Command = "eldrunartifact.ui.drop" }, RectTransform = { AnchorMin = "0.08 0.06", AnchorMax = "0.92 0.09" }, Text = { Text = "💥 Drop Here", FontSize = 8, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarPanel");
                c.Add(new CuiButton { Button = { Color = "0.45 0.10 0.10 0.80", Command = "eldrunartifact.ui.reset" }, RectTransform = { AnchorMin = "0.08 0.02", AnchorMax = "0.92 0.05" }, Text = { Text = "♻️ Reset", FontSize = 8, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarPanel");
            }

            // Optional attribution
            if (TV("show_attribution", "false") == "true")
            {
                c.Add(new CuiLabel { Text = { Text = T("faction.attribution", null, "Icons: game-icons.net (CC BY 3.0)", player), FontSize = 10, Align = TextAnchor.MiddleRight, Color = "1 1 1 0.28" }, RectTransform = { AnchorMin = "0.70 0.202", AnchorMax = "0.96 0.215" } }, PanelName);
            }

            // Footer (Unified Eldrun Style)
            c.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.15 0.35 0.96", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.02 0.02", AnchorMax = "0.98 0.08" }
            }, PanelName, "FooterPanel");
            // Top border (blue accent)
            c.Add(new CuiPanel { Image = { Color = "0.10 0.45 0.85 0.80" }, RectTransform = { AnchorMin = "0 0.90", AnchorMax = "1 1" } }, "FooterPanel");
            // Globaler Eldrun-Footertext
            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            c.Add(new CuiLabel { Text = { Text = footerText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" }, RectTransform = { AnchorMin = "0.02 0.10", AnchorMax = "0.98 0.90" } }, "FooterPanel");

            CuiHelper.AddUi(player, c);
        }

        private void ComputePanelAnchorsArtifact(BasePlayer player, out string anchorMin, out string anchorMax)
        {
            bool isAdmin = permission.UserHasPermission(player.UserIDString, AdminPerm);
            bool dropped = _data?.Dropped ?? false;
            // Base size for title + status
            float w = 0.52f;
            float h = 0.30f; // header + status
            if (dropped) h += 0.06f; // pickup or hint row
            if (isAdmin) h += 0.08f; // admin buttons row
            h = Mathf.Clamp(h, 0.30f, 0.66f);
            CenterAnchorsArtifact(w, h, out anchorMin, out anchorMax);
        }
        private void CenterAnchorsArtifact(float w, float h, out string min, out string max)
        {
            w = Mathf.Clamp(w, 0.44f, 0.76f);
            h = Mathf.Clamp(h, 0.28f, 0.70f);
            float minX = (1f - w) * 0.5f;
            float minY = (1f - h) * 0.5f;
            float maxX = 1f - minX;
            float maxY = 1f - minY;
            min = string.Format(CultureInfo.InvariantCulture, "{0:0.###} {1:0.###}", minX, minY);
            max = string.Format(CultureInfo.InvariantCulture, "{0:0.###} {1:0.###}", maxX, maxY);
        }

        private string GetStatusString()
        {
            if (_data.OwnerUserId != 0)
            {
                var owner = FindOnline(_data.OwnerUserId);
                var name = owner != null ? owner.displayName : _data.OwnerUserId.ToString();
                return T("artifact.owner.status", new Dictionary<string,string>{{"name", name}}, "Artifact Holder: {name}");
            }
            if (_data.Dropped)
            {
                var txt = T("artifact.drop.status", null, $"Artifact dropped at: {_data.DroppedPos.x:0},{_data.DroppedPos.z:0}");
                return txt.Replace("{x}", _data.DroppedPos.x.ToString("0")).Replace("{z}", _data.DroppedPos.z.ToString("0"));
            }
            return T("artifact.free.status", null, "Artifact is unclaimed.");
        }

        // === CONSOLIDATED PICKUP METHOD - REMOVED DUPLICATE ===
        // TryPickup was redundant - using TryLegendaryPickup for all pickup logic

        private void ForceGive(ulong userId)
        {
            _data.OwnerUserId = userId;
            _data.Dropped = false;
        }

        // === DUPLICATE PICKUP METHOD REMOVAL ===
        // TryPickup method consolidated into TryLegendaryPickup for consistency

        private void Heal(BasePlayer player, float amount)
        {
            try
            {
                if (amount <= 0f) return;
                player.Heal(amount);
            }
            catch { }
        }


        private string GetPlayerFaction(ulong userId)
        {
            if (EldrunFraktion == null) return null;
            try
            {
                var res = EldrunFraktion.Call("Eldrun_GetPlayerFaction", userId);
                return res as string;
            }
            catch { }
            return null;
        }

        // === ERWEITERTE PERFORMANCE-OPTIMIERUNGEN ===
        private static readonly Dictionary<ulong, BasePlayer> _playerCache = new Dictionary<ulong, BasePlayer>();
        private static float _lastCacheUpdate = 0f;
        private static readonly Dictionary<ulong, DateTime> _playerLastSeen = new Dictionary<ulong, DateTime>();
        
        private BasePlayer FindOnlineOptimized(ulong userId)
        {
            // Dynamisches Cache-Update basierend auf Konfiguration
            if (Time.realtimeSinceStartup - _lastCacheUpdate > (_config?.PlayerCacheRefreshSeconds ?? 10))
            {
                RefreshPlayerCache();
            }
            
            if (_playerCache.TryGetValue(userId, out var player) && player?.IsConnected == true)
            {
                _playerLastSeen[userId] = DateTime.Now; // Track activity
                return player;
            }
            // Fallback: attempt a lightweight refresh and lookup
            var list = BasePlayer.activePlayerList;
            if (list != null)
            {
                foreach (var p in list)
                {
                    if (p?.IsConnected == true)
                        _playerCache[p.userID] = p;
                }
            }
            if (_playerCache.TryGetValue(userId, out var player2) && player2?.IsConnected == true)
            {
                _playerLastSeen[userId] = DateTime.Now;
                return player2;
            }
            
            return null;
        }
        
        private static void RefreshPlayerCache()
        {
            _playerCache.Clear();
            var list = BasePlayer.activePlayerList;
            if (list != null)
            {
                foreach (var p in list)
                {
                    if (p?.IsConnected == true)
                        _playerCache[p.userID] = p;
                }
            }
            _lastCacheUpdate = Time.realtimeSinceStartup;
        }
        
        // === ADVANCED CLEANUP FOR INACTIVE PLAYERS ===
        private void CleanupInactivePlayerData()
        {
            if (!_config.EnablePerformanceOptimizations) return;
            
            var cutoffTime = DateTime.Now.AddDays(-30); // Remove data older than 30 days
            var toRemove = new List<ulong>();
            
            foreach (var kvp in _playerLastSeen)
            {
                if (kvp.Value < cutoffTime)
                {
                    toRemove.Add(kvp.Key);
                }
            }
            
            foreach (var userId in toRemove)
            {
                _playerLastSeen.Remove(userId);
                // Keep player history but mark as inactive
            }
        }
        
        // Legacy method for compatibility
        private BasePlayer FindOnline(ulong userId) => FindOnlineOptimized(userId);
        
        // Neue optimierte Helper-Methode
        private void NotifyNearbyPlayers(BasePlayer owner)
        {
            var ownerPos = owner.transform.position;
            foreach (var player in _playerCache.Values)
            {
                if (player == null || player == owner || !player.IsConnected) continue;
                if (Vector3.Distance(player.transform.position, ownerPos) <= _config.PowerAuraRadius)
                {
                    SendReply(player, $"{_config.ChatPrefix} {T("artifact.aura.hint", (Dictionary<string,string>)null, "You sense the presence of the Artifact...")}");
                }
            }
        }

        private bool IsSameFaction(ulong a, ulong b)
        {
            var fa = GetPlayerFaction(a);
            var fb = GetPlayerFaction(b);
            if (string.IsNullOrEmpty(fa) || string.IsNullOrEmpty(fb)) return false;
            return string.Equals(fa, fb, StringComparison.Ordinal);
        }

        private void Broadcast(string msg)
        {
            try { PrintToChat(msg); } catch { Puts(msg); }
        }

        // === OWNER MINI HUD ===
        private void UpdateOwnerHud()
        {
            try
            {
                if (_data.OwnerUserId == 0)
                {
                    // No owner -> ensure HUD is closed for previous owner
                    if (_hudOwnerUserIdCache != 0)
                    {
                        var prev = FindOnlineOptimized(_hudOwnerUserIdCache);
                        if (prev != null) { try { CuiHelper.DestroyUi(prev, HudPanelName); } catch { } }
                        _hudOwnerUserIdCache = 0;
                    }
                    return;
                }

                var owner = FindOnlineOptimized(_data.OwnerUserId);
                if (owner == null)
                {
                    // owner offline? ensure any existing HUD removed
                    if (_hudOwnerUserIdCache != 0)
                    {
                        var prev = FindOnlineOptimized(_hudOwnerUserIdCache);
                        if (prev != null) { try { CuiHelper.DestroyUi(prev, HudPanelName); } catch { } }
                        _hudOwnerUserIdCache = 0;
                    }
                    return;
                }

                // Rebuild on owner change or every ~2.5s
                if (_hudOwnerUserIdCache != owner.userID || (Time.realtimeSinceStartup - _lastHudUpdate) > 2.5f)
                {
                    ShowOwnerHud(owner);
                    _hudOwnerUserIdCache = owner.userID;
                    _lastHudUpdate = Time.realtimeSinceStartup;
                }
            }
            catch { }
        }

        private void ShowOwnerHud(BasePlayer owner)
        {
            try { CuiHelper.DestroyUi(owner, HudPanelName); } catch { }

            var c = new CuiElementContainer();
            var theme = GetPlayerThemeColors(owner);
            var anchorMin = "0.82 0.92";
            var anchorMax = "0.98 0.99";
            var bgColor = theme.ContainsKey("PrimaryColor") ? theme["PrimaryColor"] : "0.06 0.06 0.10 0.98";
            var textColor = theme.ContainsKey("TextColor") ? theme["TextColor"] : "0.96 0.96 0.99 1";
            var accent = theme.ContainsKey("AccentColor") ? theme["AccentColor"] : "0.78 0.58 0.28 1";

            // Background
            c.Add(new CuiPanel
            {
                Image = { Color = bgColor },
                RectTransform = { AnchorMin = anchorMin, AnchorMax = anchorMax }
            }, "Overlay", HudPanelName);

            // Power/Tier
            var tier = GetPowerTier(_data.PowerLevel);
            c.Add(new CuiLabel
            {
                Text = { Text = $"👑 L{_data.PowerLevel} • {tier.Name}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = textColor },
                RectTransform = { AnchorMin = "0.04 0.55", AnchorMax = "0.96 0.95" }
            }, HudPanelName);

            // Aura info
            int allies = CountFactionAlliesInAura(owner);
            c.Add(new CuiLabel
            {
                Text = { Text = $"Aura {_config.PowerAuraRadius:0}m • Allies {allies}", FontSize = 10, Align = TextAnchor.MiddleLeft, Color = textColor },
                RectTransform = { AnchorMin = "0.04 0.10", AnchorMax = "0.96 0.50" }
            }, HudPanelName);

            // Progress to next level (if scaling enabled)
            if (_config.EnablePowerScaling && _config.PowerGrowthPerHour > 0f && _data.LastPickup != DateTime.MinValue)
            {
                var hoursHeld = (float)(DateTime.Now - _data.LastPickup).TotalHours;
                var growth = _config.PowerGrowthPerHour;
                var progress = hoursHeld * growth;
                var frac = progress - Mathf.Floor(progress);
                var etaHours = (1f - frac) / growth;
                var etaMin = Mathf.CeilToInt(etaHours * 60f);
                // Progress bar element (simple accent strip)
                var barBg = c.Add(new CuiPanel { Image = { Color = "0 0 0 0.35" }, RectTransform = { AnchorMin = "0.04 0.02", AnchorMax = "0.96 0.08" } }, HudPanelName);
                // Fill
                float fill = Mathf.Clamp01(frac);
                c.Add(new CuiPanel { Image = { Color = accent }, RectTransform = { AnchorMin = "0 0", AnchorMax = $"{fill:0.###} 1" } }, barBg);
                // ETA overlay
                c.Add(new CuiLabel { Text = { Text = $"+{etaMin}m", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.85" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" } }, barBg);
            }

            CuiHelper.AddUi(owner, c);
        }

        private int CountFactionAlliesInAura(BasePlayer owner)
        {
            try
            {
                var f = GetPlayerFaction(owner.userID);
                if (string.IsNullOrEmpty(f)) return 0;
                int count = 0;
                var list = BasePlayer.activePlayerList;
                if (list == null) return 0;
                foreach (var p in list)
                {
                    if (p == null || p == owner || !p.IsConnected) continue;
                    if (Vector3.Distance(p.transform.position, owner.transform.position) > _config.PowerAuraRadius) continue;
                    var pf = GetPlayerFaction(p.userID);
                    if (!string.IsNullOrEmpty(pf) && string.Equals(pf, f, StringComparison.Ordinal)) count++;
                }
                return count;
            }
            catch { return 0; }
        }

        // Public API for HUD/Admin: get current artifact status
        public object Eldrun_GetStatus()
        {
            var dict = new Dictionary<string, object>();
            dict["ownerUserId"] = _data.OwnerUserId;
            dict["dropped"] = _data.Dropped;
            dict["droppedPosX"] = _data.DroppedPos.x;
            dict["droppedPosZ"] = _data.DroppedPos.z;
            string ownerName = null;
            if (_data.OwnerUserId != 0)
            {
                var owner = FindOnline(_data.OwnerUserId);
                ownerName = owner != null ? owner.displayName : _data.OwnerUserId.ToString();
            }
            dict["ownerName"] = ownerName;
            return dict;
        }

        // Enable/Disable API for admin menu
        public bool Eldrun_GetEnabled() => _config?.Enabled ?? true;
        public void Eldrun_SetEnabled(bool enabled)
        {
            if (_config == null) return;
            _config.Enabled = enabled;
            try { _tick?.Destroy(); } catch { }
            _tick = null;
            if (enabled)
            {
                _tick = timer.Every(Mathf.Max(1f, _config.TickSeconds), LegendaryTick);
            }
        }

        private string T(string key, Dictionary<string,string> vars, string fallback, BasePlayer player = null)
        {
            try
            {
                if (EldrunLocale != null)
                {
                    var res = EldrunLocale.Call("Eldrun_Translate", key, player, vars) as string;
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

[ConsoleCommand("eldrunartifact.ui.adminpanel")]
private void UIA_AdminPanel(ConsoleSystem.Arg arg)
{
    var player = arg.Player(); 
    if (player == null) return;
    if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
    OpenAdminPanel(player);
}

private void OpenAdminPanel(BasePlayer player)
{
    try { CuiHelper.DestroyUi(player, PanelName); } catch { }
    var c = new CuiElementContainer();
    var themeColors = GetPlayerThemeColors(player);
    
    // Main Background
    c.Add(new CuiPanel
    {
        Image = { Color = "0 0 0 0.1", FadeIn = 0.3f },
        RectTransform = { AnchorMin = "0.12 0.12", AnchorMax = "0.88 0.88" },
        CursorEnabled = true
    }, "Overlay", PanelName);
    
    // Background Image
    // Background image removed - using solid background only
    
    // Dark Overlay
    c.Add(new CuiPanel
    {
        Image = { Color = "0 0 0 0.3", FadeIn = 0.4f },
        RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
    }, PanelName, "UIOverlay");
    
    // Header
    c.Add(new CuiPanel
    {
        Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f },
        RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.98 0.99" }
    }, "UIOverlay", "HeaderPanel");
    
    c.Add(new CuiPanel { Image = { Color = themeColors["BorderColor"] }, RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } }, "HeaderPanel");
    c.Add(new CuiPanel { Image = { Color = themeColors["BorderColor"] }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" } }, "HeaderPanel");
    
    c.Add(new CuiLabel
    {
        Text = { Text = "⚙️ ARTIFACT ADMIN PANEL", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = themeColors["HeaderColor"] },
        RectTransform = { AnchorMin = "0.1 0.15", AnchorMax = "0.9 0.88" }
    }, "HeaderPanel");
    
    // Close Button
    c.Add(new CuiButton
    {
        Button = { Color = "0.45 0.10 0.10 0.90", Command = "eldrunartifact.ui.close", Close = PanelName },
        RectTransform = { AnchorMin = "0.94 0.93", AnchorMax = "0.985 0.98" },
        Text = { Text = "✖", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
    }, PanelName);
    
    // Content Panel
    c.Add(new CuiPanel
    {
        Image = { Color = "0 0 0 0.3" },
        RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.98 0.89" }
    }, "UIOverlay", "AdminContent");
    
    // === ARTIFACT MANAGEMENT ===
    c.Add(new CuiLabel
    {
        Text = { Text = "⛏️ ARTIFACT MANAGEMENT", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.05 0.82", AnchorMax = "0.48 0.88" }
    }, "AdminContent");
    
    var artifactActions = new[]
    {
        ("Give to Self", "eldrunartifact.ui.give_self", "⬇️"),
        ("Give to Player", "eldrunartifact.admin.give", "🎁"),
        ("Drop at Position", "eldrunartifact.ui.drop", "💥"),
        ("Reset Artifact", "eldrunartifact.ui.reset", "♻️"),
        ("Set Power Level", "eldrunartifact.admin.setpower", "⚡"),
        ("Teleport to Artifact", "eldrunartifact.admin.tp", "🌀")
    };
    
    var yPos = 0.75f;
    foreach (var (label, cmd, icon) in artifactActions)
    {
        c.Add(new CuiButton
        {
            Button = { Color = "0.2 0.4 0.6 0.9", Command = cmd },
            Text = { Text = $"{icon} {label}", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
            RectTransform = { AnchorMin = $"0.05 {yPos - 0.05f}", AnchorMax = $"0.48 {yPos}" }
        }, "AdminContent");
        yPos -= 0.06f;
    }
    
    // === FEATURE TOGGLES ===
    c.Add(new CuiLabel
    {
        Text = { Text = "🧪 FEATURE TOGGLES", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.05 0.22", AnchorMax = "0.95 0.28" }
    }, "AdminContent");

    // Buttons reflect current state via color
    var speedOn = _config.EnableExperimentalSpeedBuff;
    var dropOn = _config.DropOnLogout;
    var onCol = "0.20 0.55 0.20 0.90";
    var offCol = "0.35 0.35 0.35 0.90";

    c.Add(new CuiButton
    {
        Button = { Color = speedOn ? onCol : offCol, Command = speedOn ? "eldrunartifact.ui.admin.toggle experimental_speedbuff false" : "eldrunartifact.ui.admin.toggle experimental_speedbuff true" },
        Text = { Text = speedOn ? "Experimental Speed Buff: ON" : "Experimental Speed Buff: OFF", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
        RectTransform = { AnchorMin = "0.05 0.18", AnchorMax = "0.48 0.21" }
    }, "AdminContent");

    c.Add(new CuiButton
    {
        Button = { Color = dropOn ? onCol : offCol, Command = dropOn ? "eldrunartifact.ui.admin.toggle droponlogout false" : "eldrunartifact.ui.admin.toggle droponlogout true" },
        Text = { Text = dropOn ? "Drop On Logout: ON" : "Drop On Logout: OFF", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
        RectTransform = { AnchorMin = "0.52 0.18", AnchorMax = "0.95 0.21" }
    }, "AdminContent");

    // === PLAYER MANAGEMENT ===
    c.Add(new CuiLabel
    {
        Text = { Text = "👥 PLAYER MANAGEMENT", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.52 0.82", AnchorMax = "0.95 0.88" }
    }, "AdminContent");
    
    var playerActions = new[]
    {
        ("View Player Stats", "eldrunartifact.admin.playerstats", "📊"),
        ("Reset Player", "eldrunartifact.admin.resetplayer", "🔄"),
        ("Ban from Artifact", "eldrunartifact.admin.ban", "🚫"),
        ("Unban Player", "eldrunartifact.admin.unban", "✅"),
        ("Force Take", "eldrunartifact.admin.forcetake", "⚔️"),
        ("Clear History", "eldrunartifact.admin.clearhistory", "🗑️")
    };
    
    yPos = 0.75f;
    foreach (var (label, cmd, icon) in playerActions)
    {
        c.Add(new CuiButton
        {
            Button = { Color = "0.2 0.5 0.3 0.9", Command = cmd },
            Text = { Text = $"{icon} {label}", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
            RectTransform = { AnchorMin = $"0.52 {yPos - 0.05f}", AnchorMax = $"0.95 {yPos}" }
        }, "AdminContent");
        yPos -= 0.06f;
    }
    
    // === STATISTICS ===
    c.Add(new CuiLabel
    {
        Text = { Text = "📊 ARTIFACT STATISTICS", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.05 0.32", AnchorMax = "0.95 0.38" }
    }, "AdminContent");
    
    // Compute legends count without LINQ for performance and compatibility
    int legendsCount = 0;
    foreach (var ph in _data.PlayerHistory.Values)
    {
        if (ph != null && ph.IsLegendaryOwner) legendsCount++;
    }
    var stats = new[]
    {
        ("Power", _data.PowerLevel.ToString(), "⚡"),
        ("Stolen", _data.TimesStolen.ToString(), "🔄"),
        ("Kills", _data.KillsWhileHolding.ToString(), "⚔️"),
        ("Players", _data.PlayerHistory.Count.ToString(), "👥"),
        ("Events", _data.LegendaryEvents.Count.ToString(), "📜"),
        ("Legends", legendsCount.ToString(), "🏆")
    };
    
    var xPos = 0.05f;
    var statWidth = 0.14f;
    foreach (var (label, value, icon) in stats)
    {
        c.Add(new CuiPanel
        {
            Image = { Color = "0.1 0.1 0.1 0.8" },
            RectTransform = { AnchorMin = $"{xPos} 0.24", AnchorMax = $"{xPos + statWidth} 0.31" }
        }, "AdminContent", $"Stat_{label}");
        
        c.Add(new CuiLabel
        {
            Text = { Text = icon, FontSize = 14, Align = TextAnchor.MiddleCenter, Color = themeColors["AccentColor"] },
            RectTransform = { AnchorMin = "0.1 0.5", AnchorMax = "0.3 0.95" }
        }, $"Stat_{label}");
        
        c.Add(new CuiLabel
        {
            Text = { Text = value, FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
            RectTransform = { AnchorMin = "0.3 0.5", AnchorMax = "0.9 0.95" }
        }, $"Stat_{label}");
        
        c.Add(new CuiLabel
        {
            Text = { Text = label, FontSize = 8, Align = TextAnchor.MiddleCenter, Color = "0.7 0.7 0.7 1" },
            RectTransform = { AnchorMin = "0.1 0.05", AnchorMax = "0.9 0.45" }
        }, $"Stat_{label}");
        
        xPos += statWidth + 0.01f;
    }
    
    // === SYSTEM CONTROLS ===
    c.Add(new CuiLabel
    {
        Text = { Text = "⚡ SYSTEM CONTROLS", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.05 0.16", AnchorMax = "0.95 0.22" }
    }, "AdminContent");
    
    var systemActions = new[]
    {
        ("Reload Config", "eldrunartifact.admin.reload", "🔄", "0.05", "0.23"),
        ("Save Data", "eldrunartifact.admin.save", "💾", "0.24", "0.42"),
        ("Clear Events", "eldrunartifact.admin.clearevents", "🗑️", "0.43", "0.61"),
        ("Wipe Data", "eldrunartifact.admin.wipe", "💥", "0.62", "0.80"),
        ("Export Data", "eldrunartifact.admin.export", "📤", "0.81", "0.95")
    };
    
    foreach (var (label, cmd, icon, minX, maxX) in systemActions)
    {
        c.Add(new CuiButton
        {
            Button = { Color = "0.6 0.2 0.2 0.9", Command = cmd },
            Text = { Text = $"{icon} {label}", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
            RectTransform = { AnchorMin = $"{minX} 0.08", AnchorMax = $"{maxX} 0.14" }
        }, "AdminContent");
    }
    
    // === CURRENT STATUS ===
    c.Add(new CuiLabel
    {
        Text = { Text = "📋 CURRENT STATUS", FontSize = 13, Align = TextAnchor.MiddleLeft, Color = themeColors["CategoryGold"] },
        RectTransform = { AnchorMin = "0.05 0.03", AnchorMax = "0.95 0.06" }
    }, "AdminContent");
    
    var ownerName = _data.OwnerUserId > 0 ? GetPlayerDisplayName(_data.OwnerUserId) : "None";
    var status = _data.Dropped ? "Dropped" : (_data.OwnerUserId > 0 ? "Owned" : "Available");
    
    c.Add(new CuiLabel
    {
        Text = { Text = $"Owner: {ownerName} | Status: {status} | Position: {_data.DroppedPos.x:F0}, {_data.DroppedPos.z:F0}", FontSize = 10, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
        RectTransform = { AnchorMin = "0.05 0.02", AnchorMax = "0.95 0.05" }
    }, "AdminContent");
    
    CuiHelper.AddUi(player, c);
}

        // === ADMIN PANEL COMMANDS IMPLEMENTATION ===
        
        [ConsoleCommand("eldrunartifact.admin.save")]
        private void AdminSave(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ Data saved successfully!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.reload")]
        private void AdminReload(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            LoadConfigValues();
            SendReply(player, $"{_config.ChatPrefix} ✅ Configuration reloaded!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.clearevents")]
        private void AdminClearEvents(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            _data.LegendaryEvents.Clear();
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ All legendary events cleared!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.wipe")]
        private void AdminWipe(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            _data = new ArtifactData
            {
                CreationTime = DateTime.Now,
                ArtifactName = _config.ArtifactDisplayName,
                PowerLevel = 1
            };
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ All artifact data wiped!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.export")]
        private void AdminExport(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} 📄 Data exported to: oxide/data/{DataFileName}.json");
            SendReply(player, $"📊 Total Players: {_data.PlayerHistory.Count}");
            SendReply(player, $"📊 Total Events: {_data.LegendaryEvents.Count}");
            SendReply(player, $"📊 Power Level: {_data.PowerLevel}");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.setpower")]
        private void AdminSetPower(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var level = arg.GetInt(0, -1);
            if (level < 1 || level > _config.MaxPowerLevel)
            {
                SendReply(player, $"{_config.ChatPrefix} Usage: eldrunartifact.admin.setpower <1-{_config.MaxPowerLevel}>");
                return;
            }
            _data.PowerLevel = level;
            SaveData();
            var tier = GetPowerTier(level);
            SendReply(player, $"{_config.ChatPrefix} ✅ Power level set to {level} ({tier.Name})!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.tp")]
        private void AdminTeleport(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            if (!_data.Dropped)
            {
                SendReply(player, $"{_config.ChatPrefix} ⚠️ Crown is not dropped, cannot teleport!");
                return;
            }
            player.Teleport(_data.DroppedPos);
            SendReply(player, $"{_config.ChatPrefix} ✅ Teleported to Crown location!");
        }
        
        [ConsoleCommand("eldrunartifact.admin.give")]
        private void AdminGivePlayer(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var targetName = arg.GetString(0, "");
            if (string.IsNullOrEmpty(targetName))
            {
                SendReply(player, $"{_config.ChatPrefix} Usage: eldrunartifact.admin.give <player_name>");
                return;
            }
            var target = BasePlayer.Find(targetName);
            if (target == null)
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ Player not found: {targetName}");
                return;
            }
            ForceGive(target.userID);
            _data.OwnerName = target.displayName;
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ Crown given to {target.displayName}!");
            SendReply(target, $"{_config.ChatPrefix} 👑 An admin has granted you the Crown!");
        }
        
        [ConsoleCommand("eldrunartifact.admin.forcetake")]
        private void AdminForceTake(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            if (_data.OwnerUserId == 0)
            {
                SendReply(player, $"{_config.ChatPrefix} ⚠️ No one currently owns the Crown!");
                return;
            }
            var previousOwner = _data.OwnerUserId;
            var previousOwnerName = _data.OwnerName;
            _data.OwnerUserId = 0;
            _data.Dropped = true;
            _data.DroppedPos = player.ServerPosition;
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ Crown forcibly taken from {previousOwnerName} and dropped at your position!");
            var prevPlayer = FindOnline(previousOwner);
            if (prevPlayer != null)
            {
                SendReply(prevPlayer, $"{_config.ChatPrefix} ⚠️ An admin has forcibly taken the Crown from you!");
            }
        }
        
        [ConsoleCommand("eldrunartifact.admin.playerstats")]
        private void AdminPlayerStats(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var targetName = arg.GetString(0, "");
            if (string.IsNullOrEmpty(targetName))
            {
                SendReply(player, $"{_config.ChatPrefix} Usage: eldrunartifact.admin.playerstats <player_name>");
                return;
            }
            var target = BasePlayer.Find(targetName);
            if (target == null)
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ Player not found: {targetName}");
                return;
            }
            if (!_data.PlayerHistory.TryGetValue(target.userID, out var history))
            {
                SendReply(player, $"{_config.ChatPrefix} 📄 {target.displayName} has never touched the Crown.");
                return;
            }
            SendReply(player, $"{_config.ChatPrefix} 📊 STATS FOR {target.displayName}:");
            SendReply(player, $"👑 Times Owned: {history.TimesOwned}");
            SendReply(player, $"⏳ Total Time Held: {FormatTime(history.TotalTimeHeld)}");
            SendReply(player, $"⚔️ Kills: {history.KillsWhileHolding}");
            SendReply(player, $"💀 Deaths: {history.DeathsWhileHolding}");
            SendReply(player, $"✨ Legendary: {(history.IsLegendaryOwner ? "Yes" : "No")}");
        }
        
        [ConsoleCommand("eldrunartifact.admin.resetplayer")]
        private void AdminResetPlayer(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            var targetName = arg.GetString(0, "");
            if (string.IsNullOrEmpty(targetName))
            {
                SendReply(player, $"{_config.ChatPrefix} Usage: eldrunartifact.admin.resetplayer <player_name>");
                return;
            }
            var target = BasePlayer.Find(targetName);
            if (target == null)
            {
                SendReply(player, $"{_config.ChatPrefix} ❌ Player not found: {targetName}");
                return;
            }
            _data.PlayerHistory.Remove(target.userID);
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ {target.displayName}'s Crown history has been reset!");
        }
        
        [ConsoleCommand("eldrunartifact.admin.clearhistory")]
        private void AdminClearHistory(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            _data.PlayerHistory.Clear();
            SaveData();
            SendReply(player, $"{_config.ChatPrefix} ✅ All player history data cleared!");
            OpenAdminPanel(player);
        }
        
        [ConsoleCommand("eldrunartifact.admin.ban")]
        private void AdminBan(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            SendReply(player, $"{_config.ChatPrefix} ⚠️ Ban system not yet implemented. Use permissions to restrict access.");
        }
        
        [ConsoleCommand("eldrunartifact.admin.unban")]
        private void AdminUnban(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            if (!permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            SendReply(player, $"{_config.ChatPrefix} ⚠️ Ban system not yet implemented. Use permissions to manage access.");
        }
    }
}