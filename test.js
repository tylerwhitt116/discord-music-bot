const playdl = require("play-dl");

(async () => {
    try {
        const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with any video URL
        const stream = await playdl.stream(url);
        console.log("✅ Stream fetched successfully!", stream);
    } catch (error) {
        console.error("❌ Error fetching stream:", error);
    }
})();

async function test() {
    const stream = await playdl.stream("https://www.youtube.com/watch?v=6WXmaJcguXo");
    console.log("✅ play-dl is working!");
}

test();