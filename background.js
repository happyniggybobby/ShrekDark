(async () => {
    const newRules = [
        {
            id: 1,
            priority: 1,
            condition: {
                urlFilter: 'https://drednot.io/huge_signs/manifest.json',
                resourceTypes: [ "xmlhttprequest" ]
            },
            "action": {
                "type": "redirect",
                "redirect": {
                    "url": "https://api.npoint.io/6b79bc79b653ed6f0ed7"
                },
            },
        },
        {
            id: 2,
            priority: 1,
            condition: {
                urlFilter: 'https://drednot.io/huge_signs/mosaic.png',
                resourceTypes: ["image"]
            },
            "action": {
                "type": "redirect",
                "redirect": {
                    "extensionPath": "/huge_signs/mosaic.png"
                },
            },
        }
    ]

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: newRules
    });
})();