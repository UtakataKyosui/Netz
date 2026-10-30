import {Client} from "@notionhq/client";
export default function setNotionClient(env: { readonly NOTION_API_TOKEN: string }) {
    return new Client({
        auth: env.NOTION_API_TOKEN
    });
}
