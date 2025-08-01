const mangayomiSources = [{
    "name": "极速资源",
    "lang": "zh",
    "baseUrl": "https://www.jisuzy.com",
    "apiUrl": "",
    "iconUrl": "https://www.jisuzy.com/template/default/images/site_logo.png",
    "typeSource": "single",
    "itemType": 1,
    "isNsfw": false,
    "version": "0.0.2",
    "dateFormat": "",
    "dateFormatLocale": "",
    "pkgPath": "anime/src/zh/jisuzy.js"
}];

class DefaultExtension extends MProvider {
    dict = new Map([
        ["&nbsp;", " "],
        ["&quot;", '"'],
        ["&lt;", "<"],
        ["&gt;", ">"],
        ["&amp;", "&"],
        ["&sdot;", "·"],
    ]);
    text(content) {
        if (!content) return "";
        const str =
            [...content.matchAll(/>([^<]+?)</g)]
                .map((m) => m[1])
                .join("")
                .trim() || content;
        return str.replace(/&[a-z]+;/g, (c) => this.dict.get(c) || c);
    }
    async request(url) {
        const preference = new SharedPreferences();
        return (await new Client({ 'useDartHttpClient': true }).get(preference.get("url") + "/api.php/provide/vod?ac=detail" + url, { "Referer": preference.get("url") })).body;
    }
    getHeaders(url) {
        throw new Error("getHeaders not implemented");
    }
    async getPopular(page) {
        // let genres = [];
        // const gen = JSON.parse(await this.request("&ac=list"));
        // gen.class.forEach((e) => {
        //     genres.push({
        //         type_name: "SelectOption",
        //         value: e.type_id,
        //         name: e.type_name
        //     });
        // });
        // console.log(genres)
        const res = JSON.parse(await this.request(`&pg=${page}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async getLatestUpdates(page) {
        const h = (new Date().getUTCHours() + 9) % 24;
        const res = JSON.parse(await this.request(`&pg=${page}&h=${h || 24}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async search(query, page, filters) {
        var categories;
        for (const filter of filters) {
            if (filter["type"] == "categories") {
                categories = filter["values"][filter["state"]]["value"];
            }
        }
        const res = JSON.parse(await this.request(`&wd=${query}&t=${categories ?? ""}&pg=${page}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async getDetail(url) {
        let desc = "无";
        const anime = JSON.parse(await this.request(url)).list[0];
        const blurb = this.text(anime.vod_blurb);
        const content = this.text(anime.vod_content);
        desc = desc.length < blurb?.length ? blurb : desc;
        desc = desc.length < content.length ? content : desc;

        const playLists = anime.vod_play_url.split("$$$");
        const urls = [];

        for (const playList of playLists) {
            const episodes = playList.split("#").filter(e => e);

            for (const episode of episodes) {
                const parts = episode.split("$");
                const name = parts[0];
                const episodeUrl = parts[1];
                if (episodeUrl.includes("m3u8")) {
                    urls.push({ name, url: episodeUrl });
                }
            }
        }
        return {
            name: anime.vod_name,
            imageUrl: anime.vod_pic,
            description: desc,
            episodes: urls
        };
    }
    // For anime episode video list
    async getVideoList(url) {
        return [
            {
                url: url,
                originalUrl: url,
                quality: "HLS"
            }
        ];
    }
    // For manga chapter pages
    async getPageList() {
        throw new Error("getPageList not implemented");
    }
    getFilterList() {
        return [{
            type: "categories",
            name: "影片類型",
            type_name: "SelectFilter",
            values: [
                // { type_name: "SelectOption", value: "1", name: "电影" },
                // { type_name: "SelectOption", value: "2", name: "连续剧" },
                // { type_name: "SelectOption", value: "3", name: "综艺" },
                { type_name: "SelectOption", value: "", name: "全部" },
                { type_name: "SelectOption", value: "1", name: "电视剧" },
                { type_name: "SelectOption", value: "2", name: "电影" },
                { type_name: "SelectOption", value: "3", name: "欧美剧" },
                { type_name: "SelectOption", value: "4", name: "香港剧" },
                { type_name: "SelectOption", value: "5", name: "韩剧" },
                { type_name: "SelectOption", value: "6", name: "日剧" },
                { type_name: "SelectOption", value: "7", name: "马泰剧" },
                { type_name: "SelectOption", value: "8", name: "伦理片" },
                { type_name: "SelectOption", value: "9", name: "动作片" },
                { type_name: "SelectOption", value: "10", name: "爱情片" },
                { type_name: "SelectOption", value: "11", name: "喜剧片" },
                { type_name: "SelectOption", value: "12", name: "科幻片" },
                { type_name: "SelectOption", value: "13", name: "恐怖片" },
                { type_name: "SelectOption", value: "14", name: "剧情片" },
                { type_name: "SelectOption", value: "15", name: "战争片" },
                { type_name: "SelectOption", value: "16", name: "记录片" },
                { type_name: "SelectOption", value: "17", name: "动漫" },
                { type_name: "SelectOption", value: "20", name: "内地剧" },
                { type_name: "SelectOption", value: "23", name: "动画片" },
                { type_name: "SelectOption", value: "24", name: "中国动漫" },
                { type_name: "SelectOption", value: "25", name: "日本动漫" },
                { type_name: "SelectOption", value: "26", name: "欧美动漫" },
                { type_name: "SelectOption", value: "27", name: "综艺" },
                { type_name: "SelectOption", value: "28", name: "台湾剧" },
                { type_name: "SelectOption", value: "29", name: "体育赛事" },
                { type_name: "SelectOption", value: "30", name: "大陆综艺" },
                { type_name: "SelectOption", value: "31", name: "日韩综艺" },
                { type_name: "SelectOption", value: "32", name: "港台综艺" },
                { type_name: "SelectOption", value: "33", name: "欧美综艺" },
                { type_name: "SelectOption", value: "34", name: "灾难片" },
                { type_name: "SelectOption", value: "35", name: "悬疑片" },
                { type_name: "SelectOption", value: "36", name: "犯罪片" },
                { type_name: "SelectOption", value: "37", name: "奇幻片" },
                { type_name: "SelectOption", value: "38", name: "短剧" }
            ]
        }];
    }
    getSourcePreferences() {
        return [
            {
                "key": "url",
                "listPreference": {
                    "title": "Website Url",
                    "summary": "",
                    "valueIndex": 0,
                    "entries": ["jisuzy.com", "jisuzy.tv", "jisuziyuan.com"],
                    "entryValues": ["https://www.jisuzy.com", "https://www.jisuzy.tv", "https://www.jisuziyuan.com"],
                }
            }
        ];
    }
}
