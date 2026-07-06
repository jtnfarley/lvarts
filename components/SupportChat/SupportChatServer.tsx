import { isLoggedIn } from "@/app/data/currentUser";
import SupportChatWidget from "./SupportChatWidget";

export default async function SupportChatServer() {
    const user = await isLoggedIn();

    if (!user) return null;

    return <SupportChatWidget/>;
}
