namespace Oxide.Plugins
{
    [Info("EldrunNoGiveNotices", "Eldrun", "36187")]
    [Description("Prevents F1 item giving notices from showing in the chat")]
    class EldrunNoGiveNotices : RustPlugin
    {
        private object OnServerMessage(string message, string name)
        {
            if (message.Contains("gave") && name == "SERVER")
            {
                return true;
            }

            return null;
        }
    }
}
