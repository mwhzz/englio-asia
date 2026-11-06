# Reads Telegram's getUpdates answer on stdin and prints the chat id of the latest message (empty if none).
import json
import sys

updates = json.load(sys.stdin).get("result", [])
chats = [u["message"]["chat"]["id"] for u in updates if "message" in u]
print(chats[-1] if chats else "")
