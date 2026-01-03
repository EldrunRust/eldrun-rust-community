using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Oxide.Core;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using Oxide.Core.Libraries;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("EldrunBugReport", "SirEldrun", "36187")]
    [Description("Report System - BETA")]
    public class EldrunBugReport : RustPlugin
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
        [PluginReference] private Plugin EldrunCore;
        [PluginReference] private Plugin EldrunFraktion;
        [PluginReference] private Plugin EldrunXP;
        [PluginReference] private Plugin EldrunMultiShop; // Currency system
        
        private const string AdminPerm = "eldrunbugreport.admin";
        private const string UsePerm = "eldrunbugreport.use";
        private const string PanelName = "EldrunBugUI";
        
        // 👑 SERVER ADMIN CHECK
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;

        private class BRConfig
        {
            public bool Enabled = true;
            public string ChatPrefix = "<color=#FF6B35><b>[BUG REPORT]</b></color>";
            public int RewardScrap = 200; // Standard reward
            
            // === BUG CATEGORIES ===
            public List<string> Categories = new List<string>
            {
                "Gameplay", "UI/HUD", "Localization", "Performance", 
                "Crash", "Exploit", "Plugins", "Map/Zones", "Commands", "Other"
            };
            
            // === SEVERITY LEVELS ===
            public Dictionary<string, BugSeverity> SeverityLevels = new Dictionary<string, BugSeverity>
            {
                ["low"] = new BugSeverity { Name = "Low", Priority = 1, Color = "#00FF00", RewardXP = 50, RewardScrap = 100, RewardDragons = 100 },
                ["medium"] = new BugSeverity { Name = "Medium", Priority = 2, Color = "#FFFF00", RewardXP = 100, RewardScrap = 200, RewardDragons = 200 },
                ["high"] = new BugSeverity { Name = "High", Priority = 3, Color = "#FF8C00", RewardXP = 200, RewardScrap = 400, RewardDragons = 400 },
                ["critical"] = new BugSeverity { Name = "Critical", Priority = 4, Color = "#FF0000", RewardXP = 500, RewardScrap = 1000, RewardDragons = 1000 }
            };
            
            // === NOTIFICATION SYSTEM ===
            public bool EnableWebhook = false;
            public string WebhookUrl = "";
            public bool NotifyAdminsIngame = true;
            public bool BroadcastResolutions = true;
            public bool ShowReporterName = true;
            
            // === REWARD SYSTEM ===
            public bool RewardOnFix = true;
            public bool GiveXPRewards = true;
            public bool GiveDragonRewards = true;
            public int BaseXPReward = 100; // Base XP for confirmed bug
            public int BaseDragonReward = 50; // Base Dragons for confirmed bug
            public float SeverityMultiplier = 1.5f; // Bonus for critical bugs
            public float VoteMultiplier = 1.2f; // Bonus per 5 upvotes
            public int MaxRewardXP = 1000; // Max XP from one bug
            public int MaxRewardDragons = 500; // Max Dragons from one bug
            public bool RewardOnUpvotes = true; // Small reward per upvote
            public int XPPerUpvote = 5;
            public int DragonsPerUpvote = 2;
            
            // === SUBMISSION LIMITS ===
            public int MaxReportsPerPlayer = 10;
            public int MaxReportsPerDay = 3;
            public int CooldownMinutes = 15;
            
            // === FEATURES ===
            public bool EnableScreenshots = true;
            public bool EnableLocationCapture = true;
            public bool EnableAutoAssignment = true;
            public bool ShowStatistics = true;
            public bool LogAllActions = true;
            public bool EnableVoting = true;
            public bool EnableComments = true;
            public bool EnablePriority = true;
            public bool EnableDuplicateDetection = true;
            public bool EnableNotifications = true;
            public bool EnableNotificationSounds = true;
            public bool NotifyOnStatusChange = true;
            public bool NotifyOnComment = true;
            public bool NotifyOnReward = true;
            public bool NotifyOnVoteMilestone = true;
            public bool AutoCloseOldReports = false;
            public int AutoCloseDays = 30;
            // Permission behavior
            public bool RequireUsePermission = false; // if true, /bug UI requires eldrunbugreport.use permission
            
            // === UI SETTINGS ===
            public bool ShowUI = true;
            public int ReportsPerPage = 10;
            public int ChatListPerPage = 5;
            public bool EnableSearch = true;
            public bool EnableFilters = true;
            public bool ShowResolved = false; // Show resolved bugs by default
            
            // === 🔍 DUPLICATE DETECTION SETTINGS ===
            public DuplicateDetectionConfig DuplicateDetection = new DuplicateDetectionConfig();
        }
        
        private class BugSeverity
        {
            public string Name;
            public int Priority;
            public string Color;
            public int RewardXP;
            public int RewardScrap;
            public int RewardDragons; // New; fallback to RewardScrap if 0 for backward compatibility
        }

        private class BugReport
        {
            public int Id;
            public ulong UserId;
            public string PlayerName;
            public string Category;
            public string Severity;
            public string Title = "";
            public string Description;
            
            // === LOCATION DATA ===
            public string Zone = "";
            public float X, Y, Z;
            public string LocationDescription = "";
            
            // === TIMESTAMPS ===
            public DateTime CreatedAt = DateTime.UtcNow;
            public DateTime? UpdatedAt;
            public DateTime? ResolvedAt;
            
            // === STATUS TRACKING ===
            public string Status = "open"; // open, in_progress, resolved, rejected, duplicate
            public string Priority = "medium"; // calculated from severity
            public ulong AssignedAdmin = 0;
            public string AssignedAdminName = "";
            
            // === ADMIN RESPONSES ===
            public string AdminNote = "";
            public List<BugComment> Comments = new List<BugComment>();
            public string Resolution = "";
            public string ResolutionType = ""; // fixed, wont_fix, duplicate, invalid
            
            // === METADATA ===
            public string PluginVersion = "";
            public string ServerVersion = "";
            public bool IsReproduced = false;
            public int ReproducedCount = 0;
            
            // === VOTING SYSTEM ===
            public List<ulong> UpVoters = new List<ulong>(); // Players who upvoted
            public List<ulong> DownVoters = new List<ulong>(); // Players who downvoted
            public int UpVotes = 0;
            public int DownVotes = 0;
            public int VoteScore = 0; // UpVotes - DownVotes
            
            // === REWARDS ===
            public bool RewardGiven = false;
            public int RewardXP = 0;
            public int RewardDragons = 0;
            public DateTime? RewardGivenAt;
            
            // === 📸 SCREENSHOTS ===
            public List<string> Screenshots = new List<string>(); // Screenshot URLs
            public int ScreenshotCount = 0;
        }
        
        private class BugComment
        {
            public DateTime Timestamp = DateTime.UtcNow;
            public ulong UserId;
            public string UserName;
            public string Comment;
            public bool IsAdmin = false;
            public bool IsSystem = false;
        }

        private class BugNotification
        {
            public int Id;
            public int BugId;
            public ulong PlayerId;
            public string Type; // status_change, comment, reward, vote_milestone
            public string Title;
            public string Message;
            public DateTime Timestamp = DateTime.UtcNow;
            public bool IsRead = false;
            public Dictionary<string, string> Data = new Dictionary<string, string>();
        }

        private class BugDb
        {
            public int NextId = 1;
            public int NextNotificationId = 1;
            public List<BugReport> Reports = new List<BugReport>();
            public Dictionary<ulong, List<BugNotification>> PlayerNotifications = new Dictionary<ulong, List<BugNotification>>();
            public BugStatistics Stats = new BugStatistics();
            public Dictionary<ulong, PlayerBugInfo> PlayerStats = new Dictionary<ulong, PlayerBugInfo>();
            public Dictionary<int, DuplicateLink> DuplicateLinks = new Dictionary<int, DuplicateLink>(); // 🔍 Duplicate tracking
            public DateTime LastReset = DateTime.UtcNow;
        }
        
        private class BugStatistics
        {
            public int TotalReports = 0;
            public int OpenReports = 0;
            public int ResolvedReports = 0;
            public int RejectedReports = 0;
            public Dictionary<string, int> CategoryStats = new Dictionary<string, int>();
            public Dictionary<string, int> SeverityStats = new Dictionary<string, int>();
            public int TotalRewardsGiven = 0;
            public int TotalXPRewarded = 0;
            public int TotalDragonsRewarded = 0;
            public string MostActiveReporter = "";
            public string TopCategory = "";
            
            // === 🔍 DUPLICATE DETECTION STATS ===
            public int DuplicatesDetected = 0;
            public int DuplicatesPrevented = 0;
            public int DuplicatesMerged = 0;
        }
        
        // === 🔍 DUPLICATE DETECTION CLASSES ===
        
        private class DuplicateLink
        {
            public int OriginalReportId;
            public List<int> DuplicateIds = new List<int>();
            public DateTime LinkedDate = DateTime.UtcNow;
            public ulong LinkedBy; // Admin who marked as duplicate
            public string Reason = "";
        }
        
        private class SimilarityResult
        {
            public int ReportId;
            public float SimilarityScore;
            public string Title;
            public string Status;
            public DateTime CreatedDate;
            public int UpVotes;
        }
        
        private class DuplicateDetectionConfig
        {
            public bool Enabled = true;
            public float MinimumSimilarity = 0.75f; // 75% similarity threshold
            public float TitleWeight = 0.40f;
            public float DescriptionWeight = 0.40f;
            public float CategoryWeight = 0.10f;
            public float TimeWeight = 0.05f;
            public float ReporterWeight = 0.05f;
            public bool CheckOnSubmit = true;
            public bool RequireConfirmation = true; // Require force submit
            public int MaxDuplicatesToShow = 5;
            public bool IgnoreResolvedReports = true; // Don't check resolved bugs
            public int DaysToCheckBack = 30; // Only check bugs from last 30 days
            public bool AllowForceSubmit = true; // Allow override
            public int MinTitleLength = 10; // Minimum title length for checking
            public int MinDescriptionLength = 20; // Minimum description length
        }
        
        private class PlayerBugInfo
        {
            public ulong UserId;
            public string PlayerName;
            public int TotalReports = 0;
            public int ResolvedReports = 0;
            public int RewardsReceived = 0;
            public DateTime LastReport = DateTime.MinValue;
            public DateTime LastReward = DateTime.MinValue;
            public bool IsBanned = false;
            public string BanReason = "";
        }

        private BRConfig _config;
        private BugDb _db;
        private WebRequests _web = Interface.Oxide.GetLibrary<WebRequests>();
        private Dictionary<string,string> _theme;
        private Timer _saveTimer; // Batch Save System
        private bool _dataChanged = false;

        private class Draft
        {
            public string Title = "";
            public string Category = "";
            public string Severity = "";
            public string Description = "";
            public Dictionary<string, string> AdditionalData = new Dictionary<string, string>();
        }
        private Dictionary<ulong, Draft> _drafts = new Dictionary<ulong, Draft>();

        // Simple per-player UI state for Admin UI (search/pagination)
        private class UIState
        {
            public int Page = 0;
            public string Search = "";
            public string FilterCategory = "";
            public string FilterSeverity = "";
            public string FilterStatus = "";
        }
        private Dictionary<ulong, UIState> _uiStates = new Dictionary<ulong, UIState>();
        private UIState GetUIState(BasePlayer p)
        {
            if (!_uiStates.TryGetValue(p.userID, out var s)) { s = new UIState(); _uiStates[p.userID] = s; }
            return s;
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

        protected override void LoadDefaultConfig()
        {
            _config = new BRConfig();
            LogLocalizedMessage("bugreport._eldrunbugreport__created_default_config_");
        }

        private void LoadConfigValues()
        {
            try { _config = Config.ReadObject<BRConfig>(); if (_config == null) throw new Exception(); }
            catch { _config = new BRConfig(); SaveConfig(); }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void Init()
        {
            LoadConfigValues(); // Load config FIRST!
            LoadDb();
            permission.RegisterPermission(AdminPerm, this);
            permission.RegisterPermission(UsePerm, this);
            
            // Chat Commands
            cmd.AddChatCommand("bug", this, "BugCmd");
            cmd.AddChatCommand("bugreport", this, "BugReportCmd");
            cmd.AddChatCommand("fehler", this, "FehlerCmd");
            cmd.AddChatCommand("bugadmin", this, "BugAdminCmd");
            
            LogLocalizedMessage("bugreport.message", null);
        }
        
        private void OnServerInitialized()
        {
            if (_config.Enabled)
            {
                // Optimiert: Batch Save Timer - alle 30 Sekunden
                _saveTimer = timer.Every(30f, () => {
                    if (_dataChanged)
                    {
                        SaveDb();
                        _dataChanged = false;
                    }
                });
                
                // Auto-Cleanup fuer alte Bug-Reports
                if (_config.AutoCloseOldReports)
                {
                    timer.Every(3600f, () => AutoCleanupOldReports()); // Jede Stunde pruefen
                }
                
                LogLocalizedMessage("bugreport._eldrunbugreport__ultimate_bug_report_system_activated_");
                
                // Initialisiere Statistiken
                UpdateStatistics();
            }
        }

        private void OnPlayerConnected(BasePlayer player)
        {
            if (!_config.Enabled || !_config.EnableNotifications) return;
            
            // Delayed notification check (after UI loads)
            timer.Once(3f, () => 
            {
                if (player != null && player.IsConnected)
                {
                    SendPendingNotifications(player);
                }
            });
        }
        
        private void Unload()
        {
            try
            {
                foreach (var p in BasePlayer.activePlayerList)
                {
                    try { CuiHelper.DestroyUi(p, PanelName); } catch { }
                    try { CuiHelper.DestroyUi(p, "BugAdminUI"); } catch { }
                    try { CuiHelper.DestroyUi(p, "BugDetailUI"); } catch { }
                }
                _saveTimer?.Destroy();
                
                // CRITICAL: Save data before unload to prevent data loss
                SaveDb();
            }
            catch { }
        }

        private void LoadDb()
        {
            try 
            { 
                _db = Interface.Oxide.DataFileSystem.ReadObject<BugDb>("EldrunBugReport") ?? new BugDb();
                // Data migration: normalize severities ("med" -> "medium"; lower-case keys)
                try
                {
                    if (_db?.Reports != null)
                    {
                        bool migrated = false;
                        foreach (var r in _db.Reports)
                        {
                            if (string.IsNullOrEmpty(r?.Severity)) continue;
                            var sev = r.Severity.Trim();
                            if (sev.Equals("med", StringComparison.OrdinalIgnoreCase)) { r.Severity = "medium"; migrated = true; continue; }
                            var lower = sev.ToLowerInvariant();
                            if (lower != sev) { r.Severity = lower; migrated = true; }
                        }
                        if (migrated) { _dataChanged = true; SaveDb(); }
                    }
                }
                catch { }
                LogLocalizedMessage("bugreport.message", null);
            }
            catch (Exception ex) 
            { 
                _db = new BugDb(); 
                LogLocalizedMessage("bugreport.message", null);
            }
        }
        
        private void SaveDb()
        {
            try
            {
                Interface.Oxide.DataFileSystem.WriteObject("EldrunBugReport", _db);
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("bugreport.message", null);
            }
        }

        // Permission Helper
        private bool HasPermission(BasePlayer player, string perm)
        {
            try
            {
                // 👑 Admin-Commands: allow Server Admin (by SteamID) OR Oxide AdminPerm
                if (perm == AdminPerm)
                {
                    return IsServerAdmin(player) || permission.UserHasPermission(player.UserIDString, AdminPerm);
                }

                // Use permission enforcement optional via config; Server Admins bypass
                if (perm == UsePerm)
                {
                    if (_config != null && _config.RequireUsePermission)
                        return IsServerAdmin(player) || permission.UserHasPermission(player.UserIDString, UsePerm);
                    return true; // default: open to all
                }

                // Fallback for any other permissions
                return permission.UserHasPermission(player.UserIDString, perm);
            }
            catch { return false; }
        }
        
        [ChatCommand("bug")]
        private void BugCmd(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            
            if (_config == null || !_config.Enabled)
            {
                Reply(player, "Bug-Report System is currently disabled.");
                return;
            }

            // Rate Limiting check
            if (!CheckRateLimit(player))
            {
                Reply(player, $"You must wait {_config.CooldownMinutes} minutes between bug reports.");
                return;
            }
            
            if (args == null || args.Length == 0)
            {
                ShowMenu(player);
                return;
            }
            
            var sub = args[0].ToLowerInvariant();
            switch (sub)
            {
                case "ui":
                case "menu":
                    ShowMenu(player);
                    break;
                case "new":
                case "create":
                    ShowMenu(player);
                    break;
                case "category":
                case "cat":
                    if (args.Length > 1)
                    {
                        var category = string.Join(" ", args, 1, args.Length - 1);
                        if (_config.Categories.Contains(category))
                        {
                            GetDraft(player).Category = category;
                            Reply(player, $"Category set: {category}");
                        }
                        else
                        {
                            Reply(player, $"Invalid category. Available: {string.Join(", ", _config.Categories)}");
                        }
                    }
                    else
                    {
                        Reply(player, $"Available categories: {string.Join(", ", _config.Categories)}");
                    }
                    break;
                case "severity":
                case "sev":
                    if (args.Length > 1)
                    {
                        var severity = args[1].ToLowerInvariant();
                        if (severity == "med") severity = "medium";
                        if (severity == "crit") severity = "critical";
                        if (_config.SeverityLevels.ContainsKey(severity))
                        {
                            GetDraft(player).Severity = severity;
                            Reply(player, $"Severity set: {_config.SeverityLevels[severity].Name}");
                        }
                        else
                        {
                            var availableSeverities = string.Join(", ", _config.SeverityLevels.Keys);
                            Reply(player, $"Invalid severity. Available: {availableSeverities}");
                        }
                    }
                    else
                    {
                        var severityItems = new List<string>();
                        foreach (var kv in _config.SeverityLevels)
                        {
                            severityItems.Add($"{kv.Key} ({kv.Value.Name})");
                        }
                        var severityList = string.Join(", ", severityItems);
                        Reply(player, $"Available severities: {severityList}");
                    }
                    break;
                case "text":
                case "description":
                case "desc":
                    if (args.Length > 1)
                    {
                        var description = string.Join(" ", args, 1, args.Length - 1);
                        GetDraft(player).Description = Truncate(description, 1024);
                        Reply(player, $"Description set: {Truncate(description, 100)}...");
                    }
                    else
                    {
                        Reply(player, "Usage: /bug text <your description>");
                    }
                    break;
                case "submit":
                case "send":
                    // Check for force flag
                    if (args.Length > 1 && args[1].ToLower() == "force")
                    {
                        var draft = GetDraft(player);
                        draft.AdditionalData["force_submit"] = "true";
                        Reply(player, $"{_config.ChatPrefix} <color=#FFA500>Force submitting (bypassing duplicate check)...</color>");
                    }
                    SubmitBugReport(player);
                    break;
                case "cancel":
                case "clear":
                    _drafts.Remove(player.userID);
                    Reply(player, "Bug report draft cleared.");
                    break;
                case "last":
                case "my":
                case "mine":
                    ShowLastBugReport(player);
                    break;
                case "list":
                    {
                        int page = 1;
                        if (args.Length > 1 && int.TryParse(args[1], out var pge)) page = Math.Max(1, pge);
                        ShowPlayerBugReports(player, page);
                    }
                    break;
                case "voting":
                    {
                        if (!_config.EnableVoting)
                        {
                            Reply(player, "The voting system is currently disabled.");
                            break;
                        }
                        int vpage = 1;
                        if (args.Length > 1 && int.TryParse(args[1], out var vp)) vpage = Math.Max(1, vp);
                        ShowVotingList(player, vpage);
                    }
                    break;
                case "vote":
                case "upvote":
                    if (!_config.EnableVoting)
                    {
                        Reply(player, "The voting system is currently disabled.");
                        break;
                    }
                    if (args.Length > 1 && int.TryParse(args[1], out int voteId))
                    {
                        VoteForBugReport(player, voteId);
                    }
                    else
                    {
                        Reply(player, "Usage: /bug vote <bug_id>");
                    }
                    break;
                case "notifications":
                case "notifs":
                case "notify":
                    if (!_config.EnableNotifications)
                    {
                        Reply(player, "The notification system is currently disabled.");
                        break;
                    }
                    ShowNotifications(player, args.Length > 1 ? args[1] : "all");
                    break;
                case "status":
                    ShowDraftStatus(player);
                    break;
                case "screenshot":
                case "ss":
                case "image":
                    if (!_config.EnableScreenshots)
                    {
                        Reply(player, "Screenshot upload is currently disabled.");
                        break;
                    }
                    if (args.Length > 1)
                    {
                        var url = args[1];
                        AddScreenshotToDraft(player, url);
                    }
                    else
                    {
                        Reply(player, "Usage: /bug screenshot <url>");
                        Reply(player, "Tip: Upload your screenshot to imgur.com or imgbb.com.");
                    }
                    break;
                case "help":
                    ShowHelpText(player);
                    break;
                default:
                    ShowMenu(player);
                    break;
            }
        }
        
        [ChatCommand("bugreport")]
        private void BugReportCmd(BasePlayer player, string command, string[] args)
        {
            BugCmd(player, command, args);
        }
        
        [ChatCommand("bugadmin")]
        private void BugAdminCmd(BasePlayer player, string command, string[] args)
        {
            if (player == null || !HasPermission(player, AdminPerm))
            {
                Reply(player, "You do not have permission to use admin commands.");
                return;
            }
            
            if (args == null || args.Length == 0)
            {
                OpenBugAdminUI(player);
                return;
            }
            
            var sub = args[0].ToLowerInvariant();
            switch (sub)
            {
                case "list":
                    OpenBugAdminUI(player);
                    break;
                case "view":
                    if (args.Length > 1 && int.TryParse(args[1], out int viewId))
                    {
                        var report = _db.Reports.Find(r => r.Id == viewId);
                        if (report != null) ShowBugDetailUI(player, report);
                        else Reply(player, "Bug report not found.");
                    }
                    else Reply(player, "Usage: /bugadmin view <id>");
                    break;
                case "resolve":
                    if (args.Length > 1 && int.TryParse(args[1], out int resolveId))
                    {
                        ResolveBugReport(player, resolveId, args.Length > 2 ? string.Join(" ", args, 2, args.Length - 2) : "");
                    }
                    else Reply(player, "Usage: /bugadmin resolve <id> [note]");
                    break;
                case "reject":
                    if (args.Length > 1 && int.TryParse(args[1], out int rejectId))
                    {
                        RejectBugReport(player, rejectId, args.Length > 2 ? string.Join(" ", args, 2, args.Length - 2) : "");
                    }
                    else Reply(player, "Usage: /bugadmin reject <id> [reason]");
                    break;
                case "assign":
                    if (args.Length > 2 && int.TryParse(args[1], out int assignId))
                    {
                        AssignBugReport(player, assignId, args[2]);
                    }
                    else Reply(player, "Usage: /bugadmin assign <id> <admin_name_or_id>");
                    break;
                case "comment":
                    if (args.Length > 2 && int.TryParse(args[1], out int commentId))
                    {
                        AddCommentToBugReport(player, commentId, string.Join(" ", args, 2, args.Length - 2));
                    }
                    else Reply(player, "Usage: /bugadmin comment <id> <comment>");
                    break;
                case "reward":
                    if (args.Length > 1 && int.TryParse(args[1], out int rewardId))
                    {
                        var rewardReport = _db.Reports.Find(r => r.Id == rewardId);
                        if (rewardReport != null)
                        {
                            GiveBugReward(rewardReport);
                            Reply(player, $"✅ Reward granted for bug #{rewardId}!");
                        }
                        else Reply(player, $"❌ Bug #{rewardId} not found!");
                    }
                    else Reply(player, "Usage: /bugadmin reward <id>");
                    break;
                case "delete":
                    if (args.Length > 1 && int.TryParse(args[1], out int deleteId))
                    {
                        DeleteBugReport(player, deleteId);
                    }
                    else Reply(player, "Usage: /bugadmin delete <id>");
                    break;
                case "stats":
                    Reply(player, GetStatisticsString());
                    break;
                case "toggle":
                    TogglePlugin(player);
                    break;
                    
                // 🔍 DUPLICATE DETECTION COMMANDS
                case "duplicate":
                case "dup":
                    if (args.Length > 2 && int.TryParse(args[1], out int dupId) && int.TryParse(args[2], out int origId))
                    {
                        string reason = args.Length > 3 ? string.Join(" ", args, 3, args.Length - 3) : "";
                        MarkAsDuplicate(player, dupId, origId, reason);
                    }
                    else Reply(player, "Usage: /bugadmin duplicate <duplicate_id> <original_id> [reason]");
                    break;
                    
                case "similar":
                    if (args.Length > 1 && int.TryParse(args[1], out int similId))
                    {
                        ShowSimilarReportsForId(player, similId);
                    }
                    else Reply(player, "Usage: /bugadmin similar <id>");
                    break;
                    
                case "duplicates":
                    ShowDuplicateStats(player);
                    break;
                    
                default:
                    Reply(player, "Usage: /bugadmin list | view <id> | resolve <id> [note] | reject <id> [reason] | assign <id> <admin> | comment <id> <text> | reward <id> | delete <id> | stats | toggle");
                    Reply(player, "       /bugadmin duplicate <dup_id> <orig_id> | similar <id> | duplicates");
                    break;
            }
        }

        // ðŸ‡©ðŸ‡ª German alias
        [ChatCommand("fehler")]
        private void FehlerCmd(BasePlayer player, string command, string[] args) => BugCmd(player, "bug", args);

        private void ShowMenu(BasePlayer p)
        {
            // Show UI instead of chat menu
            OpenBugReportUI(p);
        }

        private void OpenBugReportUI(BasePlayer player)
        {
            if (player == null || !HasPermission(player, UsePerm)) return;
            OpenUI(player);
        }

        private void OpenBugAdminUI(BasePlayer player)
        {
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            try { CuiHelper.DestroyUi(player, "BugAdminUI"); } catch { }
            
            var container = new CuiElementContainer();
            
            // === MAIN PANEL ===
            container.Add(new CuiPanel
            {
                Image = { Color = "0.08 0.06 0.04 0.95" },
                RectTransform = { AnchorMin = "0.1 0.1", AnchorMax = "0.9 0.9" },
                CursorEnabled = true
            }, "Overlay", "BugAdminUI");
            
            // === TITLE ===
            container.Add(new CuiLabel
            {
                Text = { Text = "ðŸ› ï¸ BUG REPORT ADMIN PANEL", FontSize = 22, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.1 0.92", AnchorMax = "0.9 0.98" }
            }, "BugAdminUI");
            
            // === STATISTICS ===
            var totalReports = _db.Reports.Count;
            int openReports = 0, resolvedReports = 0, criticalReports = 0;
            foreach (var r in _db.Reports)
            {
                if (r.Status == "open") openReports++;
                if (r.Status == "resolved") resolvedReports++;
                if (r.Severity == "critical") criticalReports++;
            }
            
            container.Add(new CuiLabel
            {
                Text = { Text = $" STATISTICS: Total: {totalReports} | Open: {openReports} | Resolved: {resolvedReports} | Critical: {criticalReports}", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.8 0.8 0.2 1" },
                RectTransform = { AnchorMin = "0.1 0.85", AnchorMax = "0.9 0.91" }
            }, "BugAdminUI");
            
            // === RECENT REPORTS LIST ===
            container.Add(new CuiLabel
            {
                Text = { Text = " RECENT BUG REPORTS:", FontSize = 16, Align = TextAnchor.MiddleLeft, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.05 0.78", AnchorMax = "0.5 0.84" }
            }, "BugAdminUI");
            
            // List recent reports (last 10) - without LINQ
            var recentReports = new List<BugReport>();
            for (int i = _db.Reports.Count - 1; i >= 0 && recentReports.Count < 10; i--)
            {
                recentReports.Add(_db.Reports[i]);
            }
            float yPos = 0.72f;
            
            foreach (var report in recentReports)
            {
                if (yPos < 0.15f) break; // Don't overflow
                
                var statusColor = report.Status == "open" ? "0.8 0.2 0.2 1" : 
                                 report.Status == "resolved" ? "0.2 0.8 0.2 1" : "0.8 0.8 0.2 1";
                
                var severityIcon = report.Severity == "critical" ? "ðŸ”´" :
                                  report.Severity == "high" ? "ðŸŸ " :
                                  report.Severity == "medium" ? "" : "ðŸŸ¢";
                
                var reportText = $"{severityIcon} ID:{report.Id} | {report.Category} | {report.PlayerName} | {report.Status}";
                
                // Report row
                container.Add(new CuiButton
                {
                    Button = { Color = "0.2 0.2 0.2 0.6", Command = $"bugadmin.view {report.Id}" },
                    RectTransform = { AnchorMin = $"0.05 {yPos - 0.04f}", AnchorMax = $"0.7 {yPos}" },
                    Text = { Text = reportText, FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" }
                }, "BugAdminUI");
                
                // Status indicator
                container.Add(new CuiLabel
                {
                    Text = { Text = "â—", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = statusColor },
                    RectTransform = { AnchorMin = $"0.72 {yPos - 0.04f}", AnchorMax = $"0.75 {yPos}" }
                }, "BugAdminUI");
                
                // Quick actions
                if (report.Status == "open")
                {
                    container.Add(new CuiButton
                    {
                        Button = { Color = "0.2 0.6 0.2 0.8", Command = $"bugadmin.resolve {report.Id}" },
                        RectTransform = { AnchorMin = $"0.76 {yPos - 0.04f}", AnchorMax = $"0.85 {yPos}" },
                        Text = { Text = " LOesen", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                    }, "BugAdminUI");
                }
                
                container.Add(new CuiButton
                {
                    Button = { Color = "0.6 0.2 0.2 0.8", Command = $"bugadmin.delete {report.Id}" },
                    RectTransform = { AnchorMin = $"0.86 {yPos - 0.04f}", AnchorMax = $"0.95 {yPos}" },
                    Text = { Text = "ðŸ—‘ï¸ Del", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "BugAdminUI");
                
                yPos -= 0.05f;
            }
            
            // === FILTER BUTTONS ===
            container.Add(new CuiLabel
            {
                Text = { Text = "ðŸ” FILTER:", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.05 0.08", AnchorMax = "0.2 0.12" }
            }, "BugAdminUI");
            
            var filters = new[] { 
                new { Name = "All", Command = "bugadmin.filter all", Color = "0.3 0.3 0.3 0.8" },
                new { Name = "Open", Command = "bugadmin.filter open", Color = "0.6 0.2 0.2 0.8" },
                new { Name = "Resolved", Command = "bugadmin.filter resolved", Color = "0.2 0.6 0.2 0.8" },
                new { Name = "Critical", Command = "bugadmin.filter critical", Color = "0.6 0.1 0.1 0.9" }
            };
            
            for (int i = 0; i < filters.Length; i++)
            {
                var filter = filters[i];
                var x = 0.2f + i * 0.12f;
                
                container.Add(new CuiButton
                {
                    Button = { Color = filter.Color, Command = filter.Command },
                    RectTransform = { AnchorMin = $"{x} 0.08", AnchorMax = $"{x + 0.1f} 0.12" },
                    Text = { Text = filter.Name, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "BugAdminUI");
            }
            
            // === ACTION BUTTONS ===
            container.Add(new CuiButton
            {
                Button = { Color = "0 0.4 0.2 0.9", Command = "bugadmin.refresh", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.84 0.93", AnchorMax = "0.90 0.97" },
                Text = { Text = "🔄 REFRESH", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" }
            }, "UIOverlay");
            
            container.Add(new CuiButton
            {
                Button = { Color = "0.4 0.2 0.6 0.8", Command = "bugadmin.toggle" },
                RectTransform = { AnchorMin = "0.72 0.08", AnchorMax = "0.87 0.12" },
                Text = { Text = (_config.Enabled ? "🟢 ON" : "🔴 OFF"), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugAdminUI");
            
            // Close Button
            container.Add(new CuiButton
            {
                Button = { Color = "0.6 0.2 0.2 0.8", Command = "bugadmin.close" },
                RectTransform = { AnchorMin = "0.92 0.92", AnchorMax = "0.98 0.98" },
                Text = { Text = "✕", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugAdminUI");
            CuiHelper.AddUi(player, container);
        }

        // Alte Submit-Methode entfernt - verwendet jetzt SubmitBugReport // =================== UI (CUI) ===================
        [ConsoleCommand("eldrunbug.ui.close")]
        private void UIClose(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; try { CuiHelper.DestroyUi(p, PanelName); } catch { }
        }

        [ConsoleCommand("eldrunbug.ui.refresh")]
        private void UIRefresh(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; OpenUI(p);
        }

        [ConsoleCommand("eldrunbug.ui.cat")] // args: category key or display text
        private void UISetCat(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; var v = arg.GetString(0, null); if (string.IsNullOrEmpty(v)) return; GetDraft(p).Category = v; OpenUI(p);
        }

        [ConsoleCommand("eldrunbug.ui.sev")] // args: low|med|high
        private void UISetSev(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; var v = arg.GetString(0, null); if (string.IsNullOrEmpty(v)) return; v = v.ToLowerInvariant();
            if (v == "med") v = "medium";
            if (v != "low" && v != "medium" && v != "high" && v != "critical") return;
            GetDraft(p).Severity = v; OpenUI(p);
        }

        [ConsoleCommand("eldrunbug.ui.text")] // args: free text
        private void UISetText(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; var desc = string.Join(" ", arg.Args ?? Array.Empty<string>()); GetDraft(p).Description = Truncate(desc, 1024); OpenUI(p);
        }

        [ConsoleCommand("eldrunbug.ui.title")] // args: free text
        private void UISetTitle(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; var title = string.Join(" ", arg.Args ?? Array.Empty<string>()); GetDraft(p).Title = Truncate(title, 100); OpenUI(p);
        }

        [ConsoleCommand("eldrunbug.ui.submit")]
        private void UISubmit(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null) return; SubmitBugReport(p);
        }

        [ConsoleCommand("eldrunbug.ui.upvote")] // args: bugId
        private void UIUpvote(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); 
            if (p == null) return; 
            int bugId = arg.GetInt(0, -1); 
            if (bugId == -1) return; 
            VoteBug(p, bugId, true);
        }

        [ConsoleCommand("eldrunbug.ui.downvote")] // args: bugId
        private void UIDownvote(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); 
            if (p == null) return; 
            int bugId = arg.GetInt(0, -1); 
            if (bugId == -1) return; 
            VoteBug(p, bugId, false);
        }

        private void OpenUI(BasePlayer p)
        {
            try { CuiHelper.DestroyUi(p, PanelName); } catch { }
            var c = new CuiElementContainer();
            
            // === EXAKT WIE KITS PLUGIN ===
            string min, max; ComputeAnchors(out min, out max);
            
            // Main Background Panel - Fullscreen
            c.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f },
                RectTransform = { AnchorMin = min, AnchorMax = max },
                CursorEnabled = true
            }, "Overlay", PanelName);
            
            // Subtle Pattern Overlay (kein externes Bild)
            c.Add(new CuiPanel
            {
                Image = { Color = "0.08 0.12 0.18 0.4", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, PanelName);
            
            // Dark overlay
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.3", FadeIn = 0.4f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, PanelName, "UIOverlay");
            
            // === HEADER (0.02-0.81 x 0.91-0.99) ===
            // Bug Statistics from _db (NOT _data!)
            var totalBugs = _db.Reports.Count;
            var openBugs = _db.Reports.FindAll(r => r.Status == "open").Count;
            var resolvedBugs = _db.Reports.FindAll(r => r.Status == "resolved").Count;

            c.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.81 0.99" }
            }, "UIOverlay", "HeaderPanel");

            // Header Borders (blue, like Kits)
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 1" }, RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } }, "HeaderPanel");
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 1" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" } }, "HeaderPanel");

            // Globaler Eldrun-Header-Text für BugReport System
            var headerText = $"⚔ EldrunRust BETA  | 📦 BugReport System | 👤 Reports: {totalBugs} | ⚔ Open: {openBugs} | 💀 Resolved: {resolvedBugs} | 🐞 v{Version}";

            c.Add(new CuiLabel
            {
                Text = { Text = headerText, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.80 0.92 1 1" },
                RectTransform = { AnchorMin = "0.03 0.20", AnchorMax = "0.96 0.85" }
            }, "HeaderPanel");

            // Header-Actions oben rechts: Refresh (links), Close (rechts) – neben dem Header-Balken (EldrunKits-Stil)
            c.Add(new CuiButton
            {
                Button = { Color = "0 0.4 0.2 0.9", Command = "eldrunbug.ui.refresh", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.84 0.91", AnchorMax = "0.91 0.99" },
                Text = { Text = "🔄 REFRESH", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" }
            }, "UIOverlay");

            c.Add(new CuiButton
            {
                Button = { Color = "0.4 0 0 0.9", Command = "eldrunbug.ui.close", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.92 0.91", AnchorMax = "0.99 0.99" },
                Text = { Text = "❌ CLOSE", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 0.3 0.3 1" }
            }, "UIOverlay");

            // Right sidebar navigation (moved header buttons)
            bool isAdmin = HasPermission(p, AdminPerm);
            c.Add(new CuiPanel
            {
                Image = { Color = "0.10 0.10 0.16 0.95" },
                RectTransform = { AnchorMin = "0.82 0.16", AnchorMax = "0.98 0.89" }
            }, PanelName, "SidebarRight");

            c.Add(new CuiPanel
            {
                Image = { Color = "0.38 0.68 0.92 1" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "0.02 1" }
            }, "SidebarRight");

            c.Add(new CuiPanel
            {
                Image = { Color = "0.03 0.05 0.08 0.95" },
                RectTransform = { AnchorMin = "0 0.92", AnchorMax = "1 1" }
            }, "SidebarRight", "SidebarHeader");
            c.Add(new CuiPanel
            {
                Image = { Color = "0.38 0.68 0.92 1" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.06" }
            }, "SidebarHeader");
            c.Add(new CuiLabel
            {
                Text = { Text = "📋 NAVIGATION", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = "0.05 0.15", AnchorMax = "0.95 0.85" }
            }, "SidebarHeader");

            var navButtons = new List<(string Label, string Command, bool Visible)>
            {
                ("🐛 New Report", "eldrunbug.ui.refresh", true),
                ("📁 My Reports", "bugreport.myreports", true),
                ("🗳 Voting", "bugreport.showvoting", _config.EnableVoting)
            };

            float navY = 0.84f;
            int navIdx = 0;
            foreach (var nav in navButtons)
            {
                if (!nav.Visible) continue;
                var y = navY - navIdx * 0.12f;
                c.Add(new CuiButton
                {
                    Button = { Command = nav.Command, Color = "0.12 0.16 0.22 0.95" },
                    RectTransform = { AnchorMin = $"0.08 {y - 0.08f}", AnchorMax = $"0.92 {y}" },
                    Text = { Text = nav.Label, FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "SidebarRight");
                navIdx++;
            }

            // Top accent and borders
            c.Add(new CuiPanel { Image = { Color = TV("accent_primary", "0.38 0.68 0.92 0.20") }, RectTransform = { AnchorMin = "0.02 0.92", AnchorMax = "0.98 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("accent_line", "0.38 0.68 0.92 0.35") }, RectTransform = { AnchorMin = "0.02 0.915", AnchorMax = "0.98 0.918" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("gloss", "1.0 1.0 1.0 0.02") }, RectTransform = { AnchorMin = "0.02 0.90", AnchorMax = "0.98 0.93" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_left", "0.20 0.45 0.65 0.25") }, RectTransform = { AnchorMin = "0.01 0.10", AnchorMax = "0.03 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_right", "0.20 0.45 0.65 0.25") }, RectTransform = { AnchorMin = "0.97 0.10", AnchorMax = "0.99 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.38 0.68 0.92 0.20") }, RectTransform = { AnchorMin = "0.015 0.11", AnchorMax = "0.985 0.12" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.38 0.68 0.92 0.20") }, RectTransform = { AnchorMin = "0.015 0.88", AnchorMax = "0.985 0.89" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.38 0.68 0.92 0.20") }, RectTransform = { AnchorMin = "0.015 0.12", AnchorMax = "0.02 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.38 0.68 0.92 0.20") }, RectTransform = { AnchorMin = "0.98 0.12", AnchorMax = "0.985 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") }, RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.80 0.89" } }, PanelName);
            // Watermark
            var wm = TV("watermark_url", null);
            if (!string.IsNullOrEmpty(wm)) c.Add(new CuiElement { Parent = PanelName, Components = { new CuiRawImageComponent { Color = TV("watermark_color", "1 1 1 0.02"), Url = wm }, new CuiRectTransformComponent { AnchorMin = TV("watermark_min", "0.38 0.30"), AnchorMax = TV("watermark_max", "0.62 0.58") } } });

            // Title + icon
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.title", null, "ELDRUN â€“ Bug Report"), FontSize = 22, Align = TextAnchor.MiddleLeft, Color = TV("team1_text", "0.80 0.92 1 1") }, RectTransform = { AnchorMin = "0.04 0.925", AnchorMax = "0.80 0.985" } }, PanelName);
            var titleIcon = TV("icon_admin_module_bugreport", null);
            if (!string.IsNullOrEmpty(titleIcon))
            {
                c.Add(new CuiElement { Parent = PanelName, Components = { new CuiRawImageComponent { Url = titleIcon, Color = TV("tab_icon_active", "1 1 1 0.95") }, new CuiRectTransformComponent { AnchorMin = "0.02 0.925", AnchorMax = "0.04 0.985" } } });
            }

            

            // Intro / Reward note
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.hint", new Dictionary<string,string>{{"reward", _config.RewardScrap.ToString()}}, "Report issues quickly and precisely. Confirmed reports are rewarded ({reward} Scrap)."), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.92" }, RectTransform = { AnchorMin = "0.04 0.86", AnchorMax = "0.96 0.89" } }, PanelName);

            var d = GetDraft(p);
            var cats = _config.Categories ?? new List<string>();
            // Category buttons
            float cy = 0.82f; float ch = 0.04f; float cx = 0.04f; float cw = 0.14f;
            c.Add(new CuiLabel { Text = { Text = "Category:", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.83", AnchorMax = "0.16 0.86" } }, PanelName);
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.category", null, "Category:"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.83", AnchorMax = "0.16 0.86" } }, PanelName);
            int shown = 0;
            foreach (var cat in cats)
            {
                string col = string.Equals(d.Category, cat, StringComparison.OrdinalIgnoreCase) ? TV("tab_active", "0.86 0.72 0.38 0.90") : TV("tab_inactive", "0.25 0.25 0.30 0.85");
                c.Add(new CuiButton { Button = { Color = col, Command = $"eldrunbug.ui.cat {cat}" }, RectTransform = { AnchorMin = Format(cx, cy), AnchorMax = Format(cx+cw, cy+ch) }, Text = { Text = cat, FontSize = 12, Align = TextAnchor.MiddleCenter } }, PanelName);
                cx += (cw + 0.015f); shown++; if (shown >= 5) break;
            }

            // Severity buttons
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.sev", null, "Severity:"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.78", AnchorMax = "0.16 0.81" } }, PanelName);
            AddSevBtn(c, PanelName, d, "low", 0.18f, 0.78f, 0.28f, 0.82f);
            AddSevBtn(c, PanelName, d, "medium", 0.30f, 0.78f, 0.40f, 0.82f);
            AddSevBtn(c, PanelName, d, "high", 0.42f, 0.78f, 0.52f, 0.82f);
            AddSevBtn(c, PanelName, d, "critical", 0.54f, 0.78f, 0.64f, 0.82f);
            // Severity reward estimate (right side)
            try
            {
                var sevKey = (d.Severity ?? string.Empty).ToLowerInvariant();
                if (sevKey == "med") sevKey = "medium";
                if (!string.IsNullOrEmpty(sevKey) && _config.SeverityLevels.TryGetValue(sevKey, out var sevCfg))
                {
                    var xp = sevCfg.RewardXP > 0 ? sevCfg.RewardXP : _config.BaseXPReward;
                    var dragons = sevCfg.RewardDragons > 0 ? sevCfg.RewardDragons : _config.BaseDragonReward;
                    c.Add(new CuiLabel { Text = { Text = $"Estimated: +{xp} XP / +{dragons} Dragons", FontSize = 10, Align = TextAnchor.MiddleRight, Color = "0.9 0.9 0.9 0.9" }, RectTransform = { AnchorMin = "0.66 0.78", AnchorMax = "0.96 0.82" } }, PanelName);
                }
            }
            catch { }

            // Title input box
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.titlelbl", null, "Title:"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.74", AnchorMax = "0.16 0.77" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("tab_inactive", "0.25 0.25 0.30 0.40") }, RectTransform = { AnchorMin = "0.04 0.70", AnchorMax = "0.80 0.74" } }, PanelName);
            c.Add(new CuiElement { Parent = PanelName, Components = { new CuiInputFieldComponent { Command = "eldrunbug.ui.title {value}", FontSize = 12, Align = TextAnchor.MiddleLeft, Text = d.Title ?? string.Empty, Color = "1 1 1 1" }, new CuiRectTransformComponent { AnchorMin = "0.045 0.705", AnchorMax = "0.795 0.735" } } });

            // Description input box
            c.Add(new CuiLabel { Text = { Text = T("bug.ui.desc", null, "Description:"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.04 0.66", AnchorMax = "0.16 0.69" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("tab_inactive", "0.25 0.25 0.30 0.40") }, RectTransform = { AnchorMin = "0.04 0.50", AnchorMax = "0.80 0.66" } }, PanelName);
            c.Add(new CuiElement { Parent = PanelName, Components = { new CuiInputFieldComponent { Command = "eldrunbug.ui.text {value}", FontSize = 12, Align = TextAnchor.UpperLeft, Text = d.Description ?? string.Empty, Color = "1 1 1 1" }, new CuiRectTransformComponent { AnchorMin = "0.045 0.505", AnchorMax = "0.795 0.655" } } });

            // Submit/Cancel
            c.Add(new CuiButton { Button = { Color = TV("random_btn", "0.18 0.55 0.20 0.90"), Command = "eldrunbug.ui.submit" }, RectTransform = { AnchorMin = "0.56 0.52", AnchorMax = "0.76 0.56" }, Text = { Text = T("bug.ui.submit", null, "Submit"), FontSize = 12, Align = TextAnchor.MiddleCenter } }, PanelName);
            c.Add(new CuiButton { Button = { Color = TV("close_btn", "0.45 0.10 0.10 0.90"), Command = "eldrunbug.ui.close" }, RectTransform = { AnchorMin = "0.78 0.52", AnchorMax = "0.94 0.56" }, Text = { Text = T("bug.ui.cancel", null, "Close Window"), FontSize = 12, Align = TextAnchor.MiddleCenter } }, PanelName);

            // 📊 FOOTER PANEL (Standard Gold Design)
            c.Add(new CuiPanel { Image = { Color = "0.03 0.05 0.08 0.95" }, RectTransform = { AnchorMin = "0.02 0.02", AnchorMax = "0.98 0.10" } }, PanelName, "FooterPanel");
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 0.8" }, RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } }, "FooterPanel");
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 0.8" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.12" } }, "FooterPanel");
            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            c.Add(new CuiLabel { Text = { Text = footerText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" }, RectTransform = { AnchorMin = "0.02 0.2", AnchorMax = "0.98 0.8" } }, "FooterPanel");

            CuiHelper.AddUi(p, c);
        }

        private void ComputeAnchors(out string min, out string max)
        {
            // Fullscreen wie alle anderen Eldrun Plugins
            min = "0 0";
            max = "1 1";
        }

        private static string Format(float x, float y)
            => string.Format(CultureInfo.InvariantCulture, "{0:0.###} {1:0.###}", x, y);

        private void AddSevBtn(CuiElementContainer c, string parent, Draft d, string sev, float minX, float minY, float maxX, float maxY)
        {
            bool active = string.Equals(d?.Severity, sev, StringComparison.OrdinalIgnoreCase);
            string col = active ? TV("tab_active", "0.86 0.72 0.38 0.90") : TV("tab_inactive", "0.25 0.25 0.30 0.85");
            string label = sev=="low" ? T("bug.ui.low",null,"Low") :
                           sev=="medium" ? T("bug.ui.med",null,"Medium") :
                           sev=="high" ? T("bug.ui.high",null,"High") :
                           T("bug.ui.critical",null,"Critical");
            c.Add(new CuiButton { Button = { Color = col, Command = $"eldrunbug.ui.sev {sev}" }, RectTransform = { AnchorMin = Format(minX, minY), AnchorMax = Format(maxX, maxY) }, Text = { Text = label, FontSize = 12, Align = TextAnchor.MiddleCenter } }, parent);
        }
        
        [ConsoleCommand("eldrunbug.ui.admin")]
        private void UIAdmin(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); 
            if (p == null || !HasPermission(p, AdminPerm)) return;
            OpenAdminUI(p);
        }
        
        private void OpenAdminUI(BasePlayer p)
        {
            try { CuiHelper.DestroyUi(p, PanelName); } catch { }
            var c = new CuiElementContainer();
            string min, max; ComputeAnchors(out min, out max);
            
            c.Add(new CuiPanel { Image = { Color = "0.05 0.08 0.12 0.98", FadeIn = 0.2f }, RectTransform = { AnchorMin = min, AnchorMax = max }, CursorEnabled = true }, "Overlay", PanelName);
            // Background image removed - using solid background only
            c.Add(new CuiPanel { Image = { Color = "0 0 0 0.3", FadeIn = 0.4f }, RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" } }, PanelName, "UIOverlay");
            
            // Header (nur bis 0.81 - Platz für Sidebar!)
            c.Add(new CuiPanel { Image = { Color = "0.03 0.05 0.08 0.95" }, RectTransform = { AnchorMin = "0.02 0.91", AnchorMax = "0.81 0.99" } }, "UIOverlay", "Header");
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 1" }, RectTransform = { AnchorMin = "0 0.88", AnchorMax = "1 1" } }, "Header");
            c.Add(new CuiLabel { Text = { Text = GetLocalizedMessage("bug.ui.admin.header", p), FontSize = 16, Align = TextAnchor.MiddleLeft, Color = "0.80 0.92 1 1" }, RectTransform = { AnchorMin = "0.02 0.15", AnchorMax = "0.50 0.88" } }, "Header");
            
            // Sidebar (0.82-0.97)
            c.Add(new CuiPanel { Image = { Color = "0 0 0 0.8" }, RectTransform = { AnchorMin = "0.82 0.13", AnchorMax = "0.97 0.89" } }, "UIOverlay", "Sidebar");
            c.Add(new CuiPanel { Image = { Color = "0.38 0.68 0.92 1" }, RectTransform = { AnchorMin = "0 0", AnchorMax = "0.02 1" } }, "Sidebar");
            c.Add(new CuiLabel { Text = { Text = GetLocalizedMessage("bug.ui.admin.sidebar.stats_title", p), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.95 0.88 0.60 1" }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.98" } }, "Sidebar");
            
            var totalBugs = _db.Reports.Count;
            var openBugs = _db.Reports.FindAll(r => r.Status == "open").Count;
            var resolvedBugs = _db.Reports.FindAll(r => r.Status == "resolved").Count;
            
            float sidebarY = 0.80f;
            var stats = new[]
            {
                (GetLocalizedMessage("bug.ui.admin.stats.open", p), openBugs.ToString(), "0.28 0.88 0.38 1"),
                (GetLocalizedMessage("bug.ui.admin.stats.resolved", p), resolvedBugs.ToString(), "0.38 0.68 0.92 1"),
                (GetLocalizedMessage("bug.ui.admin.stats.total", p), totalBugs.ToString(), "1 0.88 0.42 1")
            };
            
            foreach (var (label, value, color) in stats)
            {
                c.Add(new CuiLabel { Text = { Text = label, FontSize = 10, Align = TextAnchor.MiddleLeft, Color = "0.7 0.7 0.7 1" }, RectTransform = { AnchorMin = $"0.08 {sidebarY - 0.04}", AnchorMax = $"0.60 {sidebarY}" } }, "Sidebar");
                c.Add(new CuiLabel { Text = { Text = value, FontSize = 12, Align = TextAnchor.MiddleRight, Color = color }, RectTransform = { AnchorMin = $"0.60 {sidebarY - 0.04}", AnchorMax = $"0.92 {sidebarY}" } }, "Sidebar");
                sidebarY -= 0.08f;
            }

            // Content (nur bis 0.81!)
            c.Add(new CuiPanel { Image = { Color = "0.10 0.10 0.12 0.25" }, RectTransform = { AnchorMin = "0.02 0.13", AnchorMax = "0.81 0.89" } }, PanelName, "Content");

            // Admin UI search + pagination
            var state = GetUIState(p);
            var filtered = new List<BugReport>(_db.Reports);
            if (!string.IsNullOrEmpty(state.Search))
            {
                var q = state.Search.ToLowerInvariant();
                filtered = filtered.Where(r => (r.Title ?? "").ToLower().Contains(q) || (r.Description ?? "").ToLower().Contains(q)).ToList();
            }
            // Apply optional filters
            if (_config.EnableFilters)
            {
                if (!string.IsNullOrEmpty(state.FilterCategory))
                {
                    filtered = filtered.Where(r => string.Equals(r.Category ?? string.Empty, state.FilterCategory, StringComparison.OrdinalIgnoreCase)).ToList();
                }
                if (!string.IsNullOrEmpty(state.FilterSeverity))
                {
                    var sev = state.FilterSeverity.ToLowerInvariant();
                    if (sev == "med") sev = "medium";
                    filtered = filtered.Where(r => string.Equals((r.Severity ?? string.Empty).ToLowerInvariant(), sev, StringComparison.Ordinal)).ToList();
                }
                if (!string.IsNullOrEmpty(state.FilterStatus))
                {
                    var stv = state.FilterStatus.ToLowerInvariant();
                    if (stv != "all" && stv != "any")
                        filtered = filtered.Where(r => string.Equals((r.Status ?? string.Empty).ToLowerInvariant(), stv, StringComparison.Ordinal)).ToList();
                }
            }
            int perPage = Math.Max(1, _config.ReportsPerPage);
            int total = filtered.Count;
            int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)perPage));
            if (state.Page >= totalPages) state.Page = totalPages - 1;
            if (state.Page < 0) state.Page = 0;
            var pageItems = filtered.Skip(state.Page * perPage).Take(perPage).ToList();

            // Search box
            if (_config.EnableSearch)
            {
                c.Add(new CuiLabel { Text = { Text = "Search:", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.03 0.89", AnchorMax = "0.08 0.91" } }, PanelName);
                c.Add(new CuiPanel { Image = { Color = "0 0 0 0.35" }, RectTransform = { AnchorMin = "0.08 0.885", AnchorMax = "0.30 0.915" } }, PanelName, "AdminSearch");
                c.Add(new CuiElement { Parent = "AdminSearch", Components = { new CuiInputFieldComponent { Command = "eldrunbug.admin.search {value}", FontSize = 12, Align = TextAnchor.MiddleLeft, Text = state.Search ?? string.Empty, Color = "1 1 1 1" }, new CuiRectTransformComponent { AnchorMin = "0.02 0.05", AnchorMax = "0.98 0.95" } } });
            }

            // Page controls
            c.Add(new CuiLabel { Text = { Text = $"Page {state.Page + 1}/{totalPages}", FontSize = 12, Align = TextAnchor.MiddleRight, Color = "0.95 0.95 0.95 1" }, RectTransform = { AnchorMin = "0.62 0.89", AnchorMax = "0.74 0.91" } }, PanelName);
            c.Add(new CuiButton { Button = { Color = "0.3 0.3 0.3 0.8", Command = "eldrunbug.admin.page prev" }, RectTransform = { AnchorMin = "0.75 0.885", AnchorMax = "0.78 0.915" }, Text = { Text = "<", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, PanelName);
            c.Add(new CuiButton { Button = { Color = "0.3 0.3 0.3 0.8", Command = "eldrunbug.admin.page next" }, RectTransform = { AnchorMin = "0.79 0.885", AnchorMax = "0.82 0.915" }, Text = { Text = ">", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, PanelName);

            // Filters row (inside content) - dropdown-like buttons
            if (_config.EnableFilters)
            {
                c.Add(new CuiLabel { Text = { Text = "Filters:", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 1" }, RectTransform = { AnchorMin = "0.03 0.86", AnchorMax = "0.08 0.885" } }, "Content");
                // Category cycler: < [Current/All] >
                c.Add(new CuiLabel { Text = { Text = "Category:", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.09 0.86", AnchorMax = "0.15 0.885" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.2 0.2 0.2 0.8", Command = "eldrunbug.admin.cyclecat prev" }, RectTransform = { AnchorMin = "0.15 0.855", AnchorMax = "0.17 0.885" }, Text = { Text = "<", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                var catLabel = string.IsNullOrEmpty(state.FilterCategory) ? "All" : state.FilterCategory;
                c.Add(new CuiLabel { Text = { Text = catLabel, FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0.9 0.9 0.9 1" }, RectTransform = { AnchorMin = "0.17 0.86", AnchorMax = "0.29 0.885" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.2 0.2 0.2 0.8", Command = "eldrunbug.admin.cyclecat next" }, RectTransform = { AnchorMin = "0.29 0.855", AnchorMax = "0.31 0.885" }, Text = { Text = ">", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                
                // Severity quick buttons
                c.Add(new CuiLabel { Text = { Text = "Severity:", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.33 0.86", AnchorMax = "0.40 0.885" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setsev all" }, RectTransform = { AnchorMin = "0.40 0.855", AnchorMax = "0.44 0.885" }, Text = { Text = "All", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setsev low" }, RectTransform = { AnchorMin = "0.445 0.855", AnchorMax = "0.485 0.885" }, Text = { Text = "Low", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setsev medium" }, RectTransform = { AnchorMin = "0.49 0.855", AnchorMax = "0.55 0.885" }, Text = { Text = "Med", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setsev high" }, RectTransform = { AnchorMin = "0.555 0.855", AnchorMax = "0.595 0.885" }, Text = { Text = "High", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setsev critical" }, RectTransform = { AnchorMin = "0.60 0.855", AnchorMax = "0.66 0.885" }, Text = { Text = "Crit", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

                // Status quick buttons
                c.Add(new CuiLabel { Text = { Text = "Status:", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "1 1 1 0.9" }, RectTransform = { AnchorMin = "0.67 0.86", AnchorMax = "0.73 0.885" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setstatus all" }, RectTransform = { AnchorMin = "0.73 0.855", AnchorMax = "0.765 0.885" }, Text = { Text = "All", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setstatus open" }, RectTransform = { AnchorMin = "0.77 0.855", AnchorMax = "0.815 0.885" }, Text = { Text = "Open", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setstatus in_progress" }, RectTransform = { AnchorMin = "0.82 0.855", AnchorMax = "0.885 0.885" }, Text = { Text = "Prog", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setstatus resolved" }, RectTransform = { AnchorMin = "0.89 0.855", AnchorMax = "0.945 0.885" }, Text = { Text = "Res", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = "0.18 0.18 0.22 0.9", Command = "eldrunbug.admin.setstatus rejected" }, RectTransform = { AnchorMin = "0.95 0.855", AnchorMax = "0.985 0.885" }, Text = { Text = "Rej", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                // Note: duplicate left out to keep space tight; can be set via command
            }

            float y = 0.85f;
            int shown = 0;
            foreach (var bug in pageItems)
            {
                if (y < 0.1f) break;
                var statusColor = bug.Status == "open" ? "0.28 0.88 0.38 1" : (bug.Status == "resolved" ? "0.38 0.68 0.92 1" : "0.88 0.28 0.28 1");
                bool hasVoted = bug.UpVoters.Contains(p.userID) || bug.DownVoters.Contains(p.userID);
                bool hasUpvoted = bug.UpVoters.Contains(p.userID);
                bool hasDownvoted = bug.DownVoters.Contains(p.userID);
                bool isAdmin = HasPermission(p, AdminPerm);
                
                c.Add(new CuiPanel { Image = { Color = "0 0 0 0.4" }, RectTransform = { AnchorMin = $"0.02 {y - 0.08f}", AnchorMax = $"0.98 {y}" } }, "Content", $"Bug{shown}");
                
                // Bug Info
                c.Add(new CuiLabel { Text = { Text = $"#{bug.Id} | {bug.PlayerName} | {bug.Category}", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = "0.95 0.95 0.99 1" }, RectTransform = { AnchorMin = "0.02 0.60", AnchorMax = "0.50 0.95" } }, $"Bug{shown}");
                c.Add(new CuiLabel { Text = { Text = bug.Description.Length > 50 ? bug.Description.Substring(0, 50) + "..." : bug.Description, FontSize = 9, Align = TextAnchor.MiddleLeft, Color = "0.7 0.7 0.7 1" }, RectTransform = { AnchorMin = "0.02 0.05", AnchorMax = "0.50 0.55" } }, $"Bug{shown}");
                
                // Voting Display & Buttons
                string voteColor = bug.VoteScore > 0 ? "0.28 0.88 0.38 1" : bug.VoteScore < 0 ? "0.88 0.28 0.28 1" : "0.7 0.7 0.7 1";
                c.Add(new CuiLabel { Text = { Text = $"⬆️ {bug.UpVotes}", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = hasUpvoted ? "0.28 0.88 0.38 1" : "0.7 0.7 0.7 1" }, RectTransform = { AnchorMin = "0.52 0.55", AnchorMax = "0.57 0.95" } }, $"Bug{shown}");
                c.Add(new CuiLabel { Text = { Text = $"⬇️ {bug.DownVotes}", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = hasDownvoted ? "0.88 0.28 0.28 1" : "0.7 0.7 0.7 1" }, RectTransform = { AnchorMin = "0.52 0.05", AnchorMax = "0.57 0.45" } }, $"Bug{shown}");
                
                // Vote Buttons (nur wenn nicht eigener Bug)
                if (bug.UserId != p.userID)
                {
                    string upvoteColor = hasUpvoted ? "0.18 0.68 0.28 0.9" : "0.15 0.15 0.20 0.6";
                    string downvoteColor = hasDownvoted ? "0.68 0.18 0.18 0.9" : "0.15 0.15 0.20 0.6";
                    c.Add(new CuiButton { Button = { Color = upvoteColor, Command = $"eldrunbug.ui.upvote {bug.Id}" }, RectTransform = { AnchorMin = "0.58 0.55", AnchorMax = "0.62 0.95" }, Text = { Text = "⬆️", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, $"Bug{shown}");
                    c.Add(new CuiButton { Button = { Color = downvoteColor, Command = $"eldrunbug.ui.downvote {bug.Id}" }, RectTransform = { AnchorMin = "0.58 0.05", AnchorMax = "0.62 0.45" }, Text = { Text = "⬇️", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, $"Bug{shown}");
                }
                
                // Status & Admin Buttons
                c.Add(new CuiLabel { Text = { Text = bug.Status.ToUpper(), FontSize = 10, Align = TextAnchor.MiddleRight, Color = statusColor }, RectTransform = { AnchorMin = "0.64 0.30", AnchorMax = "0.73 0.70" } }, $"Bug{shown}");
                
                if (isAdmin)
                {
                    c.Add(new CuiButton { Button = { Color = "0.38 0.68 0.92 0.9", Command = $"eldrunbug.admin.resolve {bug.Id}" }, RectTransform = { AnchorMin = "0.75 0.15", AnchorMax = "0.86 0.85" }, Text = { Text = "✅ RESOLVE", FontSize = 9, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, $"Bug{shown}");
                    c.Add(new CuiButton { Button = { Color = "0.88 0.28 0.28 0.9", Command = $"eldrunbug.admin.delete {bug.Id}" }, RectTransform = { AnchorMin = "0.88 0.15", AnchorMax = "0.98 0.85" }, Text = { Text = "🗑️", FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, $"Bug{shown}");
                }
                
                y -= 0.09f;
                shown++;
            }
            
            if (shown == 0) c.Add(new CuiLabel { Text = { Text = "❌ No bug reports available", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "0.88 0.28 0.28 1" }, RectTransform = { AnchorMin = "0.1 0.4", AnchorMax = "0.9 0.5" } }, "Content");
            
            // Buttons moved into Sidebar
            CuiHelper.AddUi(p, c);
        }

        [ConsoleCommand("eldrunbug.admin.search")]
        private void UIAdminSearch(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var q = string.Join(" ", arg.Args ?? Array.Empty<string>()) ?? string.Empty;
            var st = GetUIState(p); st.Search = q; st.Page = 0; OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.page")]
        private void UIAdminPage(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var dir = arg.GetString(0, "next");
            var st = GetUIState(p);
            if (string.Equals(dir, "prev", StringComparison.OrdinalIgnoreCase)) st.Page--; else st.Page++;
            OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.cyclecat")]
        private void UIAdminCycleCategory(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var dir = arg.GetString(0, "next").ToLowerInvariant();
            var st = GetUIState(p);
            var list = new List<string>();
            list.Add(""); // empty -> All
            if (_config.Categories != null) list.AddRange(_config.Categories);
            int idx = 0;
            if (!string.IsNullOrEmpty(st.FilterCategory))
            {
                idx = list.FindIndex(c => string.Equals(c, st.FilterCategory, StringComparison.OrdinalIgnoreCase));
                if (idx < 0) idx = 0;
            }
            if (dir == "prev") idx = (idx - 1 + list.Count) % list.Count; else idx = (idx + 1) % list.Count;
            st.FilterCategory = list[idx];
            st.Page = 0; OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.setcat")]
        private void UIAdminSetCategory(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var val = string.Join(" ", arg.Args ?? Array.Empty<string>()).Trim();
            var st = GetUIState(p);
            if (string.IsNullOrEmpty(val) || val.Equals("all", StringComparison.OrdinalIgnoreCase) || val.Equals("any", StringComparison.OrdinalIgnoreCase))
            {
                st.FilterCategory = string.Empty;
            }
            else
            {
                // Match category ignoring case
                var match = _config.Categories.FirstOrDefault(c => string.Equals(c, val, StringComparison.OrdinalIgnoreCase));
                if (!string.IsNullOrEmpty(match)) st.FilterCategory = match;
            }
            st.Page = 0; OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.setsev")]
        private void UIAdminSetSeverity(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var val = string.Join(" ", arg.Args ?? Array.Empty<string>()).Trim().ToLowerInvariant();
            var st = GetUIState(p);
            if (string.IsNullOrEmpty(val) || val == "all" || val == "any")
            {
                st.FilterSeverity = string.Empty;
            }
            else
            {
                if (val == "med") val = "medium";
                if (_config.SeverityLevels.ContainsKey(val)) st.FilterSeverity = val;
            }
            st.Page = 0; OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.setstatus")]
        private void UIAdminSetStatus(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var val = string.Join(" ", arg.Args ?? Array.Empty<string>()).Trim().ToLowerInvariant();
            var st = GetUIState(p);
            var allowed = new HashSet<string>(new[]{"open","in_progress","resolved","rejected","duplicate"});
            if (string.IsNullOrEmpty(val) || val == "all" || val == "any") st.FilterStatus = string.Empty;
            else if (allowed.Contains(val)) st.FilterStatus = val;
            st.Page = 0; OpenAdminUI(p);
        }

        [ConsoleCommand("eldrunbug.admin.clearfilters")]
        private void UIAdminClearFilters(ConsoleSystem.Arg arg)
        {
            var p = arg.Player(); if (p == null || !HasPermission(p, AdminPerm)) return;
            var st = GetUIState(p);
            st.FilterCategory = st.FilterSeverity = st.FilterStatus = string.Empty;
            st.Page = 0; OpenAdminUI(p);
        }

        private void TryWebhook(BugReport r, string action = "submitted")
        {
            if (!_config.EnableWebhook || string.IsNullOrWhiteSpace(_config.WebhookUrl)) return;
            
            try
            {
                var severityColor = GetSeverityColor(r.Severity);
                var statusEmoji = GetStatusEmoji(r.Status);
                var actionText = GetActionText(action);
                
                var embed = new
                {
                    embeds = new[]
                    {
                        new
                        {
                            title = $" Bug Report #{r.Id} {actionText}",
                            description = r.Description,
                            color = severityColor,
                            fields = new[]
                            {
                                new { name = "ðŸ‘¤ Reporter", value = $"{r.PlayerName} ({r.UserId})", inline = true },
                                new { name = "ðŸ“‚ Category", value = r.Category, inline = true },
                                new { name = "âš ï¸ Severity", value = GetSeverityName(r.Severity), inline = true },
                                new { name = " Location", value = $"({r.X:F0}, {r.Y:F0}, {r.Z:F0})", inline = true },
                                new { name = "ðŸŒ Zone", value = r.Zone ?? "Unknown", inline = true },
                                new { name = " Status", value = $"{statusEmoji} {r.Status}", inline = true }
                            },
                            footer = new { text = $"Server: {ConVar.Server.hostname} | {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC" },
                            timestamp = r.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                        }
                    }
                };

                // 📸 Add screenshots if available
                string screenshotField = "";
                if (r.Screenshots != null && r.Screenshots.Count > 0)
                {
                    var screenshotLinks = new List<string>();
                    for (int i = 0; i < r.Screenshots.Count && i < 5; i++)
                    {
                        screenshotLinks.Add($"[Screenshot {i+1}]({r.Screenshots[i]})");
                    }
                    screenshotField = $",{{\"name\": \"📸 Screenshots ({r.Screenshots.Count})\", \"value\": \"{string.Join(" | ", screenshotLinks)}\", \"inline\": false}}";
                }
                
                // Add image (first screenshot as thumbnail)
                string imageField = "";
                if (r.Screenshots != null && r.Screenshots.Count > 0)
                {
                    imageField = $",\"image\": {{\"url\": \"{JsonEscape(r.Screenshots[0])}\"}}";
                }
                
                // Manual JSON serialization fuer Oxide-Kompatibilitaet
                var json = $@"{{
                    ""embeds"": [{{
                        ""title"": ""{JsonEscape($"🐛 Bug Report #{r.Id} {actionText}")}"",
                        ""description"": ""{JsonEscape(r.Description)}"",
                        ""color"": {severityColor},
                        ""fields"": [
                            {{""name"": ""👤 Reporter"", ""value"": ""{JsonEscape($"{r.PlayerName} ({r.UserId})")}"", ""inline"": true}},
                            {{""name"": ""📂 Category"", ""value"": ""{JsonEscape(r.Category)}"", ""inline"": true}},
                            {{""name"": ""⚠️ Severity"", ""value"": ""{JsonEscape(GetSeverityName(r.Severity))}"", ""inline"": true}},
                            {{""name"": "" 📍 Location"", ""value"": ""({r.X:F0}, {r.Y:F0}, {r.Z:F0})"", ""inline"": true}},
                            {{""name"": ""🌎 Zone"", ""value"": ""{JsonEscape(r.Zone ?? "Unknown")}"", ""inline"": true}},
                            {{""name"": ""📊 Status"", ""value"": ""{JsonEscape($"{statusEmoji} {r.Status}")}"", ""inline"": true}}{screenshotField}
                        ],
                        ""footer"": {{""text"": ""{JsonEscape($"Server: {ConVar.Server.hostname}")} | {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC""}},
                        ""timestamp"": ""{r.CreatedAt:yyyy-MM-ddTHH:mm:ss.fffZ}""{imageField}
                    }}]
                }}";
                var headers = new Dictionary<string, string> { {"Content-Type", "application/json"} };
                
                _web.Enqueue(_config.WebhookUrl, json, (code, response) => 
                {
                    if (code != 200 && code != 204)
                    {
                        LogLocalizedMessage("bugreport.message", new Dictionary<string, string> { ["code"] = code.ToString(), ["response"] = response.ToString() });
                    }
                }, this, RequestMethod.POST, headers);
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("bugreport.message", null);
            }
        }

        private int GetSeverityColor(string severity)
        {
            switch (severity?.ToLowerInvariant())
            {
                case "low": return 0x00FF00;      // Green
                case "medium": return 0xFFFF00;   // Yellow
                case "high": return 0xFF8C00;     // Orange
                case "critical": return 0xFF0000; // Red
                default: return 0x808080;         // Gray
            }
        }

        private string GetStatusEmoji(string status)
        {
            switch (status?.ToLowerInvariant())
            {
                case "open": return "";
                case "in_progress": return "ðŸ”µ";
                case "resolved": return "";
                case "rejected": return "";
                case "duplicate": return "ðŸ”„";
                default: return "";
            }
        }

        private string GetActionText(string action)
        {
            switch (action?.ToLowerInvariant())
            {
                case "submitted": return "submitted";
                case "resolved": return "resolved";
                case "rejected": return "rejected";
                case "commented": return "commented";
                case "assigned": return "assigned";
                default: return "updated";
            }
        }

        private string GetSeverityName(string severity)
        {
            if (_config.SeverityLevels.TryGetValue(severity, out var sev))
                return sev.Name;
            return severity;
        }

        private string JsonEscape(string s)
        {
            if (string.IsNullOrEmpty(s)) return string.Empty;
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }

        // Alte ShowLast-Methode entfernt - ersetzt durch ShowLastBugReport

        [ConsoleCommand("bugreport.category")]
        private void ConsoleCategorySelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            var category = arg.GetString(0, "");
            if (!string.IsNullOrEmpty(category))
            {
                GetDraft(player).Category = category;
                OpenBugReportUI(player); // Refresh UI
            }
        }
        
        [ConsoleCommand("bugreport.severity")]
        private void ConsoleSeveritySelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            var severity = arg.GetString(0, "");
            if (!string.IsNullOrEmpty(severity))
            {
                GetDraft(player).Severity = severity;
                OpenBugReportUI(player); // Refresh UI
            }
        }
        
        [ConsoleCommand("bugreport.description")]
        private void ConsoleDescriptionInput(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            // Close UI and ask for text input
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            Reply(player, " Enter your bug description with: /bug text <your description>");
        }
        
        [ConsoleCommand("bugreport.submit")]
        private void ConsoleSubmitBug(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            SubmitBugReport(player);
        }
        
        [ConsoleCommand("bugreport.clear")]
        private void ConsoleClearDraft(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            _drafts.Remove(player.userID);
            OpenBugReportUI(player); // Refresh UI
            Reply(player, "🗑️ Bug report draft cleared.");
        }
        
        [ConsoleCommand("bugreport.close")]
        private void ConsoleCloseBugUI(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
        }
        
        [ConsoleCommand("bugreport.myreports")]
        private void ConsoleShowMyReports(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            int page = arg.GetInt(0, 1);
            ShowPlayerBugReports(player, page);
        }
        
        [ConsoleCommand("bugreport.help")]
        private void ConsoleShowHelp(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            ShowHelpText(player);
        }
        
        // Header button commands
        [ConsoleCommand("bugreport.notifications")]
        private void ConsoleShowNotificationsCmd(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            ShowNotifications(player, "all");
        }
        
        [ConsoleCommand("bugreport.open")]
        private void ConsoleOpenUI(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            OpenUI(player);
        }
        
        [ConsoleCommand("bugreport.info")]
        private void ConsoleInfo(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            ShowHelpText(player);
        }
        
        [ConsoleCommand("bugreport.settings")]
        private void ConsoleSettings(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            if (!HasPermission(player, AdminPerm)) { Reply(player, "You do not have permission to open settings."); return; }
            OpenBugAdminUI(player);
        }
        
        [ConsoleCommand("bugreport.showvoting")]
        private void ConsoleShowVoting(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            if (!_config.EnableVoting)
            {
                Reply(player, "The voting system is currently disabled.");
                return;
            }
            var page = arg.GetInt(0, 1);
            ShowVotingList(player, page);
        }

        private void ShowVotingList(BasePlayer player, int page = 1)
        {
            // Build list of open reports with at least 1 upvote
            var reports = _db.Reports
                .Where(r => string.Equals(r.Status, "open", StringComparison.OrdinalIgnoreCase) && r.UpVotes > 0)
                .OrderByDescending(r => r.UpVotes)
                .ThenBy(r => r.Id)
                .ToList();

            if (reports.Count == 0)
            {
                Reply(player, "No bug reports with votes found.");
                return;
            }

            int perPage = Math.Max(1, _config.ChatListPerPage);
            int total = reports.Count;
            int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)perPage));
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            var pageItems = reports.Skip((page - 1) * perPage).Take(perPage).ToList();

            Reply(player, $"👍 TOP BUG REPORTS BY VOTES (Page {page}/{totalPages}):");
            foreach (var report in pageItems)
            {
                Reply(player, $"#{report.Id} | {report.Category} | 👍 {report.UpVotes} Votes | /bug vote {report.Id}");
            }
            if (totalPages > 1) Reply(player, " Use: /bug voting <page>");
        }

        // === ADMIN UI CONSOLE COMMANDS ===
        [ConsoleCommand("bugadmin.view")]
        private void ConsoleAdminViewBug(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            
            var id = arg.GetInt(0, -1);
            if (id == -1) return;
            
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(player, "Bug report not found.");
                return;
            }
            
            // Show detailed view
            try { CuiHelper.DestroyUi(player, "BugAdminUI"); } catch { }
            ShowBugDetailUI(player, report);
        }
        
        [ConsoleCommand("bugadmin.resolve")]
        private void ConsoleAdminResolveBug(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            
            var id = arg.GetInt(0, -1);
            if (id == -1) return;
            
            var report = _db.Reports.Find(r => r.Id == id);
            if (report != null)
            {
                report.Status = "resolved";
                report.ResolvedAt = DateTime.UtcNow;
                _dataChanged = true; // Optimiert: Batch Save
                Reply(player, $"Bug report #{id} marked as resolved.");
                OpenBugAdminUI(player); // Refresh UI
            }
        }
        
        [ConsoleCommand("bugadmin.delete")]
        private void ConsoleAdminDeleteBug(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !permission.UserHasPermission(player.UserIDString, AdminPerm)) return;
            
            var id = arg.GetInt(0, -1);
            if (id == -1) return;
            
            var report = _db.Reports.Find(r => r.Id == id);
            if (report != null)
            {
                _db.Reports.Remove(report);
                _dataChanged = true; // Optimized: batch save
                Reply(player, $"🗑️ Bug report #{id} deleted.");
                OpenBugAdminUI(player); // Refresh UI
            }
        }
        
        [ConsoleCommand("bugadmin.filter")]
        private void ConsoleAdminFilterBugs(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            var filter = arg.GetString(0, "all");
            // For now, just refresh - could implement filtering later
            OpenBugAdminUI(player);
        }
        
        [ConsoleCommand("bugadmin.refresh")]
        private void ConsoleAdminRefresh(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            OpenBugAdminUI(player);
        }
        
        [ConsoleCommand("bugadmin.close")]
        private void ConsoleAdminClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, "BugAdminUI"); } catch { }
        }
        
        [ConsoleCommand("bugadmin.toggle")]
        private void ConsoleAdminToggle(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            TogglePlugin(player);
            OpenBugAdminUI(player); // Refresh UI
        }
        
        // === MISSING CONSOLE COMMANDS FOR ADMIN UI (eldrunbug.admin.*) ===
        [ConsoleCommand("eldrunbug.admin.resolve")]
        private void ConsoleAdminUIResolve(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            var id = arg.GetInt(0, -1);
            if (id == -1) return;
            
            var report = _db.Reports.Find(r => r.Id == id);
            if (report != null)
            {
                report.Status = "resolved";
                report.ResolvedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                _dataChanged = true;
                Reply(player, $"Bug-Report #{id} marked as resolved.");
                
                // Send notification to reporter
                if (_config.EnableNotifications && _config.NotifyOnStatusChange)
                {
                    SendBugNotification(report.UserId, id, "status_change", "✅ Bug Resolved!", "Your bug report has been marked as resolved.");
                }
                
                OpenUI(player); // Refresh UI
            }
        }
        
        [ConsoleCommand("eldrunbug.admin.delete")]
        private void ConsoleAdminUIDelete(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null || !HasPermission(player, AdminPerm)) return;
            
            var id = arg.GetInt(0, -1);
            if (id == -1) return;
            
            var report = _db.Reports.Find(r => r.Id == id);
            if (report != null)
            {
                _db.Reports.Remove(report);
                _dataChanged = true;
                Reply(player, $"Bug-Report #{id} deleted.");
                OpenUI(player); // Refresh UI
            }
        }

        private void ShowBugDetailUI(BasePlayer player, BugReport report)
        {
            var container = new CuiElementContainer();
            
            // === DETAIL PANEL ===
            container.Add(new CuiPanel
            {
                Image = { Color = "0.05 0.08 0.12 0.98" },
                RectTransform = { AnchorMin = "0.2 0.2", AnchorMax = "0.8 0.8" },
                CursorEnabled = true
            }, "Overlay", "BugDetailUI");
            
            // === TITLE ===
            container.Add(new CuiLabel
            {
                Text = { Text = $"🐛 BUG REPORT #{report.Id}", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "0.80 0.92 1 1" },
                RectTransform = { AnchorMin = "0.1 0.9", AnchorMax = "0.9 0.98" }
            }, "BugDetailUI");
            
            // === DETAILS ===
            var details = new[]
            {
                $"👤 Player: {report.PlayerName} ({report.UserId})",
                $"📂 Category: {report.Category}",
                $"⚠️ Severity: {report.Severity}",
                $" Created: {report.CreatedAt:yyyy-MM-dd HH:mm}",
                $" Location: ({report.X:F0}, {report.Y:F0}, {report.Z:F0})",
                $"🌎 Zone: {report.Zone}",
                $" Status: {report.Status}"
            };
            
            float y = 0.8f;
            foreach (var detail in details)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = detail, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = "0.9 0.9 0.9 1" },
                    RectTransform = { AnchorMin = $"0.1 {y - 0.06f}", AnchorMax = $"0.9 {y}" }
                }, "BugDetailUI");
                y -= 0.08f;
            }
            
            // === VOTING SECTION ===
            int upvotes = report.UpVotes;
            int downvotes = report.DownVotes;
            bool hasVoted = report.UpVoters.Contains(player.userID) || report.DownVoters.Contains(player.userID);
            int playerVote = report.UpVoters.Contains(player.userID) ? 1 : (report.DownVoters.Contains(player.userID) ? -1 : 0);
            
            container.Add(new CuiLabel
            {
                Text = { Text = "👍 VOTING:", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.1 0.48", AnchorMax = "0.3 0.52" }
            }, "BugDetailUI");
            
            // Upvote Button
            string upvoteColor = playerVote == 1 ? "0.2 0.8 0.2 0.9" : "0.3 0.3 0.3 0.7";
            container.Add(new CuiButton
            {
                Button = { Color = upvoteColor, Command = $"bugreport.vote {report.Id} 1" },
                RectTransform = { AnchorMin = "0.32 0.48", AnchorMax = "0.42 0.52" },
                Text = { Text = $"👍 {upvotes}", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugDetailUI");
            
            // Downvote Button
            string downvoteColor = playerVote == -1 ? "0.8 0.2 0.2 0.9" : "0.3 0.3 0.3 0.7";
            container.Add(new CuiButton
            {
                Button = { Color = downvoteColor, Command = $"bugreport.vote {report.Id} -1" },
                RectTransform = { AnchorMin = "0.44 0.48", AnchorMax = "0.54 0.52" },
                Text = { Text = $"👎 {downvotes}", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugDetailUI");
            
            // === SCREENSHOTS SECTION ===
            if (report.Screenshots != null && report.Screenshots.Count > 0)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = $"📸 SCREENSHOTS ({report.Screenshots.Count}):", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.86 0.72 0.38 1" },
                    RectTransform = { AnchorMin = "0.56 0.48", AnchorMax = "0.9 0.52" }
                }, "BugDetailUI");
                
                // Show screenshot URLs (max 3)
                float screenshotY = 0.44f;
                for (int i = 0; i < Math.Min(3, report.Screenshots.Count); i++)
                {
                    container.Add(new CuiLabel
                    {
                        Text = { Text = $"🔗 {report.Screenshots[i]}", FontSize = 10, Align = TextAnchor.MiddleLeft, Color = "0.7 0.7 0.9 1" },
                        RectTransform = { AnchorMin = $"0.56 {screenshotY - 0.03f}", AnchorMax = $"0.9 {screenshotY}" }
                    }, "BugDetailUI");
                    screenshotY -= 0.04f;
                }
            }
            
            // === DESCRIPTION ===
            container.Add(new CuiLabel
            {
                Text = { Text = "📝 DESCRIPTION:", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.1 0.35", AnchorMax = "0.9 0.4" }
            }, "BugDetailUI");
            
            container.Add(new CuiLabel
            {
                Text = { Text = report.Description ?? "No description", FontSize = 11, Align = TextAnchor.UpperLeft, Color = "0.9 0.9 0.9 1" },
                RectTransform = { AnchorMin = "0.1 0.15", AnchorMax = "0.9 0.33" }
            }, "BugDetailUI");
            
            // === ACTION BUTTONS ===
            if (report.Status == "open")
            {
                container.Add(new CuiButton
                {
                    Button = { Color = "0.2 0.6 0.2 0.8", Command = $"bugadmin.resolve {report.Id}" },
                    RectTransform = { AnchorMin = "0.1 0.05", AnchorMax = "0.3 0.12" },
                    Text = { Text = " MARK AS RESOLVED", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
                }, "BugDetailUI");
            }
            
            container.Add(new CuiButton
            {
                Button = { Color = "0.6 0.2 0.2 0.8", Command = $"bugadmin.delete {report.Id}" },
                RectTransform = { AnchorMin = "0.35 0.05", AnchorMax = "0.55 0.12" },
                Text = { Text = "🗑️ DELETE", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugDetailUI");
            
            // Back Button
            container.Add(new CuiButton
            {
                Button = { Color = "0.3 0.3 0.3 0.8", Command = "bugdetail.back" },
                RectTransform = { AnchorMin = "0.7 0.05", AnchorMax = "0.9 0.12" },
                Text = { Text = "⬅️ BACK", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugDetailUI");
            
            // Close Button
            container.Add(new CuiButton
            {
                Button = { Color = "0.6 0.2 0.2 0.8", Command = "bugdetail.close" },
                RectTransform = { AnchorMin = "0.92 0.9", AnchorMax = "0.98 0.98" },
                Text = { Text = "✕", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, "BugDetailUI");
            
            CuiHelper.AddUi(player, container);
        }
        
        [ConsoleCommand("bugdetail.back")]
        private void ConsoleBugDetailBack(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, "BugDetailUI"); } catch { }
            OpenBugAdminUI(player);
        }
        
        [ConsoleCommand("bugdetail.close")]
        private void ConsoleBugDetailClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player();
            if (player == null) return;
            
            try { CuiHelper.DestroyUi(player, "BugDetailUI"); } catch { }
        }

        private Draft GetDraft(BasePlayer p)
        {
            if (!_drafts.TryGetValue(p.userID, out var d)) { d = new Draft(); _drafts[p.userID] = d; }
            return d;
        }

        private void Reply(BasePlayer p, string msg)
        {
            SendReply(p, $"{_config?.ChatPrefix ?? "[Eldrun]"} {msg}");
        }
        
        private string T(string key, Dictionary<string,string> vars, string fallback)
        {
            // Simplified localization - just use fallback with variable replacement
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

        private string Truncate(string s, int max)
        {
            if (string.IsNullOrEmpty(s)) return s;
            return s.Length <= max ? s : s.Substring(0, max);
        }

        // === PUBLIC API FOR OTHER PLUGINS ===
        public bool Eldrun_GetEnabled() => _config?.Enabled ?? true;
        public void Eldrun_SetEnabled(bool enabled)
        {
            if (_config == null) return;
            _config.Enabled = enabled;
        }

        public Dictionary<string, object> Eldrun_GetStats()
        {
            return new Dictionary<string, object>
            {
                ["TotalReports"] = _db.Stats.TotalReports,
                ["OpenReports"] = _db.Stats.OpenReports,
                ["ResolvedReports"] = _db.Stats.ResolvedReports,
                ["RejectedReports"] = _db.Stats.RejectedReports,
                ["TotalRewardsGiven"] = _db.Stats.TotalRewardsGiven,
                ["TotalXPRewarded"] = _db.Stats.TotalXPRewarded,
                ["TotalDragonsRewarded"] = _db.Stats.TotalDragonsRewarded,
                ["TopReporter"] = _db.Stats.MostActiveReporter,
                ["TopCategory"] = _db.Stats.TopCategory
            };
        }

        public bool Eldrun_CreateBugReport(ulong playerId, string category, string severity, string description)
        {
            var player = BasePlayer.FindByID(playerId);
            if (player == null || !_config.Enabled) return false;

            if (!CheckRateLimit(player)) return false;

            var pos = player.transform?.position ?? Vector3.zero;
            var zone = GetPlayerZone(player, pos);

            var report = new BugReport
            {
                Id = _db.NextId++,
                UserId = playerId,
                PlayerName = player.displayName,
                Category = category,
                Severity = severity,
                Description = description,
                Zone = zone,
                X = pos.x, Y = pos.y, Z = pos.z,
                CreatedAt = DateTime.UtcNow,
                Status = "open",
                PluginVersion = Version.ToString(),
                ServerVersion = ConVar.Server.hostname
            };

            CaptureDetailedLocation(player, report);
            _db.Reports.Add(report);
            _dataChanged = true;

            // Update player stats
            if (_db.PlayerStats.TryGetValue(playerId, out var playerInfo))
            {
                playerInfo.TotalReports++;
                playerInfo.LastReport = DateTime.UtcNow;
            }
            TryWebhook(report);

            return true;
        }

        public List<Dictionary<string, object>> Eldrun_GetPlayerReports(ulong playerId)
        {
            var reports = new List<Dictionary<string, object>>();
            foreach (var report in _db.Reports)
            {
                if (report.UserId != playerId) continue;
                reports.Add(new Dictionary<string, object>
                {
                    ["Id"] = report.Id,
                    ["Category"] = report.Category,
                    ["Severity"] = report.Severity,
                    ["Status"] = report.Status,
                    ["Description"] = report.Description,
                    ["CreatedAt"] = report.CreatedAt,
                    ["ResolvedAt"] = report.ResolvedAt,
                    ["Zone"] = report.Zone,
                    ["RewardGiven"] = report.RewardGiven
                });
            }
            return reports;
        }

        public int Eldrun_GetPlayerReportCount(ulong playerId)
        {
            int count = 0;
            foreach (var report in _db.Reports)
            {
                if (report.UserId == playerId) count++;
            }
            return count;
        }

        public bool Eldrun_ResolveReport(int reportId, string adminNote = "")
        {
            var report = _db.Reports.Find(r => r.Id == reportId);
            if (report == null) return false;

            report.Status = "resolved";
            report.ResolvedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;
            report.Resolution = adminNote;
            report.ResolutionType = "fixed";

            _dataChanged = true;
            TryWebhook(report, "resolved");

            return true;
        }

        // === NEUE ADMIN-FUNKTIONEN ===
        private void ResolveBugReport(BasePlayer admin, int id, string note)
        {
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(admin, "Bug report not found.");
                return;
            }

            report.Status = "resolved";
            report.ResolvedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;
            report.Resolution = note;
            report.ResolutionType = "fixed";

            if (!string.IsNullOrEmpty(note))
            {
                report.Comments.Add(new BugComment
                {
                    UserId = admin.userID,
                    UserName = admin.displayName,
                    Comment = $"[RESOLVED] {note}",
                    IsAdmin = true,
                    Timestamp = DateTime.UtcNow
                });
            }

            // Belohnung vergeben wenn aktiviert
            if (_config.RewardOnFix && !report.RewardGiven)
            {
                GiveBugReward(report);
            }

            _dataChanged = true;
            Reply(admin, $"Bug report #{id} marked as resolved.");

            // Notification senden
            if (_config.EnableNotifications && _config.NotifyOnStatusChange)
            {
                string notificationMsg = $"Your bug report was marked as resolved!";
                if (!string.IsNullOrEmpty(note))
                {
                    notificationMsg += $" Admin note: {note}";
                }
                SendBugNotification(report.UserId, id, "status_change", "✅ Bug Resolved!", notificationMsg);
            }

            // Benachrichtigung an Reporter (Legacy - wird ersetzt durch Notification System)
            var reporter = BasePlayer.FindByID(report.UserId);
            if (reporter != null && reporter.IsConnected && !_config.EnableNotifications)
            {
                Reply(reporter, $" Your bug report #{id} was marked as resolved! {(string.IsNullOrEmpty(note) ? "" : $"Note: {note}")}");
            }

            // Webhook Benachrichtigung
            TryWebhook(report, "resolved");
        }

        private void RejectBugReport(BasePlayer admin, int id, string reason)
        {
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(admin, "Bug-Report nicht gefunden.");
                return;
            }

            report.Status = "rejected";
            report.UpdatedAt = DateTime.UtcNow;
            report.ResolutionType = "wont_fix";
            report.Resolution = reason;

            if (!string.IsNullOrEmpty(reason))
            {
                report.Comments.Add(new BugComment
                {
                    UserId = admin.userID,
                    UserName = admin.displayName,
                    Comment = $"[ABGELEHNT] {reason}",
                    IsAdmin = true,
                    Timestamp = DateTime.UtcNow
                });
            }

            _dataChanged = true;
            Reply(admin, $"Bug report #{id} rejected.");

            // Benachrichtigung an Reporter
            var reporter = BasePlayer.FindByID(report.UserId);
            if (reporter != null && reporter.IsConnected)
            {
                Reply(reporter, $" Your bug report #{id} was rejected. {(string.IsNullOrEmpty(reason) ? "" : $"Reason: {reason}")}");
            }

            // Webhook Benachrichtigung
            TryWebhook(report, "rejected");
        }

        private void AssignBugReport(BasePlayer admin, int id, string assignTarget)
        {
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(admin, "Bug-Report nicht gefunden.");
                return;
            }

            // Suche nach Admin (Name oder ID)
            BasePlayer targetAdmin = null;
            if (ulong.TryParse(assignTarget, out ulong targetId))
            {
                targetAdmin = BasePlayer.FindByID(targetId);
            }
            else
            {
                foreach (var p in BasePlayer.activePlayerList)
                {
                    if (p.displayName.ToLower().Contains(assignTarget.ToLower()))
                    {
                        targetAdmin = p;
                        break;
                    }
                }
            }

            if (targetAdmin == null)
            {
                Reply(admin, "Target admin not found.");
                return;
            }

            if (!HasPermission(targetAdmin, AdminPerm))
            {
                Reply(admin, "Target player does not have admin permission.");
                return;
            }

            report.AssignedAdmin = targetAdmin.userID;
            report.AssignedAdminName = targetAdmin.displayName;
            report.UpdatedAt = DateTime.UtcNow;

            report.Comments.Add(new BugComment
            {
                UserId = admin.userID,
                UserName = admin.displayName,
                Comment = $"Bug report assigned to {targetAdmin.displayName}",
                IsAdmin = true,
                IsSystem = true,
                Timestamp = DateTime.UtcNow
            });

            _dataChanged = true;
            Reply(admin, $"Bug report #{id} assigned to {targetAdmin.displayName}.");

            // Benachrichtigung an zugewiesenen Admin
            if (targetAdmin.IsConnected)
            {
                Reply(targetAdmin, $" You have been assigned bug report #{id}: {report.Category} - {report.Title}");
            }
        }

        private void AddCommentToBugReport(BasePlayer admin, int id, string comment)
        {
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(admin, "Bug-Report nicht gefunden.");
                return;
            }

            report.Comments.Add(new BugComment
            {
                UserId = admin.userID,
                UserName = admin.displayName,
                Comment = comment,
                IsAdmin = true,
                Timestamp = DateTime.UtcNow
            });

            report.UpdatedAt = DateTime.UtcNow;
            _dataChanged = true;

            Reply(admin, $"💬 Comment added to bug report #{id}.");

            // Benachrichtigung an Reporter
            var reporter = BasePlayer.FindByID(report.UserId);
            if (reporter != null && reporter.IsConnected)
            {
                Reply(reporter, $"💬 New comment on your bug report #{id}: {comment}");
            }

            // Webhook Benachrichtigung
            TryWebhook(report, "commented");
        }

        // OLD METHOD REMOVED - Now using GiveBugReward() with voting bonus

        private void DeleteBugReport(BasePlayer admin, int id)
        {
            var report = _db.Reports.Find(r => r.Id == id);
            if (report == null)
            {
                Reply(admin, "Bug-Report nicht gefunden.");
                return;
            }

            _db.Reports.Remove(report);
            _dataChanged = true;
            Reply(admin, $"🗑️ Bug report #{id} deleted.");
        }

        private void TogglePlugin(BasePlayer admin)
        {
            _config.Enabled = !_config.Enabled;
            Reply(admin, $"🔧 Plugin {(_config.Enabled ? "enabled" : "disabled")}." );
        }

        #region Voting & Rewards System

        // === VOTING METHODS ===
        private void VoteBug(BasePlayer player, int bugId, bool isUpvote)
        {
            var bug = GetBugById(bugId);
            if (bug == null)
            {
                SendLocalizedReply(player, "bugreport.bug_nicht_gefunden_");
                return;
            }

            // Prevent voting on own bugs
            if (bug.UserId == player.userID)
            {
                SendReply(player, "❌ You cannot vote on your own bug report!");
                return;
            }

            // Check if already voted
            bool hadUpvote = bug.UpVoters.Contains(player.userID);
            bool hadDownvote = bug.DownVoters.Contains(player.userID);

            if (isUpvote)
            {
                if (hadUpvote)
                {
                    // Remove upvote
                    bug.UpVoters.Remove(player.userID);
                    bug.UpVotes--;
                    SendReply(player, "⬆️ Upvote removed.");
                }
                else
                {
                    // Add upvote (remove downvote if exists)
                    if (hadDownvote)
                    {
                        bug.DownVoters.Remove(player.userID);
                        bug.DownVotes--;
                    }
                    bug.UpVoters.Add(player.userID);
                    bug.UpVotes++;
                    SendReply(player, "⬆️ Upvote added!");

                    // Give small reward to bug reporter per upvote
                    if (_config.RewardOnUpvotes && bug.UpVotes % 5 == 0)
                    {
                        GiveUpvoteReward(bug);
                    }
                }
            }
            else
            {
                if (hadDownvote)
                {
                    // Remove downvote
                    bug.DownVoters.Remove(player.userID);
                    bug.DownVotes--;
                    SendReply(player, "⬇️ Downvote removed.");
                }
                else
                {
                    // Add downvote (remove upvote if exists)
                    if (hadUpvote)
                    {
                        bug.UpVoters.Remove(player.userID);
                        bug.UpVotes--;
                    }
                    bug.DownVoters.Add(player.userID);
                    bug.DownVotes++;
                    SendReply(player, "⬇️ Downvote added.");
                }
            }

            // Update vote score
            bug.VoteScore = bug.UpVotes - bug.DownVotes;
            bug.UpdatedAt = DateTime.UtcNow;
            _dataChanged = true;

            // Refresh UI if open
            OpenUI(player);
        }

        private void GiveUpvoteReward(BugReport bug)
        {
            if (!_config.GiveXPRewards && !_config.GiveDragonRewards) return;

            int xpReward = _config.XPPerUpvote * 5; // Bonus every 5 upvotes
            int dragonsReward = _config.DragonsPerUpvote * 5;

            if (_config.GiveXPRewards && EldrunXP != null)
            {
                EldrunXP?.Call("AddXP", bug.UserId, xpReward, "bug_upvotes");
            }

            if (_config.GiveDragonRewards && EldrunMultiShop != null)
            {
                EldrunMultiShop?.Call("API_AddCurrency", bug.UserId, "Dragons", (double)dragonsReward);
            }

            // Send notification
            if (_config.EnableNotifications && _config.NotifyOnVoteMilestone)
            {
                string milestoneMsg = $"Your bug report reached {bug.UpVotes} upvotes! Bonus: +{xpReward} XP, +{dragonsReward} 🐲";
                SendBugNotification(bug.UserId, bug.Id, "vote_milestone", $"🎉 {bug.UpVotes} upvotes!", milestoneMsg);
            }
            
            // Legacy notification
            var reporter = BasePlayer.FindByID(bug.UserId);
            if (reporter != null && reporter.IsConnected && !_config.EnableNotifications)
            {
                SendReply(reporter, $"🎉 Your bug #{bug.Id} reached 5+ upvotes! Reward: +{xpReward} XP, +{dragonsReward} 🐲");
            }
        }

        // === REWARD METHODS ===
        private void GiveBugReward(BugReport bug)
        {
            if (!_config.RewardOnFix || bug.RewardGiven) return;
            if (!_config.GiveXPRewards && !_config.GiveDragonRewards) return;

            // Calculate reward from severity config (fallback to base if missing)
            int xpReward;
            int dragonsReward;
            var sevKey = (bug.Severity ?? string.Empty).ToLowerInvariant();
            if (sevKey == "med") sevKey = "medium";
            if (_config.SeverityLevels.TryGetValue(sevKey, out var sevCfg))
            {
                xpReward = sevCfg.RewardXP > 0 ? sevCfg.RewardXP : _config.BaseXPReward;
                dragonsReward = sevCfg.RewardDragons > 0 ? sevCfg.RewardDragons : _config.BaseDragonReward;
            }
            else
            {
                xpReward = _config.BaseXPReward;
                dragonsReward = _config.BaseDragonReward;
            }

            // Apply vote multiplier (bonus per 5 upvotes)
            int upvoteGroups = Math.Max(0, bug.UpVotes / 5);
            if (upvoteGroups > 0)
            {
                float voteBonus = 1f + upvoteGroups * (_config.VoteMultiplier - 1f);
                xpReward = (int)(xpReward * voteBonus);
                dragonsReward = (int)(dragonsReward * voteBonus);
            }

            // Cap rewards
            xpReward = Math.Min(xpReward, _config.MaxRewardXP);
            dragonsReward = Math.Min(dragonsReward, _config.MaxRewardDragons);

            // Give rewards
            if (_config.GiveXPRewards && EldrunXP != null)
            {
                EldrunXP?.Call("AddXP", bug.UserId, xpReward, "bug_fixed");
            }

            if (_config.GiveDragonRewards && EldrunMultiShop != null)
            {
                EldrunMultiShop?.Call("API_AddCurrency", bug.UserId, "Dragons", (double)dragonsReward);
            }

            // Mark as rewarded
            bug.RewardGiven = true;
            bug.RewardXP = xpReward;
            bug.RewardDragons = dragonsReward;
            bug.RewardGivenAt = DateTime.UtcNow;
            _dataChanged = true;

            // Notify player via Notification System
            if (_config.EnableNotifications && _config.NotifyOnReward)
            {
                string rewardMsg = $"You received +{xpReward} XP and +{dragonsReward} 🐲 Dragons for your confirmed bug report!";
                SendBugNotification(bug.UserId, bug.Id, "reward", "🎁 Reward received!", rewardMsg, new Dictionary<string, string> { { "xp", xpReward.ToString() }, { "dragons", dragonsReward.ToString() } });
            }
            
            // Legacy notification
            var reporter = BasePlayer.FindByID(bug.UserId);
            if (reporter != null && reporter.IsConnected && !_config.EnableNotifications)
            {
                SendReply(reporter, $"🎉 Your bug #{bug.Id} has been fixed! Reward: +{xpReward} XP, +{dragonsReward} 🐲");
            }

            // Update player stats
            if (_db.PlayerStats.ContainsKey(bug.UserId))
            {
                _db.PlayerStats[bug.UserId].RewardsReceived++;
                _db.PlayerStats[bug.UserId].LastReward = DateTime.UtcNow;
            }

            // Update global stats
            _db.Stats.TotalRewardsGiven++;
            _db.Stats.TotalXPRewarded += xpReward;
            _db.Stats.TotalDragonsRewarded += dragonsReward;

            Puts($"[BugRewards] Gave {bug.PlayerName} {xpReward} XP + {dragonsReward} Dragons for bug #{bug.Id}");
        }

        private BugReport GetBugById(int id)
        {
            foreach (var bug in _db.Reports)
            {
                if (bug.Id == id) return bug;
            }
            return null;
        }

        #endregion

        #region Notification System

        private void SendBugNotification(ulong playerId, int bugId, string type, string title, string message, Dictionary<string, string> data = null)
        {
            if (!_db.PlayerNotifications.ContainsKey(playerId))
            {
                _db.PlayerNotifications[playerId] = new List<BugNotification>();
            }

            var notification = new BugNotification
            {
                Id = _db.NextNotificationId++,
                BugId = bugId,
                PlayerId = playerId,
                Type = type,
                Title = title,
                Message = message,
                Timestamp = DateTime.UtcNow,
                Data = data ?? new Dictionary<string, string>()
            };

            _db.PlayerNotifications[playerId].Add(notification);
            _dataChanged = true;

            // Send instant notification if player is online
            var player = BasePlayer.FindByID(playerId);
            if (player != null && player.IsConnected)
            {
                SendNotificationToPlayer(player, notification);
            }

            // Cleanup old notifications (keep last 50 per player)
            if (_db.PlayerNotifications[playerId].Count > 50)
            {
                _db.PlayerNotifications[playerId].RemoveRange(0, _db.PlayerNotifications[playerId].Count - 50);
            }
        }

        private void SendNotificationToPlayer(BasePlayer player, BugNotification notification)
        {
            string icon = GetNotificationIcon(notification.Type);
            string colorCode = GetNotificationColor(notification.Type);
            
            SendReply(player, $"<color={colorCode}>{icon} {notification.Title}</color>");
            SendReply(player, $"  {notification.Message}");
            
            // Play sound effect
            if (_config.EnableNotificationSounds)
            {
                Effect.server.Run("assets/prefabs/deployable/research table/effects/research-success.prefab", player.transform.position);
            }
        }

        private string GetNotificationIcon(string type)
        {
            switch (type)
            {
                case "status_change": return "🔄";
                case "comment": return "💬";
                case "reward": return "🎁";
                case "vote_milestone": return "🎉";
                case "admin_note": return "📝";
                default: return "🔔";
            }
        }

        private string GetNotificationColor(string type)
        {
            switch (type)
            {
                case "status_change": return "#4CAF50";
                case "comment": return "#2196F3";
                case "reward": return "#FFC107";
                case "vote_milestone": return "#9C27B0";
                case "admin_note": return "#FF5722";
                default: return "#FFFFFF";
            }
        }

        private void SendPendingNotifications(BasePlayer player)
        {
            if (!_db.PlayerNotifications.ContainsKey(player.userID)) return;

            var unread = _db.PlayerNotifications[player.userID].FindAll(n => !n.IsRead);
            if (unread.Count == 0) return;

            SendReply(player, $"🔔 <color=#FFC107>You have {unread.Count} new bug report notifications!</color>");
            SendReply(player, "  Use '/bug notifications' to view them.");
        }

        private int GetUnreadNotificationCount(ulong playerId)
        {
            if (!_db.PlayerNotifications.ContainsKey(playerId)) return 0;
            return _db.PlayerNotifications[playerId].FindAll(n => !n.IsRead).Count;
        }

        private void MarkNotificationsAsRead(ulong playerId)
        {
            if (!_db.PlayerNotifications.ContainsKey(playerId)) return;

            foreach (var notification in _db.PlayerNotifications[playerId])
            {
                notification.IsRead = true;
            }
            _dataChanged = true;
        }

        private void ShowNotifications(BasePlayer player, string filter = "all")
        {
            if (!_db.PlayerNotifications.ContainsKey(player.userID))
            {
                SendReply(player, "🔔 You have no notifications.");
                return;
            }

            var notifications = _db.PlayerNotifications[player.userID];
            List<BugNotification> filtered;

            // Filter by type
            if (filter == "unread")
            {
                filtered = notifications.FindAll(n => !n.IsRead);
            }
            else if (filter == "read")
            {
                filtered = notifications.FindAll(n => n.IsRead);
            }
            else
            {
                filtered = new List<BugNotification>(notifications);
            }

            if (filtered.Count == 0)
            {
                SendReply(player, $"🔔 No {filter} notifications found.");
                return;
            }

            // Sort by timestamp (newest first)
            filtered.Sort((a, b) => b.Timestamp.CompareTo(a.Timestamp));

            // Show header
            SendReply(player, $"<color=#FFC107>═══ BUG-REPORT BENACHRICHTIGUNGEN ({filtered.Count}) ═══</color>");

            // Show last 10 notifications
            int shown = 0;
            foreach (var notif in filtered)
            {
                if (shown >= 10) break;

                string icon = GetNotificationIcon(notif.Type);
                string readIcon = notif.IsRead ? "" : "🔴";
                string timeAgo = GetTimeAgo(notif.Timestamp);
                string colorCode = GetNotificationColor(notif.Type);

                SendReply(player, $"{readIcon} <color={colorCode}>{icon} {notif.Title}</color> <color=#888888>({timeAgo})</color>");
                SendReply(player, $"  {notif.Message}");

                shown++;
            }

            // Show footer
            if (filtered.Count > 10)
            {
                SendReply(player, $"<color=#888888>... and {filtered.Count - 10} more notifications</color>");
            }

            SendReply(player, "<color=#888888>Use: /bug notifications [all|unread|read]</color>");

            // Mark as read
            MarkNotificationsAsRead(player.userID);
        }

        private string GetTimeAgo(DateTime time)
        {
            var span = DateTime.UtcNow - time;
            if (span.TotalMinutes < 1) return "just now";
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} min ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours} h ago";
            if (span.TotalDays < 7) return $"{(int)span.TotalDays} d ago";
            return time.ToString("dd.MM.yyyy");
        }

        #endregion

        private void UpdateStatistics()
        {
            _db.Stats.TotalReports = _db.Reports.Count;
            
            int openCount = 0, resolvedCount = 0, rejectedCount = 0;
            foreach (var r in _db.Reports)
            {
                if (r.Status == "open") openCount++;
                else if (r.Status == "resolved") resolvedCount++;
                else if (r.Status == "rejected") rejectedCount++;
            }
            _db.Stats.OpenReports = openCount;
            _db.Stats.ResolvedReports = resolvedCount;
            _db.Stats.RejectedReports = rejectedCount;

            // Kategorie-Statistiken
            _db.Stats.CategoryStats.Clear();
            foreach (var report in _db.Reports)
            {
                if (_db.Stats.CategoryStats.ContainsKey(report.Category))
                    _db.Stats.CategoryStats[report.Category]++;
                else
                    _db.Stats.CategoryStats[report.Category] = 1;
            }

            // Schweregrad-Statistiken
            _db.Stats.SeverityStats.Clear();
            foreach (var report in _db.Reports)
            {
                if (_db.Stats.SeverityStats.ContainsKey(report.Severity))
                    _db.Stats.SeverityStats[report.Severity]++;
                else
                    _db.Stats.SeverityStats[report.Severity] = 1;
            }

            // Top-Reporter finden
            var playerCounts = new Dictionary<string, int>();
            foreach (var report in _db.Reports)
            {
                if (playerCounts.ContainsKey(report.PlayerName))
                    playerCounts[report.PlayerName]++;
                else
                    playerCounts[report.PlayerName] = 1;
            }

            if (playerCounts.Count > 0)
            {
                var topReporter = new KeyValuePair<string, int>("", 0);
                foreach (var kv in playerCounts)
                {
                    if (kv.Value > topReporter.Value)
                        topReporter = kv;
                }
                _db.Stats.MostActiveReporter = $"{topReporter.Key} ({topReporter.Value})";
            }

            // Top-Kategorie finden
            if (_db.Stats.CategoryStats.Count > 0)
            {
                var topCategory = new KeyValuePair<string, int>("", 0);
                foreach (var kv in _db.Stats.CategoryStats)
                {
                    if (kv.Value > topCategory.Value)
                        topCategory = kv;
                }
                _db.Stats.TopCategory = $"{topCategory.Key} ({topCategory.Value})";
            }
        }

        private string GetStatisticsString()
        {
            return $" BUG REPORT STATISTICS:\n" +
                   $" Total: {_db.Stats.TotalReports}\n" +
                   $" Open: {_db.Stats.OpenReports}\n" +
                   $"├─ Resolved: {_db.Stats.ResolvedReports}\n" +
                   $"├─ Rejected: {_db.Stats.RejectedReports}\n" +
                   $"├─ Rewards given: {_db.Stats.TotalRewardsGiven}\n" +
                   $"├─ Dragons rewarded: {_db.Stats.TotalDragonsRewarded}\n" +
                   $"├─ XP rewarded: {_db.Stats.TotalXPRewarded}\n" +
                   $" Top reporter: {_db.Stats.MostActiveReporter}\n" +
                   $" Top category: {_db.Stats.TopCategory}";
        }

        // === RATE LIMITING AND VALIDATION ===
        private bool CheckRateLimit(BasePlayer player)
        {
            if (!_db.PlayerStats.TryGetValue(player.userID, out var playerInfo))
            {
                playerInfo = new PlayerBugInfo
                {
                    UserId = player.userID,
                    PlayerName = player.displayName
                };
                _db.PlayerStats[player.userID] = playerInfo;
            }

            // Cooldown check
            var timeSinceLastReport = DateTime.UtcNow - playerInfo.LastReport;
            if (timeSinceLastReport.TotalMinutes < _config.CooldownMinutes && !HasPermission(player, AdminPerm))
            {
                return false;
            }

            // Daily limit check
            var today = DateTime.UtcNow.Date;
            int todayReports = 0;
            foreach (var r in _db.Reports)
            {
                if (r.UserId == player.userID && r.CreatedAt.Date == today) todayReports++;
            }
            if (todayReports >= _config.MaxReportsPerDay && !HasPermission(player, AdminPerm))
            {
                Reply(player, $"You have already submitted {_config.MaxReportsPerDay} bug reports today. Daily limit reached.");
                return false;
            }

            // Total reports limit check
            int totalPlayerReports = 0;
            foreach (var r in _db.Reports)
            {
                if (r.UserId == player.userID) totalPlayerReports++;
            }
            if (totalPlayerReports >= _config.MaxReportsPerPlayer && !HasPermission(player, AdminPerm))
            {
                Reply(player, $"You have already submitted {_config.MaxReportsPerPlayer} bug reports. Total limit reached.");
                return false;
            }

            return true;
        }
        
        // === DUPLICATE DETECTION METHODS ===
        
        private List<SimilarityResult> FindSimilarReports(string title, string description, string category, ulong reporterId = 0)
        {
            if (!_config.EnableDuplicateDetection || !_config.DuplicateDetection.Enabled)
                return new List<SimilarityResult>();
            
            // Validate minimum length
            if (title.Length < _config.DuplicateDetection.MinTitleLength || 
                description.Length < _config.DuplicateDetection.MinDescriptionLength)
                return new List<SimilarityResult>();
            
            var results = new List<SimilarityResult>();
            var cutoffDate = DateTime.UtcNow.AddDays(-_config.DuplicateDetection.DaysToCheckBack);
            
            foreach (var report in _db.Reports)
            {
                // Skip resolved if configured
                if (_config.DuplicateDetection.IgnoreResolvedReports && 
                    (report.Status == "resolved" || report.Status == "rejected"))
                    continue;
                
                // Skip old reports
                if (report.CreatedAt < cutoffDate)
                    continue;
                
                // Calculate similarity
                float similarity = CalculateSimilarity(title, description, category, reporterId, report);
                
                if (similarity >= _config.DuplicateDetection.MinimumSimilarity)
                {
                    results.Add(new SimilarityResult
                    {
                        ReportId = report.Id,
                        SimilarityScore = similarity,
                        Title = report.Title,
                        Status = report.Status,
                        CreatedDate = report.CreatedAt,
                        UpVotes = report.UpVotes
                    });
                }
            }
            
            // Sort by similarity (highest first) and limit results
            results.Sort((a, b) => b.SimilarityScore.CompareTo(a.SimilarityScore));
            
            if (results.Count > _config.DuplicateDetection.MaxDuplicatesToShow)
            {
                results.RemoveRange(_config.DuplicateDetection.MaxDuplicatesToShow, 
                                   results.Count - _config.DuplicateDetection.MaxDuplicatesToShow);
            }
            
            return results;
        }
        
        private float CalculateSimilarity(string title1, string desc1, string cat1, ulong reporter1, BugReport report2)
        {
            // Title similarity (Levenshtein-based)
            float titleSim = LevenshteinSimilarity(title1.ToLower(), report2.Title.ToLower());
            
            // Description similarity (Word overlap)
            float descSim = WordOverlapSimilarity(desc1.ToLower(), report2.Description.ToLower());
            
            // Category bonus
            float catBonus = cat1.Equals(report2.Category, StringComparison.OrdinalIgnoreCase) ? 1.0f : 0.0f;
            
            // Time proximity (newer = more relevant)
            float timeSim = CalculateTimeProximity(DateTime.UtcNow, report2.CreatedAt);
            
            // Reporter check (same reporter = more likely duplicate)
            float reporterSim = (reporter1 != 0 && reporter1 == report2.UserId) ? 1.0f : 0.0f;
            
            // Weighted score
            return (titleSim * _config.DuplicateDetection.TitleWeight) +
                   (descSim * _config.DuplicateDetection.DescriptionWeight) +
                   (catBonus * _config.DuplicateDetection.CategoryWeight) +
                   (timeSim * _config.DuplicateDetection.TimeWeight) +
                   (reporterSim * _config.DuplicateDetection.ReporterWeight);
        }
        
        private float LevenshteinSimilarity(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0f;
            
            int distance = LevenshteinDistance(s1, s2);
            int maxLength = Math.Max(s1.Length, s2.Length);
            
            return maxLength > 0 ? 1.0f - ((float)distance / maxLength) : 0f;
        }
        
        private int LevenshteinDistance(string s1, string s2)
        {
            int len1 = s1.Length;
            int len2 = s2.Length;
            
            if (len1 == 0) return len2;
            if (len2 == 0) return len1;
            
            int[,] d = new int[len1 + 1, len2 + 1];
            
            for (int i = 0; i <= len1; i++) d[i, 0] = i;
            for (int j = 0; j <= len2; j++) d[0, j] = j;
            
            for (int i = 1; i <= len1; i++)
            {
                for (int j = 1; j <= len2; j++)
                {
                    int cost = (s2[j - 1] == s1[i - 1]) ? 0 : 1;
                    d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
                }
            }
            
            return d[len1, len2];
        }
        
        private float WordOverlapSimilarity(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0f;
            
            // Split and clean words
            var words1 = new HashSet<string>(s1.Split(new[] { ' ', ',', '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries));
            var words2 = new HashSet<string>(s2.Split(new[] { ' ', ',', '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries));
            
            if (words1.Count == 0 || words2.Count == 0)
                return 0f;
            
            // Calculate overlap
            int overlap = 0;
            foreach (var word in words1)
            {
                if (words2.Contains(word))
                    overlap++;
            }
            
            // Union size
            var union = new HashSet<string>(words1);
            foreach (var word in words2)
                union.Add(word);
            
            return union.Count > 0 ? (float)overlap / union.Count : 0f;
        }
        
        private float CalculateTimeProximity(DateTime date1, DateTime date2)
        {
            double daysDiff = Math.Abs((date1 - date2).TotalDays);
            
            // Closer in time = higher score
            // Max 1.0 for same day, decays over 30 days
            if (daysDiff < 1) return 1.0f;
            if (daysDiff > 30) return 0f;
            
            return 1.0f - (float)(daysDiff / 30.0);
        }
        
        private void ShowDuplicateWarning(BasePlayer player, List<SimilarityResult> similarReports)
        {
            Reply(player, " POTENTIAL DUPLICATES FOUND");
            Reply(player, "━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            int count = 0;
            foreach (var result in similarReports)
            {
                count++;
                string statusColor = result.Status == "resolved" ? "00FF00" : result.Status == "rejected" ? "FF0000" : "FFA500";
                int percentage = (int)(result.SimilarityScore * 100);
                
                string colorCode = percentage >= 90 ? "FF0000" : percentage >= 80 ? "FFA500" : "FFFF00";
                Reply(player, $"<color=#{colorCode}>[#{result.ReportId}] {result.Title}</color>");
                Reply(player, $"  <color={statusColor}>{result.Status}</color> | Similarity: {percentage}% | Votes: {result.UpVotes}");
                Reply(player, $"  Created: {result.CreatedDate.ToShortDateString()}");
                
                if (count >= _config.DuplicateDetection.MaxDuplicatesToShow)
                    break;
            }
            
            Reply(player, "━━━━━━━━━━━━━━━━━━━━━━━━━");
            Reply(player, "Use '/bugreport view <id>' to see details");
            
            if (_config.DuplicateDetection.AllowForceSubmit)
            {
                Reply(player, "Use '/bugreport submit force' to submit anyway");
            }
        }
        
        private void MarkAsDuplicate(BasePlayer admin, int duplicateId, int originalId, string reason = "")
        {
            var duplicateReport = _db.Reports.Find(r => r.Id == duplicateId);
            var originalReport = _db.Reports.Find(r => r.Id == originalId);
            
            if (duplicateReport == null || originalReport == null)
            {
                Reply(admin, " Report not found!");
                return;
            }
            
            // Update duplicate report status
            duplicateReport.Status = "duplicate";
            duplicateReport.Resolution = $"Duplicate of #{originalId}";
            duplicateReport.ResolutionType = "duplicate";
            duplicateReport.ResolvedAt = DateTime.UtcNow;
            duplicateReport.AdminNote = string.IsNullOrEmpty(reason) ? $"Marked as duplicate of #{originalId}" : reason;
            
            // Create or update duplicate link
            if (!_db.DuplicateLinks.ContainsKey(originalId))
            {
                _db.DuplicateLinks[originalId] = new DuplicateLink
                {
                    OriginalReportId = originalId,
                    LinkedBy = admin.userID,
                    Reason = reason
                };
            }
            
            _db.DuplicateLinks[originalId].DuplicateIds.Add(duplicateId);
            
            // Update stats
            _db.Stats.DuplicatesDetected++;
            _dataChanged = true;
            
            Reply(admin, $" Report #{duplicateId} marked as duplicate of #{originalId}");
            
            // Notify reporter
            var reporterPlayer = BasePlayer.FindByID(duplicateReport.UserId);
            if (reporterPlayer != null && reporterPlayer.IsConnected)
            {
                Reply(reporterPlayer, $"Your bug report #{duplicateId} was marked as a duplicate of #{originalId}");
            }
        }
        
        private void ShowSimilarReportsForId(BasePlayer admin, int reportId)
        {
            var report = _db.Reports.Find(r => r.Id == reportId);
            if (report == null)
            {
                Reply(admin, " Report #{reportId} not found!");
                return;
            }
            
            Reply(admin, $" Finding similar reports to #{reportId}: {report.Title}");
            
            var similarReports = FindSimilarReports(report.Title, report.Description, report.Category, report.UserId);
            
            if (similarReports.Count == 0)
            {
                Reply(admin, " No similar reports found.");
                return;
            }
            
            Reply(admin, "━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            foreach (var result in similarReports)
            {
                int percentage = (int)(result.SimilarityScore * 100);
                
                Reply(admin, $"[#{result.ReportId}] {result.Title}");
                Reply(admin, $"  Similarity: {percentage}% | Status: {result.Status} | Votes: {result.UpVotes}");
            }
            
            Reply(admin, "━━━━━━━━━━━━━━━━━━━━━━━━━");
            Reply(admin, "Use /bugadmin duplicate <dup_id> {reportId} to mark as duplicate");
        }
        
        private void ShowDuplicateStats(BasePlayer admin)
        {
            Reply(admin, " === DUPLICATE DETECTION STATISTICS ===");
            Reply(admin, $"Total Duplicates Detected: {_db.Stats.DuplicatesDetected}");
            Reply(admin, $"Duplicates Prevented: {_db.Stats.DuplicatesPrevented}");
            Reply(admin, $"Duplicates Merged: {_db.Stats.DuplicatesMerged}");
            
            if (_db.DuplicateLinks.Count > 0)
            {
                Reply(admin, "\n Duplicate Links:");
                
                int count = 0;
                foreach (var link in _db.DuplicateLinks.Values)
                {
                    if (count >= 10) break; // Show max 10
                    
                    var originalReport = _db.Reports.Find(r => r.Id == link.OriginalReportId);
                    if (originalReport != null)
                    {
                        Reply(admin, $"[#{link.OriginalReportId}] {originalReport.Title}");
                        var duplicateList = new List<string>();
                        foreach (var id in link.DuplicateIds)
                            duplicateList.Add($"#{id}");
                        Reply(admin, $"  → {link.DuplicateIds.Count} duplicate(s): {string.Join(", ", duplicateList)}");
                        count++;
                    }
                }
            }
            else
            {
                Reply(admin, "\n No duplicate links found.");
            }
        }

        private void SubmitBugReport(BasePlayer player)
        {
            var draft = GetDraft(player);
            if (string.IsNullOrWhiteSpace(draft.Category) || string.IsNullOrWhiteSpace(draft.Severity) || string.IsNullOrWhiteSpace(draft.Description))
            {
                Reply(player, "Please set category, severity and description before submitting the bug report.");
                ShowDraftStatus(player);
                return;
            }

            // Final Rate Limit Check before submit
            if (!CheckRateLimit(player))
            {
                return;
            }
            
            // DUPLICATE DETECTION CHECK
            bool forceSubmit = draft.AdditionalData.ContainsKey("force_submit") && draft.AdditionalData["force_submit"] == "true";
            
            if (_config.EnableDuplicateDetection && _config.DuplicateDetection.Enabled && 
                _config.DuplicateDetection.CheckOnSubmit && !forceSubmit)
            {
                // Use title if present, otherwise use a fallback from description for duplicate detection
                string titleForCheck = !string.IsNullOrWhiteSpace(draft.Title)
                    ? draft.Title
                    : (draft.Description.Length >= _config.DuplicateDetection.MinTitleLength
                        ? draft.Description.Substring(0, _config.DuplicateDetection.MinTitleLength)
                        : draft.Description);
                var similarReports = FindSimilarReports(titleForCheck, draft.Description, draft.Category, player.userID);
                
                if (similarReports.Count > 0)
                {
                    ShowDuplicateWarning(player, similarReports);
                    
                    // Update stats
                    _db.Stats.DuplicatesPrevented++;
                    _dataChanged = true;
                    
                    if (_config.DuplicateDetection.RequireConfirmation)
                    {
                        // Store force submit option in draft
                        Reply(player, "If you're sure this is unique, use '/bugreport submit force'");
                        return; // Block submission
                    }
                    // If RequireConfirmation is false, continue with submission
                }
            }
            
            // Clear force submit flag
            if (draft.AdditionalData.ContainsKey("force_submit"))
                draft.AdditionalData.Remove("force_submit");

            var pos = player.transform?.position ?? Vector3.zero;
            string zone = GetPlayerZone(player, pos);

            var report = new BugReport
            {
                Id = _db.NextId++,
                UserId = player.userID,
                PlayerName = player.displayName,
                Title = string.IsNullOrEmpty(draft.Title) ? draft.Description.Substring(0, Math.Min(50, draft.Description.Length)) : draft.Title, // Auto-generate from description if empty
                Category = draft.Category,
                Severity = draft.Severity,
                Description = draft.Description,
                Zone = zone,
                X = pos.x, Y = pos.y, Z = pos.z,
                CreatedAt = DateTime.UtcNow,
                Status = "open",
                PluginVersion = Version.ToString(),
                ServerVersion = ConVar.Server.hostname,
                // Copy screenshots from draft
                Screenshots = draft.AdditionalData.ContainsKey("screenshots") 
                    ? new List<string>(draft.AdditionalData["screenshots"].Split('|'))
                    : new List<string>(),
                ScreenshotCount = draft.AdditionalData.ContainsKey("screenshots") 
                    ? draft.AdditionalData["screenshots"].Split('|').Length 
                    : 0
            };

            // Capture detailed location
            CaptureDetailedLocation(player, report);

            // Capture screenshot if enabled
            if (_config.EnableScreenshots)
            {
                CapturePlayerScreenshot(player, report.Id);
            }

            _db.Reports.Add(report);
            _drafts.Remove(player.userID);
            _dataChanged = true;

            // Player Stats update
            if (_db.PlayerStats.TryGetValue(player.userID, out var playerInfo))
            {
                playerInfo.TotalReports++;
                playerInfo.LastReport = DateTime.UtcNow;
                playerInfo.PlayerName = player.displayName; // Name update if changed
            }
            Reply(player, "Bug report submitted successfully! Thank you for your help.");

            // Admin notification
            if (_config.NotifyAdminsIngame)
            {
                NotifyAdmins($" New bug report #{report.Id}: {report.Category} ({report.Severity}) by {player.displayName}");
            }

            // Webhook
            TryWebhook(report);
        }

        private string GetPlayerZone(BasePlayer player, Vector3 pos)
        {
            try
            {
                if (EldrunCore != null)
                {
                    var zones = EldrunCore.Call("Eldrun_ListZones") as List<Dictionary<string, object>>;
                    if (zones != null)
                    {
                        foreach (var zoneData in zones)
                        {
                            if (zoneData.TryGetValue("id", out var zoneId) && zoneId is string id)
                            {
                                var isInside = EldrunCore.Call("Eldrun_IsPointInZone", pos, id);
                                if (isInside is bool inZone && inZone)
                                {
                                    return id;
                                }
                            }
                        }
                    }
                }
            }
            catch { }
            return "Unknown";
        }

        private void ShowLastBugReport(BasePlayer player)
        {
            var lastReport = _db.Reports.FindLast(r => r.UserId == player.userID);
            if (lastReport == null)
            {
                Reply(player, "You have not submitted any bug reports yet.");
                return;
            }

            var statusIcon = lastReport.Status == "open" ? "" : 
                           lastReport.Status == "resolved" ? "" : 
                           lastReport.Status == "rejected" ? "" : "";

            Reply(player, $"{statusIcon} Last bug report: #{lastReport.Id} | {lastReport.Category} ({lastReport.Severity}) | Status: {lastReport.Status} | {lastReport.CreatedAt:dd.MM.yyyy}");
            
            if (!string.IsNullOrEmpty(lastReport.Resolution))
            {
                Reply(player, $" Answer: {lastReport.Resolution}");
            }
        }

        private void ShowPlayerBugReports(BasePlayer player, int page = 1)
        {
            var playerReports = new List<BugReport>();
            foreach (var report in _db.Reports)
            {
                if (report.UserId == player.userID)
                {
                    if (!_config.ShowResolved && report.Status == "resolved") continue;
                    playerReports.Add(report);
                }
            }
            
            // Sort by CreatedAt descending
            playerReports.Sort((a, b) => b.CreatedAt.CompareTo(a.CreatedAt));
            int perPage = Math.Max(1, _config.ChatListPerPage);
            int total = playerReports.Count;
            int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)perPage));
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            var pageItems = playerReports.Skip((page - 1) * perPage).Take(perPage).ToList();
            
            if (pageItems.Count == 0)
            {
                Reply(player, "You have not submitted any bug reports yet.");
                return;
            }

            Reply(player, $" Your bug reports (Page {page}/{totalPages}):");
            foreach (var report in pageItems)
            {
                var statusIcon = report.Status == "open" ? "" : 
                               report.Status == "resolved" ? "" : 
                               report.Status == "rejected" ? "" : "";
                
                Reply(player, $"#{report.Id} | {report.Category} | {report.CreatedAt:dd.MM.yyyy}");
            }
            if (totalPages > 1) Reply(player, " Use: /bug list <page>");
        }

        private void VoteForBugReport(BasePlayer player, int bugId)
        {
            // Unify chat voting with UI voting: treat as toggle upvote
            VoteBug(player, bugId, true);
        }

        private void ShowDraftStatus(BasePlayer player)
        {
            var draft = GetDraft(player);
            var status = $" DRAFT STATUS:\n" +
                        $" Category: {draft.Category ?? " Not set"}\n" +
                        $" Title: {(string.IsNullOrEmpty(draft.Title) ? " Not set" : " Set")}\n" +
                        $" Severity: {draft.Severity ?? " Not set"}\n" +
                        $" Description: {(string.IsNullOrEmpty(draft.Description) ? " Not set" : " Set")}";
            
            Reply(player, status);
            
            if (!string.IsNullOrEmpty(draft.Category) && !string.IsNullOrEmpty(draft.Severity) && !string.IsNullOrEmpty(draft.Description))
            {
                Reply(player, " Ready to submit! Use: /bug submit");
            }
        }

        private void ShowHelpText(BasePlayer player)
        {
            Reply(player, GetLocalizedMessage("bug.ui.help.header", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.ui", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.category", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.severity", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.text", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.screenshot", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.submit", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.status", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.last", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.list", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.vote", player));
            Reply(player, GetLocalizedMessage("bug.ui.help.clear", player));
        }

        // === 📸 SCREENSHOT UPLOAD SYSTEM ===
        
        private void AddScreenshotToDraft(BasePlayer player, string url)
        {
            if (!IsValidImageUrl(url))
            {
                Reply(player, $"{_config.ChatPrefix} <color=#FF0000>❌ Invalid URL!</color>");
                Reply(player, "URL must start with http:// or https:// and end with an image (.png, .jpg, .jpeg, .gif)");
                return;
            }
            
            var draft = GetDraft(player);
            
            // Get existing screenshots
            string existingScreenshots = draft.AdditionalData.ContainsKey("screenshots") ? draft.AdditionalData["screenshots"] : "";
            var screenshotList = string.IsNullOrEmpty(existingScreenshots) 
                ? new List<string>() 
                : new List<string>(existingScreenshots.Split('|'));
            
            // Max 5 screenshots per report
            if (screenshotList.Count >= 5)
            {
                Reply(player, $"{_config.ChatPrefix} <color=#FF0000>Maximum 5 screenshots per bug report allowed!</color>");
                return;
            }
            
            // Add new screenshot
            screenshotList.Add(url);
            draft.AdditionalData["screenshots"] = string.Join("|", screenshotList);
            
            Reply(player, $"{_config.ChatPrefix} <color=#00FF00>✅ Screenshot #{screenshotList.Count} added!</color>");
            Reply(player, $"Current: {screenshotList.Count}/5 screenshots");
            
            // Show all screenshots
            for (int i = 0; i < screenshotList.Count; i++)
            {
                Reply(player, $"  {i+1}. {TruncateUrl(screenshotList[i])}");
            }
        }
        
        private bool IsValidImageUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return false;
            
            // Check if URL starts with http:// or https://
            if (!url.StartsWith("http://") && !url.StartsWith("https://"))
                return false;
            
            // Check if URL ends with common image extensions
            string lower = url.ToLower();
            return lower.EndsWith(".png") || 
                   lower.EndsWith(".jpg") || 
                   lower.EndsWith(".jpeg") || 
                   lower.EndsWith(".gif") || 
                   lower.EndsWith(".webp") ||
                   lower.Contains("imgur.com") ||
                   lower.Contains("imgbb.com") ||
                   lower.Contains("gyazo.com") ||
                   lower.Contains("prntscr.com") ||
                   lower.Contains("i.ibb.co");
        }
        
        private string TruncateUrl(string url, int maxLength = 60)
        {
            if (url.Length <= maxLength) return url;
            return url.Substring(0, maxLength - 3) + "...";
        }

        private void NotifyAdmins(string message)
        {
            foreach (var admin in BasePlayer.activePlayerList)
            {
                if (HasPermission(admin, AdminPerm))
                {
                    Reply(admin, message);
                }
            }
        }

        private void AutoCleanupOldReports()
        {
            if (!_config.AutoCloseOldReports) return;

            var cutoffDate = DateTime.UtcNow.AddDays(-_config.AutoCloseDays);
            var oldReports = new List<BugReport>();
            foreach (var report in _db.Reports)
            {
                if (report.Status == "open" && report.CreatedAt < cutoffDate)
                    oldReports.Add(report);
            }
            
            int closedCount = 0;
            foreach (var report in oldReports)
            {
                report.Status = "auto_closed";
                report.UpdatedAt = DateTime.UtcNow;
                report.Resolution = $"Automatisch geschlossen nach {_config.AutoCloseDays} Tagen Inaktivitaet";
                report.ResolutionType = "auto_closed";
                
                report.Comments.Add(new BugComment
                {
                    UserId = 0,
                    UserName = "System",
                    Comment = report.Resolution,
                    IsSystem = true,
                    Timestamp = DateTime.UtcNow
                });
                
                closedCount++;
            }

            if (closedCount > 0)
            {
                _dataChanged = true;
                if (_config.LogAllActions)
                {
                    LogLocalizedMessage("bugreport.message", new Dictionary<string, string> { ["closedCount"] = closedCount.ToString() });
                }
                
                NotifyAdmins($"🧹 Auto-cleanup: {closedCount} old bug reports closed automatically");
            }
        }

        // === SCREENSHOT UND LOCATION CAPTURE ===
        private void CapturePlayerScreenshot(BasePlayer player, int bugId)
        {
            if (!_config.EnableScreenshots) return;
            
            try
            {
                // Simulate Rust screenshot via F12 command
                player.Command("screenshot");
                Reply(player, "📸 Screenshot captured for bug report. Please share it with the admins.");
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("bugreport.message", null);
            }
        }

        private void CaptureDetailedLocation(BasePlayer player, BugReport report)
        {
            if (!_config.EnableLocationCapture) return;
            
            try
            {
                var pos = player.transform.position;
                var rotation = player.eyes.rotation;
                
                // Extended location data
                report.LocationDescription = $"Pos: ({pos.x:F2}, {pos.y:F2}, {pos.z:F2}) | " +
                                           $"Rot: ({rotation.x:F2}, {rotation.y:F2}, {rotation.z:F2}) | " +
                                           $"Zone: {GetPlayerZone(player, pos)}";
                
                // Scan nearby entities
                var nearbyEntities = new List<string>();
                var entities = UnityEngine.Object.FindObjectsOfType<BaseEntity>();
                foreach (var entity in entities)
                {
                    if (Vector3.Distance(entity.transform.position, pos) <= 50f)
                    {
                        nearbyEntities.Add($"{entity.ShortPrefabName}({Vector3.Distance(entity.transform.position, pos):F0}m)");
                        if (nearbyEntities.Count >= 10) break; // Limit
                    }
                }
                
                if (nearbyEntities.Count > 0)
                {
                    report.LocationDescription += $" | Nearby: {string.Join(", ", nearbyEntities)}";
                }
            }
            catch (Exception ex)
            {
                LogLocalizedMessage("bugreport.message", null);
            }
        }

        private Dictionary<string, string> GetPlayerThemeColors(BasePlayer player)
        {
            // PERFEKTES ELDRUN GOLD THEME - 100% OPTIMIERT wie Kits-Plugin
            return new Dictionary<string, string>
            {
                // HAUPT-FARBEN
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
                ["InfoColor"] = "0.38 0.68 0.92 1",
                
                // SEVERITY COLORS
                ["SeverityLow"] = "0.28 0.88 0.38 1",
                ["SeverityMedium"] = "0.92 0.68 0.28 1",
                ["SeverityHigh"] = "0.92 0.48 0.18 1",
                ["SeverityCritical"] = "0.88 0.28 0.28 1"
            };
        }
    }
}

