chrome.runtime.onInstalled.addListener(() => {
    console.log("Leetcode RAG Helper Installed!");

    const element = document.querySelector("#\\36 3ee50a8-93d6-e0fd-1b9d-5aa06b044e58 > div > div.flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5 > div:nth-child(4) > div");
    
    if (element) {
        console.log("Element found:", element);
    } else {
        console.log("Element not found.");
    }
});
