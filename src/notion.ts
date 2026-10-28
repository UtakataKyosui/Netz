import {Client} from "@notionhq/client";
export default function setNotionClient(env: Env) {
    return new Client({
        auth: env.NOTION_API_TOKEN
    });
}