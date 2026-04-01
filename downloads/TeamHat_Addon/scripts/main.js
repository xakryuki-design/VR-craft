import { world, system, ItemStack } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        const isRed = tags.includes("team:red");
        const isBlue = tags.includes("team:blue");

        if (!isRed && !isBlue) continue;

        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) continue;

        // 1. 帽子を作る
        const helmet = new ItemStack("leather_helmet", 1);
        
        // 2. ★ここで色を塗る！ (ここが重要)
        const dye = helmet.getComponent("minecraft:dyable");
        if (dye) {
            // 赤チームなら赤、それ以外（青チーム）なら青
            dye.color = isRed ? { red: 255, green: 0, blue: 0 } : { red: 0, green: 0, blue: 255 };
        }

        // 3. 装備させる
        equippable.setEquipment("Head", helmet);
    }
}, 20);