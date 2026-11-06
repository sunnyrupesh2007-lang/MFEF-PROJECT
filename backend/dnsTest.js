import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

try {
    const records = await dns.promises.resolveTxt(
        "cluster0.z4ms6be.mongodb.net"
    );

    console.log("MongoDB TXT Records:", records);
} catch (error) {
    console.log("TXT Error:", error.message);
}