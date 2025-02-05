import got from "got";
import loc from "../../localization/manager.js";

export default async function(obj) {
    try {
        let _headers = {
            "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAAIK1zgAAAAAA2tUWuhGZ2JceoId5GwYWU5GspY4%3DUq7gzFoCZs1QfwGoVdvSac3IniczZEYXIcDyumCauIXpcAPorE",
            "Host": "api.twitter.com",
            "Content-Type": "application/json",
            "Content-Length": 0
        };
        let req_act = await got.post("https://api.twitter.com/1.1/guest/activate.json", {
            headers: _headers
        });
        req_act.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
        })
        _headers["x-guest-token"] = req_act.body["guest_token"];
        let req_status = await got.get(`https://api.twitter.com/1.1/statuses/show.json?id=${obj.id}&tweet_mode=extended`, {
            headers: _headers
        });
        req_status.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
        })
        let parsbod = JSON.parse(req_status.body);
        if (parsbod["extended_entities"] && parsbod["extended_entities"]["media"]) {
            let media = parsbod["extended_entities"]["media"][0]
            if (media["type"] === "video" || media["type"] === "animated_gif") {
                return { urls: media["video_info"]["variants"].filter((v) => { if (v["content_type"] == "video/mp4") return true; }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split('?')[0], audioFilename: `twitter_${obj.id}_audio` }
            } else {
                return { error: loc(obj.lang, 'ErrorNoVideosInTweet') }
            }
        } else {
            return { error: loc(obj.lang, 'ErrorNoVideosInTweet') }
        }
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
