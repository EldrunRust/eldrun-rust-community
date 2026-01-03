using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;
using Oxide.Game.Rust.Cui;

namespace Oxide.Plugins
{
    [Info("EldrunWerbung", "SirEldrun", "36187")]
    [Description("Advertising System - BETA")]
    public class EldrunWerbung : RustPlugin
    {
        [PluginReference] private Plugin EldrunLocale;
        
        // Legacy localization helpers removed (using T() for UI strings). Clean and English-only UI text.
        [PluginReference] private Plugin EldrunFraktion;
        
        private const string AdminPerm = "eldrunwerbung.admin";
        private const string DataFileName = "eldrun_werbung_data";
        
        private const string ServerAdminSteamId = "76561199373421398";
        private bool IsServerAdmin(BasePlayer player) => player?.UserIDString == ServerAdminSteamId;
        private const string PanelName = "EldrunWerbungUI";

        private bool HasAdminAccess(BasePlayer player)
        {
            return player != null && (permission.UserHasPermission(player.UserIDString, AdminPerm) || IsServerAdmin(player));
        }

        private WerbungConfig _config;
        private WerbungData _data;
        private Timer _loop;
        private int _currentMessageIndex = 0;

        private Dictionary<string, string> _theme;
        private readonly Dictionary<ulong, string> _editDraft = new Dictionary<ulong, string>();
        private readonly Dictionary<ulong, string> _playerActiveTab = new Dictionary<ulong, string>();

        // UI state helpers
        private readonly Dictionary<ulong, int> _playerMessagePage = new Dictionary<ulong, int>();
        private readonly Dictionary<ulong, string> _addDraftText = new Dictionary<ulong, string>();
        private readonly Dictionary<ulong, string> _addDraftCategory = new Dictionary<ulong, string>();

        // Stats batching
        private int _unsavedStatIncrements = 0;

        // Messages tab filter state
        private readonly Dictionary<ulong, string> _msgFilterSearch = new Dictionary<ulong, string>();
        private readonly Dictionary<ulong, string> _msgFilterCategory = new Dictionary<ulong, string>();

        // New Category draft (per-player)
        private readonly Dictionary<ulong, string> _newCatDraftName = new Dictionary<ulong, string>();

        // Category Picker and Import drafts
        private readonly Dictionary<ulong, int> _catPickerPage = new Dictionary<ulong, int>();
        private readonly Dictionary<ulong, string> _importCatsDraft = new Dictionary<ulong, string>();

        // Rename Category, Destination drafts and Selection state
        private readonly Dictionary<ulong, string> _renameCatDraftName = new Dictionary<ulong, string>();
        private readonly Dictionary<ulong, string> _destPickerDraftName = new Dictionary<ulong, string>();
        private readonly Dictionary<ulong, HashSet<int>> _msgSelected = new Dictionary<ulong, HashSet<int>>();
        private readonly Dictionary<ulong, string> _destPickerMode = new Dictionary<ulong, string>();

        // Theme helpers
        private void LoadTheme()
        {
            _theme = null;
            try
            {
                if (EldrunFraktion != null)
                {
                    var r = EldrunFraktion.Call("Eldrun_GetTheme") as Dictionary<string, string>;
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

        private void EnsureCategoryOrderIncludesAll()
        {
            if (_config.CategoryOrder == null) _config.CategoryOrder = new List<string>();
            var set = new HashSet<string>(_config.CategoryOrder);
            foreach (var k in _config.MessageCategories.Keys)
            {
                if (!set.Contains(k)) _config.CategoryOrder.Add(k);
            }
        }

        private void RemoveFromCategoryOrder(string key)
        {
            if (_config.CategoryOrder == null) return;
            _config.CategoryOrder.RemoveAll(k => k == key);
        }

        private void ReplaceInCategoryOrder(string oldKey, string newKey)
        {
            if (_config.CategoryOrder == null) _config.CategoryOrder = new List<string>();
            bool replaced = false;
            for (int i = 0; i < _config.CategoryOrder.Count; i++)
            {
                if (_config.CategoryOrder[i] == oldKey)
                {
                    _config.CategoryOrder[i] = newKey;
                    replaced = true;
                    break;
                }
            }
            if (!replaced) _config.CategoryOrder.Add(newKey);
            // Deduplicate
            var seen = new HashSet<string>();
            var dedup = new List<string>();
            foreach (var k in _config.CategoryOrder)
            {
                if (seen.Add(k)) dedup.Add(k);
            }
            _config.CategoryOrder = dedup;
        }

        [ConsoleCommand("eldrunwerbung.ui.catorder.up")]
        private void UIW_CatOrderUp(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string cat = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(cat) || cat == "all") return;
            EnsureCategoryOrderIncludesAll();
            int idx = _config.CategoryOrder.IndexOf(cat);
            if (idx > 0)
            {
                var tmp = _config.CategoryOrder[idx - 1];
                _config.CategoryOrder[idx - 1] = _config.CategoryOrder[idx];
                _config.CategoryOrder[idx] = tmp;
                SaveConfig();
            }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.catorder.down")]
        private void UIW_CatOrderDown(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string cat = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(cat) || cat == "all") return;
            EnsureCategoryOrderIncludesAll();
            int idx = _config.CategoryOrder.IndexOf(cat);
            if (idx >= 0 && idx < _config.CategoryOrder.Count - 1)
            {
                var tmp = _config.CategoryOrder[idx + 1];
                _config.CategoryOrder[idx + 1] = _config.CategoryOrder[idx];
                _config.CategoryOrder[idx] = tmp;
                SaveConfig();
            }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.delcat.confirm")]
        private void UIW_DeleteCategoryConfirm(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string cat = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(cat) || cat == "all") { SendReply(player, "ℹ️ Select a category first."); return; }
            if (!_config.MessageCategories.ContainsKey(cat)) { SendReply(player, "❌ Category not found."); return; }
            const string Panel = "EldrunWerbungUIDelCat";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            int count = _config.MessageCategories[cat].Count;
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.33 0.38", AnchorMax = "0.67 0.58" }, CursorEnabled = true }, "Overlay", Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.confirm", null, "CONFIRM"), FontSize = 18, Align = TextAnchor.MiddleLeft, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.35 0.54", AnchorMax = "0.65 0.57" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Delete category '{cat}' with {count} messages?", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.35 0.49", AnchorMax = "0.80 0.53" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["ErrorColor"], Command = "eldrunwerbung.ui.delcat.apply" }, RectTransform = { AnchorMin = "0.46 0.40", AnchorMax = "0.58 0.44" }, Text = { Text = T("ui.delete", null, "Delete"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.delcat.cancel" }, RectTransform = { AnchorMin = "0.60 0.40", AnchorMax = "0.72 0.44" }, Text = { Text = T("ui.cancel", null, "Cancel"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.delcat.cancel" }, RectTransform = { AnchorMin = "0.65 0.55", AnchorMax = "0.67 0.57" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }
        
        [ConsoleCommand("eldrunwerbung.ui.delcat.apply")]
        private void UIW_DeleteCategoryApply(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string cat = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(cat) || cat == "all") return;
            if (_config.MessageCategories.ContainsKey(cat))
            {
                _config.MessageCategories.Remove(cat);
                RemoveFromCategoryOrder(cat);
                SaveConfig();
            }
            _msgFilterCategory[player.userID] = "all";
            _playerMessagePage[player.userID] = 0;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDelCat"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.delcat.cancel")]
        private void UIW_DeleteCategoryCancel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDelCat"); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.catpicker")]
        private void UIW_CatPicker(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            const string Panel = "EldrunWerbungUICatPicker";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            var keys = new List<string>(); GetOrderedCategoryKeys(keys);
            keys.Insert(0, "all");
            int page = _catPickerPage.ContainsKey(player.userID) ? _catPickerPage[player.userID] : 0;
            int pageSize = 10; int totalPages = Mathf.Max(1, (int)Math.Ceiling(keys.Count / (double)pageSize));
            if (page >= totalPages) page = totalPages - 1; if (page < 0) page = 0; _catPickerPage[player.userID] = page;
            int start = page * pageSize; int end = Math.Min(keys.Count, start + pageSize);
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.33 0.30", AnchorMax = "0.67 0.70" }, CursorEnabled = true }, "Overlay", Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.select_category", null, "SELECT CATEGORY"), FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.35 0.66", AnchorMax = "0.65 0.69" } }, Panel);
            float y = 0.62f; float rowH = 0.05f;
            for (int i = start; i < end; i++)
            {
                string cat = keys[i]; string label = cat.ToUpperInvariant();
                c.Add(new CuiLabel { Text = { Text = label, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.36 {0}", y), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.52 {0}", y + rowH) } }, Panel);
                c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = $"eldrunwerbung.ui.catpicker.select {cat}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.54 {0}", y), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.64 {0}", y + rowH) }, Text = { Text = T("ui.select", null, "Select"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
                y -= (rowH + 0.01f);
            }
            // Pagination
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.catpicker.page {Mathf.Max(0, page - 1)}" }, RectTransform = { AnchorMin = "0.36 0.32", AnchorMax = "0.43 0.36" }, Text = { Text = "◀ Prev", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Page {page + 1}/{totalPages}", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.44 0.32", AnchorMax = "0.51 0.36" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.catpicker.page {Mathf.Min(totalPages - 1, page + 1)}" }, RectTransform = { AnchorMin = "0.52 0.32", AnchorMax = "0.59 0.36" }, Text = { Text = "Next ▶", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.catpicker.close" }, RectTransform = { AnchorMin = "0.64 0.67", AnchorMax = "0.66 0.69" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.catpicker.page")]
        private void UIW_CatPickerPage(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int page = Mathf.Max(0, arg.GetInt(0, 0));
            _catPickerPage[player.userID] = page;
            UIW_CatPicker(arg);
        }

        [ConsoleCommand("eldrunwerbung.ui.catpicker.select")] // args: <category|all>
        private void UIW_CatPickerSelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            var cat = arg.GetString(0, "all"); if (string.IsNullOrEmpty(cat)) cat = "all";
            _msgFilterCategory[player.userID] = cat.ToLowerInvariant();
            _playerMessagePage[player.userID] = 0;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUICatPicker"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.catpicker.close")]
        private void UIW_CatPickerClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUICatPicker"); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.renamecat.overlay")]
        private void UIW_RenameCatOverlay(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(src) || src == "all") { SendReply(player, "ℹ️ Select a category first."); return; }
            const string Panel = "EldrunWerbungUIRenameCat";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            if (!_renameCatDraftName.ContainsKey(player.userID)) _renameCatDraftName[player.userID] = src;
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.30 0.34", AnchorMax = "0.70 0.62" }, CursorEnabled = true }, "Overlay", Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.rename_category", null, "RENAME CATEGORY"), FontSize = 18, Align = TextAnchor.MiddleLeft, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.32 0.58", AnchorMax = "0.68 0.61" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Current: {src}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.32 0.54", AnchorMax = "0.68 0.57" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.new_name", null, "New name"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.32 0.49", AnchorMax = "0.42 0.52" } }, Panel);
            c.Add(new CuiElement { Parent = Panel, Components = { new CuiInputFieldComponent { Align = TextAnchor.MiddleLeft, CharsLimit = 40, Command = "eldrunwerbung.ui.renamecat.text", FontSize = 12, Text = _renameCatDraftName[player.userID] }, new CuiRectTransformComponent { AnchorMin = "0.32 0.44", AnchorMax = "0.68 0.49" } } });
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.renamecat.apply" }, RectTransform = { AnchorMin = "0.44 0.40", AnchorMax = "0.56 0.44" }, Text = { Text = T("ui.rename", null, "Rename"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["WarningColor"], Command = "eldrunwerbung.ui.renamecat.merge" }, RectTransform = { AnchorMin = "0.58 0.40", AnchorMax = "0.70 0.44" }, Text = { Text = T("ui.merge", null, "Merge"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.renamecat.cancel" }, RectTransform = { AnchorMin = "0.68 0.59", AnchorMax = "0.70 0.61" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.renamecat.text")] // args: <name...>
        private void UIW_RenameCatText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 1)
                {
                    var parts = new List<string>(); for (int i = 0; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    text = string.Join(" ", parts.ToArray());
                }
                else text = arg.GetString(0, "");
            }
            catch { text = arg.GetString(0, ""); }
            _renameCatDraftName[player.userID] = text ?? string.Empty;
        }

        [ConsoleCommand("eldrunwerbung.ui.renamecat.apply")]
        private void UIW_RenameCatApply(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(src) || src == "all") return;
            string desired = _renameCatDraftName.ContainsKey(player.userID) ? _renameCatDraftName[player.userID] : string.Empty;
            desired = (desired ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(desired)) { SendReply(player, "❌ Empty name."); return; }
            string dst = NormalizeCategoryKey(desired);
            if (dst == null) { SendReply(player, "❌ Invalid name."); return; }
            if (dst == src) { try { CuiHelper.DestroyUi(player, "EldrunWerbungUIRenameCat"); } catch { } OpenUI(player); return; }
            if (_config.MessageCategories.ContainsKey(dst)) { SendReply(player, "❌ Category exists. Use Merge."); return; }
            if (!_config.MessageCategories.ContainsKey(src)) { SendReply(player, "❌ Source category missing."); return; }
            // Perform rename
            var list = _config.MessageCategories[src];
            _config.MessageCategories[dst] = list;
            _config.MessageCategories.Remove(src);
            ReplaceInCategoryOrder(src, dst);
            // Stats migrate
            if (_data.CategoryBroadcasts.ContainsKey(src))
            {
                _data.CategoryBroadcasts[dst] = _data.CategoryBroadcasts[src];
                _data.CategoryBroadcasts.Remove(src);
            }
            if (_data.CategoryIndex.ContainsKey(src))
            {
                _data.CategoryIndex[dst] = _data.CategoryIndex[src];
                _data.CategoryIndex.Remove(src);
            }
            SaveConfig(); SaveData();
            _msgFilterCategory[player.userID] = dst; _playerMessagePage[player.userID] = 0;
            _renameCatDraftName.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIRenameCat"); } catch { }
            OpenUI(player);
            SendReply(player, "✅ Category renamed.");
        }

        [ConsoleCommand("eldrunwerbung.ui.renamecat.merge")]
        private void UIW_RenameCatMerge(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(src) || src == "all") return;
            string desired = _renameCatDraftName.ContainsKey(player.userID) ? _renameCatDraftName[player.userID] : string.Empty;
            string dst = (desired ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(dst)) { SendReply(player, "❌ Empty name."); return; }
            if (!_config.MessageCategories.ContainsKey(src)) { SendReply(player, "❌ Source category missing."); return; }
            if (!_config.MessageCategories.ContainsKey(dst)) { SendReply(player, "❌ Destination does not exist. Use Rename."); return; }
            if (dst == src) { SendReply(player, "ℹ️ Same category."); return; }
            // Merge lists with capacity and dedupe
            var srcList = _config.MessageCategories[src]; var dstList = _config.MessageCategories[dst];
            for (int i = 0; i < srcList.Count; i++)
            {
                if (dstList.Count >= _config.MaxMessagesPerCategory) break;
                var t = srcList[i]; if (string.IsNullOrEmpty(t)) continue;
                if (!dstList.Contains(t)) dstList.Add(t);
            }
            _config.MessageCategories.Remove(src);
            RemoveFromCategoryOrder(src);
            // Stats merge
            int add = _data.CategoryBroadcasts.ContainsKey(src) ? _data.CategoryBroadcasts[src] : 0;
            if (add > 0)
            {
                _data.CategoryBroadcasts[dst] = (_data.CategoryBroadcasts.ContainsKey(dst) ? _data.CategoryBroadcasts[dst] : 0) + add;
                _data.CategoryBroadcasts.Remove(src);
            }
            if (_data.CategoryIndex.ContainsKey(src)) _data.CategoryIndex.Remove(src);
            SaveConfig(); SaveData();
            _msgFilterCategory[player.userID] = dst; _playerMessagePage[player.userID] = 0;
            _renameCatDraftName.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIRenameCat"); } catch { }
            OpenUI(player);
            SendReply(player, "✅ Categories merged.");
        }

        [ConsoleCommand("eldrunwerbung.ui.renamecat.cancel")]
        private void UIW_RenameCatCancel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _renameCatDraftName.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIRenameCat"); } catch { }
        }

        private void OpenDestPickerUI(BasePlayer player, string mode)
        {
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            if (string.IsNullOrEmpty(src) || src == "all") { SendReply(player, "ℹ️ Select a category first."); return; }
            _destPickerMode[player.userID] = mode;
            var keys = new List<string>(); GetOrderedCategoryKeys(keys);
            const string Panel = "EldrunWerbungUIDestPicker";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.28 0.26", AnchorMax = "0.72 0.74" }, CursorEnabled = true }, "Overlay", Panel);
            string title = (mode == "move") ? T("werbung.ui.move_all", null, "MOVE ALL") : T("werbung.ui.copy_all", null, "COPY ALL");
            c.Add(new CuiLabel { Text = { Text = title, FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.30 0.70", AnchorMax = "0.70 0.73" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Source: {src}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.30 0.66", AnchorMax = "0.60 0.69" } }, Panel);
            // Destination list
            float y = 0.62f; float rowH = 0.05f; int shown = 0;
            for (int i = 0; i < keys.Count && shown < 8; i++)
            {
                string dest = keys[i];
                if (mode == "move" && dest == src) continue; // avoid noop
                string label = dest.ToUpperInvariant();
                c.Add(new CuiLabel { Text = { Text = label, FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.30 {0}", y), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.50 {0}", y + rowH) } }, Panel);
                string cmd = (mode == "move") ? $"eldrunwerbung.ui.destpicker.moveselect {dest}" : $"eldrunwerbung.ui.destpicker.copyselect {dest}";
                c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = cmd }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.52 {0}", y), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.62 {0}", y + rowH) }, Text = { Text = T("ui.select", null, "Select"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
                string prevCmd = $"eldrunwerbung.ui.destpreview.select {dest}";
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = prevCmd }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.64 {0}", y), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.74 {0}", y + rowH) }, Text = { Text = T("ui.preview", null, "Preview"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
                y -= (rowH + 0.01f); shown++;
            }
            // Create new destination
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.new_destination", null, "New destination"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.30 0.34", AnchorMax = "0.50 0.37" } }, Panel);
            string textCmd = (mode == "move") ? "eldrunwerbung.ui.destpicker.movetext" : "eldrunwerbung.ui.destpicker.copytext";
            c.Add(new CuiElement { Parent = Panel, Components = { new CuiInputFieldComponent { Align = TextAnchor.MiddleLeft, CharsLimit = 40, Command = textCmd, FontSize = 12, Text = (_destPickerDraftName.ContainsKey(player.userID)?_destPickerDraftName[player.userID]:string.Empty) }, new CuiRectTransformComponent { AnchorMin = "0.30 0.30", AnchorMax = "0.62 0.34" } } });
            string createCmd = (mode == "move") ? "eldrunwerbung.ui.destpicker.movecreate" : "eldrunwerbung.ui.destpicker.copycreate";
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = createCmd }, RectTransform = { AnchorMin = "0.64 0.30", AnchorMax = "0.74 0.34" }, Text = { Text = T("ui.create", null, "Create & Use"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            string prevCreateCmd = "eldrunwerbung.ui.destpreview.create";
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = prevCreateCmd }, RectTransform = { AnchorMin = "0.76 0.30", AnchorMax = "0.86 0.34" }, Text = { Text = T("ui.preview", null, "Preview"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.destpicker.close" }, RectTransform = { AnchorMin = "0.70 0.71", AnchorMax = "0.72 0.73" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        private void PerformBatchMoveCopy(BasePlayer player, string mode, string src, string dest)
        {
            if (string.IsNullOrEmpty(src) || src == "all" || string.IsNullOrEmpty(dest)) { SendReply(player, "❌ Invalid source or destination."); return; }
            if (!_config.MessageCategories.ContainsKey(src)) { SendReply(player, "❌ Source category missing."); return; }
            if (!_config.MessageCategories.ContainsKey(dest)) _config.MessageCategories[dest] = new List<string>();
            if (mode == "move" && dest == src) { SendReply(player, "ℹ️ Same destination."); return; }
            var srcList = _config.MessageCategories[src]; var dstList = _config.MessageCategories[dest];
            // Determine items to process (all or selected)
            var items = new List<Tuple<int,string>>(); // (indexWithinCategory, text)
            bool selectedOnly = (mode == "move_sel" || mode == "copy_sel");
            if (selectedOnly)
            {
                var sel = _msgSelected.ContainsKey(player.userID) ? _msgSelected[player.userID] : null;
                if (sel != null && sel.Count > 0)
                {
                    // Collect selected indices belonging to src
                    var idxs = new List<int>();
                    foreach (var flat in sel)
                    {
                        string c; int ci; if (!TryResolveFlatMessageIndex(flat, out c, out ci)) continue; if (c != src) continue; idxs.Add(ci);
                    }
                    idxs.Sort();
                    for (int k = 0; k < idxs.Count; k++)
                    {
                        int ci = idxs[k]; if (ci >= 0 && ci < srcList.Count) items.Add(Tuple.Create(ci, srcList[ci]));
                    }
                }
            }
            else
            {
                for (int i = 0; i < srcList.Count; i++) items.Add(Tuple.Create(i, srcList[i]));
            }
            // Copy unique messages, respect capacity
            var keepFlags = new bool[srcList.Count]; for (int i = 0; i < keepFlags.Length; i++) keepFlags[i] = true;
            foreach (var it in items)
            {
                string t = it.Item2; if (string.IsNullOrEmpty(t)) continue;
                bool added = false;
                if (!dstList.Contains(t) && dstList.Count < _config.MaxMessagesPerCategory)
                {
                    dstList.Add(t);
                    added = true;
                }
                if (mode.StartsWith("copy")) continue;
                if (!added)
                {
                    // remain in source
                    continue;
                }
                // moved -> remove from source
                int ci = it.Item1; if (ci >= 0 && ci < keepFlags.Length) keepFlags[ci] = false;
            }
            if (mode.StartsWith("move"))
            {
                var newSrc = new List<string>();
                for (int i = 0; i < srcList.Count; i++) if (keepFlags[i]) newSrc.Add(srcList[i]);
                _config.MessageCategories[src] = newSrc;
            }
            SaveConfig();
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDestPicker"); } catch { }
            OpenUI(player);
            SendReply(player, mode == "move" ? "✅ Messages moved." : mode == "move_sel" ? "✅ Selected moved." : mode == "copy_sel" ? "✅ Selected copied." : "✅ Messages copied.");
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.move")]
        private void UIW_DestPickerMove(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            OpenDestPickerUI(player, "move");
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.copy")]
        private void UIW_DestPickerCopy(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            OpenDestPickerUI(player, "copy");
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.move_sel")]
        private void UIW_DestPickerMoveSel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            OpenDestPickerUI(player, "move_sel");
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.copy_sel")]
        private void UIW_DestPickerCopySel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            OpenDestPickerUI(player, "copy_sel");
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.movetext")] // args: <name...>
        private void UIW_DestPickerMoveText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty; try { if (arg.Args != null && arg.Args.Length >= 1) { var parts = new List<string>(); for (int i=0;i<arg.Args.Length;i++) parts.Add(arg.Args[i]); text = string.Join(" ", parts.ToArray()); } else text = arg.GetString(0, ""); } catch { text = arg.GetString(0, ""); }
            _destPickerDraftName[player.userID] = text ?? string.Empty;
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.copytext")] // args: <name...>
        private void UIW_DestPickerCopyText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty; try { if (arg.Args != null && arg.Args.Length >= 1) { var parts = new List<string>(); for (int i=0;i<arg.Args.Length;i++) parts.Add(arg.Args[i]); text = string.Join(" ", parts.ToArray()); } else text = arg.GetString(0, ""); } catch { text = arg.GetString(0, ""); }
            _destPickerDraftName[player.userID] = text ?? string.Empty;
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.movecreate")]
        private void UIW_DestPickerMoveCreate(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string name = _destPickerDraftName.ContainsKey(player.userID) ? _destPickerDraftName[player.userID] : string.Empty;
            string dest = NormalizeCategoryKey(name ?? string.Empty); if (dest == null) { SendReply(player, "❌ Invalid name."); return; }
            if (!_config.MessageCategories.ContainsKey(dest)) { _config.MessageCategories[dest] = new List<string>(); EnsureCategoryOrderIncludesAll(); SaveConfig(); }
            PerformBatchMoveCopy(player, _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "move", src, dest);
            _destPickerDraftName.Remove(player.userID);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.copycreate")]
        private void UIW_DestPickerCopyCreate(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string name = _destPickerDraftName.ContainsKey(player.userID) ? _destPickerDraftName[player.userID] : string.Empty;
            string dest = NormalizeCategoryKey(name ?? string.Empty); if (dest == null) { SendReply(player, "❌ Invalid name."); return; }
            if (!_config.MessageCategories.ContainsKey(dest)) { _config.MessageCategories[dest] = new List<string>(); EnsureCategoryOrderIncludesAll(); SaveConfig(); }
            PerformBatchMoveCopy(player, _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "copy", src, dest);
            _destPickerDraftName.Remove(player.userID);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.moveselect")] // args: <destCat>
        private void UIW_DestPickerMoveSelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string dest = arg.GetString(0, ""); dest = NormalizeCategoryKey(dest ?? string.Empty); if (dest == null) return;
            PerformBatchMoveCopy(player, _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "move", src, dest);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.copyselect")] // args: <destCat>
        private void UIW_DestPickerCopySelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string dest = arg.GetString(0, ""); dest = NormalizeCategoryKey(dest ?? string.Empty); if (dest == null) return;
            PerformBatchMoveCopy(player, _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "copy", src, dest);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpicker.close")]
        private void UIW_DestPickerClose2(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDestPicker"); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.select.toggle")] // args: flatIndex
        private void UIW_SelectToggle(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1); if (idx < 0) return;
            if (!_msgSelected.ContainsKey(player.userID)) _msgSelected[player.userID] = new HashSet<int>();
            var set = _msgSelected[player.userID];
            if (set.Contains(idx)) set.Remove(idx); else set.Add(idx);
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.select.clear")]
        private void UIW_SelectClear(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            _msgSelected.Remove(player.userID);
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.select.allpage")]
        private void UIW_SelectAllPage(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            // Recompute matching list as in AddMessagesTab
            string search = _msgFilterSearch.ContainsKey(player.userID) ? _msgFilterSearch[player.userID] : string.Empty;
            string catFilter = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            int totalFlat = GetFlattenedMessageCount();
            var matching = new List<int>();
            for (int i = 0; i < totalFlat; i++)
            {
                var t = GetMessageTextByFlatIndex(i); if (string.IsNullOrEmpty(t)) continue;
                bool searchOk = string.IsNullOrEmpty(search) || t.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0;
                bool catOk = true;
                if (!string.IsNullOrEmpty(catFilter) && !string.Equals(catFilter, "all", StringComparison.OrdinalIgnoreCase))
                { string cat; int idxWithin; if (!TryResolveFlatMessageIndex(i, out cat, out idxWithin)) cat = null; catOk = (cat != null && string.Equals(cat, catFilter, StringComparison.OrdinalIgnoreCase)); }
                if (searchOk && catOk) matching.Add(i);
            }
            int pageSize = 8; int page = _playerMessagePage.ContainsKey(player.userID) ? _playerMessagePage[player.userID] : 0;
            int start = page * pageSize; int end = Math.Min(matching.Count, start + pageSize);
            if (!_msgSelected.ContainsKey(player.userID)) _msgSelected[player.userID] = new HashSet<int>();
            var set = _msgSelected[player.userID];
            for (int j = start; j < end; j++) set.Add(matching[j]);
            OpenUI(player);
        }

        private void ShowPreviewOverlay(BasePlayer player, string src, string dest, string mode, int totalConsidered, int willAdd, int willSkip)
        {
            const string Panel = "EldrunWerbungUIDestPreview";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.35 0.38", AnchorMax = "0.65 0.62" }, CursorEnabled = true }, "Overlay", Panel);
            string title = T("werbung.ui.preview", null, "PREVIEW");
            c.Add(new CuiLabel { Text = { Text = title, FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.36 0.58", AnchorMax = "0.64 0.61" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Source: {src}  →  Dest: {dest}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.36 0.54", AnchorMax = "0.64 0.57" } }, Panel);
            string scope = (mode.Contains("sel")) ? "Selected" : "All";
            c.Add(new CuiLabel { Text = { Text = $"Scope: {scope}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.36 0.51", AnchorMax = "0.64 0.54" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Total considered: {totalConsidered}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.36 0.48", AnchorMax = "0.64 0.51" } }, Panel);
            c.Add(new CuiLabel { Text = { Text = $"Will add: {willAdd}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["SuccessColor"] }, RectTransform = { AnchorMin = "0.36 0.45", AnchorMax = "0.64 0.48" } }, Panel);
            string skipLabel = mode.StartsWith("move") ? "Remain in source" : "Skip";
            c.Add(new CuiLabel { Text = { Text = $"{skipLabel}: {willSkip}", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["WarningColor"] }, RectTransform = { AnchorMin = "0.36 0.42", AnchorMax = "0.64 0.45" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = $"eldrunwerbung.ui.destpreview.proceed {dest}" }, RectTransform = { AnchorMin = "0.46 0.40", AnchorMax = "0.58 0.44" }, Text = { Text = T("ui.proceed", null, "Proceed"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.destpreview.close" }, RectTransform = { AnchorMin = "0.60 0.40", AnchorMax = "0.72 0.44" }, Text = { Text = T("ui.close", null, "Close"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        private void ComputePreview(BasePlayer player, string src, string dest, string mode, out int total, out int willAdd, out int willSkip)
        {
            total = 0; willAdd = 0; willSkip = 0;
            if (string.IsNullOrEmpty(src) || src == "all" || string.IsNullOrEmpty(dest)) return;
            if (!_config.MessageCategories.ContainsKey(src)) return;
            if (!_config.MessageCategories.ContainsKey(dest)) _config.MessageCategories[dest] = new List<string>();
            var srcList = _config.MessageCategories[src]; var dstList = _config.MessageCategories[dest];
            var items = new List<string>();
            bool selectedOnly = mode.Contains("sel");
            if (selectedOnly)
            {
                var sel = _msgSelected.ContainsKey(player.userID) ? _msgSelected[player.userID] : null;
                if (sel != null && sel.Count > 0)
                {
                    var idxs = new List<int>();
                    foreach (var flat in sel)
                    { string c; int ci; if (!TryResolveFlatMessageIndex(flat, out c, out ci)) continue; if (c != src) continue; idxs.Add(ci); }
                    idxs.Sort();
                    for (int k = 0; k < idxs.Count; k++) { int ci = idxs[k]; if (ci>=0 && ci<srcList.Count) items.Add(srcList[ci]); }
                }
            }
            else
            {
                items.AddRange(srcList);
            }
            total = items.Count; int capacityLeft = Math.Max(0, _config.MaxMessagesPerCategory - dstList.Count);
            for (int i = 0; i < items.Count; i++)
            {
                var t = items[i]; if (string.IsNullOrEmpty(t)) { willSkip++; continue; }
                if (dstList.Contains(t)) { willSkip++; continue; }
                if (capacityLeft <= 0) { willSkip++; continue; }
                willAdd++; capacityLeft--;
            }
        }

        [ConsoleCommand("eldrunwerbung.ui.destpreview.select")] // args: <dest>
        private void UIW_DestPreviewSelect(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string mode = _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "move";
            string dest = arg.GetString(0, ""); dest = NormalizeCategoryKey(dest ?? string.Empty); if (dest == null) return;
            int total, add, skip; ComputePreview(player, src, dest, mode, out total, out add, out skip);
            ShowPreviewOverlay(player, src, dest, mode, total, add, skip);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpreview.create")]
        private void UIW_DestPreviewCreate(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string mode = _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "move";
            string name = _destPickerDraftName.ContainsKey(player.userID) ? _destPickerDraftName[player.userID] : string.Empty;
            string dest = NormalizeCategoryKey(name ?? string.Empty); if (dest == null) { SendReply(player, "❌ Invalid name."); return; }
            int total, add, skip; ComputePreview(player, src, dest, mode, out total, out add, out skip);
            ShowPreviewOverlay(player, src, dest, mode, total, add, skip);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpreview.proceed")] // args: <dest>
        private void UIW_DestPreviewProceed(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string src = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            string mode = _destPickerMode.ContainsKey(player.userID) ? _destPickerMode[player.userID] : "move";
            string dest = arg.GetString(0, ""); dest = NormalizeCategoryKey(dest ?? string.Empty); if (dest == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDestPreview"); } catch { }
            PerformBatchMoveCopy(player, mode, src, dest);
        }

        [ConsoleCommand("eldrunwerbung.ui.destpreview.close")]
        private void UIW_DestPreviewClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIDestPreview"); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.exportcats")]
        private void UIW_ExportCats(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            const string Panel = "EldrunWerbungUIExportCats";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            var colors = GetPlayerThemeColors(player);
            string json = "{}";
            try { json = JsonConvert.SerializeObject(_config.MessageCategories, Formatting.None); } catch { }
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.20 0.20", AnchorMax = "0.80 0.80" }, CursorEnabled = true }, "Overlay", Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.export_categories", null, "EXPORT CATEGORIES"), FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.22 0.76", AnchorMax = "0.78 0.79" } }, Panel);
            c.Add(new CuiElement { Parent = Panel, Components = { new CuiInputFieldComponent { Align = TextAnchor.UpperLeft, CharsLimit = 12000, FontSize = 12, Text = json }, new CuiRectTransformComponent { AnchorMin = "0.22 0.24", AnchorMax = "0.78 0.74" } } });
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.copy_hint", null, "Copy the JSON above. Close when done."), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.22 0.20", AnchorMax = "0.78 0.23" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.exportcats.close" }, RectTransform = { AnchorMin = "0.78 0.77", AnchorMax = "0.80 0.79" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.exportcats.close")]
        private void UIW_ExportCatsClose(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIExportCats"); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.importcats.overlay")]
        private void UIW_ImportCatsOverlay(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            const string Panel = "EldrunWerbungUIImportCats";
            try { CuiHelper.DestroyUi(player, Panel); } catch { }
            if (!_importCatsDraft.ContainsKey(player.userID)) _importCatsDraft[player.userID] = string.Empty;
            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") }, RectTransform = { AnchorMin = "0.20 0.20", AnchorMax = "0.80 0.80" }, CursorEnabled = true }, "Overlay", Panel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.import_categories", null, "IMPORT CATEGORIES"), FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.22 0.76", AnchorMax = "0.78 0.79" } }, Panel);
            c.Add(new CuiElement { Parent = Panel, Components = { new CuiInputFieldComponent { Align = TextAnchor.UpperLeft, CharsLimit = 12000, Command = "eldrunwerbung.ui.importcats.text", FontSize = 12, Text = _importCatsDraft[player.userID] }, new CuiRectTransformComponent { AnchorMin = "0.22 0.24", AnchorMax = "0.78 0.74" } } });
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.importcats.apply.merge" }, RectTransform = { AnchorMin = "0.48 0.20", AnchorMax = "0.60 0.24" }, Text = { Text = T("ui.merge", null, "Merge"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["WarningColor"], Command = "eldrunwerbung.ui.importcats.apply.replace" }, RectTransform = { AnchorMin = "0.62 0.20", AnchorMax = "0.74 0.24" }, Text = { Text = T("ui.replace", null, "Replace"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.importcats.cancel" }, RectTransform = { AnchorMin = "0.76 0.20", AnchorMax = "0.78 0.24" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, Panel);
            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.importcats.text")] // args: <json...>
        private void UIW_ImportCatsText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 1)
                {
                    var parts = new List<string>();
                    for (int i = 0; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    text = string.Join(" ", parts.ToArray());
                }
                else
                {
                    text = arg.GetString(0, "");
                }
            }
            catch { text = arg.GetString(0, ""); }
            _importCatsDraft[player.userID] = text ?? string.Empty;
        }

        private Dictionary<string, List<string>> ParseCategoriesJsonSafe(string json)
        {
            try
            {
                var dict = JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(json);
                if (dict == null) return null;
                var norm = new Dictionary<string, List<string>>();
                foreach (var kv in dict)
                {
                    if (string.IsNullOrEmpty(kv.Key)) continue;
                    var key = NormalizeCategoryKey(kv.Key);
                    if (key == null) continue;
                    if (!norm.ContainsKey(key)) norm[key] = new List<string>();
                    if (kv.Value == null) continue;
                    foreach (var t in kv.Value)
                    {
                        var s = (t ?? string.Empty).Trim();
                        if (string.IsNullOrEmpty(s)) continue;
                        if (!norm[key].Contains(s)) norm[key].Add(s);
                        if (norm[key].Count >= _config.MaxMessagesPerCategory) break;
                    }
                }
                return norm;
            }
            catch { return null; }
        }

        [ConsoleCommand("eldrunwerbung.ui.importcats.apply.merge")]
        private void UIW_ImportCatsApplyMerge(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            if (!_importCatsDraft.ContainsKey(player.userID)) { SendReply(player, "❌ No JSON provided."); return; }
            var dict = ParseCategoriesJsonSafe(_importCatsDraft[player.userID]);
            if (dict == null) { SendReply(player, "❌ Invalid JSON."); return; }
            foreach (var kv in dict)
            {
                if (!_config.MessageCategories.ContainsKey(kv.Key)) _config.MessageCategories[kv.Key] = new List<string>();
                var target = _config.MessageCategories[kv.Key];
                foreach (var t in kv.Value)
                {
                    if (target.Count >= _config.MaxMessagesPerCategory) break;
                    if (!target.Contains(t)) target.Add(t);
                }
            }
            EnsureCategoryOrderIncludesAll();
            SaveConfig();
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIImportCats"); } catch { }
            _importCatsDraft.Remove(player.userID);
            OpenUI(player);
            SendReply(player, "✅ Categories merged.");
        }

        [ConsoleCommand("eldrunwerbung.ui.importcats.apply.replace")]
        private void UIW_ImportCatsApplyReplace(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            if (!_importCatsDraft.ContainsKey(player.userID)) { SendReply(player, "❌ No JSON provided."); return; }
            var dict = ParseCategoriesJsonSafe(_importCatsDraft[player.userID]);
            if (dict == null) { SendReply(player, "❌ Invalid JSON."); return; }
            _config.MessageCategories = dict;
            // Reset order to alphabetical of new keys
            var keys = new List<string>(dict.Keys); keys.Sort();
            _config.CategoryOrder = keys;
            SaveConfig();
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIImportCats"); } catch { }
            _importCatsDraft.Remove(player.userID);
            _msgFilterCategory[player.userID] = "all"; _playerMessagePage[player.userID] = 0;
            OpenUI(player);
            SendReply(player, "✅ Categories replaced.");
        }

        [ConsoleCommand("eldrunwerbung.ui.importcats.cancel")]
        private void UIW_ImportCatsCancel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIImportCats"); } catch { }
            _importCatsDraft.Remove(player.userID);
        }


        private class WerbungConfig
        {
            public bool Enabled = true;
            public float MinIntervalSeconds = 45f; // Minimum 45 Sekunden
            public float MaxIntervalSeconds = 60f; // Maximum 60 Sekunden  
            public float StartDelaySeconds = 30f;
            public bool RandomOrder = true; // Zufaellige Reihenfolge
            public bool ShowInChat = true;
            public string ChatPrefix = " <size=14><color=#D4AF37><b>ELDRUN</b></color></size> <color=#FFD700>⚡</color>";
            
            public bool PlayerOptOut = true; // Spieler kOennen sich abmelden
            public bool ShowStatistics = true; // Statistiken sammeln
            public bool EnableCategories = true; // Kategorien aktivieren
            public bool AutoBackup = true; // Automatische Backups
            public int MaxMessagesPerCategory = 20; // Max Nachrichten pro Kategorie
            public List<string> DisabledPlayers = new List<string>(); // Spieler die sich abgemeldet haben
            // Display order for categories (optional). If empty, alphabetical is used.
            public List<string> CategoryOrder = new List<string>();
            
            public Dictionary<string, List<string>> MessageCategories = new Dictionary<string, List<string>>
            {
                ["core"] = new List<string>
                {
                    " Welcome to the world of ELDRUN! Use /help for all available commands and start your adventure!",
                    " Join a powerful faction! Use /faction ui to choose between Stark, Lannister, and Targaryen!",
                    " Manage your equipment with /kit - Choose from various starter kits and special armor sets!",
                    " Use /help for a complete list of all available commands and features!",
                    " Report bugs with /bugreport - Help us make Eldrun even better!"
                },
                ["economy"] = new List<string>
                {
                    " Visit the Eldrun MultiShop with /shop - Weapons, healing, resources and premium items await you!",
                    " Gold rules the world of Eldrun - earn coins through quests and trading with /shop!",
                    " The merchants await you - /shop opens the gates to rare treasures and weapons!",
                    " Collect Eldrunmarks for premium items - the most valuable currency in the realm!"
                },
                ["adventure"] = new List<string>
                {
                    " Travel fast with /travel - Teleport to important locations and save time on your adventures!",
                    " Conquer mighty castles with /castle - Fight for control of strategic fortresses!",
                    " Overcome the Stormwall with /stormwall - But beware of the deadly lightning!",
                    " Explore the Artifact Island! Wait for the bridge gates or use /artifact for information!",
                    " The bridge gates open regularly - use this time to reach the Artifact Island!",
                    " The world of Eldrun is vast - use /travel to quickly move between important locations!",
                    " The mysterious Artifact Island holds powerful treasures - wait for the bridge gates!",
                    " The Stormwall is deadly but passable - /stormwall for information on crossing!",
                    " When the ancient bridges open, it's time for great adventures and rare finds!",
                    " Conquer the mighty castles of the realm - /castle shows available fortresses!"
                },
                ["social"] = new List<string>
                {
                    " Rise in the faction rankings! Use /faction top to see the most powerful players!",
                    " Show your power! Use /faction ui to manage your faction and statistics!",
                    " Show your power in faction rankings - /faction top for fame and honor!"
                },
                ["progression"] = new List<string>
                {
                    " Collect experience points with /xp - Level up and unlock new abilities!",
                    " Track your progress! Use /xp stats to see your levels and XP gains!",
                    " Receive daily rewards! Log in regularly for bonus XP and items!",
                    " Reach new milestones! Each level brings you better rewards and abilities!",
                    " Become stronger through activities - Fighting, building and exploring brings valuable XP!",
                    " Every action brings experience - /xp shows your path to mastery in Eldrun!",
                    " Track your rise to power - /xp stats for detailed progress analytics!",
                    " Loyalty is rewarded - daily logins bring valuable bonuses and gifts!",
                    " Reach legendary levels and unlock powerful abilities!",
                    " Through combat, trade and exploration you will become true masters of Eldrun!"
                },
                ["roleplay"] = new List<string>
                {
                    " In the lands of Eldrun, ancient laws prevail - choose your faction wisely with /faction!",
                    " The battle for the Iron Throne continues - use /castle to conquer fortresses!",
                    " Like the great houses of Westeros, you fight for power and honor together with your faction - use /faction to rally your allies!",
                    " Forge your weapons and arm yourselves - /kit offers the best equipment for warriors!",
                    " Only the strongest will rule - use /xp to increase your power!",
                    " Automatic doors with /autodoor - Configure smart entrances for your base!",
                    " Automatic lighting with /autolights - Your base lights up at the right time!"
                }
            };
            
            [JsonIgnore]
            public List<string> Messages
            {
                get
                {
                    var allMessages = new List<string>();
                    foreach (var category in MessageCategories.Values)
                    {
                        allMessages.AddRange(category);
                    }
                    return allMessages;
                }
            }
        }

        private class WerbungData
        {
            public int NextIndex = 0;
            public Dictionary<string, int> CategoryIndex = new Dictionary<string, int>();
            public Dictionary<string, int> MessageViews = new Dictionary<string, int>();
            public Dictionary<string, DateTime> LastShown = new Dictionary<string, DateTime>();
            public List<string> DisabledPlayers = new List<string>();
            public DateTime LastBackup = DateTime.MinValue;
            public int TotalBroadcasts = 0;
            public Dictionary<string, int> CategoryBroadcasts = new Dictionary<string, int>();
        }

        protected override void LoadDefaultConfig()
        {
            _config = new WerbungConfig();
            Puts("[EldrunWerbung] Default configuration created.");
        }

        private void LoadConfigValues()
        {
            try { _config = Config.ReadObject<WerbungConfig>(); if (_config == null) throw new Exception(); }
            catch { _config = new WerbungConfig(); SaveConfig(); }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        private void LoadData()
        {
            try { _data = Interface.Oxide.DataFileSystem.ReadObject<WerbungData>(DataFileName) ?? new WerbungData(); }
            catch { _data = new WerbungData(); }
        }

        private void SaveData() => Interface.Oxide.DataFileSystem.WriteObject(DataFileName, _data);

        private void Init()
        {
            permission.RegisterPermission(AdminPerm, this);
            LoadData();
            
            // 💾 AUTO-SAVE TIMER (30s interval)
            timer.Every(30f, () => SaveData());
            Puts("[EldrunWerbung] Auto-save enabled (30s interval)");
        }

        private void OnServerInitialized()
        {
            LoadConfigValues();
            LoadTheme();
            TryStartLoopDelayed();
            Puts("[EldrunWerbung] Plugin initialized and advertising loop scheduled.");
        }

        private void TryStartLoopDelayed()
        {
            if (_config == null || !_config.Enabled) return;
            float delay = Math.Max(0f, _config.StartDelaySeconds);
            timer.Once(delay, () => RestartLoop());
        }

        private void RestartLoop()
        {
            try { _loop?.Destroy(); } catch { }
            if (_config == null || !_config.Enabled) return;
            
            // Sofort erste Nachricht senden
            BroadcastNext();
            
            // Dann Schedule für weitere Nachrichten starten
            ScheduleNextBroadcast();
        }
        
        private void ScheduleNextBroadcast()
        {
            if (_config == null || !_config.Enabled) return;
            
            // Zufaelliges Intervall zwischen Min und Max
            float randomInterval = UnityEngine.Random.Range(_config.MinIntervalSeconds, _config.MaxIntervalSeconds);
            randomInterval = Math.Max(15f, randomInterval); // Minimum 15 Sekunden Sicherheit
            
            try { _loop?.Destroy(); } catch { }
            _loop = timer.Once(randomInterval, () =>
            {
                try
                {
                    BroadcastNext();
                    ScheduleNextBroadcast(); // Naechsten zufaelligen Timer planen
                }
                catch (Exception ex)
                {
                    PrintError($"[EldrunWerbung] ScheduleNextBroadcast error: {ex}");
                    ScheduleNextBroadcast(); // Trotz Fehler weitermachen
                }
            });
        }

        private void BroadcastNext()
        {
            if (_config?.MessageCategories == null || _config.MessageCategories.Count == 0) return;
            
            string selectedCategory;
            string msg;
            
            if (_config.RandomOrder)
            {
                // Zufaellige Kategorie und Nachricht waehlen (ohne LINQ)
                var categories = new List<string>();
                foreach (var key in _config.MessageCategories.Keys)
                {
                    categories.Add(key);
                }
                if (categories.Count == 0) return;
                selectedCategory = categories[UnityEngine.Random.Range(0, categories.Count)];
                var categoryMessages = _config.MessageCategories[selectedCategory];
                if (categoryMessages.Count == 0) return;
                msg = categoryMessages[UnityEngine.Random.Range(0, categoryMessages.Count)];
            }
            else
            {
                // Sequentielle Reihenfolge durch alle Kategorien (ohne LINQ)
                var categories = new List<string>();
                foreach (var key in _config.MessageCategories.Keys)
                {
                    categories.Add(key);
                }
                if (categories.Count == 0) return;
                
                selectedCategory = categories[(_data?.NextIndex ?? 0) % categories.Count];
                var categoryMessages = _config.MessageCategories[selectedCategory];
                if (categoryMessages.Count == 0) 
                {
                    _data.NextIndex++;
                    return;
                }
                
                int categoryIdx = _data.CategoryIndex.ContainsKey(selectedCategory) ? _data.CategoryIndex[selectedCategory] : 0;
                msg = categoryMessages[categoryIdx % categoryMessages.Count];
                
                // Update indices
                _data.CategoryIndex[selectedCategory] = (categoryIdx + 1) % categoryMessages.Count;
                if (_data.CategoryIndex[selectedCategory] == 0) _data.NextIndex++;
            }
            
            if (string.IsNullOrWhiteSpace(msg)) return;
            
            // Statistiken aktualisieren
            if (_config.ShowStatistics)
            {
                _data.TotalBroadcasts++;
                _data.CategoryBroadcasts[selectedCategory] = (_data.CategoryBroadcasts.ContainsKey(selectedCategory) ? _data.CategoryBroadcasts[selectedCategory] : 0) + 1;
                _data.MessageViews[msg] = (_data.MessageViews.ContainsKey(msg) ? _data.MessageViews[msg] : 0) + 1;
                _data.LastShown[msg] = DateTime.Now;
            }
            
            // Prüfe Player Opt-Out Liste (ohne LINQ)
            var playersToShow = new List<BasePlayer>();
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (!_data.DisabledPlayers.Contains(p.UserIDString))
                    playersToShow.Add(p);
            }
            
            if (playersToShow.Count == 0) return;
            
            // Broadcast an aktive Spieler (ohne opt-out)
            if (_config.ShowInChat)
            {
                foreach (var player in playersToShow)
                {
                    PrintToChat(player, $"{_config.ChatPrefix} {msg}");
                }
            }
            
            // Auto-Backup wenn aktiviert (24h)
            if (_config.AutoBackup && DateTime.Now.Subtract(_data.LastBackup).TotalHours >= 24)
            {
                try { CreateBackup(); } catch {}
                _data.LastBackup = DateTime.Now;
                SaveData();
            }
            // Log fuer Admins
            Puts($"[EldrunWerbung] Broadcasted [{selectedCategory}]: {(msg.Length > 50 ? msg.Substring(0, 50) + "..." : msg)} to {playersToShow.Count} players");

            // Batch-save stats to reduce data loss
            _unsavedStatIncrements++;
            if (_unsavedStatIncrements >= 10)
            {
                _unsavedStatIncrements = 0;
                try { SaveData(); } catch {}
            }
        }

        [ChatCommand("werbungadmin")]
        private void WerbungAdmin(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            if (!HasAdminAccess(player))
            {
                SendReply(player, "❌ You do not have permission to use this command.");
                return;
            }
            if (args == null || args.Length == 0)
            {
                SendReply(player, "Usage: /werbungadmin on|off | interval <min> <max> | stats | backup | category <name> | list | now [index] | add <text> | set <index> <text> | remove <index> | resetindex | prefix <text> | reload | save");
                return;
            }
            var sub = args[0].ToLowerInvariant();
            if (sub == "on" || sub == "enable") { _config.Enabled = true; SaveConfig(); RestartLoop(); SendReply(player, "✅ Advertising system enabled."); return; }
            if (sub == "off" || sub == "disable") { _config.Enabled = false; SaveConfig(); try { _loop?.Destroy(); } catch { } SendReply(player, "❌ Advertising system disabled."); return; }
            if (sub == "interval")
            {
                if (args.Length < 3 || !float.TryParse(args[1], out var minSec) || !float.TryParse(args[2], out var maxSec)) 
                { 
                    SendReply(player, $"Usage: /werbungadmin interval <min> <max> | Current: {_config.MinIntervalSeconds}s - {_config.MaxIntervalSeconds}s"); 
                    return; 
                }
                _config.MinIntervalSeconds = Math.Max(15f, Math.Min(minSec, maxSec)); 
                _config.MaxIntervalSeconds = Math.Max(_config.MinIntervalSeconds + 5f, maxSec); 
                SaveConfig(); RestartLoop(); 
                SendReply(player, $"✅ Interval set: {_config.MinIntervalSeconds}s - {_config.MaxIntervalSeconds}s (random)"); 
                return;
            }
            if (sub == "stats")
            {
                SendReply(player, $"📊 ADVERTISING STATISTICS:");
                SendReply(player, $"Total Broadcasts: {_data.TotalBroadcasts}");
                SendReply(player, $"Opt-Out Players: {_data.DisabledPlayers.Count}");
                foreach (var cat in _data.CategoryBroadcasts)
                {
                    SendReply(player, $"  {cat.Key}: {cat.Value} broadcasts");
                }
                return;
            }
            if (sub == "backup")
            {
                CreateBackup();
                _data.LastBackup = DateTime.Now;
                SaveData();
                SendReply(player, "💾 Backup created.");
                return;
            }
            if (sub == "category")
            {
                if (args.Length < 2) 
                { 
                    SendReply(player, "Available categories: " + string.Join(", ", _config.MessageCategories.Keys)); 
                    return; 
                }
                var catName = args[1].ToLowerInvariant();
                if (!_config.MessageCategories.ContainsKey(catName))
                {
                    SendReply(player, "❌ Category not found.");
                    return;
                }
                var messages = _config.MessageCategories[catName];
                SendReply(player, $"Category '{catName}' ({messages.Count} messages):");
                for (int i = 0; i < messages.Count && i < 10; i++)
                {
                    var shortMsg = messages[i].Length > 60 ? messages[i].Substring(0, 60) + "..." : messages[i];
                    SendReply(player, $"  {i}: {shortMsg}");
                }
                if (messages.Count > 10) SendReply(player, $"... and {messages.Count - 10} more");
                return;
            }
            if (sub == "list")
            {
                if (GetFlattenedMessageCount() == 0) { SendReply(player, "No messages available."); return; }
                int total = GetFlattenedMessageCount();
                SendReply(player, $"📋 ADVERTISING MESSAGES ({total} total):");
                for (int i = 0; i < total; i++)
                {
                    var t = GetMessageTextByFlatIndex(i);
                    var shortTxt = t;
                    if (shortTxt.Length > 80) shortTxt = shortTxt.Substring(0, 80) + "...";
                    SendReply(player, $"#{i}: {shortTxt}");
                }
                return;
            }
            if (sub == "now")
            {
                int total = GetFlattenedMessageCount();
                if (total == 0) { SendReply(player, "No messages available."); return; }
                int idx = (_data?.NextIndex ?? 0) % Math.Max(1, total);
                if (args.Length >= 2 && int.TryParse(args[1], out var i2)) idx = Mathf.Clamp(i2, 0, Math.Max(0, total - 1));
                var msg = GetMessageTextByFlatIndex(idx);
                if (string.IsNullOrEmpty(msg)) { SendReply(player, "Invalid index."); return; }
                if (_config.ShowInChat) PrintToChat($"{_config.ChatPrefix} {msg}");
                _data.NextIndex = idx + 1; SaveData();
                return;
            }
            if (sub == "add")
            {
                if (args.Length < 2) { SendReply(player, "Usage: /werbungadmin add <text>"); return; }
                var textParts = new List<string>();
                for (int i = 1; i < args.Length; i++) textParts.Add(args[i]);
                var text = string.Join(" ", textParts.ToArray());
                // Add to default 'custom' category
                if (!_config.MessageCategories.ContainsKey("custom"))
                    _config.MessageCategories["custom"] = new List<string>();
                _config.MessageCategories["custom"].Add(text);
                SaveConfig();
                SendReply(player, "✅ Message added to category 'custom'.");
                return;
            }
            if (sub == "set")
            {
                if (args.Length < 3 || !int.TryParse(args[1], out var idx)) { SendReply(player, "Usage: /werbungadmin set <index> <text>"); return; }
                string cat; int catIdx;
                if (!TryResolveFlatMessageIndex(idx, out cat, out catIdx)) { SendReply(player, "Index out of range."); return; }
                var textParts = new List<string>();
                for (int i = 2; i < args.Length; i++) textParts.Add(args[i]);
                var text = string.Join(" ", textParts.ToArray());
                _config.MessageCategories[cat][catIdx] = text; SaveConfig(); SendReply(player, $"✅ Updated message #{idx}."); return;
            }
            if (sub == "remove")
            {
                if (args.Length < 2 || !int.TryParse(args[1], out var idx)) { SendReply(player, "Usage: /werbungadmin remove <index>"); return; }
                string cat; int catIdx;
                if (!TryResolveFlatMessageIndex(idx, out cat, out catIdx)) { SendReply(player, "❌ Index out of range."); return; }
                _config.MessageCategories[cat].RemoveAt(catIdx); SaveConfig(); SendReply(player, "✅ Message removed."); return;
            }
            if (sub == "resetindex") { _data.NextIndex = 0; SaveData(); SendReply(player, "✅ Message index reset to 0."); return; }
            if (sub == "prefix")
            {
                if (args.Length < 2) { SendReply(player, "Usage: /werbungadmin prefix <text>"); return; }
                var prefixParts = new List<string>();
                for (int i = 1; i < args.Length; i++) prefixParts.Add(args[i]);
                _config.ChatPrefix = string.Join(" ", prefixParts.ToArray()); SaveConfig(); SendReply(player, "✅ Chat prefix updated."); return;
            }
            if (sub == "reload") { LoadConfigValues(); SendReply(player, "✅ Configuration reloaded."); return; }
            if (sub == "save") { SaveConfig(); SaveData(); SendReply(player, "✅ Configuration and data saved."); return; }
            SendReply(player, "Usage: /werbungadmin on|off | interval <min> <max> | stats | backup | category <name> | list | now [index] | add <text> | set <index> <text> | remove <index> | resetindex | prefix <text> | reload | save");
        }

        private int GetFlattenedMessageCount()
        {
            if (_config == null || _config.MessageCategories == null) return 0;
            int total = 0;
            foreach (var cat in _config.MessageCategories.Values)
                if (cat != null) total += cat.Count;
            return total;
        }

        private void GetOrderedCategoryKeys(List<string> keys)
        {
            keys.Clear();
            if (_config == null || _config.MessageCategories == null) return;
            var all = new List<string>();
            foreach (var k in _config.MessageCategories.Keys) all.Add(k);
            all.Sort();
            if (_config.CategoryOrder != null && _config.CategoryOrder.Count > 0)
            {
                // Respect configured order; append any new categories alphabetically at the end
                var setAll = new HashSet<string>(all);
                var seen = new HashSet<string>();
                foreach (var k in _config.CategoryOrder)
                {
                    if (setAll.Contains(k) && !seen.Contains(k)) { keys.Add(k); seen.Add(k); }
                }
                foreach (var k in all)
                {
                    if (!seen.Contains(k)) keys.Add(k);
                }
            }
            else
            {
                keys.AddRange(all);
            }
        }

        private string NormalizeCategoryKey(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            name = name.Trim().ToLowerInvariant();
            var sb = new StringBuilder(name.Length);
            int max = 32;
            foreach (var ch in name)
            {
                if (sb.Length >= max) break;
                if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-')
                {
                    sb.Append(ch);
                }
                else if (ch == ' ' || ch == '.' || ch == '/' || ch == '\\')
                {
                    sb.Append('_');
                }
                else
                {
                    sb.Append('_');
                }
            }
            var key = sb.ToString().Trim('_', '-');
            while (key.Contains("__")) key = key.Replace("__", "_");
            if (string.IsNullOrEmpty(key) || key == "all") return null;
            return key;
        }

        private bool TryResolveFlatMessageIndex(int flatIndex, out string category, out int indexWithinCategory)
        {
            category = null;
            indexWithinCategory = -1;
            if (_config == null || _config.MessageCategories == null || flatIndex < 0) return false;
            var keys = new List<string>();
            GetOrderedCategoryKeys(keys);
            int current = 0;
            for (int ki = 0; ki < keys.Count; ki++)
            {
                var key = keys[ki];
                var list = _config.MessageCategories.ContainsKey(key) ? _config.MessageCategories[key] : null;
                if (list == null) continue;
                for (int i = 0; i < list.Count; i++)
                {
                    if (current == flatIndex)
                    {
                        category = key;
                        indexWithinCategory = i;
                        return true;
                    }
                    current++;
                }
            }
            return false;
        }

        private string GetMessageTextByFlatIndex(int flatIndex)
        {
            string cat; int idx;
            if (!TryResolveFlatMessageIndex(flatIndex, out cat, out idx)) return null;
            var list = _config.MessageCategories[cat];
            return (idx >= 0 && idx < list.Count) ? list[idx] : null;
        }

        [ChatCommand("werbung")]
        private void WerbungUI(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            
            if (args?.Length > 0 && args[0].ToLowerInvariant() == "ui" && HasAdminAccess(player))
            {
                OpenUI(player);
                return;
            }
            
            // Basic information for all players
            SendReply(player, "<color=#FFD700>📢 ELDRUN ADVERTISING SYSTEM</color> - Current Server Announcements");
            SendReply(player, "   The advertising system informs you about all available features and commands.");
            SendReply(player, $"   Messages appear every {_config.MinIntervalSeconds:0}-{_config.MaxIntervalSeconds:0} seconds automatically in chat.");
            SendReply(player, "   Use /werbungopt out|in to toggle advertising messages.");
            if (HasAdminAccess(player))
            {
                SendReply(player, "   <color=#90EE90>Admin:</color> Use /werbungadmin for advanced management or /werbung ui for the graphical interface.");
            }
            if (_config?.MessageCategories != null)
            {
                int totalMessages = 0;
                foreach (var cat in _config.MessageCategories.Values)
                    totalMessages += cat.Count;
                SendReply(player, $"📊 Currently {totalMessages} different advertising messages in {_config.MessageCategories.Count} categories active.");
                SendReply(player, $"📊 Total Broadcasts: {_data?.TotalBroadcasts ?? 0}");
            }
        }

        [ConsoleCommand("eldrunwerbung.ui.close")]
        private void UIW_Close(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; try { CuiHelper.DestroyUi(player, PanelName); } catch { }
        }

        [ConsoleCommand("eldrunwerbung.ui.refresh")]
        private void UIW_Refresh(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.enable")] // args: true|false
        private void UIW_Enable(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            bool en = arg.GetBool(0, _config.Enabled);
            _config.Enabled = en; SaveConfig(); RestartLoop();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.interval")] // args: seconds
        private void UIW_Interval(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            float sec = Mathf.Max(5f, arg.GetFloat(0, (_config.MinIntervalSeconds + _config.MaxIntervalSeconds) / 2));
            _config.MinIntervalSeconds = Math.Max(15f, sec - 5f);
            _config.MaxIntervalSeconds = sec + 5f;
            SaveConfig(); RestartLoop();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.now")] // args: index
        private void UIW_Now(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int total = GetFlattenedMessageCount();
            if (total == 0) return;
            int idx = Mathf.Clamp(arg.GetInt(0, _data?.NextIndex ?? 0), 0, Math.Max(0, total - 1));
            var msg = GetMessageTextByFlatIndex(idx); if (string.IsNullOrEmpty(msg)) return;
            if (_config.ShowInChat) PrintToChat($"{_config.ChatPrefix} {msg}");
            _data.NextIndex = idx + 1; SaveData();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.confirmremove")] // args: index - Show confirmation dialog
        private void UIW_ConfirmRemove(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1);
            int total = GetFlattenedMessageCount();
            if (idx < 0 || idx >= total) return;

            // Create confirmation overlay
            const string ConfirmPanel = "EldrunWerbungUIConfirm";
            try { CuiHelper.DestroyUi(player, ConfirmPanel); } catch { }

            var c = new CuiElementContainer();
            c.Add(new CuiPanel
            {
                Image = { Color = "0.08 0.08 0.12 0.98" },
                RectTransform = { AnchorMin = "0.35 0.40", AnchorMax = "0.65 0.60" },
                CursorEnabled = true
            }, "Overlay", ConfirmPanel);

            // Title
            c.Add(new CuiLabel
            {
                Text = { Text = "CONFIRM DELETION", FontSize = 16, Align = TextAnchor.MiddleCenter, Color = "0.88 0.28 0.28 1" },
                RectTransform = { AnchorMin = "0.1 0.70", AnchorMax = "0.9 0.85" }
            }, ConfirmPanel);

            // Message preview
            var msgPreview = GetMessageTextByFlatIndex(idx) ?? string.Empty;
            if (msgPreview.Length > 60) msgPreview = msgPreview.Substring(0, 60) + "...";
            c.Add(new CuiLabel
            {
                Text = { Text = $"Delete message #{idx}?\n{msgPreview}", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 0.8" },
                RectTransform = { AnchorMin = "0.1 0.45", AnchorMax = "0.9 0.68" }
            }, ConfirmPanel);

            // YES button
            c.Add(new CuiButton
            {
                Button = { Color = "0.45 0.10 0.10 0.90", Command = $"eldrunwerbung.ui.remove {idx}" },
                RectTransform = { AnchorMin = "0.15 0.20", AnchorMax = "0.45 0.35" },
                Text = { Text = "YES, DELETE", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, ConfirmPanel);

            // NO button
            c.Add(new CuiButton
            {
                Button = { Color = "0.18 0.55 0.20 0.90", Command = "eldrunwerbung.ui.cancelremove" },
                RectTransform = { AnchorMin = "0.55 0.20", AnchorMax = "0.85 0.35" },
                Text = { Text = "NO, CANCEL", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, ConfirmPanel);

            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.remove")] // args: index - Actually remove the message
        private void UIW_Remove(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1);
            string cat; int catIdx;
            if (!TryResolveFlatMessageIndex(idx, out cat, out catIdx)) return;
            _config.MessageCategories[cat].RemoveAt(catIdx); SaveConfig();
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIConfirm"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.cancelremove")]
        private void UIW_CancelRemove(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIConfirm"); } catch { }
        }
        
        [ConsoleCommand("eldrunwerbung.ui.stats")]
        private void UIW_Stats(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            
            // Zeige detaillierte Stats
            SendReply(player, "\n<color=#FFD700>📊 ADVERTISING STATISTICS</color>");
            SendReply(player, $"<color=#90EE90>Total Broadcasts:</color> {_data.TotalBroadcasts}");
            SendReply(player, $"<color=#FF6B6B>Opt-Out Players:</color> {_data.DisabledPlayers.Count}");
            SendReply(player, $"<color=#87CEEB>Active Players:</color> {BasePlayer.activePlayerList.Count - _data.DisabledPlayers.Count}");
            SendReply(player, "\n<color=#FFD700>Broadcasts per Category:</color>");
            foreach (var cat in _data.CategoryBroadcasts)
            {
                SendReply(player, $"  • <color=#FFA500>{cat.Key}:</color> {cat.Value}x");
            }
            SendReply(player, $"\n<color=#90EE90>Last Backup:</color> {(_data.LastBackup == DateTime.MinValue ? "Never" : _data.LastBackup.ToString("dd.MM.yyyy HH:mm"))}");
            
            // Refresh UI to show updated stats
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunwerbung.ui.backup")]
        private void UIW_Backup(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            
            // Echtes Backup erstellen
            CreateBackup();
            _data.LastBackup = DateTime.Now;
            SaveData();
            
            SendReply(player, "<color=#90EE90>💾 Backup created successfully!</color>");
            SendReply(player, $"Time: {DateTime.Now:dd.MM.yyyy HH:mm:ss}");
            
            // Refresh UI
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunwerbung.ui.random")]
        private void UIW_ToggleRandom(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            _config.RandomOrder = !_config.RandomOrder;
            RestartLoop();
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunwerbung.ui.broadcast")]
        private void UIW_BroadcastNow(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            
            // Echten Broadcast sofort senden
            BroadcastNext();
            
            SendReply(player, "<color=#90EE90>📢 Advertising sent to all players!</color>");
            
            // Refresh UI
            OpenUI(player);
        }
        
        [ConsoleCommand("eldrunwerbung.ui.category")] // args: category
        private void UIW_ShowCategory(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string catName = arg.GetString(0, "").ToLowerInvariant();
            if (string.IsNullOrEmpty(catName) || !_config.MessageCategories.ContainsKey(catName)) return;
            
            var messages = _config.MessageCategories[catName];
            PrintToChat(player, $"📚 Category '{catName}' ({messages.Count} messages):");
            for (int i = 0; i < Math.Min(messages.Count, 10); i++)
            {
                var shortMsg = messages[i].Length > 80 ? messages[i].Substring(0, 80) + "..." : messages[i];
                PrintToChat(player, $"  {i}: {shortMsg}");
            }
            if (messages.Count > 10) PrintToChat(player, $"... and {messages.Count - 10} more");
        }

        [ConsoleCommand("eldrunwerbung.ui.edit")] // args: index
        private void UIW_Edit(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1);
            int total = GetFlattenedMessageCount();
            if (idx < 0 || idx >= total) return;

            // Create small overlay editor
            const string EditPanel = "EldrunWerbungUIEdit";
            try { CuiHelper.DestroyUi(player, EditPanel); } catch { }

            var c = new CuiElementContainer();
            c.Add(new CuiPanel
            {
                Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") },
                RectTransform = { AnchorMin = "0.30 0.35", AnchorMax = "0.70 0.65" },
                CursorEnabled = true
            }, "Overlay", EditPanel);

            // Title
            c.Add(new CuiLabel
            {
                Text = { Text = T("werbung.ui.edit_title", null, "EDIT MESSAGE"), FontSize = 18, Align = TextAnchor.MiddleLeft, Color = TV("team1_text", "0.95 0.88 0.60 1") },
                RectTransform = { AnchorMin = "0.32 0.61", AnchorMax = "0.66 0.64" }
            }, EditPanel);

            // Input field (pre-filled)
            var current = GetMessageTextByFlatIndex(idx) ?? string.Empty;
            _editDraft[player.userID] = current; // initialize draft
            c.Add(new CuiElement
            {
                Parent = EditPanel,
                Components =
                {
                    new CuiInputFieldComponent
                    {
                        Align = TextAnchor.UpperLeft,
                        CharsLimit = 500,
                        Command = $"eldrunwerbung.ui.edittext {idx}",
                        FontSize = 12,
                        Text = current
                    },
                    new CuiRectTransformComponent { AnchorMin = "0.32 0.43", AnchorMax = "0.68 0.59" }
                }
            });

            // Save & Cancel buttons
            c.Add(new CuiButton
            {
                Button = { Color = TV("team1_join", "0.18 0.55 0.20 0.90"), Command = $"eldrunwerbung.ui.applyedit {idx}" },
                RectTransform = { AnchorMin = "0.44 0.37", AnchorMax = "0.56 0.41" },
                Text = { Text = T("ui.save", null, "Save"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, EditPanel);

            c.Add(new CuiButton
            {
                Button = { Color = TV("close_btn", "0.45 0.10 0.10 0.90"), Command = "eldrunwerbung.ui.canceledit" },
                RectTransform = { AnchorMin = "0.58 0.37", AnchorMax = "0.70 0.41" },
                Text = { Text = T("ui.cancel", null, "Cancel"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, EditPanel);

            // Close X
            c.Add(new CuiButton
            {
                Button = { Color = TV("close_btn", "0.45 0.10 0.10 0.90"), Command = "eldrunwerbung.ui.canceledit" },
                RectTransform = { AnchorMin = "0.675 0.62", AnchorMax = "0.695 0.64" },
                Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" }
            }, EditPanel);

            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.edittext")] // args: index, <text...>
        private void UIW_EditText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1);
            int total = GetFlattenedMessageCount();
            if (idx < 0 || idx >= total) return;

            // Capture entire text after the first argument
            string newText = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 2)
                {
                    var parts = new List<string>();
                    for (int i = 1; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    newText = string.Join(" ", parts.ToArray());
                }
                else
                {
                    newText = arg.GetString(1, "");
                }
            }
            catch { newText = arg.GetString(1, ""); }

            _editDraft[player.userID] = newText ?? string.Empty;
        }

        [ConsoleCommand("eldrunwerbung.ui.applyedit")] // args: index
        private void UIW_ApplyEdit(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int idx = arg.GetInt(0, -1);
            string cat; int catIdx;
            if (!TryResolveFlatMessageIndex(idx, out cat, out catIdx)) return;

            string fallback = GetMessageTextByFlatIndex(idx) ?? string.Empty;
            string newText = _editDraft.ContainsKey(player.userID) ? _editDraft[player.userID] : fallback;
            if (!string.IsNullOrWhiteSpace(newText))
            {
                _config.MessageCategories[cat][catIdx] = newText;
                SaveConfig();
            }
            _editDraft.Remove(player.userID);

            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIEdit"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.canceledit")]
        private void UIW_CancelEdit(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _editDraft.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIEdit"); } catch { }
            OpenUI(player);
        }

        private void OpenUI(BasePlayer player)
        {
            try { CuiHelper.DestroyUi(player, PanelName); } catch { }
            LoadTheme();
            var c = new CuiElementContainer();
            var themeColors = GetPlayerThemeColors(player);
            
            // ═══════════════════════════════════════════════════════════
            // 🎨 AAA FULLSCREEN UI SYSTEM (wie EldrunCastles)
            // ═══════════════════════════════════════════════════════════
            
            // ═══ FULLSCREEN BACKGROUND ═══
            c.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.95", FadeIn = 0.2f },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" },
                CursorEnabled = true
            }, "Overlay", PanelName);
            
            // ═══ HEADER ═══
            c.Add(new CuiPanel { Image = { Color = themeColors["HeaderBG"] }, RectTransform = { AnchorMin = "0 0.92", AnchorMax = "1 1" } }, PanelName, "Header");

            // Globaler Eldrun-Header-Text für Werbung System
            var statusText = _config.Enabled ? "ENABLED" : "DISABLED";
            int totalMessages = GetFlattenedMessageCount();
            int totalBroadcasts = _data?.TotalBroadcasts ?? 0;
            var headerText = $"⚔ EldrunRust BETA  | 📦 Werbung System | 👤 Status: {statusText} | ⚔ Messages: {totalMessages} | 💀 Interval: {_config.MinIntervalSeconds:0}-{_config.MaxIntervalSeconds:0}s | 📢 Broadcasts: {totalBroadcasts}";

            c.Add(new CuiLabel
            {
                Text = { Text = headerText, FontSize = 13, Align = TextAnchor.MiddleLeft, Color = themeColors["HeaderColor"] },
                RectTransform = { AnchorMin = "0.02 0.10", AnchorMax = "0.96 0.90" }
            }, "Header");

            // Header-Actions oben rechts: Refresh – EldrunKits-Stil (Neon Green), Close-Button bleibt entfernt
            c.Add(new CuiButton
            {
                Button = { Color = "0 0.4 0.2 0.9", Command = "eldrunwerbung.ui.refresh", FadeIn = 0.3f },
                RectTransform = { AnchorMin = "0.84 0.91", AnchorMax = "0.91 0.99" },
                Text = { Text = "🔄 REFRESH", FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "0 1 0.5 1" }
            }, PanelName);

            // Linke Sidebar-Navigation wird nicht mehr verwendet und wurde entfernt

            // Rechte Aktions-Sidebar bleibt thematisch, aber an Fraktionsbreite angeglichen
            c.Add(new CuiPanel { Image = { Color = themeColors["SidebarBG"] }, RectTransform = { AnchorMin = "0.82 0.06", AnchorMax = "1 0.91" } }, PanelName, "SidebarRight");
            string activeTab = _playerActiveTab.ContainsKey(player.userID) ? _playerActiveTab[player.userID] : "overview";
            
            // Right sidebar action buttons (logical, icon-based)
            float ry = 0.80f; float rh = 0.08f; float rg = 0.02f;
            c.Add(new CuiButton { Button = { Color = themeColors["TabActive"], Command = "eldrunwerbung.ui.tab overview" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", ry), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.94 {0}", ry + rh) }, Text = { Text = "📊 OVERVIEW", FontSize = 13, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarRight");
            ry -= (rh + rg);
            c.Add(new CuiButton { Button = { Color = themeColors["TabInactive"], Command = "eldrunwerbung.ui.tab messages" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", ry), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.94 {0}", ry + rh) }, Text = { Text = "📝 MESSAGES", FontSize = 13, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarRight");
            ry -= (rh + rg);
            c.Add(new CuiButton { Button = { Color = themeColors["TabInactive"], Command = "eldrunwerbung.ui.tab settings" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", ry), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.94 {0}", ry + rh) }, Text = { Text = "⚙️ SETTINGS", FontSize = 13, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarRight");
            ry -= (rh + rg);
            c.Add(new CuiButton { Button = { Color = themeColors["InfoColor"], Command = "eldrunwerbung.ui.tab stats" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", ry), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.94 {0}", ry + rh) }, Text = { Text = "📈 STATS", FontSize = 13, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarRight");
            ry -= (rh + rg);
            c.Add(new CuiButton { Button = { Color = themeColors["SuccessColor"], Command = "eldrunwerbung.ui.broadcast" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", ry), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.94 {0}", ry + rh) }, Text = { Text = "📢 BROADCAST", FontSize = 13, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "SidebarRight");

            // ═══ CONTENT ═══
            c.Add(new CuiPanel { Image = { Color = themeColors["ContentBG"] }, RectTransform = { AnchorMin = "0.19 0.06", AnchorMax = "0.81 0.91" } }, PanelName, "Content");
            
            // Render active tab content
            switch (activeTab)
            {
                case "overview": AddOverviewTab(c, player, themeColors); break;
                case "messages": AddMessagesTab(c, player, themeColors); break;
                case "settings": AddSettingsTab(c, player, themeColors); break;
                case "stats": AddStatsTab(c, player, themeColors); break;
                case "categories": AddCategoriesTab(c, player, themeColors); break;
            }

            // Subtle inner gloss band
            c.Add(new CuiPanel { Image = { Color = TV("gloss", "0.30 0.55 0.85 0.06") }, RectTransform = { AnchorMin = "0.02 0.90", AnchorMax = "0.98 0.93" } }, PanelName);

            // Side banners & blue borders for GoT premium look
            c.Add(new CuiPanel { Image = { Color = TV("side_left", "0.20 0.45 0.65 0.25") }, RectTransform = { AnchorMin = "0.01 0.10", AnchorMax = "0.03 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("side_right", "0.20 0.45 0.65 0.25") }, RectTransform = { AnchorMin = "0.97 0.10", AnchorMax = "0.99 0.98" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.20 0.45 0.65 0.35") }, RectTransform = { AnchorMin = "0.015 0.11", AnchorMax = "0.985 0.12" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.20 0.45 0.65 0.35") }, RectTransform = { AnchorMin = "0.015 0.88", AnchorMax = "0.985 0.89" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.20 0.45 0.65 0.35") }, RectTransform = { AnchorMin = "0.015 0.12", AnchorMax = "0.02 0.88" } }, PanelName);
            c.Add(new CuiPanel { Image = { Color = TV("border", "0.20 0.45 0.65 0.35") }, RectTransform = { AnchorMin = "0.98 0.12", AnchorMax = "0.985 0.88" } }, PanelName);

            // Content background
            c.Add(new CuiPanel { Image = { Color = TV("content_bg", "0.10 0.10 0.12 0.25") }, RectTransform = { AnchorMin = "0.02 0.12", AnchorMax = "0.98 0.89" } }, PanelName);

            // ═══ FOOTER ═══ (Global Eldrun-Footer)
            c.Add(new CuiPanel
            {
                Image = { Color = themeColors["FooterBG"] },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 0.04" }
            }, PanelName, "Footer");

            var footerText = $"⚔ EldrunRust BETA  | 📦 {Name} v{Version} | 👑 Powerd bY SirEldrun | 🌌 Unified Eldrun UI";
            c.Add(new CuiLabel
            {
                Text = { Text = footerText, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "0.86 0.72 0.38 1" },
                RectTransform = { AnchorMin = "0.01 0", AnchorMax = "0.99 1" }
            }, "Footer");

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

            // Title
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.title", null, "ADVERTISING SYSTEM"), FontSize = 24, Align = TextAnchor.MiddleLeft, Color = TV("team1_text", "0.95 0.88 0.60 1") }, RectTransform = { AnchorMin = "0.04 0.935", AnchorMax = "0.60 0.985" } }, PanelName);
            // Optional title icon (theme)
            var iconTitle = TV("icon_admin_module_werbung", null);
            if (string.IsNullOrEmpty(iconTitle)) iconTitle = TV("icon_announcement", null);
            if (string.IsNullOrEmpty(iconTitle)) iconTitle = TV("icon_overview", null);
            if (!string.IsNullOrEmpty(iconTitle))
            {
                c.Add(new CuiLabel { Text = { Text = iconTitle, FontSize = 20, Align = TextAnchor.MiddleLeft, Color = TV("team1_text", "0.95 0.88 0.60 1") }, RectTransform = { AnchorMin = "0.01 0.935", AnchorMax = "0.04 0.985" } }, PanelName);
            }
            
            // Root-level content moved into tab renderers

            // Optional attribution
            if (TV("show_attribution", "false") == "true")
            {
                c.Add(new CuiLabel { Text = { Text = T("faction.attribution", null, "Icons: game-icons.net (CC BY 3.0)"), FontSize = 10, Align = TextAnchor.MiddleRight, Color = themeColors["SubTextColor"] }, RectTransform = { AnchorMin = "0.70 0.122", AnchorMax = "0.96 0.135" } }, PanelName);
            }

            CuiHelper.AddUi(player, c);
        }
        
        private void AddTabButton(CuiElementContainer c, string tabId, string label, float yPos, string activeTab, Dictionary<string, string> colors)
        {
            bool isActive = tabId == activeTab;
            c.Add(new CuiButton { Button = { Color = isActive ? colors["TabActive"] : colors["TabInactive"], Command = $"eldrunwerbung.ui.tab {tabId}" }, RectTransform = { AnchorMin = $"0.02 {yPos}", AnchorMax = $"0.98 {yPos + 0.08f}" }, Text = { Text = label, FontSize = 13, Align = TextAnchor.MiddleCenter, Color = isActive ? "1 1 1 1" : "0.7 0.7 0.7 1" } }, "Sidebar");
        }
        
        private void AddOverviewTab(CuiElementContainer c, BasePlayer player, Dictionary<string, string> colors)
        {
            c.Add(new CuiLabel { Text = { Text = "📊 OVERVIEW", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.96" } }, "Content");
            string st = _config.Enabled ? "Active" : "Inactive";
            int totalMessages = GetFlattenedMessageCount();
            c.Add(new CuiLabel { Text = { Text = $"Status: {st}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.83", AnchorMax = "0.30 0.88" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Interval: {_config.MinIntervalSeconds:0}-{_config.MaxIntervalSeconds:0}s", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.32 0.83", AnchorMax = "0.60 0.88" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Messages: {totalMessages}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.62 0.83", AnchorMax = "0.80 0.88" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Total Broadcasts: {_data?.TotalBroadcasts ?? 0}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.82 0.83", AnchorMax = "0.98 0.88" } }, "Content");

            // Quick controls
            c.Add(new CuiButton { Button = { Color = _config.Enabled?colors["ErrorColor"]:colors["SuccessColor"], Command = _config.Enabled?"eldrunwerbung.ui.enable false":"eldrunwerbung.ui.enable true" }, RectTransform = { AnchorMin = "0.05 0.75", AnchorMax = "0.18 0.80" }, Text = { Text = _config.Enabled?T("common.disable", null, "Disable"):T("common.enable", null, "Enable"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.interval {(_config.MinIntervalSeconds + _config.MaxIntervalSeconds) / 2 + 5}" }, RectTransform = { AnchorMin = "0.20 0.75", AnchorMax = "0.26 0.80" }, Text = { Text = "+5s", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.interval {Mathf.Max(20f, (_config.MinIntervalSeconds + _config.MaxIntervalSeconds) / 2 - 5f)}" }, RectTransform = { AnchorMin = "0.28 0.75", AnchorMax = "0.34 0.80" }, Text = { Text = "-5s", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["InfoColor"], Command = "eldrunwerbung.ui.tab stats" }, RectTransform = { AnchorMin = "0.36 0.75", AnchorMax = "0.48 0.80" }, Text = { Text = T("werbung.ui.stats", null, "Statistics"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["WarningColor"], Command = "eldrunwerbung.ui.backup" }, RectTransform = { AnchorMin = "0.50 0.75", AnchorMax = "0.62 0.80" }, Text = { Text = T("werbung.ui.backup", null, "Backup"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = "eldrunwerbung.ui.random" }, RectTransform = { AnchorMin = "0.64 0.75", AnchorMax = "0.78 0.80" }, Text = { Text = _config.RandomOrder ? T("werbung.ui.sequential", null, "Sequential") : T("werbung.ui.random", null, "Random"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = "eldrunwerbung.ui.broadcast" }, RectTransform = { AnchorMin = "0.80 0.75", AnchorMax = "0.94 0.80" }, Text = { Text = T("werbung.ui.broadcast_now", null, "Broadcast Now"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
        }
        
        private void AddMessagesTab(CuiElementContainer c, BasePlayer player, Dictionary<string, string> colors)
        {
            c.Add(new CuiLabel { Text = { Text = "📝 MESSAGES", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.96" } }, "Content");
            // Filters: search input and category selection
            string search = _msgFilterSearch.ContainsKey(player.userID) ? _msgFilterSearch[player.userID] : string.Empty;
            string catFilter = _msgFilterCategory.ContainsKey(player.userID) ? _msgFilterCategory[player.userID] : "all";
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.search", null, "Search"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.05 0.85", AnchorMax = "0.10 0.88" } }, "Content");
            c.Add(new CuiElement { Parent = "Content", Components = { new CuiInputFieldComponent { Align = TextAnchor.MiddleLeft, CharsLimit = 80, Command = "eldrunwerbung.ui.filtertext", FontSize = 12, Text = search }, new CuiRectTransformComponent { AnchorMin = "0.11 0.845", AnchorMax = "0.40 0.885" } } });
            // Reset Filter button
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.filterreset" }, RectTransform = { AnchorMin = "0.42 0.845", AnchorMax = "0.485 0.885" }, Text = { Text = T("common.reset", null, "Reset"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

            // Category buttons row
            var keys = new List<string>();
            GetOrderedCategoryKeys(keys);
            int catCount = keys.Count;
            bool usePicker = catCount > 12;
            if (!usePicker)
            {
                // Show chips for ALL + categories
                var rowCats = new List<string>(); rowCats.Add("all");
                for (int k = 0; k < keys.Count; k++) rowCats.Add(keys[k]);
                float xStart = 0.50f; float x = xStart; float yTop = 0.845f; float btnW = 0.07f; float btnH = 0.04f; float gap = 0.005f;
                for (int i = 0; i < rowCats.Count && x + btnW <= 0.98f; i++)
                {
                    string cat = rowCats[i]; string label = cat.ToUpperInvariant(); bool active = string.Equals(catFilter, cat, StringComparison.OrdinalIgnoreCase);
                    c.Add(new CuiButton { Button = { Color = active ? colors["TabActive"] : colors["TabInactive"], Command = $"eldrunwerbung.ui.filtercat {cat}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "{0} {1}", x, yTop), AnchorMax = string.Format(CultureInfo.InvariantCulture, "{0} {1}", x + btnW, yTop + btnH) }, Text = { Text = label, FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                    x += btnW + gap;
                }
            }
            else
            {
                // Show Category Picker instead of chips
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.catpicker" }, RectTransform = { AnchorMin = "0.50 0.845", AnchorMax = "0.65 0.885" }, Text = { Text = T("werbung.ui.select_category", null, "Select Category"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                string currentLabel = string.Equals(catFilter, "all", StringComparison.OrdinalIgnoreCase) ? "ALL" : catFilter.ToUpperInvariant();
                c.Add(new CuiLabel { Text = { Text = $"{T("werbung.ui.current", null, "Current")} : {currentLabel}", FontSize = 11, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.66 0.845", AnchorMax = "0.98 0.885" } }, "Content");
            }

            // New Category button
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.newcat.overlay" }, RectTransform = { AnchorMin = "0.80 0.80", AnchorMax = "0.95 0.84" }, Text = { Text = T("werbung.ui.new_category", null, "New Category"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            // Category order Up/Down when a category is selected
            if (!string.IsNullOrEmpty(catFilter) && !string.Equals(catFilter, "all", StringComparison.OrdinalIgnoreCase))
            {
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.catorder.up" }, RectTransform = { AnchorMin = "0.74 0.80", AnchorMax = "0.78 0.84" }, Text = { Text = "▲", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.catorder.down" }, RectTransform = { AnchorMin = "0.79 0.80", AnchorMax = "0.83 0.84" }, Text = { Text = "▼", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            }

            // Build matching indices according to filters
            int totalFlat = GetFlattenedMessageCount();
            var matching = new List<int>();
            for (int i = 0; i < totalFlat; i++)
            {
                var t = GetMessageTextByFlatIndex(i);
                if (string.IsNullOrEmpty(t)) continue;
                bool searchOk = string.IsNullOrEmpty(search) || t.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0;
                bool catOk = true;
                if (!string.IsNullOrEmpty(catFilter) && !string.Equals(catFilter, "all", StringComparison.OrdinalIgnoreCase))
                {
                    string cat; int idxWithin; if (!TryResolveFlatMessageIndex(i, out cat, out idxWithin)) cat = null;
                    catOk = (cat != null && string.Equals(cat, catFilter, StringComparison.OrdinalIgnoreCase));
                }
                if (searchOk && catOk) matching.Add(i);
            }

            int pageSize = 8;
            int page = _playerMessagePage.ContainsKey(player.userID) ? _playerMessagePage[player.userID] : 0;
            int totalPages = Mathf.Max(1, (int)Math.Ceiling(matching.Count / (double)pageSize));
            if (page >= totalPages) page = totalPages - 1; if (page < 0) page = 0; _playerMessagePage[player.userID] = page;

            float yList = 0.78f; float rowH = 0.07f; int start = page * pageSize; int end = Math.Min(matching.Count, start + pageSize);
            if (matching.Count == 0)
            {
                c.Add(new CuiLabel { Text = { Text = T("werbung.ui.none", null, "No messages match your filter."), FontSize = 14, Align = TextAnchor.MiddleCenter, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.60", AnchorMax = "0.95 0.68" } }, "Content");
            }
            else
            {
                for (int j = start; j < end; j++)
                {
                    int i = matching[j];
                    var text = GetMessageTextByFlatIndex(i);
                    if (string.IsNullOrEmpty(text)) continue;
                    string label = text.Length > 100 ? text.Substring(0, 100) + "..." : text;
                    var views = _data.MessageViews.ContainsKey(text) ? _data.MessageViews[text] : 0;
                    bool isSel = _msgSelected.ContainsKey(player.userID) && _msgSelected[player.userID] != null && _msgSelected[player.userID].Contains(i);
                    string selCmd = $"eldrunwerbung.ui.select.toggle {i}";
                    // Selection checkbox
                    c.Add(new CuiButton { Button = { Color = isSel ? colors["TabActive"] : colors["TabInactive"], Command = selCmd }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.02 {0}", yList), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.045 {0}", yList + rowH) }, Text = { Text = isSel ? "☑" : "☐", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                    c.Add(new CuiLabel { Text = { Text = $"#{i}: {label} ({views}x)", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.05 {0}", yList), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.68 {0}", yList + rowH) } }, "Content");
                    c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = $"eldrunwerbung.ui.now {i}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.70 {0}", yList), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.78 {0}", yList + rowH) }, Text = { Text = T("werbung.ui.now", null, "Now"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                    c.Add(new CuiButton { Button = { Color = colors["WarningColor"], Command = $"eldrunwerbung.ui.edit {i}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.80 {0}", yList), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.88 {0}", yList + rowH) }, Text = { Text = T("werbung.ui.edit", null, "Edit"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                    c.Add(new CuiButton { Button = { Color = colors["ErrorColor"], Command = $"eldrunwerbung.ui.confirmremove {i}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.90 {0}", yList), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.97 {0}", yList + rowH) }, Text = { Text = T("werbung.ui.remove", null, "Remove"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                    yList -= (rowH + 0.01f);
                }

                // Pagination controls
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.page {Mathf.Max(0, page - 1)}" }, RectTransform = { AnchorMin = "0.05 0.10", AnchorMax = "0.12 0.15" }, Text = { Text = "◀ Prev", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiLabel { Text = { Text = $"Page {page + 1}/{totalPages}", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.12 0.10", AnchorMax = "0.18 0.15" } }, "Content");
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.page {Mathf.Min(totalPages - 1, page + 1)}" }, RectTransform = { AnchorMin = "0.18 0.10", AnchorMax = "0.25 0.15" }, Text = { Text = "Next ▶", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                // Selection helpers
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.select.allpage" }, RectTransform = { AnchorMin = "0.28 0.10", AnchorMax = "0.38 0.15" }, Text = { Text = T("werbung.ui.select_all", null, "Select Page"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.select.clear" }, RectTransform = { AnchorMin = "0.40 0.10", AnchorMax = "0.50 0.15" }, Text = { Text = T("werbung.ui.clear_sel", null, "Clear Sel"), FontSize = 11, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            }

            // Add new message
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.addoverlay" }, RectTransform = { AnchorMin = "0.62 0.10", AnchorMax = "0.77 0.15" }, Text = { Text = T("werbung.ui.add", null, "Add New"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            // Delete category (with confirm)
            c.Add(new CuiButton { Button = { Color = colors["ErrorColor"], Command = "eldrunwerbung.ui.delcat.confirm" }, RectTransform = { AnchorMin = "0.79 0.10", AnchorMax = "0.95 0.15" }, Text = { Text = T("werbung.ui.delete_category", null, "Delete Category"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

            // When a specific category is selected, show extra tools: Rename, Move All, Copy All
            if (!string.IsNullOrEmpty(catFilter) && !string.Equals(catFilter, "all", StringComparison.OrdinalIgnoreCase))
            {
                // Rename Category (top-right area near New Category)
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.renamecat.overlay" }, RectTransform = { AnchorMin = "0.62 0.80", AnchorMax = "0.77 0.84" }, Text = { Text = T("werbung.ui.rename_category", null, "Rename Category"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                // Move/Copy All (second row above bottom)
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.destpicker.move" }, RectTransform = { AnchorMin = "0.62 0.16", AnchorMax = "0.77 0.21" }, Text = { Text = T("werbung.ui.move_all", null, "Move All"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.destpicker.copy" }, RectTransform = { AnchorMin = "0.79 0.16", AnchorMax = "0.95 0.21" }, Text = { Text = T("werbung.ui.copy_all", null, "Copy All"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                // Move/Copy Selected
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.destpicker.move_sel" }, RectTransform = { AnchorMin = "0.62 0.22", AnchorMax = "0.77 0.27" }, Text = { Text = T("werbung.ui.move_selected", null, "Move Selected"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
                c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.destpicker.copy_sel" }, RectTransform = { AnchorMin = "0.79 0.22", AnchorMax = "0.95 0.27" }, Text = { Text = T("werbung.ui.copy_selected", null, "Copy Selected"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            }
        }
        
        private void AddSettingsTab(CuiElementContainer c, BasePlayer player, Dictionary<string, string> colors)
        {
            c.Add(new CuiLabel { Text = { Text = "⚙️ SETTINGS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.96" } }, "Content");
            // Show In Chat toggle
            c.Add(new CuiLabel { Text = { Text = "Show in Chat", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.80", AnchorMax = "0.25 0.86" } }, "Content");
            c.Add(new CuiButton { Button = { Color = _config.ShowInChat ? colors["SuccessColor"] : colors["ErrorColor"], Command = "eldrunwerbung.ui.toggle.showchat" }, RectTransform = { AnchorMin = "0.26 0.80", AnchorMax = "0.38 0.86" }, Text = { Text = _config.ShowInChat ? "ON" : "OFF", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            // Player Opt-Out toggle
            c.Add(new CuiLabel { Text = { Text = "Player Opt-Out", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.70", AnchorMax = "0.25 0.76" } }, "Content");
            c.Add(new CuiButton { Button = { Color = _config.PlayerOptOut ? colors["SuccessColor"] : colors["ErrorColor"], Command = "eldrunwerbung.ui.toggle.playeropt" }, RectTransform = { AnchorMin = "0.26 0.70", AnchorMax = "0.38 0.76" }, Text = { Text = _config.PlayerOptOut ? "ON" : "OFF", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

            // Random/Sequential mode toggle
            c.Add(new CuiLabel { Text = { Text = "Mode", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.60", AnchorMax = "0.25 0.66" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabActive"], Command = "eldrunwerbung.ui.random" }, RectTransform = { AnchorMin = "0.26 0.60", AnchorMax = "0.46 0.66" }, Text = { Text = _config.RandomOrder ? "Random" : "Sequential", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

            // Enable/Disable and Interval +/-
            c.Add(new CuiLabel { Text = { Text = "Status", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.50", AnchorMax = "0.25 0.56" } }, "Content");
            c.Add(new CuiButton { Button = { Color = _config.Enabled?colors["ErrorColor"]:colors["SuccessColor"], Command = _config.Enabled?"eldrunwerbung.ui.enable false":"eldrunwerbung.ui.enable true" }, RectTransform = { AnchorMin = "0.26 0.50", AnchorMax = "0.38 0.56" }, Text = { Text = _config.Enabled?T("common.disable", null, "Disable"):T("common.enable", null, "Enable"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = "Interval", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.40", AnchorMax = "0.25 0.46" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.interval {Mathf.Max(20f, (_config.MinIntervalSeconds + _config.MaxIntervalSeconds) / 2 - 5f)}" }, RectTransform = { AnchorMin = "0.26 0.40", AnchorMax = "0.32 0.46" }, Text = { Text = "-5s", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = $"eldrunwerbung.ui.interval {(_config.MinIntervalSeconds + _config.MaxIntervalSeconds) / 2 + 5}" }, RectTransform = { AnchorMin = "0.34 0.40", AnchorMax = "0.40 0.46" }, Text = { Text = "+5s", FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");

            // Export/Import categories
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.exportcats" }, RectTransform = { AnchorMin = "0.05 0.28", AnchorMax = "0.20 0.34" }, Text = { Text = T("werbung.ui.export_categories", null, "Export Categories"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
            c.Add(new CuiButton { Button = { Color = colors["TabInactive"], Command = "eldrunwerbung.ui.importcats.overlay" }, RectTransform = { AnchorMin = "0.22 0.28", AnchorMax = "0.37 0.34" }, Text = { Text = T("werbung.ui.import_categories", null, "Import Categories"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, "Content");
        }
        
        private void AddStatsTab(CuiElementContainer c, BasePlayer player, Dictionary<string, string> colors)
        {
            c.Add(new CuiLabel { Text = { Text = "📈 STATS", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.96" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Total Broadcasts: {_data.TotalBroadcasts}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.82", AnchorMax = "0.40 0.87" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Opt-Out Players: {_data.DisabledPlayers.Count}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.76", AnchorMax = "0.40 0.81" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Messages: {GetFlattenedMessageCount()}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.70", AnchorMax = "0.40 0.75" } }, "Content");
            c.Add(new CuiLabel { Text = { Text = $"Last Backup: {(_data.LastBackup == DateTime.MinValue ? "Never" : _data.LastBackup.ToString("dd.MM.yyyy HH:mm"))}", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = "0.05 0.64", AnchorMax = "0.60 0.69" } }, "Content");

            // Categories list (top 8)
            float y = 0.58f; int shown = 0;
            c.Add(new CuiLabel { Text = { Text = "Per-Category Broadcasts:", FontSize = 14, Align = TextAnchor.MiddleLeft, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.60", AnchorMax = "0.60 0.63" } }, "Content");
            foreach (var cat in _data.CategoryBroadcasts)
            {
                if (shown >= 8) break;
                c.Add(new CuiLabel { Text = { Text = $"• {cat.Key}: {cat.Value}x", FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["TextColor"] }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "0.06 {0}", y - 0.02f), AnchorMax = string.Format(CultureInfo.InvariantCulture, "0.60 {0}", y + 0.02f) } }, "Content");
                y -= 0.05f; shown++;
            }
        }
        
        private void AddCategoriesTab(CuiElementContainer c, BasePlayer player, Dictionary<string, string> colors)
        {
            c.Add(new CuiLabel { Text = { Text = "🎨 CATEGORIES", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.05 0.90", AnchorMax = "0.95 0.96" } }, "Content");
        }
        
        [ConsoleCommand("eldrunwerbung.ui.tab")]
        private void UITab(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            string tab = arg.GetString(0, "overview");
            _playerActiveTab[player.userID] = tab;
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.page")] // args: pageIndex
        private void UIW_Page(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            int page = Mathf.Max(0, arg.GetInt(0, 0));
            _playerMessagePage[player.userID] = page;
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.addoverlay")]
        private void UIW_AddOverlay(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            const string AddPanel = "EldrunWerbungUIAdd";
            try { CuiHelper.DestroyUi(player, AddPanel); } catch { }

            if (!_addDraftText.ContainsKey(player.userID)) _addDraftText[player.userID] = string.Empty;
            if (!_addDraftCategory.ContainsKey(player.userID)) _addDraftCategory[player.userID] = "custom";

            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel
            {
                Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") },
                RectTransform = { AnchorMin = "0.28 0.32", AnchorMax = "0.72 0.66" },
                CursorEnabled = true
            }, "Overlay", AddPanel);

            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.add_title", null, "ADD MESSAGE"), FontSize = 18, Align = TextAnchor.MiddleLeft, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.30 0.62", AnchorMax = "0.70 0.65" } }, AddPanel);

            // Message input
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.message", null, "Message"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.30 0.56", AnchorMax = "0.42 0.60" } }, AddPanel);
            c.Add(new CuiElement
            {
                Parent = AddPanel,
                Components =
                {
                    new CuiInputFieldComponent { Align = TextAnchor.UpperLeft, CharsLimit = 500, Command = "eldrunwerbung.ui.addtext", FontSize = 12, Text = _addDraftText[player.userID] },
                    new CuiRectTransformComponent { AnchorMin = "0.30 0.46", AnchorMax = "0.70 0.56" }
                }
            });

            // Category selection buttons (dropdown-like row)
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.category", null, "Category"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.30 0.42", AnchorMax = "0.42 0.46" } }, AddPanel);
            var keysAdd = new List<string>(); GetOrderedCategoryKeys(keysAdd);
            if (!keysAdd.Contains("custom")) keysAdd.Insert(0, "custom");
            float ax = 0.30f; float ay = 0.36f; float aw = 0.10f; float ah = 0.05f; float ag = 0.01f;
            for (int i = 0; i < keysAdd.Count && ax + aw <= 0.70f; i++)
            {
                string cat = keysAdd[i]; bool active = string.Equals(_addDraftCategory[player.userID], cat, StringComparison.OrdinalIgnoreCase);
                c.Add(new CuiButton { Button = { Color = active ? colors["TabActive"] : colors["TabInactive"], Command = $"eldrunwerbung.ui.addcat {cat}" }, RectTransform = { AnchorMin = string.Format(CultureInfo.InvariantCulture, "{0} {1}", ax, ay), AnchorMax = string.Format(CultureInfo.InvariantCulture, "{0} {1}", ax + aw, ay + ah) }, Text = { Text = cat.ToUpperInvariant(), FontSize = 10, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, AddPanel);
                ax += aw + ag;
            }

            // Buttons
            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.applyadd" }, RectTransform = { AnchorMin = "0.44 0.32", AnchorMax = "0.56 0.36" }, Text = { Text = T("ui.add", null, "Add"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, AddPanel);
            c.Add(new CuiButton { Button = { Color = colors["ErrorColor"], Command = "eldrunwerbung.ui.canceladd" }, RectTransform = { AnchorMin = "0.58 0.32", AnchorMax = "0.70 0.36" }, Text = { Text = T("ui.cancel", null, "Cancel"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, AddPanel);

            // Close X
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.canceladd" }, RectTransform = { AnchorMin = "0.70 0.63", AnchorMax = "0.72 0.65" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, AddPanel);

            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.addtext")] // args: <text...>
        private void UIW_AddText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string newText = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 1)
                {
                    var parts = new List<string>();
                    for (int i = 0; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    newText = string.Join(" ", parts.ToArray());
                }
                else
                {
                    newText = arg.GetString(0, "");
                }
            }
            catch { newText = arg.GetString(0, ""); }
            _addDraftText[player.userID] = newText ?? string.Empty;
        }

        [ConsoleCommand("eldrunwerbung.ui.addcat")] // args: <category>
        private void UIW_AddCategory(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            var cat = arg.GetString(0, "custom");
            if (string.IsNullOrEmpty(cat)) cat = "custom";
            _addDraftCategory[player.userID] = cat.ToLowerInvariant();
            // Refresh overlay to update active button
            UIW_AddOverlay(arg);
        }

        [ConsoleCommand("eldrunwerbung.ui.filtertext")] // args: <text...>
        private void UIW_FilterText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 1)
                {
                    var parts = new List<string>();
                    for (int i = 0; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    text = string.Join(" ", parts.ToArray());
                }
                else
                {
                    text = arg.GetString(0, "");
                }
            }
            catch { text = arg.GetString(0, ""); }
            _msgFilterSearch[player.userID] = text ?? string.Empty;
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.filtercat")] // args: <category|all>
        private void UIW_FilterCategory(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            var cat = arg.GetString(0, "all"); if (string.IsNullOrEmpty(cat)) cat = "all";
            _msgFilterCategory[player.userID] = cat.ToLowerInvariant();
            _playerMessagePage[player.userID] = 0; // reset to first page on filter change
            _msgSelected.Remove(player.userID); // clear selection on filter change
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.filterreset")]
        private void UIW_FilterReset(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            _msgFilterSearch[player.userID] = string.Empty;
            _msgFilterCategory[player.userID] = "all";
            _playerMessagePage[player.userID] = 0;
            _msgSelected.Remove(player.userID);
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.newcat.overlay")]
        private void UIW_NewCatOverlay(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            const string NewCatPanel = "EldrunWerbungUINewCat";
            try { CuiHelper.DestroyUi(player, NewCatPanel); } catch { }
            if (!_newCatDraftName.ContainsKey(player.userID)) _newCatDraftName[player.userID] = string.Empty;

            var colors = GetPlayerThemeColors(player);
            var c = new CuiElementContainer();
            c.Add(new CuiPanel
            {
                Image = { Color = TV("content_bg", "0.08 0.08 0.12 0.98") },
                RectTransform = { AnchorMin = "0.33 0.38", AnchorMax = "0.67 0.58" },
                CursorEnabled = true
            }, "Overlay", NewCatPanel);

            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.new_category", null, "NEW CATEGORY"), FontSize = 18, Align = TextAnchor.MiddleLeft, Color = colors["HeaderColor"] }, RectTransform = { AnchorMin = "0.35 0.54", AnchorMax = "0.65 0.57" } }, NewCatPanel);
            c.Add(new CuiLabel { Text = { Text = T("werbung.ui.name", null, "Name"), FontSize = 12, Align = TextAnchor.MiddleLeft, Color = colors["LabelColor"] }, RectTransform = { AnchorMin = "0.35 0.49", AnchorMax = "0.45 0.52" } }, NewCatPanel);
            c.Add(new CuiElement { Parent = NewCatPanel, Components = { new CuiInputFieldComponent { Align = TextAnchor.MiddleLeft, CharsLimit = 40, Command = "eldrunwerbung.ui.newcat.text", FontSize = 12, Text = _newCatDraftName[player.userID] }, new CuiRectTransformComponent { AnchorMin = "0.35 0.44", AnchorMax = "0.65 0.49" } } });

            c.Add(new CuiButton { Button = { Color = colors["SuccessColor"], Command = "eldrunwerbung.ui.newcat.apply" }, RectTransform = { AnchorMin = "0.46 0.40", AnchorMax = "0.58 0.44" }, Text = { Text = T("ui.create", null, "Create"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, NewCatPanel);
            c.Add(new CuiButton { Button = { Color = colors["ErrorColor"], Command = "eldrunwerbung.ui.newcat.cancel" }, RectTransform = { AnchorMin = "0.60 0.40", AnchorMax = "0.72 0.44" }, Text = { Text = T("ui.cancel", null, "Cancel"), FontSize = 12, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, NewCatPanel);

            // Close dot
            c.Add(new CuiButton { Button = { Color = colors["CloseButton"], Command = "eldrunwerbung.ui.newcat.cancel" }, RectTransform = { AnchorMin = "0.65 0.55", AnchorMax = "0.67 0.57" }, Text = { Text = "•", FontSize = 14, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" } }, NewCatPanel);

            CuiHelper.AddUi(player, c);
        }

        [ConsoleCommand("eldrunwerbung.ui.newcat.text")] // args: <name...>
        private void UIW_NewCatText(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = string.Empty;
            try
            {
                if (arg.Args != null && arg.Args.Length >= 1)
                {
                    var parts = new List<string>();
                    for (int i = 0; i < arg.Args.Length; i++) parts.Add(arg.Args[i]);
                    text = string.Join(" ", parts.ToArray());
                }
                else
                {
                    text = arg.GetString(0, "");
                }
            }
            catch { text = arg.GetString(0, ""); }
            _newCatDraftName[player.userID] = (text ?? string.Empty);
        }

        [ConsoleCommand("eldrunwerbung.ui.newcat.apply")]
        private void UIW_NewCatApply(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string name = _newCatDraftName.ContainsKey(player.userID) ? _newCatDraftName[player.userID] : string.Empty;
            name = (name ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(name)) { SendReply(player, "❌ Empty category name."); return; }
            string key = NormalizeCategoryKey(name);
            if (key == null) { SendReply(player, "❌ Invalid name."); return; }
            if (_config.MessageCategories.ContainsKey(key)) { SendReply(player, "❌ Category already exists."); return; }
            _config.MessageCategories[key] = new List<string>();
            EnsureCategoryOrderIncludesAll();
            SaveConfig();
            // Switch filter to the new category for convenience
            _msgFilterCategory[player.userID] = key;
            _playerMessagePage[player.userID] = 0;
            _newCatDraftName.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUINewCat"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.newcat.cancel")]
        private void UIW_NewCatCancel(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _newCatDraftName.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUINewCat"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.applyadd")]
        private void UIW_ApplyAdd(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            string text = _addDraftText.ContainsKey(player.userID) ? _addDraftText[player.userID] : string.Empty;
            string cat = _addDraftCategory.ContainsKey(player.userID) ? _addDraftCategory[player.userID] : "custom";
            text = (text ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(text)) { SendReply(player, "❌ Empty message."); return; }
            if (!_config.MessageCategories.ContainsKey(cat)) _config.MessageCategories[cat] = new List<string>();
            if (_config.MessageCategories[cat].Count >= _config.MaxMessagesPerCategory) { SendReply(player, "❌ Category is full."); return; }
            _config.MessageCategories[cat].Add(text);
            SaveConfig();
            _addDraftText.Remove(player.userID);
            _addDraftCategory.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIAdd"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.canceladd")]
        private void UIW_CancelAdd(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return;
            _addDraftText.Remove(player.userID);
            _addDraftCategory.Remove(player.userID);
            try { CuiHelper.DestroyUi(player, "EldrunWerbungUIAdd"); } catch { }
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.toggle.showchat")]
        private void UIW_ToggleShowChat(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            _config.ShowInChat = !_config.ShowInChat; SaveConfig();
            OpenUI(player);
        }

        [ConsoleCommand("eldrunwerbung.ui.toggle.playeropt")]
        private void UIW_TogglePlayerOpt(ConsoleSystem.Arg arg)
        {
            var player = arg.Player(); if (player == null) return; if (!HasAdminAccess(player)) return;
            _config.PlayerOptOut = !_config.PlayerOptOut; SaveConfig();
            OpenUI(player);
        }


        private void Unload()
        {
            try { _loop?.Destroy(); } catch { }
            
            // CRITICAL: Save data before unload to prevent data loss
            SaveData();
        }
        
        private void CreateBackup()
        {
            try
            {
                var backupData = new
                {
                    Config = _config,
                    Data = _data,
                    Timestamp = DateTime.Now,
                    Version = Version.ToString()
                };
                
                string backupPath = $"eldrun_werbung_backup_{DateTime.Now:yyyyMMdd_HHmmss}";
                Interface.Oxide.DataFileSystem.WriteObject(backupPath, backupData);
                Puts($"[EldrunWerbung] Backup created: {backupPath}");
            }
            catch (Exception ex)
            {
                PrintError($"[EldrunWerbung] Backup failed: {ex.Message}");
            }
        }
        
        [ChatCommand("werbungopt")]
        private void WerbungOptOut(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            
            bool isOptedOut = _data.DisabledPlayers.Contains(player.UserIDString);
            
            // If player opt-out is disabled by config, only show status
            if (_config?.PlayerOptOut == false)
            {
                if (args?.Length > 0)
                {
                    SendReply(player, "ℹ️ Opt-out is disabled by the server settings.");
                    return;
                }
                string statusLocked = isOptedOut ? "OPTED OUT (locked)" : "OPTED IN (locked)";
                SendReply(player, $"📢 Advertising Status: {statusLocked}. Opt-out is disabled by the server.");
                return;
            }

            if (args?.Length > 0 && args[0].ToLowerInvariant() == "out")
            {
                if (!isOptedOut)
                {
                    _data.DisabledPlayers.Add(player.UserIDString);
                    SaveData();
                    SendReply(player, "✅ You have opted out of ELDRUN advertising. Use /werbungopt in to opt back in.");
                    Puts($"[EldrunWerbung] Player {player.displayName} ({player.UserIDString}) opted out of advertising.");
                }
                else
                {
                    SendReply(player, "ℹ️ You are already opted out of advertising.");
                }
            }
            else if (args?.Length > 0 && args[0].ToLowerInvariant() == "in")
            {
                if (isOptedOut)
                {
                    _data.DisabledPlayers.Remove(player.UserIDString);
                    SaveData();
                    SendReply(player, "✅ You will now receive ELDRUN advertising again. Use /werbungopt out to opt out.");
                    Puts($"[EldrunWerbung] Player {player.displayName} ({player.UserIDString}) opted back in to advertising.");
                }
                else
                {
                    SendReply(player, "ℹ️ You are already receiving advertising.");
                }
            }
            else
            {
                string status = isOptedOut ? "OPTED OUT" : "OPTED IN";
                SendReply(player, $"📢 Advertising Status: {status}. Use /werbungopt out|in to change.");
                if (_config?.PlayerOptOut == true)
                {
                    SendReply(player, "   Advertising helps you discover all ELDRUN features!");
                }
            }
        }
        
        // Zusaetzliche Chat Commands fuer bessere User Experience
        [ChatCommand("adverts")]
        private void AdvertsAlias(BasePlayer player, string command, string[] args) => WerbungUI(player, command, args);
        
        [ChatCommand("ads")]
        private void AdsAlias(BasePlayer player, string command, string[] args) => WerbungOptOut(player, command, args);
        
        [ChatCommand("whelp")]
        private void WerbungHelp(BasePlayer player, string command, string[] args)
        {
            if (player == null) return;
            
            SendReply(player, "<color=#FFD700>📜 ELDRUN ADVERTISING HELP</color>");
            SendReply(player, "/werbung - Show advertising system information");
            SendReply(player, "/werbungopt out - Disable advertising");
            SendReply(player, "/werbungopt in - Enable advertising");
            SendReply(player, "/werbungopt - Show current status");
            
            if (HasAdminAccess(player))
            {
                SendReply(player, "\n<color=#FFD700>🔑 ADMIN COMMANDS</color>");
                SendReply(player, "/werbung ui - Open graphical management interface");
                SendReply(player, "/werbungadmin - Show all admin options");
            }
        }
        
        // Enable/Disable API for admin menu
        public bool Eldrun_GetEnabled() => _config?.Enabled ?? true;
        public void Eldrun_SetEnabled(bool enabled)
        {
            if (_config == null) return;
            _config.Enabled = enabled;
            RestartLoop();
        }
        
        // API fuer andere Plugins
        public void Eldrun_BroadcastMessage(string message, string category = "custom")
        {
            if (string.IsNullOrWhiteSpace(message)) return;
            
            var playersToShow = new List<BasePlayer>();
            foreach (var p in BasePlayer.activePlayerList)
            {
                if (!_data.DisabledPlayers.Contains(p.UserIDString))
                    playersToShow.Add(p);
            }
            if (_config.ShowInChat)
            {
                foreach (var player in playersToShow)
                {
                    PrintToChat(player, $"{_config.ChatPrefix} {message}");
                }
            }
            
            if (_config.ShowStatistics)
            {
                _data.TotalBroadcasts++;
                _data.CategoryBroadcasts[category] = (_data.CategoryBroadcasts.ContainsKey(category) ? _data.CategoryBroadcasts[category] : 0) + 1;
                _data.MessageViews[message] = (_data.MessageViews.ContainsKey(message) ? _data.MessageViews[message] : 0) + 1;
                _data.LastShown[message] = DateTime.Now;
            }
            Puts($"[EldrunWerbung] API Broadcast [{category}]: {(message.Length > 50 ? message.Substring(0, 50) + "..." : message)} to {playersToShow.Count} players");

            // Batch-save stats
            _unsavedStatIncrements++;
            if (_unsavedStatIncrements >= 10)
            {
                _unsavedStatIncrements = 0;
                try { SaveData(); } catch {}
            }
        }
        
        private int GetTotalMessageCount()
        {
            int total = 0;
            if (_config?.MessageCategories?.Values != null)
            {
                foreach (var cat in _config.MessageCategories.Values)
                    total += cat.Count;
            }
            return total;
        }
        
        public Dictionary<string, object> Eldrun_GetStats()
        {
            return new Dictionary<string, object>
            {
                ["enabled"] = _config?.Enabled ?? false,
                ["totalBroadcasts"] = _data?.TotalBroadcasts ?? 0,
                ["optOutPlayers"] = _data?.DisabledPlayers?.Count ?? 0,
                ["totalMessages"] = GetTotalMessageCount(),
                ["categories"] = _config?.MessageCategories?.Count ?? 0,
                ["intervalMin"] = _config?.MinIntervalSeconds ?? 45f,
                ["intervalMax"] = _config?.MaxIntervalSeconds ?? 60f,
                ["randomOrder"] = _config?.RandomOrder ?? true,
                ["categoryBroadcasts"] = _data?.CategoryBroadcasts ?? new Dictionary<string, int>()
            };
        }
        
        public bool Eldrun_AddMessage(string message, string category = "custom")
        {
            if (string.IsNullOrWhiteSpace(message) || _config?.MessageCategories == null) return false;
            
            if (!_config.MessageCategories.ContainsKey(category))
            {
                _config.MessageCategories[category] = new List<string>();
            }
            
            if (_config.MessageCategories[category].Count >= _config.MaxMessagesPerCategory)
            {
                return false; // Kategorie ist voll
            }
            
            _config.MessageCategories[category].Add(message);
            return true;
        }
        
        public bool Eldrun_RemoveMessage(string message, string category = null)
        {
            if (string.IsNullOrWhiteSpace(message) || _config?.MessageCategories == null) return false;
            
            if (category != null)
            {
                if (_config.MessageCategories.ContainsKey(category))
                {
                    bool removed = _config.MessageCategories[category].Remove(message);
                    if (removed) SaveConfig();
                    return removed;
                }
                return false;
            }
            
            // Suche in allen Kategorien
            bool anyRemoved = false;
            foreach (var cat in _config.MessageCategories.Values)
            {
                if (cat.Remove(message)) anyRemoved = true;
            }
            if (anyRemoved) SaveConfig();
            return anyRemoved;
        }
        
        public List<string> Eldrun_GetCategories()
        {
            var result = new List<string>();
            if (_config?.MessageCategories?.Keys != null)
            {
                foreach (var key in _config.MessageCategories.Keys)
                    result.Add(key);
            }
            return result;
        }
        
        public List<string> Eldrun_GetMessages(string category = null)
        {
            if (_config?.MessageCategories == null) return new List<string>();
            
            if (category != null && _config.MessageCategories.ContainsKey(category))
            {
                return new List<string>(_config.MessageCategories[category]);
            }
            
            // Alle Nachrichten zurueckgeben
            var allMessages = new List<string>();
            foreach (var cat in _config.MessageCategories.Values)
            {
                allMessages.AddRange(cat);
            }
            return allMessages;
        }
        
        // Hooks fuer Event-Driven Broadcasting
        private void OnPlayerConnected(BasePlayer player)
        {
            if (player == null || _config?.MessageCategories == null) return;
            
            // Willkommensnachricht nach 10 Sekunden
            timer.Once(10f, () => 
            {
                if (player != null && player.IsConnected && !_data.DisabledPlayers.Contains(player.UserIDString))
                {
                    var welcomeMessages = _config.MessageCategories.ContainsKey("core") ? _config.MessageCategories["core"] : null;
                    if (welcomeMessages != null && welcomeMessages.Count > 0)
                    {
                        var welcomeMsg = welcomeMessages[0]; // Erste core Nachricht als Willkommen
                        if (_config.ShowInChat) PrintToChat(player, $"{_config.ChatPrefix} {welcomeMsg}");
                    }
                }
            });
        }
        
        private void OnPlayerDisconnected(BasePlayer player)
        {
            // Cleanup falls nOetig - aktuell nichts zu tun
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

        private Dictionary<string, string> GetPlayerThemeColors(BasePlayer player)
        {
            return new Dictionary<string, string>
            {
                // Basispalette – Eldrun-Website-Stil
                ["PrimaryColor"]    = "0.02 0.02 0.03 0.98",
                ["SecondaryColor"]  = "0.06 0.06 0.09 0.96",
                ["BackgroundColor"] = "0.02 0.02 0.03 0.98",

                // Header/Sidebar/Content/Footer-Hintergründe
                ["HeaderBG"]   = "0.06 0.06 0.09 0.96",
                ["SidebarBG"]  = "0.06 0.06 0.09 0.96",
                ["ContentBG"]  = "0.02 0.02 0.03 0.98",
                ["FooterBG"]   = "0.06 0.06 0.09 0.96",
                ["CloseButton"] = "0.88 0.27 0.27 0.90",

                // Text und Akzente (Gold/Border/Text)
                ["HeaderColor"]   = "0.95 0.83 0.42 1",
                ["CategoryGold"]  = "0.79 0.60 0.29 1",
                ["AccentColor"]   = "0.79 0.60 0.29 1",
                ["HoverColor"]    = "0.89 0.70 0.35 0.9",
                ["BorderColor"]   = "0.42 0.32 0.19 0.9",
                ["TextColor"]     = "0.96 0.96 0.98 1",
                ["SubTextColor"]  = "0.68 0.69 0.77 1",
                ["LabelColor"]    = "0.68 0.69 0.77 1",

                // Tabs
                ["TabActive"]   = "0.20 0.45 0.65 0.90",
                ["TabInactive"] = "0.25 0.25 0.30 0.85",

                // Statusfarben
                ["SuccessColor"] = "0.28 0.88 0.39 1",
                ["WarningColor"] = "0.92 0.68 0.28 1",
                ["ErrorColor"]   = "0.88 0.27 0.27 1",
                ["InfoColor"]    = "0.22 0.74 0.97 1",

                // Rarity-Farben
                ["RarityBasic"]      = "0.6 0.6 0.6 1",
                ["RarityAdvanced"]   = "0.4 0.8 0.4 1",
                ["RarityElite"]      = "0.4 0.6 0.9 1",
                ["RarityLegendary"]  = "0.8 0.4 0.8 1",
                ["RarityMythic"]     = "0.9 0.6 0.2 1",
                ["RarityGodlike"]    = "1 0.8 0.2 1"
            };
        }
        
        // Console Command fuer Server-Admins
        [ConsoleCommand("eldrunwerbung.broadcast")]
        private void ConsoleBroadcast(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null) return; // Nur Server Console
            
            string message = arg.GetString(0);
            if (string.IsNullOrWhiteSpace(message))
            {
                Puts("[EldrunWerbung] Usage: eldrunwerbung.broadcast \"Your message here\"");
                return;
            }
            
            Eldrun_BroadcastMessage(message, "console");
            Puts($"[EldrunWerbung] Console broadcast: {message}");
        }
        
        // Performance Monitoring
        private void OnServerSave()
        {
            if (_config?.AutoBackup == true && DateTime.Now.Subtract(_data.LastBackup).TotalDays >= 7)
            {
                try { CreateBackup(); } catch {}
                _data.LastBackup = DateTime.Now;
                try { SaveData(); } catch {}
            }
        }
        
        // Version Info fuer andere Plugins
        public string Eldrun_GetVersion() => Version.ToString();
        
        public Dictionary<string, object> Eldrun_GetInfo()
        {
            return new Dictionary<string, object>
            {
                ["name"] = Name,
                ["version"] = Version.ToString(),
                ["author"] = Author,
                ["description"] = Description
            };
        }
        
        // Cleanup bei Plugin Reload/Unload
        private void OnPluginUnloaded(Plugin plugin)
        {
            if (plugin == this)
            {
                foreach (var player in BasePlayer.activePlayerList)
                {
                    try { CuiHelper.DestroyUi(player, PanelName); } catch { }
                }
            }
        }
    }
}

