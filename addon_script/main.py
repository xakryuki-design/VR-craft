import os
import shutil
import json
import zipfile
import uuid

# アドオンの設定
ADDON_NAME = "ThunderSword_v3"
BP_NAME = f"{ADDON_NAME}_BP"
RP_NAME = f"{ADDON_NAME}_RP"

def create_addon():
    if os.path.exists(ADDON_NAME): shutil.rmtree(ADDON_NAME)
    
    base_dir = ADDON_NAME
    os.makedirs(f"{base_dir}/bp/items", exist_ok=True)
    os.makedirs(f"{base_dir}/bp/scripts", exist_ok=True)
    os.makedirs(f"{base_dir}/rp/textures/items", exist_ok=True)
    os.makedirs(f"{base_dir}/rp/texts", exist_ok=True)

    # UUID生成
    uuids = [str(uuid.uuid4()) for _ in range(5)]

    # --- Behavior Pack ---
    save_json = lambda p, d: json.dump(d, open(p, 'w', encoding='utf-8'), indent=2)

    save_json(f"{base_dir}/bp/manifest.json", {
        "format_version": 2,
        "header": {
            "name": "Thunder Sword BP v3",
            "description": "Script API lightning addon",
            "uuid": uuids[0],
            "version": [1, 0, 0],
            "min_engine_version": [1, 20, 0]
        },
        "modules": [
            {"type": "data", "uuid": uuids[1], "version": [1, 0, 0]},
            {"type": "script", "language": "javascript", "uuid": uuids[2], "version": [1, 0, 0], "entry": "scripts/main.js"}
        ],
        "dependencies": [{"module_name": "@minecraft/server", "version": "1.11.0"}] # バージョンを少し上げた
    })

    save_json(f"{base_dir}/bp/items/thunder_sword.json", {
        "format_version": "1.20.0",
        "minecraft:item": {
            "description": { "identifier": "myaddon:thunder_sword", "menu_category": { "category": "equipment", "group": "itemGroup.name.sword" } },
            "components": {
                "minecraft:display_name": { "value": "Thunder Sword" },
                "minecraft:icon": { "texture": "thunder_sword" },
                "minecraft:hand_equipped": True,
                "minecraft:max_stack_size": 1,
                "minecraft:damage": 8,
                "minecraft:on_use": { "on_use": { "event": "dummy" } } # スクリプト検知用に必要
            }
        }
    })

    # スクリプト (ログ出力を追加)
    js_content = """
import { world, system } from "@minecraft/server";

world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack } = event;
    
    if (itemStack.typeId === "myaddon:thunder_sword") {
        player.sendMessage("§e雷の力を解放した！"); // 動作確認用メッセージ
        
        system.run(() => {
            const entities = player.dimension.getEntities({
                location: player.location,
                maxDistance: 15,
                excludeTypes: ["minecraft:player", "minecraft:item"]
            });

            if (entities.length === 0) {
                player.sendMessage("§c周囲に標的がいません。");
                return;
            }

            entities.forEach(entity => {
                player.dimension.spawnEntity("minecraft:lightning_bolt", entity.location);
            });
        });
    }
});
"""
    with open(f"{base_dir}/bp/scripts/main.js", 'w', encoding='utf-8') as f: f.write(js_content)

    # --- Resource Pack ---
    save_json(f"{base_dir}/rp/manifest.json", {
        "format_version": 2,
        "header": { "name": "Thunder Sword RP v3", "uuid": uuids[3], "version": [1, 0, 0], "min_engine_version": [1, 20, 0] },
        "modules": [{"type": "resources", "uuid": uuids[4], "version": [1, 0, 0]}]
    })

    save_json(f"{base_dir}/rp/textures/item_texture.json", {
        "texture_data": { "thunder_sword": { "textures": "textures/items/thunder_sword" } }
    })

    # 画像のバグ対策：16x16のダミー画像を生成（最小限のPNGバイナリ）
    # ※本当はNeoさんが描いたカッコいい剣の画像をこのパスに上書きするのがベスト！
    with open(f"{base_dir}/rp/textures/items/thunder_sword.png", 'wb') as f:
        f.write(bytes.fromhex('89504e470d0a1a0a0000000d49484452000000100000001008060000001ff3bcad000000017352474200aece1ce90000000467414d410000b18f0bfc61050000001c49444154384f6360606060f80f050c0c0c0c0c080000110300011e030119e75f920000000049454e44ae426082'))

    # パッケージング
    def zip_pack(folder, name):
        with zipfile.ZipFile(name, 'w', zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(folder):
                for file in files:
                    z.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), folder))

    zip_pack(f"{base_dir}/bp", f"{BP_NAME}.mcpack")
    zip_pack(f"{base_dir}/rp", f"{RP_NAME}.mcpack")

    with zipfile.ZipFile(f"{ADDON_NAME}.mcaddon", 'w') as addon:
        addon.write(f"{BP_NAME}.mcpack"); addon.write(f"{RP_NAME}.mcpack")

    os.remove(f"{BP_NAME}.mcpack"); os.remove(f"{RP_NAME}.mcpack")
    shutil.rmtree(base_dir)
    print(f"Build Complete: {ADDON_NAME}.mcaddon")

if __name__ == "__main__": create_addon()